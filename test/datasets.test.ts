import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { loadDataset, assertMayScore, checkAnswerLines, type ModelRegistry } from '../src/datasets.ts';

const sha = (s: string | Buffer) => createHash('sha256').update(s).digest('hex');
function tmp() { return fs.mkdtempSync(path.join(os.tmpdir(), 'ds-')); }
function registry(dir: string) {
  const data = '{"id":"q0001","tier":"easy","question":"Q?","reference_sql":"SELECT a FROM /dmo/carrier","ordered":false,"expected":null}\n';
  fs.writeFileSync(path.join(dir, 'set.jsonl'), data);
  const reg = { datasets: {
    'test-v1': { path: 'set.jsonl', sha256: sha(data), role: 'test' },
    val: { path: 'set.jsonl', sha256: sha(data), role: 'selection' },
  }, legacy_answers: {} as Record<string, string> };
  const file = path.join(dir, 'datasets.json');
  fs.writeFileSync(file, JSON.stringify(reg));
  return { file, reg, data };
}
const models: ModelRegistry = {
  'qwen': { role: 'baseline', identity: 'digest-q' },
  'qwen-fixed': { role: 'baseline', derived_from: 'qwen' },
  'abap-sql-ft': { role: 'candidate', identity: 'digest-ft' },
  'abap-sql-ft-fixed': { role: 'candidate', derived_from: 'abap-sql-ft' },
};
const test1 = { name: 'test-v1', role: 'test' as const };
const sel = { name: 'val', role: 'selection' as const };

test('loadDataset returns items and role for a matching hash', () => {
  const d = tmp(); const { file } = registry(d);
  const ds = loadDataset('test-v1', file);
  assert.equal(ds.items.length, 1);
  assert.equal(ds.role, 'test');
});
test('loadDataset throws on hash mismatch', () => {
  const d = tmp(); const { file, reg } = registry(d);
  fs.appendFileSync(path.join(d, 'set.jsonl'), ' ');
  const actual = sha(fs.readFileSync(path.join(d, 'set.jsonl')));
  assert.throws(() => loadDataset('test-v1', file), (e: Error) => e.message.includes(actual) && e.message.includes(reg.datasets['test-v1'].sha256));
});
test('assertMayScore refuses an unknown model on test', () => {
  assert.throws(() => assertMayScore(test1, { name: 'mystery', identity: 'x' }, { models }), /unknown model/);
});
test('assertMayScore refuses a baseline whose weights changed', () => {
  assert.throws(() => assertMayScore(test1, { name: 'qwen', identity: 'other' }, { models }), /identity/);
});
test('assertMayScore allows baselines and derived baselines on test', () => {
  assertMayScore(test1, { name: 'qwen', identity: 'digest-q' }, { models });
  assertMayScore(test1, { name: 'qwen-fixed', identity: 'digest-q' }, { models });
});
test('assertMayScore refuses a candidate without marker', () => {
  assert.throws(() => assertMayScore(test1, { name: 'abap-sql-ft', identity: 'digest-ft' }, { models, marker: path.join(tmp(), 'none.json') }), /frozen/);
});
test('assertMayScore refuses a candidate whose identity differs from the marker', () => {
  const m = path.join(tmp(), 'ft-v1.json');
  fs.writeFileSync(m, JSON.stringify({ name: 'abap-sql-ft', identity: 'digest-ft' }));
  const swapped = { ...models, 'abap-sql-ft': { role: 'candidate' as const, identity: 'digest-new' } };
  assert.throws(() => assertMayScore(test1, { name: 'abap-sql-ft', identity: 'digest-new' }, { models: swapped, marker: m }), /frozen/);
});
test('assertMayScore allows the frozen candidate and its derived arm', () => {
  const m = path.join(tmp(), 'ft-v1.json');
  fs.writeFileSync(m, JSON.stringify({ name: 'abap-sql-ft', identity: 'digest-ft' }));
  assertMayScore(test1, { name: 'abap-sql-ft', identity: 'digest-ft' }, { models, marker: m });
  assertMayScore(test1, { name: 'abap-sql-ft-fixed', identity: 'digest-ft' }, { models, marker: m });
});
test('assertMayScore allows anything on selection', () => {
  assertMayScore(sel, { name: 'mystery', identity: 'x' }, { models, marker: '/nope' });
  assertMayScore(sel, { name: 'abap-sql-ft', identity: 'digest-ft' }, { models, marker: '/nope' });
});
test('checkAnswerLines requires matching provenance', () => {
  const lines = [{ id: 'q1', sql: 'x', dataset_sha256: 'd1', model_identity: 'm1' }];
  assert.deepEqual(checkAnswerLines(lines, { datasetSha: 'd1', file: 'a.jsonl', fileSha: 'f', legacy: {} }), { identity: 'm1' });
  assert.throws(() => checkAnswerLines(lines, { datasetSha: 'd2', file: 'a.jsonl', fileSha: 'f', legacy: {} }), /dataset/);
  assert.throws(() => checkAnswerLines([...lines, { id: 'q2', sql: 'y', dataset_sha256: 'd1', model_identity: 'm2' }],
    { datasetSha: 'd1', file: 'a.jsonl', fileSha: 'f', legacy: {} }), /identity/);
});
test('legacy file accepted only while its hash is allowlisted', () => {
  const lines = [{ id: 'q1', sql: 'x' }];
  assert.deepEqual(checkAnswerLines(lines, { datasetSha: 'd1', file: 'answers/test-v1/a.jsonl', fileSha: 'f1', legacy: { 'answers/test-v1/a.jsonl': 'f1' } }), { identity: null });
  assert.throws(() => checkAnswerLines(lines, { datasetSha: 'd1', file: 'answers/test-v1/a.jsonl', fileSha: 'f2', legacy: { 'answers/test-v1/a.jsonl': 'f1' } }), /provenance/);
});

import { deriveAnswers } from '../src/eval.ts';
test('derived answers keep dataset and model provenance', () => {
  const src = [
    { id: 'q1', sql: 'SELECT a FROM t A', ms: 1, dataset_sha256: 'd1', model_identity: 'm1' },
    { id: 'q2', sql: 'SELECT b FROM u B', ms: 2, dataset_sha256: 'd1', model_identity: 'm1' },
  ];
  for (const mode of ['fix', 'shuffle'] as const) {
    for (const a of deriveAnswers(mode, src)) {
      assert.equal(a.dataset_sha256, 'd1');
      assert.equal(a.model_identity, 'm1');
    }
  }
});
import { digestGuard } from '../src/datasets.ts';
test('digestGuard throws when the model behind the tag changes mid-run', async () => {
  let digest = 'A';
  const check = digestGuard(async () => digest, 'A');
  await check();
  digest = 'B';
  await assert.rejects(check(), /changed/);
});
