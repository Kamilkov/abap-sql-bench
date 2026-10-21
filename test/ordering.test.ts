import { test } from 'node:test';
import assert from 'node:assert/strict';
import { applyOrdering, buildOrderPrompt, checkJudgments, orderingDecision, type Judgment } from '../src/ordering.ts';
import { pilotFunnel } from '../src/pilot.ts';
import type { WorkItem } from '../src/items.ts';

const res = (rows: string[][]) => ({ columns: [{ name: 'A', type: 'C' }, { name: 'B', type: 'C' }], rows, totalRows: rows.length });
const item = (over: Partial<WorkItem> = {}): WorkItem => ({
  id: 't1', batch: 'b', tier: 'hard', question: 'Which carriers have more than 5 flights? Show name and count.',
  reference_sql: 'SELECT secret_teacher_sql FROM /dmo/flight ORDER BY a', ordered: true, source: 'teacher', status: 'disputed',
  reason: 'results differ: rows differ', flags: [], expected: res([['x', '1'], ['y', '2']]),
  crosscheck_sql: 'SELECT secret_checker_sql FROM /dmo/flight', crosscheck_result: { ok: true, result: res([['y', '2'], ['x', '1']]) }, ...over,
});
const j = (verdict: Judgment['verdict'], by: string): Judgment => ({ verdict, evidence: verdict === 'ordered' ? 'most flights first' : '', by });

test('orderingDecision: two matching judgments decide; anything else is unresolved', () => {
  assert.deepEqual(orderingDecision(j('ordered', 'd'), j('ordered', 'g')), { final: true, reason: 'two-ordered' });
  assert.deepEqual(orderingDecision(j('unordered', 'd'), j('unordered', 'g')), { final: false, reason: 'two-unordered' });
  for (const [a, b] of [['ordered', 'unordered'], ['unordered', 'ordered'], ['ambiguous', 'ambiguous'], ['ordered', 'ambiguous']] as const) {
    assert.equal(orderingDecision(j(a, 'd'), j(b, 'g')).final, null, `${a}/${b}`);
  }
});
test('the ordering prompt carries only id and question — no SQL, no flag, no status', () => {
  const p = buildOrderPrompt([item()]);
  assert.ok(p.includes('Which carriers have more than 5 flights?'));
  for (const leak of ['secret_teacher_sql', 'secret_checker_sql', 'rows differ', 'disputed', '"ordered":true', '"ordered": true']) assert.ok(!p.includes(leak), leak);
});
test('checkJudgments needs one valid verdict per id', () => {
  assert.equal(checkJudgments(['a'], { answers: [{ id: 'a', ordering: 'unordered', evidence: '' }] }).length, 1);
  for (const bad of [null, { answers: [] }, { answers: [{ id: 'a', ordering: 'sorted', evidence: '' }] }, { answers: [{ id: 'b', ordering: 'ordered', evidence: 'x' }] },
    { answers: [{ id: 'a', ordering: 'ordered' }] }]) assert.throws(() => checkJudgments(['a'], bad), /ordering judgments invalid/, JSON.stringify(bad));
});
test('two-unordered rescues an order-only dispute and keeps the teacher flag for diagnosis', () => {
  const out = applyOrdering(item(), j('unordered', 'deepseek'), j('unordered', 'glm'));
  assert.equal(out.status, 'agreed');
  assert.equal(out.ordered, false);
  assert.equal(out.ordered_teacher, true);
  assert.equal(out.ordered_reason, 'two-unordered');
  assert.deepEqual(out.ordered_judges!.map((x) => x.by), ['deepseek', 'glm']);
});
test('two-ordered keeps an order dispute disputed', () => {
  assert.equal(applyOrdering(item(), j('ordered', 'd'), j('ordered', 'g')).status, 'disputed');
});
test('disagreement drops even a currently agreed pair; the teacher flag never votes', () => {
  const agreed = item({ status: 'agreed', reason: undefined, ordered: false, crosscheck_result: { ok: true, result: res([['x', '1'], ['y', '2']]) } });
  const out = applyOrdering(agreed, j('unordered', 'd'), j('ordered', 'g'));
  assert.equal(out.status, 'dropped');
  assert.match(out.reason!, /^ordering:unresolved: d=unordered g=ordered/);
  assert.equal(applyOrdering(agreed, j('ambiguous', 'd'), j('ambiguous', 'g')).status, 'dropped');
});
test('a non-order dispute stays disputed whatever the judges say', () => {
  const sqlErr = item({ reason: 'sql error: x', crosscheck_result: { ok: false, error: 'x' } });
  assert.equal(applyOrdering(sqlErr, j('unordered', 'd'), j('unordered', 'g')).status, 'disputed');
});
test('pilot funnel reports ordering exclusions as their own reason', () => {
  const f = pilotFunnel([{ tier: 'hard', status: 'dropped', reason: 'ordering:unresolved: d=ordered g=unordered' }], 0.9);
  assert.equal(f.find((r) => r.tier === 'hard')!.reasons['ordering:unresolved'], 1);
});
