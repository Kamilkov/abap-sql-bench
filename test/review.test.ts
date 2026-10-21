import { test } from 'node:test';
import assert from 'node:assert/strict';
import { applyDecisions, renderSheet } from '../src/review.ts';
import { decide } from '../src/crosscheck.ts';
import type { Outcome, Result } from '../src/a4h.ts';
import type { WorkItem } from '../src/items.ts';

const res = (rows: string[][]): Result => ({ columns: [{ name: 'A', type: 'C' }], rows, totalRows: rows.length });
const okOut = (rows: string[][]): Outcome => ({ ok: true, result: res(rows) });
const item = (over: Partial<WorkItem> = {}): WorkItem => ({
  id: 'q0001', batch: 'b', tier: 'easy', question: 'Which carriers fly to Rome?', reference_sql: 'SELECT a FROM /dmo/carrier',
  ordered: false, source: 'codex', status: 'agreed', flags: [], expected: res([['LH']]), pipeline: 'agree',
  checked_question: 'Which carriers fly to Rome?', ...over,
});
const disputed = (over: Partial<WorkItem> = {}) => item({
  status: 'disputed', pipeline: undefined, checked_question: undefined, reason: 'results differ',
  crosscheck_sql: 'SELECT b FROM /dmo/carrier', crosscheck_result: okOut([['AZ']]), ...over,
});

test('keep: agreed → accepted', () => {
  const [i] = applyDecisions([item()], [{ id: 'q0001', action: 'keep' }]);
  assert.equal(i.status, 'accepted');
  assert.equal(i.pipeline, 'agree');
});
test('keep on disputed throws and changes nothing', () => {
  const items = [disputed()];
  const snapshot = structuredClone(items);
  assert.throws(() => applyDecisions(items, [{ id: 'q0001', action: 'keep' }]), /line 1/);
  assert.deepEqual(items, snapshot);
});
test('unknown id throws', () => {
  assert.throws(() => applyDecisions([item()], [{ id: 'q9999', action: 'drop' }]), /unknown id q9999/);
});
test('drop → dropped', () => {
  assert.equal(applyDecisions([disputed()], [{ id: 'q0001', action: 'drop' }])[0].status, 'dropped');
});
test('use_reference: disputed → accepted, adjudicated', () => {
  const [i] = applyDecisions([disputed()], [{ id: 'q0001', action: 'use_reference' }]);
  assert.equal(i.status, 'accepted');
  assert.equal(i.pipeline, 'adjudicated');
  assert.equal(i.checked_question, i.question);
  assert.equal(i.reference_sql, 'SELECT a FROM /dmo/carrier');
});
test('use_crosscheck: takes cross SQL and its stored result', () => {
  const [i] = applyDecisions([disputed()], [{ id: 'q0001', action: 'use_crosscheck' }]);
  assert.equal(i.status, 'accepted');
  assert.equal(i.pipeline, 'adjudicated');
  assert.equal(i.reference_sql, 'SELECT b FROM /dmo/carrier');
  assert.deepEqual(i.expected, res([['AZ']]));
});
test('use_crosscheck refuses a cross result that failed judge', () => {
  const bad = disputed({ crosscheck_result: { ok: false, error: 'boom' } });
  assert.throws(() => applyDecisions([bad], [{ id: 'q0001', action: 'use_crosscheck' }]), /judge/);
});
test('use_crosscheck to unanswerable without tier throws; with tier → null SQL and expected', () => {
  const d = disputed({ crosscheck_sql: null, crosscheck_result: null });
  assert.throws(() => applyDecisions([d], [{ id: 'q0001', action: 'use_crosscheck' }]), /tier/);
  const [i] = applyDecisions([d], [{ id: 'q0001', action: 'use_crosscheck', tier: 'unanswerable' }]);
  assert.equal(i.status, 'accepted');
  assert.equal(i.tier, 'unanswerable');
  assert.equal(i.reference_sql, null);
  assert.equal(i.expected, null);
  assert.equal(i.ordered, false);
});
test('use_crosscheck from unanswerable needs tier and ordered', () => {
  const d = disputed({ tier: 'unanswerable', reference_sql: null, expected: null });
  assert.throws(() => applyDecisions([d], [{ id: 'q0001', action: 'use_crosscheck' }]), /tier/);
  assert.throws(() => applyDecisions([d], [{ id: 'q0001', action: 'use_crosscheck', tier: 'medium' }]), /ordered/);
  const [i] = applyDecisions([d], [{ id: 'q0001', action: 'use_crosscheck', tier: 'medium', ordered: false }]);
  assert.equal(i.status, 'accepted');
  assert.equal(i.tier, 'medium');
  assert.deepEqual(i.expected, res([['AZ']]));
});
test('rewrite resets to drafted and clears checked_question', () => {
  const [i] = applyDecisions([item({ status: 'accepted' })], [{ id: 'q0001', action: 'rewrite', question: 'Which airlines fly to Rome?' }]);
  assert.equal(i.status, 'drafted');
  assert.equal(i.question, 'Which airlines fly to Rome?');
  assert.equal(i.source, 'codex+kamil');
  assert.equal(i.checked_question, undefined);
  assert.equal(i.pipeline, undefined);
  assert.equal(i.expected, null);
  assert.equal(i.crosscheck_sql, undefined);
});
test('rewrite without question throws', () => {
  assert.throws(() => applyDecisions([item()], [{ id: 'q0001', action: 'rewrite' }]), /question/);
});
test('unanswerable → SQL → adjudicated answerable, end to end', () => {
  const u = item({ tier: 'unanswerable', reference_sql: null, expected: null, status: 'validated', pipeline: undefined, checked_question: undefined });
  const out = okOut([['LH'], ['AZ']]);
  Object.assign(u, decide(u, 'SELECT a FROM /dmo/carrier', out));
  assert.equal(u.status, 'disputed');
  assert.ok(u.crosscheck_result);
  const [i] = applyDecisions([u], [{ id: 'q0001', action: 'use_crosscheck', tier: 'easy', ordered: false }]);
  assert.equal(i.status, 'accepted');
  assert.equal(i.pipeline, 'adjudicated');
  assert.deepEqual(i.expected, res([['LH'], ['AZ']]));
});
test('renderSheet shows both SQLs and rows for disputed items', () => {
  const md = renderSheet([disputed(), item({ id: 'q0002', status: 'accepted' })]);
  assert.ok(md.includes('q0001') && md.includes('SELECT b FROM /dmo/carrier') && md.includes('AZ'));
  assert.ok(!md.includes('## q0002'));
});
test('rewrite honours ordered and tier when given', () => {
  const [i] = applyDecisions([item()], [{ id: 'q0001', action: 'rewrite', question: 'Which carriers fly to Rome, sorted by name?', ordered: true, tier: 'medium' }]);
  assert.equal(i.ordered, true);
  assert.equal(i.tier, 'medium');
});
test('invalid tier is rejected', () => {
  assert.throws(() => applyDecisions([disputed()], [{ id: 'q0001', action: 'use_crosscheck', tier: 'expert' as never }]), /tier/);
});

import { shortlist } from '../src/review.ts';
test('shortlist: all disputed + flagged agreed + deterministic sample of the rest', () => {
  const items = [
    disputed({ id: 'q0001' }),
    item({ id: 'q0002', flags: ['near-dup:q0003'] }),
    ...Array.from({ length: 10 }, (_, k) => item({ id: `q01${String(k).padStart(2, '0')}` })),
    item({ id: 'q0200', status: 'accepted' }),
  ];
  const a = shortlist(items, 3, 'seed');
  const b = shortlist(items, 3, 'seed');
  assert.deepEqual(a.map((i) => i.id), b.map((i) => i.id));
  assert.equal(a.length, 5);
  assert.ok(a.some((i) => i.id === 'q0001') && a.some((i) => i.id === 'q0002'));
  assert.ok(!a.some((i) => i.id === 'q0200'));
  assert.notDeepEqual(shortlist(items, 3, 'other').map((i) => i.id), a.map((i) => i.id));
});
