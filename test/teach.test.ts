import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { planBatches, draftBatches, importDrafts, type Focus } from '../src/teach.ts';
import { readItems } from '../src/items.ts';
import { FIXER_HASH } from '../src/fix.ts';

const F = (n: number, p: string): Focus[] => Array.from({ length: n }, (_, k) => ({ tables: `${p}${k}`, feature: `${p}-feature${k}` }));
const focus = { easy: F(3, 'e'), medium: F(4, 'm'), hard: F(5, 'h'), unanswerable: F(2, 'u') };
const FP = { fingerprint: (b: { id: string }) => `fp-${b.id}` };
const tmp = () => fs.mkdtempSync(path.join(os.tmpdir(), 'teach-'));
const fakeAsk = (fail = new Set<string>()) => async (b: { id: string; count: number }) => {
  if (fail.has(b.id)) throw new Error('boom');
  return { prompt: `p-${b.id}`, items: Array.from({ length: b.count }, (_, k) => ({ question: `${b.id} q${k}?`, sql: 'SELECT a FROM /dmo/carrier', ordered: false })) };
};

test('planBatches hits the tier mix', () => {
  const n: Record<string, number> = {};
  for (const b of planBatches(2000, focus)) n[b.tier] = (n[b.tier] ?? 0) + b.count;
  assert.deepEqual(n, { easy: 600, medium: 700, hard: 500, unanswerable: 200 });
});
test('planBatches is deterministic and prefix-stable', () => {
  assert.deepEqual(planBatches(300, focus), planBatches(300, focus));
  const big = planBatches(4500, focus);
  const small = planBatches(300, focus);
  assert.deepEqual(big.slice(0, small.length), small);
});
test('teach skips a failed batch and keeps going', async () => {
  const d = tmp(); const drafts = path.join(d, 'drafts'); const items = path.join(d, 'work.jsonl');
  const batches = planBatches(30, focus);
  await draftBatches(batches, drafts, fakeAsk(new Set([batches[1].id])), FP);
  importDrafts(drafts, items);
  const got = readItems(items);
  assert.equal(got.length, 20);
  assert.ok(!got.some((i) => i.batch === batches[1].id));
  assert.ok(got.every((i) => i.source === 'teacher' && i.status === 'drafted'));
});
test('teach resumes without duplicates and drafts only missing batches', async () => {
  const d = tmp(); const drafts = path.join(d, 'drafts'); const items = path.join(d, 'work.jsonl');
  const batches = planBatches(30, focus);
  await draftBatches(batches, drafts, fakeAsk(new Set([batches[2].id])), FP);
  importDrafts(drafts, items);
  let calls = 0;
  await draftBatches(batches, drafts, async (b) => { calls++; return fakeAsk()(b); }, FP);
  importDrafts(drafts, items);
  assert.equal(calls, 1);
  assert.equal(readItems(items).length, 30);
});
test('crash after saving a batch but before import → next run imports it once', async () => {
  const d = tmp(); const drafts = path.join(d, 'drafts'); const items = path.join(d, 'work.jsonl');
  await draftBatches(planBatches(10, focus), drafts, fakeAsk(), FP);
  importDrafts(drafts, items);
  importDrafts(drafts, items);
  assert.equal(readItems(items).length, 10);
});
test('import keeps later statuses of existing items', async () => {
  const d = tmp(); const drafts = path.join(d, 'drafts'); const items = path.join(d, 'work.jsonl');
  await draftBatches(planBatches(10, focus), drafts, fakeAsk(), FP);
  importDrafts(drafts, items);
  const all = readItems(items); all[0].status = 'agreed';
  fs.writeFileSync(items, all.map((i) => JSON.stringify(i)).join('\n') + '\n');
  importDrafts(drafts, items);
  assert.equal(readItems(items)[0].status, 'agreed');
});
test('saved batch files keep the exact prompt', async () => {
  const d = tmp(); const drafts = path.join(d, 'drafts');
  const [b] = planBatches(10, focus);
  await draftBatches([b], drafts, fakeAsk(), FP);
  assert.equal(JSON.parse(fs.readFileSync(path.join(drafts, `${b.id}.json`), 'utf8')).prompt, `p-${b.id}`);
});
test('teach never reads the test set', () => {
  for (const f of ['src/teach.ts', 'scripts/teach.ts', 'src/teacher.ts', 'src/profile.ts', 'prompts/teach.md']) {
    assert.ok(!fs.readFileSync(new URL(`../${f}`, import.meta.url), 'utf8').includes('testset'), f);
  }
});

test('each tier draws from its own focus list without repeats until the list is used up', () => {
  const plan = planBatches(10_000, focus);
  for (const [tier, list] of Object.entries(focus)) {
    const mine = plan.filter((b) => b.tier === tier);
    assert.ok(mine.every((b) => list.includes(b.focus)), tier);
    const first = mine.slice(0, list.length).map((b) => b.focus.tables);
    assert.equal(new Set(first).size, list.length, tier);
  }
});
test('repeated focuses get a different variation round, so no two prompts of a tier are identical', () => {
  const plan = planBatches(10_000, focus);
  for (const tier of Object.keys(focus)) {
    const keys = plan.filter((b) => b.tier === tier).map((b) => `${b.focus.tables}|${b.round}`);
    assert.equal(new Set(keys).size, keys.length, tier);
  }
});
test('a batch with missing, empty or wrong-sized items is not saved and is logged', async () => {
  const d = tmp(); const drafts = path.join(d, 'drafts'); const log = path.join(d, 'teach.log');
  const [b1, b2, b3] = planBatches(30, focus);
  const bad = new Map<string, unknown>([[b1.id, { prompt: 'p', items: undefined }], [b2.id, { prompt: 'p', items: [] }],
    [b3.id, { prompt: 'p', items: [{ question: 'q', sql: null, ordered: false }] }]]);
  await draftBatches([b1, b2, b3], drafts, async (b) => bad.get(b.id) as any, { ...FP, logFile: log });
  assert.equal(fs.readdirSync(drafts).filter((f) => f.endsWith('.json')).length, 0);
  const logged = fs.readFileSync(log, 'utf8');
  for (const b of [b1, b2, b3]) assert.ok(logged.includes(b.id), b.id);
});
test('saved batches record the teacher model', async () => {
  const d = tmp(); const drafts = path.join(d, 'drafts');
  const [b] = planBatches(10, focus);
  await draftBatches([b], drafts, async (x) => ({ ...(await fakeAsk()(x)), model: 'teacher-x' }), FP);
  assert.equal(JSON.parse(fs.readFileSync(path.join(drafts, `${b.id}.json`), 'utf8')).model, 'teacher-x');
});
test('resume refuses a saved batch whose prompt or request settings differ, before any call', async () => {
  const d = tmp(); const drafts = path.join(d, 'drafts');
  const [b] = planBatches(10, focus);
  await draftBatches([b], drafts, fakeAsk(), FP);
  assert.equal(JSON.parse(fs.readFileSync(path.join(drafts, `${b.id}.json`), 'utf8')).fingerprint, `fp-${b.id}`);
  let calls = 0;
  await assert.rejects(draftBatches([b, ...planBatches(20, focus).slice(1)], drafts, async (x) => { calls++; return fakeAsk()(x); },
    { fingerprint: () => 'other-config' }), /fp-b0001.*other-config/);
  assert.equal(calls, 0);
});
test('resume refuses a saved batch that has no fingerprint (made before binding)', async () => {
  const d = tmp(); const drafts = path.join(d, 'drafts');
  const [b] = planBatches(10, focus);
  fs.mkdirSync(drafts, { recursive: true });
  fs.writeFileSync(path.join(drafts, `${b.id}.json`), JSON.stringify({ batch: b, model: 'old', prompt: 'p', items: [] }));
  await assert.rejects(draftBatches([b], drafts, fakeAsk(), FP), /fingerprint/);
});
test('a fatal teacher error stops dispatching new batches and fails the run', async () => {
  const d = tmp(); const drafts = path.join(d, 'drafts');
  let calls = 0;
  const fatal = Object.assign(new Error('teacher response rejected — served by provider Novita'), { fatal: true });
  await assert.rejects(draftBatches(planBatches(30, focus), drafts, async () => { calls++; throw fatal; }, { ...FP, concurrency: 1 }), /Novita/);
  assert.equal(calls, 1);
});

test('import keeps the raw teacher SQL, stores the fixer-repaired label and records the repair', async () => {
  const d = tmp(); const drafts = path.join(d, 'drafts'); const items = path.join(d, 'work.jsonl');
  const [b] = planBatches(10, focus);
  const sqls = ['SELECT f~carrier_id, COUNT(f~connection_id) AS n FROM /dmo/flight f GROUP BY f~carrier_id', 'SELECT carrier_id FROM /dmo/carrier', null];
  await draftBatches([b], drafts, async (x) => ({ prompt: 'p', items: Array.from({ length: x.count }, (_, k) => ({ question: `q${k}?`, sql: sqls[k % 3], ordered: false })) }), FP);
  importDrafts(drafts, items);
  const [fixed, same, none] = readItems(items);
  assert.equal(fixed.raw_sql, sqls[0]);
  assert.equal(fixed.reference_sql, 'SELECT f~carrier_id, COUNT( f~connection_id ) AS n FROM /dmo/flight AS f GROUP BY f~carrier_id');
  assert.equal(fixed.repaired, true);
  assert.equal(fixed.fixer, FIXER_HASH);
  assert.deepEqual([same.repaired, same.reference_sql, same.raw_sql], [false, sqls[1], sqls[1]]);
  assert.deepEqual([none.repaired, none.reference_sql, none.raw_sql], [false, null, null]);
});
