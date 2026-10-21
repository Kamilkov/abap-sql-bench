// Step 2: run every drafted reference query on A4H → validated (expected captured) or rejected (reason).
import { connect, type Result } from '../src/a4h.ts';
import { runCandidate } from '../src/eval.ts';
import { itemsFileArg, readItems, writeItems } from '../src/items.ts';
import { staticCheck, judge, nearDuplicates } from '../src/validate.ts';

const file = itemsFileArg();
const items = readItems(file);
const todo = items.filter((i) => i.status === 'drafted');
const a4h = todo.some((i) => i.reference_sql) ? await connect() : null;

for (const item of todo) {
  const problem = staticCheck(item);
  if (problem) { Object.assign(item, { status: 'rejected', reason: problem }); continue; }
  if (item.reference_sql === null) { Object.assign(item, { status: 'validated', expected: null, reason: undefined }); continue; }
  const outcome = await runCandidate(a4h!, item.reference_sql); // a short dump rejects the item
  const verdict = judge(item.reference_sql, outcome);
  if (!verdict.ok) Object.assign(item, { status: 'rejected', reason: verdict.reason, expected: null });
  else Object.assign(item, { status: 'validated', reason: undefined, expected: outcome.ok ? outcome.result : null });
}

// Flags are advisory and recomputed over all live items.
const live = items.filter((i) => !['rejected', 'dropped'].includes(i.status));
for (const i of items) i.flags = i.flags.filter((f) => !f.startsWith('near-dup:') && !f.startsWith('same-result:'));
for (const [id, of] of nearDuplicates(live)) live.find((i) => i.id === id)!.flags.push(`near-dup:${of}`);
const key = (r: Result) => JSON.stringify(r.rows.map((row) => row.map((c) => c.trim())).sort());
const seen = new Map<string, string>();
for (const i of live) {
  if (!i.expected) continue;
  const k = key(i.expected);
  if (seen.has(k)) i.flags.push(`same-result:${seen.get(k)}`);
  else seen.set(k, i.id);
}

writeItems(items, file);
for (const i of todo) console.log(`${i.id} ${i.status}${i.reason ? ` — ${i.reason}` : ''}${i.flags.length ? ` [${i.flags.join(', ')}]` : ''}`);
