import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { answerPrompt } from '../src/prompt.ts';
import { buildExport, registerDataset } from '../src/export.ts';
import { REPO, type WorkItem } from '../src/items.ts';
import { sha256 } from '../src/datasets.ts';

test('answerPrompt matches the prompt generate.ts used for the baseline', () => {
  // Golden: the exact construction the baseline campaigns used (prompts/answer.md + schema.md, no few-shot).
  const [head, tail] = fs.readFileSync(path.join(REPO, 'prompts/answer.md'), 'utf8')
    .replace('{{SCHEMA}}', fs.readFileSync(path.join(REPO, 'schema.md'), 'utf8').trim())
    .replace('# Question', '' + '# Question').split('{{QUESTION}}');
  const q = 'How many carriers are there?';
  assert.equal(answerPrompt(q), head + q + tail);
  assert.ok(!answerPrompt(q).includes('{{'));
});

const item = (id: string, sql: string | null, tier: WorkItem['tier'] = 'easy'): WorkItem => ({
  id, batch: 'b', tier, question: `question ${id}?`, reference_sql: sql, ordered: false, source: 'teacher', status: 'agreed', flags: [],
  expected: sql ? { columns: [{ name: 'A', type: 'C' }], rows: [['x']], totalRows: 1 } : null,
});
test('export puts whole groups in val', () => {
  const items = Array.from({ length: 100 }, (_, k) => item(`t${k}`, `SELECT a FROM /dmo/carrier WHERE b = ${k % 25 > 12 ? 1 : 2} AND c${k % 25} = 'x'`));
  const ex = buildExport(items, new Map(), 'seed');
  const valGroups = new Set(ex.valItems.map((i) => i.group));
  assert.ok(ex.canonical.every((i) => valGroups.has(i.group) === ex.valItems.some((v) => v.id === i.id)));
  assert.equal(ex.trainChat.length + ex.valChat.length, 100);
});
test('export writes UNANSWERABLE as the assistant answer for null SQL', () => {
  const ex = buildExport([item('u1', null, 'unanswerable'), ...Array.from({ length: 30 }, (_, k) => item(`t${k}`, `SELECT a FROM /dmo/carrier WHERE c${k} = 1`))], new Map(), 's');
  const rec = [...ex.trainChat, ...ex.valChat].find((r) => r.messages[0].content.includes('question u1?'))!;
  assert.equal(rec.messages[1].content, 'UNANSWERABLE');
  assert.equal(rec.messages[0].content, answerPrompt('question u1?'));
});
test('export registers val with the file sha256', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'reg-'));
  const reg = path.join(dir, 'datasets.json');
  fs.writeFileSync(reg, JSON.stringify({ datasets: {}, legacy_answers: {} }));
  fs.writeFileSync(path.join(dir, 'val.items.jsonl'), '{"id":"t1"}\n');
  registerDataset(reg, 'val', 'val.items.jsonl', 'selection');
  const r = JSON.parse(fs.readFileSync(reg, 'utf8'));
  assert.deepEqual(r.datasets.val, { path: 'val.items.jsonl', sha256: sha256('{"id":"t1"}\n'), role: 'selection' });
});

import { tierMix } from '../src/export.ts';
test('export fails when the split leaves a tier under-represented in train', () => {
  const mk = (n: number, tier: WorkItem['tier']) => Array.from({ length: n }, (_, k) => ({ id: `${tier}${k}`, tier }));
  const all = [...mk(90, 'easy'), ...mk(10, 'unanswerable')];
  assert.doesNotThrow(() => tierMix(all.filter((i) => i.id !== 'easy0' && i.id !== 'unanswerable0'), all));
  assert.throws(() => tierMix(all.filter((i) => i.tier === 'easy'), all), /unanswerable/);
});
test('checker SQL and raw teacher SQL never reach the training export (only the repaired teacher label)', () => {
  const items = Array.from({ length: 40 }, (_, k) => ({ ...item(`t${k}`, `SELECT a FROM /dmo/carrier WHERE c${k} = 1`),
    crosscheck_sql: `SELECT checker_marker_${k} FROM /dmo/carrier`, crosscheck_by: 'z-ai/glm-5.2-20260616@fp4#x',
    raw_sql: `SELECT raw_marker_${k} FROM /dmo/carrier c`, crosscheck_raw_sql: `SELECT raw_marker_${k}` }));
  const ex = buildExport(items, new Map(), 's');
  const out = JSON.stringify([ex.trainChat, ex.valChat, ex.canonical, ex.valItems]);
  assert.ok(!out.includes('checker_marker_'));
  assert.ok(!out.includes('raw_marker_'));
});
