import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { freezable, assertNotFrozen } from '../src/fingerprint.ts';
import type { WorkItem } from '../src/items.ts';

const item = (over: Partial<WorkItem>): WorkItem => ({
  id: 'q0001', batch: 'b', tier: 'easy', question: 'Q?', reference_sql: 'SELECT a FROM t', ordered: false,
  source: 'codex', status: 'accepted', flags: [], expected: null, checked_question: 'Q?', pipeline: 'agree', ...over,
});

test('freezable rejects pending items', () => {
  const r = freezable([item({}), item({ id: 'q0002', status: 'agreed' })]);
  assert.equal(r.ok, false);
  assert.match((r as { problems: string[] }).problems.join(), /q0002/);
});
test('freezable rejects accepted item whose wording changed since cross-check', () => {
  const r = freezable([item({ checked_question: 'Old Q?' })]);
  assert.equal(r.ok, false);
});
test('freezable passes accepted/rejected/dropped and returns only accepted', () => {
  const r = freezable([item({}), item({ id: 'q0002', status: 'rejected' }), item({ id: 'q0003', status: 'dropped' })]);
  assert.ok(r.ok);
  assert.deepEqual(r.items.map((i) => i.id), ['q0001']);
});
test('refuses when testset.jsonl exists', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'freeze-'));
  assert.doesNotThrow(() => assertNotFrozen(dir));
  fs.writeFileSync(path.join(dir, 'testset.jsonl'), '');
  assert.throws(() => assertNotFrozen(dir), /already frozen/);
});
test('refuses when fingerprint.json exists', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'freeze-'));
  fs.writeFileSync(path.join(dir, 'fingerprint.json'), '{}');
  assert.throws(() => assertNotFrozen(dir), /already frozen/);
});
import { recaptureDiff } from '../src/fingerprint.ts';
test('recaptureDiff flags an answer that changed since review', () => {
  const r = (rows: string[][]) => ({ columns: [{ name: 'A', type: 'C' }], rows, totalRows: rows.length });
  assert.equal(recaptureDiff(item({ expected: r([['LH']]) }), r([['LH  ']])), null);
  assert.match(recaptureDiff(item({ expected: r([['LH']]) }), r([['AF']]))!, /q0001/);
  assert.match(recaptureDiff(item({ expected: null }), r([['AF']]))!, /no reviewed result/);
});

import { freezePlan } from '../src/fingerprint.ts';
test('freeze to a new out file never touches testset.jsonl or fingerprint.json', () => {
  const plan = freezePlan('testset-fresh-v1.jsonl');
  assert.deepEqual(plan, { guardFiles: ['testset-fresh-v1.jsonl'], writesFingerprint: false });
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'freeze-'));
  fs.writeFileSync(path.join(dir, 'testset.jsonl'), '');
  fs.writeFileSync(path.join(dir, 'fingerprint.json'), '{}');
  assert.doesNotThrow(() => assertNotFrozen(dir, plan.guardFiles)); // existing release does not block a new file
  fs.writeFileSync(path.join(dir, 'testset-fresh-v1.jsonl'), '');
  assert.throws(() => assertNotFrozen(dir, plan.guardFiles), /already frozen/);
});
test('freezePlan for the main release keeps the original guard', () => {
  assert.deepEqual(freezePlan('testset.jsonl'), { guardFiles: ['testset.jsonl', 'fingerprint.json'], writesFingerprint: true });
});
