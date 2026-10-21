import { test } from 'node:test';
import assert from 'node:assert/strict';
import { extractAnswer, grade, rotateAnswers, runCandidate, summarize, type ItemResult, type TestItem } from '../src/eval.ts';
import type { Outcome, Result } from '../src/a4h.ts';

const res = (rows: string[][]): Result => ({ columns: [{ name: 'A', type: 'C' }], rows, totalRows: rows.length });
const okOut = (rows: string[][]): Outcome => ({ ok: true, result: res(rows) });
const item = (over: Partial<TestItem> = {}): TestItem => ({
  id: 'q0001', tier: 'easy', question: 'Which carriers?', reference_sql: 'SELECT a FROM /DMO/CARRIER',
  ordered: false, expected: res([['LH'], ['AF']]), ...over,
});
const unans = () => item({ tier: 'unanswerable', reference_sql: null, expected: null });
const ref = res([['LH'], ['AF']]);

test('extractAnswer: plain SQL is trimmed', () => {
  assert.equal(extractAnswer('  SELECT a FROM /DMO/CARRIER \n'), 'SELECT a FROM /DMO/CARRIER');
});
test('extractAnswer: takes the first fenced block', () => {
  assert.equal(extractAnswer('Here you go:\n```sql\nSELECT a\nFROM /DMO/CARRIER\n```\nDone.'), 'SELECT a\nFROM /DMO/CARRIER');
});
test('extractAnswer: UNANSWERABLE marker, tolerant of case, fences and punctuation', () => {
  assert.equal(extractAnswer('UNANSWERABLE'), 'UNANSWERABLE');
  assert.equal(extractAnswer('`unanswerable.`'), 'UNANSWERABLE');
  assert.equal(extractAnswer('```\nUNANSWERABLE\n```'), 'UNANSWERABLE');
});
test('extractAnswer: marker mixed with SQL is not the marker', () => {
  assert.notEqual(extractAnswer('UNANSWERABLE\nSELECT a FROM /DMO/CARRIER'), 'UNANSWERABLE');
});

test('unanswerable item: UNANSWERABLE passes', () => {
  assert.deepEqual(grade(unans(), null, 'UNANSWERABLE', null), { pass: true, reason: 'unanswerable' });
});
test('unanswerable item: any SQL fails, even if it runs', () => {
  const g = grade(unans(), null, 'SELECT a FROM /DMO/CARRIER', okOut([['LH']]));
  assert.equal(g.pass, false);
  assert.match(g.reason, /answered with SQL/);
});
test('answerable item: UNANSWERABLE fails', () => {
  const g = grade(item(), ref, 'UNANSWERABLE', null);
  assert.equal(g.pass, false);
  assert.match(g.reason, /said UNANSWERABLE/);
});
test('missing or empty answer fails', () => {
  assert.equal(grade(item(), ref, undefined, null).pass, false);
  assert.match(grade(item(), ref, '', null).reason, /no answer/);
});
test('foreign table fails without needing an outcome', () => {
  const g = grade(item(), ref, 'SELECT * FROM usr02', null);
  assert.equal(g.pass, false);
  assert.match(g.reason, /outside the benchmark: USR02/);
});
test('SQL error fails', () => {
  const g = grade(item(), ref, 'SELECT x FROM /DMO/CARRIER', { ok: false, error: 'Column X unknown' });
  assert.deepEqual(g, { pass: false, reason: 'sql error: Column X unknown' });
});
test('matching result passes, order ignored when unordered', () => {
  assert.equal(grade(item(), ref, 'SELECT a FROM /DMO/CARRIER', okOut([['AF'], ['LH']])).pass, true);
});
test('ordered item: wrong order fails', () => {
  const g = grade(item({ ordered: true }), ref, 'SELECT a FROM /DMO/CARRIER', okOut([['AF'], ['LH']]));
  assert.deepEqual(g, { pass: false, reason: 'rows differ' });
});
test('grades against the recaptured reference, not the frozen expected', () => {
  const g = grade(item(), res([['LH']]), 'SELECT a FROM /DMO/CARRIER', okOut([['LH']]));
  assert.equal(g.pass, true);
});

const row = (over: Partial<ItemResult>): ItemResult => ({
  id: 'q', tier: 'easy', model: 'm', answer: 'SELECT 1', pass: true, reason: 'match', sql_error: false,
  foreign: false, gen_ms: 100, exec_ms: 10, ...over,
});

test('summarize: accuracy overall and per tier', () => {
  const s = summarize([
    row({ tier: 'easy', pass: true }), row({ tier: 'easy', pass: false }),
    row({ tier: 'hard', pass: true }), row({ tier: 'unanswerable', answer: 'UNANSWERABLE', pass: true }),
  ]).m;
  assert.equal(s.n, 4);
  assert.equal(s.accuracy, 0.75);
  assert.deepEqual(s.tiers.easy, { n: 2, pass: 1, accuracy: 0.5 });
  assert.deepEqual(s.tiers.medium, { n: 0, pass: 0, accuracy: null });
  assert.deepEqual(s.tiers.hard, { n: 1, pass: 1, accuracy: 1 });
});
test('summarize: unanswerable precision and recall', () => {
  const s = summarize([
    row({ tier: 'unanswerable', answer: 'UNANSWERABLE', pass: true }), // TP
    row({ tier: 'unanswerable', answer: 'SELECT 1', pass: false }), // FN
    row({ tier: 'easy', answer: 'UNANSWERABLE', pass: false }), // FP
    row({ tier: 'easy', answer: 'UNANSWERABLE', pass: false }), // FP
  ]).m;
  assert.equal(s.unanswerable.precision, 1 / 3);
  assert.equal(s.unanswerable.recall, 0.5);
});
test('summarize: precision is null when the model never says UNANSWERABLE', () => {
  assert.equal(summarize([row({})]).m.unanswerable.precision, null);
});
test('summarize: SQL-error rate is over SQL answers only', () => {
  const s = summarize([
    row({ sql_error: true, pass: false }), row({}), row({ answer: 'UNANSWERABLE', pass: false }),
    row({ foreign: true, pass: false }),
  ]).m;
  assert.equal(s.sql_answers, 3);
  assert.equal(s.sql_errors, 1);
  assert.equal(s.sql_error_rate, 1 / 3);
  assert.equal(s.foreign, 1);
});
test('summarize: latency median and p95 (nearest rank)', () => {
  const rows = Array.from({ length: 20 }, (_, i) => row({ gen_ms: (i + 1) * 10, exec_ms: i + 1 }));
  const s = summarize(rows).m;
  assert.equal(s.gen_ms.median, 100);
  assert.equal(s.gen_ms.p95, 190);
  assert.equal(s.exec_ms.median, 10);
});
test('summarize: exec latency ignores items that were not executed', () => {
  const s = summarize([row({ exec_ms: null }), row({ exec_ms: 7 })]).m;
  assert.equal(s.exec_ms.median, 7);
});
test('summarize: keyed per model', () => {
  const s = summarize([row({ model: 'a' }), row({ model: 'b', pass: false })]);
  assert.deepEqual(Object.keys(s), ['a', 'b']);
  assert.equal(s.b.accuracy, 0);
});

const fakeA4H = (run: () => Promise<Outcome>) => ({ run });
test('runCandidate: an HTTP 500 dump from candidate SQL is that SQL failing', async () => {
  const o = await runCandidate(fakeA4H(async () => { throw new Error('A4H HTTP 500: <html>dump</html>'); }), 'SELECT 1');
  assert.deepEqual(o, { ok: false, error: 'server error (HTTP 500, short dump)' });
});
test('runCandidate: other infrastructure errors still abort', async () => {
  await assert.rejects(runCandidate(fakeA4H(async () => { throw new Error('A4H HTTP 401: nope'); }), 'SELECT 1'), /401/);
  await assert.rejects(runCandidate(fakeA4H(async () => { throw new TypeError('fetch failed'); }), 'SELECT 1'), /fetch failed/);
});
test('runCandidate: normal outcomes pass through', async () => {
  const out = okOut([['LH']]);
  assert.deepEqual(await runCandidate(fakeA4H(async () => out), 'SELECT 1'), out);
});

test('rotateAnswers: SQL answers move to the next SQL item, UNANSWERABLE stays put', () => {
  const out = rotateAnswers([
    { id: 'a', sql: 'S1', ms: 1 }, { id: 'b', sql: 'UNANSWERABLE', ms: 2 }, { id: 'c', sql: 'S3', ms: 3 }, { id: 'd', sql: 'S4', ms: 4 },
  ]);
  assert.deepEqual(out.map((a) => [a.id, a.sql]), [['a', 'S3'], ['b', 'UNANSWERABLE'], ['c', 'S4'], ['d', 'S1']]);
});
test('summarize: counts short dumps per model', () => {
  const s = summarize([row({ sql_error: true, pass: false, reason: 'sql error: server error (HTTP 500, short dump)' }), row({})]).m;
  assert.equal(s.dumps, 1);
});
