import { test } from 'node:test';
import assert from 'node:assert/strict';
import { clarifyCandidates, applyClarification } from '../src/clarify.ts';
import type { WorkItem } from '../src/items.ts';

const item = (id: string, question: string, over: Partial<WorkItem> = {}): WorkItem => ({
  id, batch: 'b', tier: 'easy', question, reference_sql: 'SELECT carrier_id, COUNT(*) AS n FROM /dmo/flight GROUP BY carrier_id',
  ordered: false, source: 'codex', status: 'agreed', flags: [], expected: null, pipeline: 'agree', checked_question: question, ...over,
});

test('clarifyCandidates: agreed "each <entity>" questions without an outer join', () => {
  const c = clarifyCandidates([
    item('q1', 'How many flights does each airline have?'),
    item('q2', 'How many customers are there in each country?'),
    item('q3', 'How many flights does each airline have?', { reference_sql: 'SELECT … FROM /dmo/carrier AS c LEFT OUTER JOIN /dmo/flight AS f ON 1 = 1' }),
    item('q4', 'How many flights does each airline have?', { status: 'accepted' }),
    item('q5', 'For every travel agency, how many trips?'),
  ]);
  assert.deepEqual(c.map((i) => i.id), ['q1', 'q5']);
});

test('applyClarification: unchanged question is a no-op', () => {
  const i = item('q1', 'How many flights does each airline have?');
  assert.equal(applyClarification(i, '  How many flights does each airline have? '), false);
  assert.equal(i.status, 'agreed');
});

test('applyClarification: changed question goes back to drafted, keeps SQL and source', () => {
  const i = item('q1', 'How many flights does each airline have?');
  assert.equal(applyClarification(i, 'How many flights does each airline that has flights have?'), true);
  assert.equal(i.status, 'drafted');
  assert.equal(i.question, 'How many flights does each airline that has flights have?');
  assert.equal(i.source, 'codex');
  assert.ok(i.reference_sql);
  assert.equal(i.checked_question, undefined);
  assert.equal(i.pipeline, undefined);
});
