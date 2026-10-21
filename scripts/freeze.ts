// Step 5: freeze accepted items → testset.jsonl + fingerprint.json. Never overwrites a frozen release.
//   node scripts/freeze.ts [--items <file> --out <name.jsonl>]   (other --out: data must match fingerprint.json)
import fs from 'node:fs';
import path from 'node:path';
import { connect } from '../src/a4h.ts';
import { assertNotFrozen, fingerprint, freezable, freezePlan, recaptureDiff } from '../src/fingerprint.ts';
import { itemsFileArg, readItems, REPO, TIERS } from '../src/items.ts';
import { judge } from '../src/validate.ts';

const outArg = process.argv.indexOf('--out');
const out = outArg < 0 ? 'testset.jsonl' : process.argv[outArg + 1];
const plan = freezePlan(out);
assertNotFrozen(REPO, plan.guardFiles);
const check = freezable(readItems(itemsFileArg()));
if (!check.ok) { console.error(check.problems.join('\n')); process.exit(1); }

const a4h = await connect();
const before = await fingerprint(a4h);
const frozen = [];
const changed: string[] = [];
for (const i of check.items) {
  let expected = null;
  if (i.reference_sql !== null) {
    const o = await a4h.run(i.reference_sql);
    const v = judge(i.reference_sql, o);
    if (!v.ok || !o.ok) throw new Error(`${i.id}: reference no longer passes: ${v.ok ? 'error' : v.reason}`);
    const diff = recaptureDiff(i, o.result);
    if (diff) changed.push(diff);
    expected = { columns: o.result.columns, rows: o.result.rows };
  }
  frozen.push({ id: i.id, tier: i.tier, question: i.question, reference_sql: i.reference_sql, ordered: i.ordered,
    expected, source: i.source, pipeline: i.pipeline });
}
if (changed.length) {
  console.error(`Not frozen — these answers differ from what was reviewed:\n${changed.join('\n')}`);
  process.exit(1);
}
const after = await fingerprint(a4h);
if (JSON.stringify(before) !== JSON.stringify(after)) throw new Error('data changed during freeze — rerun in a write-free window');
if (!plan.writesFingerprint) {
  const existing = JSON.parse(fs.readFileSync(path.join(REPO, 'fingerprint.json'), 'utf8')).tables;
  if (JSON.stringify(existing) !== JSON.stringify(after)) throw new Error('data differs from fingerprint.json — the new set must use the same data state');
}

const tmp = path.join(REPO, 'tmp');
fs.mkdirSync(tmp, { recursive: true });
fs.writeFileSync(path.join(tmp, out), frozen.map((f) => JSON.stringify(f)).join('\n') + '\n');
if (plan.writesFingerprint) {
  fs.writeFileSync(path.join(tmp, 'fingerprint.json'), JSON.stringify({ captured_at: new Date().toISOString(), tables: after }, null, 2) + '\n');
  fs.renameSync(path.join(tmp, 'fingerprint.json'), path.join(REPO, 'fingerprint.json'));
}
fs.renameSync(path.join(tmp, out), path.join(REPO, out));
for (const t of TIERS) console.log(`${t.padEnd(13)} ${frozen.filter((f) => f.tier === t).length}`);
console.log(`frozen ${frozen.length} items`);
