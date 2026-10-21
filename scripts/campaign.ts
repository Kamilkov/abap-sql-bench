// Campaign (spec "Data stability"): fingerprint check → per item, reference + every model's SQL back to back →
// grade → fingerprint check. Run inside a write-free window.
//   node scripts/campaign.ts <campaign-id> --dataset <name> answers/<name>/a.jsonl …
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { isDeepStrictEqual, parseArgs } from 'node:util';
import { assertMayScore, checkAnswerLines, loadDataset, MODELS, type ModelRegistry } from '../src/datasets.ts';
import { connect, type Result } from '../src/a4h.ts';
import { grade, runCandidate, summarize, UNANSWERABLE, type ItemResult, type TestItem } from '../src/eval.ts';
import { fingerprint, recaptureDiff } from '../src/fingerprint.ts';
import { REPO, TIERS } from '../src/items.ts';
import { foreignTables } from '../src/validate.ts';

const { positionals: [campaign, ...files], values: opt } = parseArgs({ allowPositionals: true, options: { dataset: { type: 'string' } } });
if (!campaign || !files.length || !opt.dataset) throw new Error('usage: campaign.ts <campaign-id> --dataset <name> <answers.jsonl>…');
const dir = path.join(REPO, 'results', campaign);
if (fs.existsSync(dir)) throw new Error(`results/${campaign} exists; pick a new campaign id`);

const sha = (f: string) => createHash('sha256').update(fs.readFileSync(f)).digest('hex');
const lines = (f: string) => fs.readFileSync(f, 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l));
const ds = loadDataset(opt.dataset);
const items: TestItem[] = ds.items;
const registry = JSON.parse(fs.readFileSync(MODELS, 'utf8')) as ModelRegistry;
// Last error-free line per id wins (generate.ts appends retries). Provenance is checked before anything runs.
const models = files.map((f) => {
  const model = path.basename(f, '.jsonl');
  const all = lines(f);
  const rel = path.relative(REPO, path.resolve(f));
  let { identity } = checkAnswerLines(all, { datasetSha: ds.sha256, file: rel, fileSha: sha(f), legacy: ds.legacy });
  if (identity === null) { // allowlisted legacy file: only for test-v1, identity from the registry
    if (ds.name !== 'test-v1') throw new Error(`${rel}: legacy answers are only valid for test-v1`);
    const e = registry[model];
    identity = (e?.derived_from ? registry[e.derived_from]?.identity : e?.identity) ?? null;
  }
  assertMayScore(ds, { name: model, identity }, { models: registry });
  return { model, file: f, identity, answers: new Map<string, { sql: string; ms: number }>(all.filter((a) => !a.error).map((a) => [a.id, a])) };
});
const frozen = JSON.parse(fs.readFileSync(path.join(REPO, 'fingerprint.json'), 'utf8'));

const a4h = await connect();
async function checkFingerprint(when: string) {
  const now = await fingerprint(a4h);
  const changed = Object.keys(frozen.tables).filter((t) => now[t] !== frozen.tables[t]);
  if (changed.length || !isDeepStrictEqual(now, frozen.tables)) {
    throw new Error(`fingerprint mismatch ${when}: ${changed.join(', ') || 'table set differs'} — campaign invalid`);
  }
}

const started = new Date().toISOString();
await checkFingerprint('before');
const rows: ItemResult[] = [];
for (const [k, item] of items.entries()) {
  let ref: Result | null = null;
  if (item.reference_sql !== null) {
    const o = await a4h.run(item.reference_sql);
    if (!o.ok) throw new Error(`${item.id}: reference SQL failed: ${o.error} — campaign invalid`);
    const diff = recaptureDiff(item, o.result);
    if (diff) throw new Error(`${diff} — campaign invalid`);
    ref = o.result;
  }
  for (const m of models) {
    const a = m.answers.get(item.id);
    const isSql = !!a?.sql && a.sql !== UNANSWERABLE;
    // Never execute SQL that reads outside the 13 benchmark tables.
    const foreign = isSql && foreignTables(a!.sql).length > 0;
    let outcome = null, exec_ms = null;
    if (isSql && !foreign) {
      const t0 = performance.now();
      outcome = await runCandidate(a4h, a!.sql);
      exec_ms = Math.round(performance.now() - t0);
    }
    const g = grade(item, ref, a?.sql, outcome);
    rows.push({ id: item.id, tier: item.tier, model: m.model, answer: a?.sql ?? null, pass: g.pass, reason: g.reason,
      sql_error: outcome ? !outcome.ok : false, foreign, gen_ms: a?.ms ?? null, exec_ms });
  }
  if ((k + 1) % 25 === 0) console.log(`${k + 1}/${items.length}`);
}
await checkFingerprint('after');

const summary = summarize(rows);
const meta = {
  campaign, started, finished: new Date().toISOString(), dataset: ds.name, dataset_sha256: ds.sha256,
  fingerprint_captured_at: frozen.captured_at,
  answers: Object.fromEntries(models.map((m) => [m.model, { file: path.relative(REPO, path.resolve(m.file)), sha256: sha(m.file), identity: m.identity }])),
};

const pct = (x: number | null) => (x === null ? '–' : `${(100 * x).toFixed(1)}%`);
const names = Object.keys(summary);
const tr = (label: string, f: (s: (typeof summary)[string]) => string) => `| ${label} | ${names.map((n) => f(summary[n])).join(' | ')} |`;
const md = [
  `# Campaign ${campaign}`, '',
  `${items.length} items, fingerprint verified before and after (${meta.started} → ${meta.finished}).`, '',
  `| | ${names.join(' | ')} |`, `|---|${names.map(() => '---:').join('|')}|`,
  tr('**overall**', (s) => `**${pct(s.accuracy)}** (${s.pass}/${s.n})`),
  ...TIERS.map((t) => tr(t, (s) => `${pct(s.tiers[t].accuracy)} (${s.tiers[t].pass}/${s.tiers[t].n})`)),
  tr('unanswerable precision', (s) => pct(s.unanswerable.precision)),
  tr('unanswerable recall', (s) => pct(s.unanswerable.recall)),
  tr('SQL-error rate', (s) => `${pct(s.sql_error_rate)} (${s.sql_errors}/${s.sql_answers})`),
  tr('foreign-table answers (not run)', (s) => String(s.foreign)),
  tr('generation latency median / p95', (s) => `${s.gen_ms.median} / ${s.gen_ms.p95} ms`),
  tr('execution latency median / p95', (s) => `${s.exec_ms.median} / ${s.exec_ms.p95} ms`),
].join('\n') + '\n';

fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(path.join(dir, 'items.jsonl'), rows.map((r) => JSON.stringify(r)).join('\n') + '\n');
fs.writeFileSync(path.join(dir, 'summary.json'), JSON.stringify({ meta, summary }, null, 2) + '\n');
fs.writeFileSync(path.join(dir, 'summary.md'), md);
console.log(md);
