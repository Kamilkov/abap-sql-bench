import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import http from 'node:http';
import type { AddressInfo } from 'node:net';
import { thresholdFrom, decontaminate, calibrationSample, embed, type Pair } from '../src/decontam.ts';
import type { Result } from '../src/a4h.ts';

const res = (rows: string[][]): Result => ({ columns: rows[0].map((_, k) => ({ name: `C${k}`, type: 'C' })), rows, totalRows: rows.length });
const T = (id: string, question: string, expected: Result | null = null) =>
  ({ id, tier: 'easy' as const, question, reference_sql: expected ? 'SELECT a FROM /dmo/carrier' : null, ordered: false, expected });
const pair = (cos: number, k: number): Pair => ({ trainId: `t${k}`, testId: `q${k}`, cos });

test('thresholdFrom uses lowest paraphrase minus 0.01', () => {
  const top = [pair(0.97, 1), pair(0.93, 2), pair(0.9, 3)];
  const labelled = [{ cos: 0.97, label: 'duplicate' as const }, { cos: 0.93, label: 'paraphrase' as const }, { cos: 0.9, label: 'distinct' as const }, { cos: 0.86, label: 'paraphrase' as const }];
  assert.equal(thresholdFrom(labelled, top), 0.85);
});
test('thresholdFrom with no paraphrase uses top max plus 0.01', () => {
  const top = [pair(0.88, 1), pair(0.8, 2)];
  assert.equal(thresholdFrom([{ cos: 0.88, label: 'distinct' }, { cos: 0.8, label: 'distinct' }], top), 0.89);
});
test('calibrationSample band excludes the top 60', () => {
  const pairs = Array.from({ length: 300 }, (_, k) => pair(1 - k / 1000, k));
  const { top, band } = calibrationSample(pairs, 's');
  assert.equal(top.length, 60);
  assert.equal(band.length, 20);
  const topIds = new Set(top.map((p) => p.trainId));
  assert.ok(band.every((p) => !topIds.has(p.trainId)));
  assert.ok(band.every((p) => p.cos <= top[59].cos));
});
test('decontaminate drops by each rule', () => {
  const big = res([['LH', '1'], ['AF', '2']]);
  const test1 = [T('q1', 'How many flights does each airline have?'), T('q2', 'Totally different wording', big)];
  const train = [
    T('t1', 'How many flights does each airline have?'),          // jaccard
    T('t2', 'Count of departures per carrier'),                    // cosine
    T('t3', 'Something unrelated', res([['LH', '1'], ['AF', '2']])), // identical multi-cell result
    T('t4', 'Fine question about bookings'),
  ];
  const emb = new Map([['t2', [1, 0]], ['q1', [0.99, 0.14]], ['t1', [0, 1]], ['t3', [0, 1]], ['t4', [0, 1]], ['q2', [1, 0.0]]]);
  emb.set('q2', [-1, 0]);
  const drops = decontaminate(train, test1, emb, 0.95);
  assert.equal(drops.get('t1')?.rule, 'jaccard');
  assert.equal(drops.get('t2')?.rule, 'cosine');
  assert.equal(drops.get('t3')?.rule, 'result');
  assert.equal(drops.has('t4'), false);
});
test('result rule ignores single-cell results', () => {
  const one = res([['42']]);
  const drops = decontaminate([T('t1', 'How many carriers fly to Rome?', one)], [T('q1', 'Number of agencies in Berlin', one)], new Map(), 0.99);
  assert.equal(drops.size, 0);
});
test('within-train duplicate keeps the first id', () => {
  const drops = decontaminate([T('t1', 'List all carriers that fly from Frankfurt to New York'), T('t2', 'List the carriers that fly from Frankfurt to New York')], [], new Map(), 0.99);
  assert.equal(drops.get('t2')?.rule, 'train-dup');
  assert.equal(drops.has('t1'), false);
});
test('embed caches by model and text and calls the API once per new text', async () => {
  let calls = 0;
  const server = http.createServer((req, res) => {
    let d = ''; req.on('data', (c) => (d += c)); req.on('end', () => {
      calls++;
      const body = JSON.parse(d);
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ data: body.input.map((t: string, index: number) => ({ index, embedding: [t.length, 1] })) }));
    });
  });
  await new Promise<void>((ok) => server.listen(0, '127.0.0.1', ok));
  const url = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  const cache = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'emb-')), 'emb.jsonl');
  try {
    const a = await embed(['ab', 'abc'], { url, key: 'k', cacheFile: cache });
    const b = await embed(['abc', 'abcd'], { url, key: 'k', cacheFile: cache });
    assert.deepEqual(a, [[2, 1], [3, 1]]);
    assert.deepEqual(b, [[3, 1], [4, 1]]);
    assert.equal(calls, 2);
  } finally { server.close(); }
});

import { writeThresholdOnce, readThreshold, assertDecontaminated } from '../src/decontam.ts';
test('thresholdFrom never rounds the threshold up (floors to 3 decimals)', () => {
  assert.equal(thresholdFrom([{ cos: 0.8751, label: 'paraphrase' }], [pair(0.9, 1)]), 0.865);
  assert.equal(thresholdFrom([{ cos: 0.8, label: 'distinct' }], [pair(0.8807, 1)]), 0.89);
});
test('the calibrated threshold is written once and read back, never typed by hand', () => {
  const f = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'thr-')), 'threshold.json');
  writeThresholdOnce(f, { threshold: 0.865, model: 'voyage-x' });
  assert.equal(readThreshold(f).threshold, 0.865);
  assert.throws(() => writeThresholdOnce(f, { threshold: 0.9, model: 'voyage-x' }), /already/);
});
test('export refuses agreed items not stamped with the frozen threshold', () => {
  const ok = { id: 't1', status: 'agreed', decontam: 0.865 };
  assert.doesNotThrow(() => assertDecontaminated([ok, { id: 't2', status: 'dropped' }], 0.865));
  assert.throws(() => assertDecontaminated([ok, { id: 't3', status: 'agreed' }], 0.865), /t3/);
  assert.throws(() => assertDecontaminated([{ ...ok, decontam: 0.9 }], 0.865), /t1/);
});
import { decontamCounts } from '../src/decontam.ts';
test('decontamination counts are cumulative over recorded drop reasons', () => {
  const items = [{ status: 'dropped', reason: 'decontam:jaccard:q1' }, { status: 'dropped', reason: 'decontam:cosine:q2' },
    { status: 'dropped', reason: 'decontam:cosine:q3' }, { status: 'dropped', reason: 'cross answered UNANSWERABLE' }, { status: 'agreed' }];
  assert.deepEqual(decontamCounts(items), { jaccard: 1, cosine: 2, result: 0, 'train-dup': 0 });
});
