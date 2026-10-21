// Offline answer generation: one fixed prompt (schema.md + question) per item → answers/<name>.jsonl.
// Resumable: ids already answered without error are skipped.
//   node scripts/generate.ts claude --dataset <name> [--limit n]
//   node scripts/generate.ts ollama --dataset <name> --model qwen3:4b-instruct-2507-q8_0 [--url http://127.0.0.1:11434] [--limit n]
// Every line records the dataset hash and model identity; test datasets are guarded (src/datasets.ts).
// --fewshot adds the worked examples from prompts/fewshot.jsonl (written for the prompt, not from the test set).
import fs from 'node:fs';
import path from 'node:path';
import { parseArgs } from 'node:util';
import { loadSecret } from '../src/creds.ts';
import { extractAnswer, type TestItem } from '../src/eval.ts';
import { REPO } from '../src/items.ts';
import { post } from '../src/http.ts';
import { promptParts } from '../src/prompt.ts';
import { assertMayScore, digestGuard, loadDataset } from '../src/datasets.ts';

const { positionals: [backend], values: opt } = parseArgs({
  allowPositionals: true,
  options: { dataset: { type: 'string' }, 'answers-dir': { type: 'string', default: 'answers' }, model: { type: 'string' }, url: { type: 'string', default: 'http://127.0.0.1:11434' }, limit: { type: 'string' }, fewshot: { type: 'boolean' } },
});
if (backend !== 'claude' && backend !== 'ollama') throw new Error('usage: generate.ts claude|ollama [--model m] [--url u] [--limit n]');

const CLAUDE = { model: 'claude-opus-5-5', effort: 'high' };
const base = backend === 'claude' ? `${CLAUDE.model}-${CLAUDE.effort}`
  : (opt.model ?? '').replace(/[:/]/g, '-').toLowerCase();
const name = base + (opt.fewshot ? '-fewshot' : '');
if (!base) throw new Error('ollama needs --model');

const [head, tail] = promptParts(opt.fewshot);
if (!opt.dataset) throw new Error('--dataset <name> is required (see datasets.json)');
const ds = loadDataset(opt.dataset);
const items: TestItem[] = ds.items;
const identity = backend === 'claude' ? `${CLAUDE.model}@${CLAUDE.effort}` : await ollamaDigest(opt.model!);
assertMayScore(ds, { name, identity });
const stillSameModel = backend === 'ollama' ? digestGuard(() => ollamaDigest(opt.model!), identity) : async () => {};

const out = path.resolve(REPO, opt['answers-dir']!, ds.name, `${name}.jsonl`);
fs.mkdirSync(path.dirname(out), { recursive: true });
const previous = fs.existsSync(out) ? fs.readFileSync(out, 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l)) : [];
const stale = previous.find((a) => a.dataset_sha256 !== ds.sha256 || a.model_identity !== identity);
if (stale) throw new Error(`${path.relative(REPO, out)}: existing answers are for another dataset hash or model identity — refusing to resume`);
const done = new Set(previous.filter((a) => !a.error).map((a) => a.id));
const todo = items.filter((i) => !done.has(i.id)).slice(0, opt.limit ? Number(opt.limit) : undefined);

async function ollamaDigest(tag: string): Promise<string> {
  const r = await fetch(`${opt.url}/api/tags`);
  const m = ((await r.json()) as { models: { name: string; digest: string }[] }).models.find((x) => x.name === tag);
  if (!m) throw new Error(`ollama model ${tag} not found`);
  return m.digest;
}


// No SDK on purpose (project has no runtime deps). No refusal fallback: a fallback model would contaminate the baseline.
async function askClaude(question: string): Promise<string> {
  const key = loadSecret('ANTHROPIC_API_KEY');
  const r = await post('https://api.anthropic.com/v1/messages', { 'x-api-key': key, 'anthropic-version': '2023-06-01' }, {
    model: CLAUDE.model, max_tokens: 16000, output_config: { effort: CLAUDE.effort },
    messages: [{ role: 'user', content: [
      { type: 'text', text: head, cache_control: { type: 'ephemeral' } },
      { type: 'text', text: question + tail },
    ] }],
  });
  if (r.stop_reason !== 'end_turn') throw new Error(`stop_reason ${r.stop_reason}`);
  return r.content.filter((b: any) => b.type === 'text').map((b: any) => b.text).join('');
}

// Ollama native API: greedy decoding, and num_ctx set explicitly so the schema is never silently truncated.
async function askOllama(question: string): Promise<string> {
  const r = await post(`${opt.url}/api/chat`, {}, {
    model: opt.model, stream: false, think: false,
    options: { temperature: 0, num_ctx: 8192, num_predict: 1024 },
    messages: [{ role: 'user', content: head + question + tail }],
  });
  if (r.done_reason !== 'stop') throw new Error(`done_reason ${r.done_reason}`);
  return r.message.content;
}

const ask = backend === 'claude' ? askClaude : askOllama;
let n = 0;
async function worker() {
  for (let i = todo.shift(); i; i = todo.shift()) {
    const t0 = performance.now();
    let line;
    try {
      const raw = await ask(i.question);
      await stillSameModel(); // fatal: rethrown below, the answer is not written
      line = { id: i.id, sql: extractAnswer(raw), raw, ms: Math.round(performance.now() - t0), dataset_sha256: ds.sha256, model_identity: identity };
    } catch (e) {
      if (/model behind the tag changed/.test((e as Error).message)) { todo.length = 0; throw e; }
      line = { id: i.id, error: (e as Error).message, dataset_sha256: ds.sha256, model_identity: identity };
    }
    fs.appendFileSync(out, JSON.stringify(line) + '\n');
    console.log(`${String(++n).padStart(3)} ${i.id} ${'error' in line ? `ERROR ${line.error}` : `${line.ms} ms`}`);
  }
}
const total = todo.length;
await Promise.all(Array.from({ length: backend === 'claude' ? 8 : 1 }, worker));
console.log(`${name}: ${total} generated → ${path.relative(REPO, out)}`);
