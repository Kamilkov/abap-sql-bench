import { test } from 'node:test';
import assert from 'node:assert/strict';
import { staticCheck, judge, nearDuplicates } from '../src/validate.ts';
import type { Outcome } from '../src/a4h.ts';
import type { WorkItem } from '../src/items.ts';

const item = (over: Partial<WorkItem>): WorkItem => ({
  id: 'q0001', batch: 'b', tier: 'easy', question: 'List flights on 2026-06-20', reference_sql: 'SELECT a FROM /dmo/carrier',
  ordered: false, source: 'codex', status: 'drafted', flags: [], expected: null, ...over,
});
const ok = (totalRows: number, n: number): Outcome =>
  ({ ok: true, result: { columns: [{ name: 'A', type: 'C' }], rows: Array.from({ length: n }, () => ['x']), totalRows } });

test('staticCheck rejects today-relative wording', () => {
  assert.match(staticCheck(item({ question: 'Which flights depart this month?' }))!, /relative/);
  assert.match(staticCheck(item({ question: 'List recent bookings' }))!, /relative/);
  assert.equal(staticCheck(item({})), null);
});
test('staticCheck: ordered needs ORDER BY', () => {
  assert.match(staticCheck(item({ ordered: true }))!, /ORDER BY/);
  assert.equal(staticCheck(item({ ordered: true, reference_sql: 'SELECT a FROM /dmo/carrier ORDER BY a' })), null);
});
test('staticCheck: SQL presence must match answerability', () => {
  assert.ok(staticCheck(item({ reference_sql: null })));
  assert.ok(staticCheck(item({ tier: 'unanswerable' })));
  assert.equal(staticCheck(item({ tier: 'unanswerable', reference_sql: null })), null);
});
test('judge: sql error and empty', () => {
  assert.deepEqual(judge('SELECT a FROM /dmo/carrier', { ok: false, error: 'boom' }), { ok: false, reason: 'sql error: boom' });
  assert.deepEqual(judge('SELECT a FROM /dmo/carrier', ok(0, 0)), { ok: false, reason: '0 rows' });
});
test('judge: ceiling without UP TO counts returned rows (run fetches 1,001)', () => {
  assert.deepEqual(judge('SELECT a FROM /dmo/carrier', ok(5000, 1001)), { ok: false, reason: 'more than 1000 rows' });
  assert.deepEqual(judge('SELECT a FROM /dmo/carrier', ok(1000, 1000)), { ok: true });
});
test('judge: ignores totalRows, which is wrong for aggregates', () => {
  assert.deepEqual(judge('SELECT COUNT(*) AS n FROM /dmo/carrier', ok(476, 1)), { ok: true });
});
test('judge: explicit top-N over a large table is fine', () => {
  assert.deepEqual(judge('SELECT a FROM /dmo/carrier ORDER BY price DESCENDING, flight_date UP TO 5 ROWS', ok(20560, 5)), { ok: true });
  assert.deepEqual(judge('SELECT a FROM /dmo/carrier ORDER BY a UP TO 5 ROWS OFFSET 20558', ok(20560, 2)), { ok: true });
});
test('judge: ceiling applies with UP TO too', () => {
  assert.deepEqual(judge('SELECT a FROM /dmo/carrier ORDER BY a UP TO 2000 ROWS', ok(20560, 2000)), { ok: false, reason: 'more than 1000 rows' });
});
test('nearDuplicates uses Jaccard ≥ 0.8', () => {
  const dup = nearDuplicates([
    item({ id: 'q0001', question: 'List all carriers that fly from Frankfurt to New York' }),
    item({ id: 'q0002', question: 'List the carriers that fly from Frankfurt to New York' }),
    item({ id: 'q0003', question: 'How many carriers are there?' }),
    item({ id: 'q0004', question: 'How many carriers are there in total?' }),
  ]);
  assert.deepEqual([...dup], [['q0002', 'q0001']]);
});

import { foreignTables } from '../src/validate.ts';
test('foreignTables finds tables outside the benchmark in FROM, JOIN and subqueries', () => {
  assert.deepEqual(foreignTables('SELECT a FROM /dmo/flight AS f INNER JOIN /DMO/CARRIER AS c ON c~carrier_id = f~carrier_id'), []);
  assert.deepEqual(foreignTables('SELECT a FROM /dmo/flight WHERE carrier_id IN ( SELECT carrid FROM scarr )'), ['SCARR']);
  assert.deepEqual(foreignTables('SELECT a FROM usr02 LEFT OUTER JOIN /dmo/agency AS g ON 1 = 1'), ['USR02']);
  assert.deepEqual(foreignTables('SELECT a FROM /dmo/travel_m'), ['/DMO/TRAVEL_M']);
});
test('foreignTables sees through parenthesised joins', () => {
  assert.deepEqual(foreignTables('SELECT a FROM ( ( usr02 AS u INNER JOIN /dmo/agency AS g ON 1 = 1 ) )'), ['USR02']);
  assert.deepEqual(foreignTables('SELECT a FROM (/dmo/flight AS f INNER JOIN /DMO/CARRIER AS c ON c~carrier_id = f~carrier_id)'), []);
});
test('staticCheck rejects reference SQL that reads other tables', () => {
  assert.match(staticCheck(item({ reference_sql: 'SELECT bname FROM usr02' }))!, /outside the benchmark: USR02/);
});
