import { test } from 'node:test';
import assert from 'node:assert/strict';
import { decide, buildPrompt, checkAnswers, repairChecker } from '../src/crosscheck.ts';
import { FIXER_HASH } from '../src/fix.ts';
import type { Outcome, Result } from '../src/a4h.ts';
import type { WorkItem } from '../src/items.ts';

const res = (rows: string[][]): Result => ({ columns: [{ name: 'A', type: 'C' }], rows, totalRows: rows.length });
const okOut = (rows: string[][]): Outcome => ({ ok: true, result: res(rows) });
const item = (over: Partial<WorkItem> = {}): WorkItem => ({
  id: 'q0001', batch: 'b', tier: 'easy', question: 'Which carriers?', reference_sql: 'SELECT a FROM /dmo/carrier',
  ordered: false, source: 'codex', status: 'validated', flags: [], expected: res([['LH'], ['AF']]), ...over,
});
const unans = () => item({ tier: 'unanswerable', reference_sql: null, expected: null });

test('unanswerable + cross null → agreed', () => {
  const d = decide(unans(), null, null);
  assert.equal(d.status, 'agreed');
  assert.equal(d.pipeline, 'agree');
  assert.equal(d.checked_question, 'Which carriers?');
  assert.equal(d.crosscheck_result, null);
});
test('unanswerable + cross SQL → disputed with executed evidence', () => {
  const out = okOut([['LH']]);
  const d = decide(unans(), 'SELECT a FROM /dmo/carrier', out);
  assert.equal(d.status, 'disputed');
  assert.match(d.reason!, /cross answered with SQL/);
  assert.deepEqual(d.crosscheck_result, out);
  assert.equal(d.crosscheck_sql, 'SELECT a FROM /dmo/carrier');
});
test('answerable + cross null → disputed', () => {
  const d = decide(item(), null, null);
  assert.equal(d.status, 'disputed');
  assert.match(d.reason!, /UNANSWERABLE/);
});
test('cross SQL error → disputed with judge reason and stored outcome', () => {
  const out: Outcome = { ok: false, error: 'boom' };
  const d = decide(item(), 'SELECT x FROM /dmo/carrier', out);
  assert.equal(d.status, 'disputed');
  assert.match(d.reason!, /sql error: boom/);
  assert.deepEqual(d.crosscheck_result, out);
});
test('truncated cross result is disputed, never agreed', () => {
  const rows = Array.from({ length: 1000 }, (_, i) => [String(i)]);
  const ref = item({ expected: res(rows) });
  const d = decide(ref, 'SELECT a FROM /dmo/flight', okOut([...rows, ['1000']]));
  assert.equal(d.status, 'disputed');
  assert.match(d.reason!, /more than 1000 rows/);
  assert.ok(d.crosscheck_result);
});
test('results differ → disputed', () => {
  const d = decide(item(), 'SELECT a FROM /dmo/carrier', okOut([['LH']]));
  assert.equal(d.status, 'disputed');
  assert.match(d.reason!, /results differ/);
  assert.ok(d.crosscheck_result);
});
test('same rows → agreed', () => {
  const d = decide(item(), 'SELECT a FROM /dmo/agency', okOut([['AF'], ['LH']]));
  assert.equal(d.status, 'agreed');
  assert.equal(d.pipeline, 'agree');
  assert.equal(d.checked_question, 'Which carriers?');
  assert.ok(d.crosscheck_result);
});
test('prompt never contains reference SQL, tier or ordered', () => {
  const p = buildPrompt([item({ reference_sql: 'SELECT secret_marker FROM x', tier: 'hard', ordered: true })], 'SCHEMA');
  assert.ok(!p.includes('secret_marker'));
  assert.ok(!/\bhard\b/.test(p));
  assert.ok(!p.includes('"ordered"'));
  assert.ok(p.includes('Which carriers?') && p.includes('q0001') && p.includes('SCHEMA'));
});
import { interleave } from '../src/crosscheck.ts';
test('interleave mixes tiers so a batch is never one tier', () => {
  const mk = (id: string, tier: WorkItem['tier']) => item({ id, tier });
  const out = interleave([mk('a1', 'easy'), mk('a2', 'easy'), mk('u1', 'unanswerable'), mk('u2', 'unanswerable'), mk('u3', 'unanswerable'), mk('h1', 'hard')]);
  assert.deepEqual(out.map((i) => i.id), ['a1', 'u1', 'h1', 'a2', 'u2', 'u3']);
});
test('cross SQL reading other tables is disputed and never needs execution', () => {
  const d = decide(item(), 'SELECT bname FROM usr02', null);
  assert.equal(d.status, 'disputed');
  assert.match(d.reason!, /outside the benchmark/);
});
test('unanswerable item with a failing cross SQL is disputed, not agreed', () => {
  const d = decide(unans(), 'SELECT nope FROM /dmo/carrier', { ok: false, error: 'Unknown column' });
  assert.equal(d.status, 'disputed');
  assert.match(d.reason!, /cross answered with SQL/);
});
import { crosscheckArgs } from '../src/crosscheck.ts';
test('--via checker requires an explicit --items file', () => {
  assert.throws(() => crosscheckArgs(['--via', 'checker']), /--items/);
  assert.equal(crosscheckArgs(['--via', 'checker', '--items', 'train/work.jsonl']).via, 'checker');
  assert.throws(() => crosscheckArgs(['--via', 'teacher', '--items', 'x']), /--via codex\|checker/);
  assert.equal(crosscheckArgs([]).via, 'codex');
  assert.throws(() => crosscheckArgs(['--via', 'gpt']), /codex\|checker/);
});
test('checkAnswers accepts exactly one answer per batch id', () => {
  const ids = ['a', 'b'];
  assert.deepEqual(checkAnswers(ids, { answers: [{ id: 'b', sql: null }, { id: 'a', sql: 'SELECT 1' }] }),
    [{ id: 'b', sql: null }, { id: 'a', sql: 'SELECT 1' }]);
  for (const bad of [null, {}, { answers: null }, { answers: [{ id: 'a', sql: 'x' }] }, { answers: [{ id: 'a', sql: 'x' }, { id: 'a', sql: 'y' }] },
    { answers: [{ id: 'a', sql: 'x' }, { id: 'c', sql: 'y' }] }, { answers: [{ id: 'a', sql: 1 }, { id: 'b', sql: null }] },
    { answers: [{ id: 'a', sql: 'x' }, { id: 'b', sql: null }, { id: 'b', sql: null }] }]) {
    assert.throws(() => checkAnswers(ids, bad), /checker answers/, JSON.stringify(bad));
  }
});

test('repairChecker applies the frozen fixer to checker SQL and keeps the raw answer', () => {
  assert.deepEqual(repairChecker('SELECT COUNT(carrier_id) AS n FROM /dmo/flight f'),
    { sql: 'SELECT COUNT( carrier_id ) AS n FROM /dmo/flight AS f', crosscheck_raw_sql: 'SELECT COUNT(carrier_id) AS n FROM /dmo/flight f', crosscheck_repaired: true });
  assert.deepEqual(repairChecker(null), { sql: null, crosscheck_raw_sql: null, crosscheck_repaired: false });
  assert.equal(FIXER_HASH.length, 64);
});
test('the checker prompt carries the ABAP rules and asks for JSON null, never the string "sql: null"', () => {
  const p = buildPrompt([], 'SCHEMA');
  assert.match(p, /DATS_DAYS_BETWEEN/);
  assert.match(p, /JSON `null`/);
  assert.ok(!p.includes('`sql: null`'));
  assert.ok(!p.includes('{{'));
});
