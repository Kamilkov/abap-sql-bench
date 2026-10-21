// Decontamination against the frozen test set (spec Part A). The only training-side code that reads test items.
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import type { Result } from './a4h.ts';
import { loadSecret } from './creds.ts';
import { post } from './http.ts';
import { cosine } from './skeleton.ts';
import { jaccard } from './validate.ts';

export { cosine };
export const VOYAGE_MODEL = 'voyage-3.5'; // pinned; recorded in the spec addendum at calibration
export type Pair = { trainId: string; testId: string; cos: number };
export type Label = 'duplicate' | 'paraphrase' | 'distinct';
type Q = { id: string; question: string; expected: Result | null };

export async function embed(
  texts: string[],
  opts: { url?: string; key?: string; model?: string; cacheFile: string },
): Promise<number[][]> {
  const model = opts.model ?? VOYAGE_MODEL;
  const k = (t: string) => createHash('sha256').update(`${model}\0${t}`).digest('hex');
  const cache = new Map<string, number[]>();
  if (fs.existsSync(opts.cacheFile)) {
    for (const l of fs.readFileSync(opts.cacheFile, 'utf8').split('\n').filter(Boolean)) {
      const e = JSON.parse(l) as { k: string; v: number[] };
      cache.set(e.k, e.v);
    }
  }
  const missing = [...new Set(texts.filter((t) => !cache.has(k(t))))];
  const key = opts.key ?? (() => { try { return loadSecret('ABAP_SQL_BENCH__VOYAGE_API_KEY'); } catch { return loadSecret('VOYAGE_API_KEY'); } })();
  fs.mkdirSync(path.dirname(opts.cacheFile), { recursive: true });
  for (let i = 0; i < missing.length; i += 128) {
    const chunk = missing.slice(i, i + 128);
    const r = await post(`${opts.url ?? 'https://api.voyageai.com'}/v1/embeddings`, { authorization: `Bearer ${key}` },
      { input: chunk, model, input_type: 'query' });
    for (const d of r.data as { index: number; embedding: number[] }[]) {
      cache.set(k(chunk[d.index]), d.embedding);
      fs.appendFileSync(opts.cacheFile, JSON.stringify({ k: k(chunk[d.index]), v: d.embedding }) + '\n');
    }
  }
  return texts.map((t) => cache.get(k(t))!);
}

// Best test match per training item, highest cosine first.
export function bestMatches(train: Q[], test: Q[], emb: Map<string, number[]>): Pair[] {
  return train.filter((t) => emb.has(t.id)).map((t) => {
    let best: Pair = { trainId: t.id, testId: '', cos: -1 };
    for (const q of test) {
      const c = emb.has(q.id) ? cosine(emb.get(t.id)!, emb.get(q.id)!) : -1;
      if (c > best.cos) best = { trainId: t.id, testId: q.id, cos: c };
    }
    return best;
  }).sort((a, b) => b.cos - a.cos);
}

// Top 60 + 20 seeded-random from ranks 61–300 (catches paraphrases the embedding ranks lower).
export function calibrationSample(pairs: Pair[], seed: string): { top: Pair[]; band: Pair[] } {
  const sorted = [...pairs].sort((a, b) => b.cos - a.cos);
  const h = (p: Pair) => createHash('sha256').update(seed + p.trainId).digest('hex');
  const band = sorted.slice(60, 300).sort((a, b) => (h(a) < h(b) ? -1 : 1)).slice(0, 20);
  return { top: sorted.slice(0, 60), band };
}

// Floored to 3 decimals: rounding may only make the threshold stricter, never laxer.
const floor3 = (x: number) => Math.floor(x * 1000 + 1e-9) / 1000;
export function thresholdFrom(labelled: { cos: number; label: Label }[], top: Pair[]): number {
  const close = labelled.filter((l) => l.label !== 'distinct').map((l) => l.cos);
  return close.length ? floor3(Math.min(...close) - 0.01) : floor3(Math.max(...top.map((p) => p.cos)) + 0.01);
}

// The calibrated threshold lives in one committed file, written once; later steps read it, nobody types it.
export function writeThresholdOnce(file: string, value: { threshold: number; model: string }): void {
  if (fs.existsSync(file)) throw new Error(`${file} already exists — the threshold is frozen`);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify({ ...value, frozen_at: new Date().toISOString() }, null, 2) + '\n');
}
export function readThreshold(file: string): { threshold: number; model: string } {
  if (!fs.existsSync(file)) throw new Error(`${file} missing — run decontam.ts calibrate-apply first`);
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

// Cumulative counts from the drop reasons recorded on the items (survives repeated runs).
export function decontamCounts(items: { status: string; reason?: string }[]): Record<'jaccard' | 'cosine' | 'result' | 'train-dup', number> {
  const out = { jaccard: 0, cosine: 0, result: 0, 'train-dup': 0 };
  for (const i of items) {
    const rule = i.status === 'dropped' ? i.reason?.match(/^decontam:([\w-]+):/)?.[1] : undefined;
    if (rule && rule in out) out[rule as keyof typeof out]++;
  }
  return out;
}

// Export guard: every kept pair must carry the stamp of a decontamination run at the frozen threshold.
export function assertDecontaminated(items: { id: string; status: string; decontam?: number }[], threshold: number): void {
  const bad = items.filter((i) => i.status === 'agreed' && i.decontam !== threshold).map((i) => i.id);
  if (bad.length) throw new Error(`not decontaminated at ${threshold}: ${bad.slice(0, 10).join(', ')}${bad.length > 10 ? ` (+${bad.length - 10})` : ''} — run decontam.ts apply`);
}

const resultKey = (r: Result) => JSON.stringify(r.rows.map((row) => row.map((c) => c.trim())).sort());
const cells = (r: Result) => r.rows.length * r.columns.length;

export function decontaminate(train: Q[], test: Q[], emb: Map<string, number[]>, threshold: number):
  Map<string, { rule: 'jaccard' | 'cosine' | 'result' | 'train-dup'; ref: string }> {
  const drops = new Map<string, { rule: 'jaccard' | 'cosine' | 'result' | 'train-dup'; ref: string }>();
  const testResults = new Map<string, string>();
  for (const q of test) if (q.expected && cells(q.expected) > 2) testResults.set(resultKey(q.expected), q.id);
  const kept: Q[] = [];
  for (const t of [...train].sort((a, b) => (a.id < b.id ? -1 : 1))) {
    const j = test.find((q) => jaccard(t.question, q.question) >= 0.8);
    if (j) { drops.set(t.id, { rule: 'jaccard', ref: j.id }); continue; }
    const c = emb.has(t.id) ? test.find((q) => emb.has(q.id) && cosine(emb.get(t.id)!, emb.get(q.id)!) >= threshold) : undefined;
    if (c) { drops.set(t.id, { rule: 'cosine', ref: c.id }); continue; }
    const r = t.expected && cells(t.expected) > 2 ? testResults.get(resultKey(t.expected)) : undefined;
    if (r) { drops.set(t.id, { rule: 'result', ref: r }); continue; }
    const d = kept.find((k) => jaccard(t.question, k.question) >= 0.8);
    if (d) { drops.set(t.id, { rule: 'train-dup', ref: d.id }); continue; }
    kept.push(t);
  }
  return drops;
}
