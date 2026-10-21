import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mcnemarExact, seenSplit, terciles, cell, primaryVerdict } from '../src/stats.ts';

const close = (a: number, b: number) => assert.ok(Math.abs(a - b) < 1e-5, `${a} vs ${b}`);
test('mcnemarExact(0, 0) = 1', () => assert.equal(mcnemarExact(0, 0), 1));
test('mcnemarExact(10, 0) ≈ 0.001953', () => close(mcnemarExact(10, 0), 0.001953));
test('mcnemarExact(5, 15) ≈ 0.04139', () => close(mcnemarExact(5, 15), 0.041389));
test('mcnemarExact is symmetric and capped at 1', () => {
  assert.equal(mcnemarExact(7, 3), mcnemarExact(3, 7));
  assert.equal(mcnemarExact(4, 4), 1);
});
test('seenSplit marks unanswerables separately', () => {
  const m = seenSplit([
    { id: 'a', reference_sql: "SELECT x FROM /dmo/carrier WHERE y = 'LH'" },
    { id: 'b', reference_sql: 'SELECT z FROM /dmo/flight' },
    { id: 'c', reference_sql: null },
  ], new Set(["select x from /dmo/carrier where y = ?"]));
  assert.deepEqual([...m], [['a', 'seen'], ['b', 'unseen'], ['c', 'unanswerable']]);
});
test('terciles split values into thirds', () => {
  const t = terciles(new Map([['a', 0.1], ['b', 0.2], ['c', 0.3], ['d', 0.4], ['e', 0.5], ['f', 0.6]]));
  assert.deepEqual([...t.values()], [1, 1, 2, 2, 3, 3]);
});
test('report marks a 12-item cell too small and an empty cell empty', () => {
  assert.equal(cell(9, 12), '75.0% (9/12) — too small');
  assert.equal(cell(0, 0), 'empty');
  assert.equal(cell(15, 20), '75.0% (15/20)');
});
test('primaryVerdict follows the pre-registration', () => {
  assert.equal(primaryVerdict({ candidateAcc: 0.6, baselineAcc: 0.53, p: 0.01 }), 'success');
  assert.equal(primaryVerdict({ candidateAcc: 0.6, baselineAcc: 0.53, p: 0.08 }), 'not significant');
  assert.equal(primaryVerdict({ candidateAcc: 0.5, baselineAcc: 0.53, p: 0.01 }), 'not higher');
  assert.equal(primaryVerdict({ candidateAcc: 0.53, baselineAcc: 0.53, p: 1 }), 'not higher');
});

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { primaryPair, trainedSkeletons } from '../src/stats.ts';
test('the primary pair is fixed by the pre-registration and the frozen marker', () => {
  const m = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'pp-')), 'ft-v1.json');
  fs.writeFileSync(m, JSON.stringify({ name: 'abap-sql-qwen3-4b-ft-q8_0', identity: 'd' }));
  assert.deepEqual(primaryPair(m), { candidate: 'abap-sql-qwen3-4b-ft-q8_0', baseline: 'qwen3-4b-instruct-2507-q8_0-fixed' });
  assert.throws(() => primaryPair(path.join(os.tmpdir(), 'missing-marker.json')), /frozen/);
});
test('seen means trained on: val skeletons do not count', () => {
  const items = [{ id: 't1', skeleton: 'a' }, { id: 't2', skeleton: 'b' }, { id: 't3', skeleton: null }];
  assert.deepEqual([...trainedSkeletons(items, new Set(['t2']))], ['a']);
});
import { assertPrimaryCampaign } from '../src/stats.ts';
test('only the frozen candidate on test-v1 can produce a pre-registered verdict', () => {
  const ok = { dataset: 'test-v1', dataset_sha256: 'h', answers: { 'abap-sql-ft': { identity: 'd1' } } };
  const marker = { name: 'abap-sql-ft', identity: 'd1' };
  assert.doesNotThrow(() => assertPrimaryCampaign(ok, marker, 'h'));
  assert.throws(() => assertPrimaryCampaign({ ...ok, dataset: 'val' }, marker, 'h'), /test-v1/);
  assert.throws(() => assertPrimaryCampaign(ok, marker, 'other-hash'), /hash/);
  assert.throws(() => assertPrimaryCampaign({ ...ok, answers: { 'abap-sql-ft': { identity: 'old' } } }, marker, 'h'), /identity/);
});
