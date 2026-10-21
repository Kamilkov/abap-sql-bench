import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import type { AddressInfo } from 'node:net';
import { askTeacher, CHECKER, TEACHER } from '../src/teacher.ts';

type Reply = { status?: number; body: unknown };
async function fake(replies: Reply[]) {
  const seen: { auth?: string; body: any }[] = [];
  const server = http.createServer((req, res) => {
    let data = '';
    req.on('data', (c) => (data += c));
    req.on('end', () => {
      seen.push({ auth: req.headers.authorization, body: JSON.parse(data) });
      const r = replies.shift()!;
      res.writeHead(r.status ?? 200, { 'content-type': 'application/json' });
      res.end(JSON.stringify(r.body));
    });
  });
  await new Promise<void>((ok) => server.listen(0, '127.0.0.1', ok));
  const url = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  return { url, seen, close: () => server.close() };
}
const completion = (content: string, finish = 'stop', extra: Record<string, unknown> = {}, reasoning = 0) => ({
  id: 'gen-1', model: 'deepseek/deepseek-v4-pro-20260813', provider: 'DeepInfra',
  usage: { prompt_tokens: 10, completion_tokens: 5, completion_tokens_details: { reasoning_tokens: reasoning }, cost: 0.0001 },
  choices: [{ message: { content }, finish_reason: finish }], ...extra,
});
const callLog = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'calls-')), 'calls.jsonl');
const logged = () => fs.readFileSync(callLog, 'utf8').trim().split('\n').map((l) => JSON.parse(l));
const schema = { type: 'object', properties: { items: { type: 'array' } }, required: ['items'] };

test('askTeacher returns parsed JSON and sends the bearer key and schema', async () => {
  const f = await fake([{ body: completion('{"items":[1]}') }]);
  try {
    const out = await askTeacher<{ items: number[] }>('hi', schema, { url: f.url, apiKey: 'k1', callLog });
    assert.deepEqual(out, { items: [1] });
    assert.equal(f.seen[0].auth, 'Bearer k1');
    assert.deepEqual(f.seen[0].body.response_format.json_schema.schema, schema);
    assert.equal(f.seen[0].body.messages[0].content, 'hi');
  } finally { f.close(); }
});
test('askTeacher rejects invalid JSON', async () => {
  const f = await fake([{ body: completion('{"items": [') }]);
  try { await assert.rejects(askTeacher('hi', schema, { url: f.url, apiKey: 'k', callLog }), /JSON/); } finally { f.close(); }
});
test('askTeacher rejects finish_reason length', async () => {
  const f = await fake([{ body: completion('{"items":[]}', 'length') }]);
  try { await assert.rejects(askTeacher('hi', schema, { url: f.url, apiKey: 'k', callLog }), /length/); } finally { f.close(); }
});
test('askTeacher retries a 503 then succeeds', async () => {
  const f = await fake([{ status: 503, body: { error: 'busy' } }, { body: completion('{"items":[]}') }]);
  try {
    assert.deepEqual(await askTeacher('hi', schema, { url: f.url, apiKey: 'k', retryBaseMs: 1, callLog }), { items: [] });
    assert.equal(f.seen.length, 2);
  } finally { f.close(); }
});
test('askTeacher routes the teacher to DeepSeek-V4-Pro on DeepInfra fp8 only, reasoning off, no data collection', async () => {
  const f = await fake([{ body: completion('{"items":[]}') }]);
  try {
    await askTeacher('hi', schema, { url: f.url, apiKey: 'k', callLog });
    const b = f.seen[0].body;
    assert.equal(b.model, 'deepseek/deepseek-v4-pro-0813');
    assert.deepEqual(b.reasoning, { effort: 'none' });
    assert.deepEqual(b.provider, { only: ['deepinfra'], quantizations: ['fp8'], require_parameters: true, allow_fallbacks: false, data_collection: 'deny', zdr: true, enforce_distillable_text: true });
    assert.deepEqual(b.usage, { include: true });
  } finally { f.close(); }
});
test('askTeacher sends the cross-check to GLM-5.2 on DeepInfra fp4', async () => {
  const f = await fake([{ body: completion('{"items":[]}', 'stop', { model: 'z-ai/glm-5.2-20260616' }) }]);
  try {
    await askTeacher('hi', schema, { url: f.url, apiKey: 'k', endpoint: CHECKER, callLog });
    assert.equal(f.seen[0].body.model, 'z-ai/glm-5.2');
    assert.deepEqual(f.seen[0].body.provider, { only: ['deepinfra'], quantizations: ['fp4'], require_parameters: true, allow_fallbacks: false,
      data_collection: 'deny', zdr: true });
    assert.notEqual(CHECKER.model, TEACHER.model);
  } finally { f.close(); }
});
test('askTeacher rejects a response that billed reasoning tokens, and logs it with id, model, provider, usage', async () => {
  const f = await fake([{ body: completion('{"ok":true}', 'stop', {}, 120) }]);
  try {
    await assert.rejects(askTeacher('hi', schema, { url: f.url, apiKey: 'k', callLog }), /reasoning tokens 120/);
    const last = logged().at(-1);
    assert.equal(last.ok, false);
    assert.equal(last.id, 'gen-1');
    assert.equal(last.provider, 'DeepInfra');
    assert.equal(last.model, 'deepseek/deepseek-v4-pro-20260813');
    assert.equal(last.usage.cost, 0.0001);
    assert.match(last.error, /reasoning/);
  } finally { f.close(); }
});
test('askTeacher rejects a response from another provider or another model', async () => {
  const f = await fake([{ body: completion('{}', 'stop', { provider: 'Novita' }) }, { body: completion('{}', 'stop', { model: 'deepseek/deepseek-v4-flash' }) },
    { body: completion('{}', 'stop', { provider: undefined }) }]);
  try {
    await assert.rejects(askTeacher('hi', schema, { url: f.url, apiKey: 'k', callLog }), /provider Novita/);
    await assert.rejects(askTeacher('hi', schema, { url: f.url, apiKey: 'k', callLog }), /model deepseek\/deepseek-v4-flash/);
    await assert.rejects(askTeacher('hi', schema, { url: f.url, apiKey: 'k', callLog }), /provider undefined/);
  } finally { f.close(); }
});
test('askTeacher logs successful calls and refusals of the routing policy', async () => {
  const f = await fake([{ body: completion('{"items":[]}') }, { status: 404, body: { error: { message: 'No endpoints found matching your data policy' } } }]);
  try {
    await askTeacher('hi', schema, { url: f.url, apiKey: 'k', callLog });
    assert.equal(logged().at(-1).ok, true);
    await assert.rejects(askTeacher('hi', schema, { url: f.url, apiKey: 'k', callLog }), /No endpoints found/);
    assert.equal(f.seen.length, 2);
    assert.match(logged().at(-1).error, /HTTP 404/);
  } finally { f.close(); }
});
test('askTeacher refuses a response without numeric reasoning-token evidence', async () => {
  const noEvidence = (details: unknown) => completion('{"ok":true}', 'stop', {
    usage: { prompt_tokens: 1, completion_tokens: 1, ...(details === 'omit' ? {} : { completion_tokens_details: details }) } });
  const f = await fake([{ body: noEvidence('omit') }, { body: noEvidence({ reasoning_tokens: null }) }, { body: noEvidence({ reasoning_tokens: '0' }) }]);
  try {
    for (let k = 0; k < 3; k++) await assert.rejects(askTeacher('hi', schema, { url: f.url, apiKey: 'k', callLog }), /no numeric reasoning-token evidence/);
    assert.equal(logged().at(-1).ok, false);
  } finally { f.close(); }
});
test('compliance and policy refusals are fatal; a malformed answer is not', async () => {
  const f = await fake([{ body: completion('{}', 'stop', { provider: 'Novita' }) }, { status: 404, body: { error: { message: 'No endpoints found' } } },
    { status: 402, body: { error: { message: 'Insufficient credits' } } }, { body: completion('{"items": [') }]);
  const fatal = async () => (await askTeacher<unknown>('hi', schema, { url: f.url, apiKey: 'k', callLog }).then((): { fatal?: boolean } => ({}), (e: { fatal?: boolean }) => e)).fatal;
  try {
    assert.equal(await fatal(), true);
    assert.equal(await fatal(), true);
    assert.equal(await fatal(), true);
    assert.equal(await fatal(), undefined);
  } finally { f.close(); }
});
