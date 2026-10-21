import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { loadSecret } from './creds.ts';
import { post } from './http.ts';
import { REPO } from './items.ts';

// Open-weight models via OpenRouter, pinned to DeepInfra at a fixed quantization (spec addendum 2026-10-21b).
// `distillable`: enforce OpenRouter's distillation filter. Only the teacher's outputs become training labels; the
// checker only votes (its SQL never reaches the export), and Z.ai has not opted GLM-5.2 in (addendum 2026-10-21e).
export type Endpoint = { model: string; canonical: string; quantization: string; distillable: boolean };
export const TEACHER: Endpoint = { model: 'deepseek/deepseek-v4-pro-0813', canonical: 'deepseek/deepseek-v4-pro-20260813', quantization: 'fp8', distillable: true }; // MIT
export const CHECKER: Endpoint = { model: 'z-ai/glm-5.2', canonical: 'z-ai/glm-5.2-20260616', quantization: 'fp4', distillable: false }; // MIT, different lab
export const CALL_LOG = path.join(REPO, 'train', 'teacher-calls.jsonl');

// Everything in the request except the prompt; its hash binds saved batches and cross-checks to one configuration.
export function requestSettings(ep: Endpoint, schema: object, maxTokens = 8192) {
  return {
    model: ep.model,
    temperature: 0.7,
    max_tokens: maxTokens,
    response_format: { type: 'json_schema', json_schema: { name: 'out', schema, strict: true } },
    reasoning: { effort: 'none' },
    provider: { only: ['deepinfra'], quantizations: [ep.quantization], require_parameters: true, allow_fallbacks: false,
      data_collection: 'deny', zdr: true, ...(ep.distillable ? { enforce_distillable_text: true } : {}) },
    usage: { include: true },
  };
}
export const settingsHash = (ep: Endpoint, schema: object) =>
  createHash('sha256').update(JSON.stringify(requestSettings(ep, schema))).digest('hex');

// Live compliance: the request settings are only a wish, so every response is checked and every call is logged.
function problemWith(r: any, ep: Endpoint): string | null {
  const reasoning = r.usage?.completion_tokens_details?.reasoning_tokens;
  if (r.provider !== 'DeepInfra') return `served by provider ${r.provider}`;
  if (r.model !== ep.model && r.model !== ep.canonical) return `served by model ${r.model}`;
  if (typeof reasoning !== 'number') return `no numeric reasoning-token evidence (got ${JSON.stringify(reasoning)})`;
  if (reasoning !== 0 || r.choices?.[0]?.message?.reasoning) return `reasoning tokens ${reasoning} (thinking was not off)`;
  return null;
}
// Compliance refusals and client errors (policy refusal, auth, credits, exhausted 429) stop the run;
// a truncated or malformed answer only loses its batch.
const fatal = (e: Error) => Object.assign(e, { fatal: true });

export async function askTeacher<T>(
  prompt: string,
  schema: object,
  opts: { url?: string; apiKey?: string; endpoint?: Endpoint; maxTokens?: number; retryBaseMs?: number; callLog?: string } = {},
): Promise<T> {
  const url = opts.url ?? 'https://openrouter.ai/api';
  const apiKey = opts.apiKey ?? loadSecret('ABAP_SQL_BENCH__TEACHER_API_KEY');
  const ep = opts.endpoint ?? TEACHER;
  const callLog = opts.callLog ?? CALL_LOG;
  const log = (entry: object) => {
    fs.mkdirSync(path.dirname(callLog), { recursive: true });
    fs.appendFileSync(callLog, JSON.stringify({ at: new Date().toISOString(), requested: ep.model, settings: settingsHash(ep, schema), ...entry }) + '\n');
  };
  let r: any;
  try {
    r = await post(`${url}/v1/chat/completions`, { authorization: `Bearer ${apiKey}` },
      { ...requestSettings(ep, schema, opts.maxTokens), messages: [{ role: 'user', content: prompt }] }, opts.retryBaseMs);
  } catch (e) {
    log({ ok: false, error: (e as Error).message.slice(0, 500) });
    throw /^HTTP 4\d\d/.test((e as Error).message) ? fatal(e as Error) : e;
  }
  const meta = { id: r.id, model: r.model, provider: r.provider, finish_reason: r.choices?.[0]?.finish_reason, usage: r.usage };
  const violation = problemWith(r, ep);
  let error = violation;
  let out: T | undefined;
  if (!error && r.choices?.[0]?.finish_reason !== 'stop') error = `finish_reason ${r.choices?.[0]?.finish_reason}`;
  if (!error) {
    try { out = JSON.parse(r.choices[0].message.content) as T; } catch { error = `invalid JSON: ${String(r.choices[0].message.content).slice(0, 200)}`; }
  }
  log({ ...meta, ok: !error, ...(error ? { error } : {}) });
  if (violation) throw fatal(new Error(`teacher response rejected — ${violation}`));
  if (error) throw new Error(`teacher response rejected — ${error}`);
  return out as T;
}
