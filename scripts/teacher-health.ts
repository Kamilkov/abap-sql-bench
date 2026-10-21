// Health check for teacher and checker via OpenRouter (one tiny structured call each, < $0.01); loads only
// ABAP_SQL_BENCH__TEACHER_API_KEY. askTeacher refuses a response not served by DeepInfra, by another model, or with
// billed reasoning tokens, so "OK" means the live route complies; the evidence is printed from train/teacher-calls.jsonl.
import fs from 'node:fs';
import { askTeacher, CALL_LOG, CHECKER, TEACHER } from '../src/teacher.ts';

const schema = { type: 'object', properties: { ok: { type: 'boolean' } }, required: ['ok'], additionalProperties: false };
let failed = false;
for (const endpoint of [TEACHER, CHECKER]) {
  try {
    const out = await askTeacher<{ ok: boolean }>('Reply with {"ok": true}.', schema, { endpoint, maxTokens: 50 });
    failed ||= out.ok !== true;
    console.log(`${endpoint.model}: ${out.ok === true ? 'OK' : `unexpected ${JSON.stringify(out)}`}`);
  } catch (e) {
    failed = true;
    console.log(`${endpoint.model}: FAILED — ${(e as Error).message.slice(0, 300)}`);
  }
  const last = JSON.parse(fs.readFileSync(CALL_LOG, 'utf8').trim().split('\n').at(-1)!);
  console.log(`  id ${last.id} · model ${last.model} · provider ${last.provider} · reasoning tokens ${
    last.usage?.completion_tokens_details?.reasoning_tokens ?? 'n/a'} · cost $${last.usage?.cost ?? 'n/a'}`);
}
process.exit(failed ? 1 : 0);
