// Decontamination of training pairs against the frozen test set (spec Part A). Subcommands:
//   embed                         embed test + kept training questions (cached in train/embeddings.jsonl)
//   calibrate                     write review/calibration.md + review/calibration.jsonl (Kamil labels 80 pairs)
//   calibrate-apply               threshold from Kamil's labels → dated addendum appended to the spec
//   apply                         at the frozen threshold (train/threshold.json): mark drops, stamp kept pairs,
//                                 write results/decontamination.md
import fs from 'node:fs';
import path from 'node:path';
import { loadDataset } from '../src/datasets.ts';
import { bestMatches, calibrationSample, decontamCounts, decontaminate, embed, readThreshold, thresholdFrom, VOYAGE_MODEL, writeThresholdOnce, type Label, type Pair } from '../src/decontam.ts';
import { readItems, writeItems, REPO } from '../src/items.ts';

const [cmd] = process.argv.slice(2);
const workFile = path.join(REPO, 'train', 'work.jsonl');
const cacheFile = path.join(REPO, 'train', 'embeddings.jsonl');
const thresholdFile = path.join(REPO, 'train', 'threshold.json');
const spec = path.join(REPO, 'docs/superpowers/specs/2026-10-20-training-data-finetune-design.md');
const test = loadDataset('test-v1').items;
const work = readItems(workFile);
const train = work.filter((i) => i.status === 'agreed');

async function embeddings(): Promise<Map<string, number[]>> {
  const all = [...test, ...train];
  const vecs = await embed(all.map((i) => i.question), { cacheFile });
  return new Map(all.map((i, k) => [i.id, vecs[k]]));
}
const q = (id: string) => (test.find((t) => t.id === id) ?? train.find((t) => t.id === id))!.question;

if (cmd === 'embed') {
  const emb = await embeddings();
  console.log(`${emb.size} questions embedded with ${VOYAGE_MODEL}`);
} else if (cmd === 'calibrate') {
  const { top, band } = calibrationSample(bestMatches(train, test, await embeddings()), 'calibration-1');
  const rows = [...top, ...band];
  fs.mkdirSync(path.join(REPO, 'review'), { recursive: true });
  fs.writeFileSync(path.join(REPO, 'review', 'calibration.md'), `# Calibration — label each pair duplicate / paraphrase / distinct\n\n` +
    `Same task with different constants = paraphrase. Write labels into review/calibration.jsonl.\n\n` +
    rows.map((p, k) => `${k + 1}. cos ${p.cos.toFixed(3)} — ${p.trainId} vs ${p.testId}\n   - train: ${q(p.trainId)}\n   - test:  ${q(p.testId)}`).join('\n') + '\n');
  fs.writeFileSync(path.join(REPO, 'review', 'calibration.jsonl'), rows.map((p) => JSON.stringify({ ...p, band: band.includes(p), label: '' })).join('\n') + '\n');
  console.log(`wrote review/calibration.md (${top.length} top + ${band.length} band)`);
} else if (cmd === 'calibrate-apply') {
  const labelled = fs.readFileSync(path.join(REPO, 'review', 'calibration.jsonl'), 'utf8').split('\n').filter(Boolean)
    .map((l) => JSON.parse(l) as Pair & { band: boolean; label: Label });
  const bad = labelled.filter((l) => !['duplicate', 'paraphrase', 'distinct'].includes(l.label));
  if (bad.length || labelled.length !== 80) throw new Error(`calibration.jsonl: ${bad.length} unlabelled, ${labelled.length}/80 rows`);
  const t = thresholdFrom(labelled, labelled.filter((l) => !l.band));
  writeThresholdOnce(thresholdFile, { threshold: t, model: VOYAGE_MODEL }); // refuses a second run
  const counts = Object.fromEntries((['duplicate', 'paraphrase', 'distinct'] as const).map((x) => [x, labelled.filter((l) => l.label === x).length]));
  fs.appendFileSync(spec, `\n## Addendum ${new Date().toISOString().slice(0, 10)} — decontamination calibration\n\n` +
    `- Embedding model: \`${VOYAGE_MODEL}\`, input_type \`query\`.\n- Labels (Kamil, review/calibration.jsonl): ${JSON.stringify(counts)}.\n` +
    `- Cosine threshold: **${t}** (frozen before full generation).\n- Unanswerable grouping for the split: single-link embedding cosine ≥ 0.80.\n`);
  console.log(`threshold ${t} → addendum appended to the spec`);
} else if (cmd === 'apply') {
  const { threshold, model } = readThreshold(thresholdFile);
  if (model !== VOYAGE_MODEL) throw new Error(`threshold was calibrated with ${model}, code uses ${VOYAGE_MODEL}`);
  const emb = await embeddings();
  const drops = decontaminate(train, test, emb, threshold);
  for (const i of work) {
    const d = drops.get(i.id);
    if (d) Object.assign(i, { status: 'dropped', reason: `decontam:${d.rule}:${d.ref}` });
    else if (i.status === 'agreed') i.decontam = threshold;
  }
  writeItems(work, workFile);
  const pairs = bestMatches(train, test, emb);
  const hist = Array.from({ length: 20 }, (_, b) => pairs.filter((p) => Math.min(19, Math.floor(p.cos * 20)) === b).length);
  const keptPairs = pairs.filter((p) => !drops.has(p.trainId)).slice(0, 10);
  fs.mkdirSync(path.join(REPO, 'results'), { recursive: true });
  const total = decontamCounts(work); // cumulative over every run (pilot, full, top-ups)
  fs.appendFileSync(path.join(REPO, 'results', 'decontamination-runs.jsonl'), JSON.stringify({ at: new Date().toISOString(), threshold,
    checked: train.length, dropped_this_run: drops.size, by_rule_this_run: Object.fromEntries(['jaccard', 'cosine', 'result', 'train-dup']
      .map((r) => [r, [...drops.values()].filter((d) => d.rule === r).length])) }) + '\n');
  fs.writeFileSync(path.join(REPO, 'results', 'decontamination.md'), [
    `# Decontamination (threshold ${threshold}, ${VOYAGE_MODEL})`, '',
    `Latest run: checked ${train.length} cross-checked pairs against ${test.length} test items, dropped ${drops.size}, kept ${train.length - drops.size}. Totals below are cumulative over all runs (per-run log: results/decontamination-runs.jsonl).`, '',
    '| rule | dropped (cumulative) |', '|---|---:|', ...(['jaccard', 'cosine', 'result', 'train-dup'] as const).map((r) => `| ${r} | ${total[r]} |`), '',
    '## Best-match cosine histogram (0.05 bins)', '', '| bin | pairs |', '|---|---:|',
    ...hist.map((n, b) => (n ? `| ${(b / 20).toFixed(2)}–${((b + 1) / 20).toFixed(2)} | ${n} |` : '')).filter(Boolean), '',
    '## 10 closest kept pairs', '', ...keptPairs.map((p) => `- ${p.cos.toFixed(3)} — train: ${q(p.trainId)} / test: ${q(p.testId)}`), '',
  ].join('\n'));
  console.log(`dropped ${drops.size}, kept ${train.length - drops.size} → results/decontamination.md`);
} else {
  throw new Error('usage: decontam.ts embed | calibrate | calibrate-apply | apply');
}
