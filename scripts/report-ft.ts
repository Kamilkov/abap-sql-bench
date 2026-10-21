// Pre-registered fine-tune report (spec Part C) for one finished campaign.
//   node scripts/report-ft.ts <campaign-id>   (primary pair fixed: frozen candidate vs Qwen + fixer)
import fs from 'node:fs';
import path from 'node:path';
import { parseArgs } from 'node:util';
import { loadDataset } from '../src/datasets.ts';
import { cosine, embed } from '../src/decontam.ts';
import type { ItemResult } from '../src/eval.ts';
import { REPO, TIERS } from '../src/items.ts';
import { DATASETS, MARKER } from '../src/datasets.ts';
import { assertPrimaryCampaign, cell, mcnemarExact, primaryPair, primaryVerdict, seenSplit, terciles, trainedSkeletons } from '../src/stats.ts';

const { positionals: [campaign] } = parseArgs({ allowPositionals: true, options: {} });
if (!campaign) throw new Error('usage: report-ft.ts <campaign-id>');
const opt = primaryPair(MARKER);
const dir = path.join(REPO, 'results', campaign);
const jsonl = (f: string) => fs.readFileSync(f, 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l));
const { meta } = JSON.parse(fs.readFileSync(path.join(dir, 'summary.json'), 'utf8'));
const marker = JSON.parse(fs.readFileSync(MARKER, 'utf8')) as { name: string; identity: string };
assertPrimaryCampaign(meta, marker, JSON.parse(fs.readFileSync(DATASETS, 'utf8')).datasets['test-v1'].sha256);
const test = loadDataset(meta.dataset).items;
const rows = jsonl(path.join(dir, 'items.jsonl')) as ItemResult[];
const passOf = (m: string) => new Map(rows.filter((r) => r.model === m).map((r) => [r.id, r.pass]));
const cand = passOf(opt.candidate), base = passOf(opt.baseline);
if (cand.size !== test.length || base.size !== test.length) throw new Error(`campaign must grade both ${opt.candidate} and ${opt.baseline} on every item`);

const b = test.filter((t) => base.get(t.id) && !cand.get(t.id)).length;
const c = test.filter((t) => !base.get(t.id) && cand.get(t.id)).length;
const acc = (m: Map<string, boolean>, ids = test.map((t) => t.id)) => ids.filter((id) => m.get(id)).length;
const p = mcnemarExact(b, c);
const verdict = primaryVerdict({ candidateAcc: acc(cand) / test.length, baselineAcc: acc(base) / test.length, p });

// Seen/unseen and similarity use only pairs the model trained on (val excluded) — decided before results.
const valIds = new Set((jsonl(path.join(REPO, 'train', 'val.items.jsonl')) as { id: string }[]).map((v) => v.id));
const train = (jsonl(path.join(REPO, 'train', 'items.jsonl')) as { id: string; question: string; skeleton: string | null }[])
  .filter((t) => !valIds.has(t.id));
const seen = seenSplit(test, trainedSkeletons(train, new Set()));
const vecs = await embed([...test.map((t) => t.question), ...train.map((t) => t.question)], { cacheFile: path.join(REPO, 'train', 'embeddings.jsonl') });
const testVec = vecs.slice(0, test.length), trainVec = vecs.slice(test.length);
const sim = new Map(test.map((t, k) => [t.id, Math.max(...trainVec.map((v) => cosine(testVec[k], v)))]));

const pct = (x: number) => `${(100 * x).toFixed(1)}%`;
const lines: string[] = [
  `# Fine-tune report — campaign ${campaign}`, '',
  `Dataset \`${meta.dataset}\` (sha256 ${meta.dataset_sha256.slice(0, 12)}…), ${test.length} items. Candidate \`${opt.candidate}\` vs baseline \`${opt.baseline}\`.`, '',
  '## Primary (pre-registered)', '',
  `- Candidate ${pct(acc(cand) / test.length)} (${acc(cand)}/${test.length}), baseline ${pct(acc(base) / test.length)} (${acc(base)}/${test.length}), difference ${((100 * (acc(cand) - acc(base))) / test.length).toFixed(1)} points.`,
  `- Discordant pairs: baseline-only passes b = ${b}, candidate-only passes c = ${c}. Exact two-sided McNemar p = ${p.toPrecision(3)}.`,
  `- **Verdict: ${verdict}** (success = p < 0.05 and candidate higher).`, '',
  'Secondary arms (candidate + fixer, zero-shot, few-shot, Claude) are in this campaign\'s summary.md; they are not part of the primary test.', '',
  '## Per tier', '', '| tier | candidate | baseline |', '|---|---|---|',
  ...TIERS.map((t) => { const ids = test.filter((i) => i.tier === t).map((i) => i.id); return `| ${t} | ${cell(acc(cand, ids), ids.length)} | ${cell(acc(base, ids), ids.length)} |`; }), '',
  '## Query pattern seen in training vs unseen (evidence against copying, not proof against memorization)', '',
  '| tier | group | candidate | baseline | improvement |', '|---|---|---|---|---|',
];
for (const t of TIERS) for (const g of ['seen', 'unseen', 'unanswerable'] as const) {
  const ids = test.filter((i) => i.tier === t && seen.get(i.id) === g).map((i) => i.id);
  if (g === 'unanswerable' && t !== 'unanswerable') continue;
  if (g !== 'unanswerable' && t === 'unanswerable') continue;
  const imp = ids.length ? `${((100 * (acc(cand, ids) - acc(base, ids))) / ids.length).toFixed(1)} pts` : '–';
  lines.push(`| ${t} | ${g} | ${cell(acc(cand, ids), ids.length)} | ${cell(acc(base, ids), ids.length)} | ${ids.length < 20 ? `${imp} (too small)` : imp} |`);
}
lines.push('', '## Improvement over baseline by similarity to the nearest training question (terciles within tier)', '',
  '| tier | tercile (1 = least similar) | n | candidate | baseline | improvement |', '|---|---|---|---|---|---|');
for (const t of TIERS) {
  const ids = test.filter((i) => i.tier === t).map((i) => i.id);
  const terc = terciles(new Map(ids.map((id) => [id, sim.get(id)!])));
  for (const k of [1, 2, 3] as const) {
    const g = ids.filter((id) => terc.get(id) === k);
    const imp = g.length ? `${((100 * (acc(cand, g) - acc(base, g))) / g.length).toFixed(1)} pts` : '–';
    lines.push(`| ${t} | ${k} | ${g.length} | ${cell(acc(cand, g), g.length)} | ${cell(acc(base, g), g.length)} | ${g.length < 20 ? `${imp} (too small)` : imp} |`);
  }
}
fs.writeFileSync(path.join(dir, 'finetune-report.md'), lines.join('\n') + '\n');
console.log(lines.slice(0, 12).join('\n'));
