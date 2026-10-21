import fs from 'node:fs';
import path from 'node:path';
import { readItems, writeItems, type Tier, type WorkItem } from './items.ts';
import { runQueue } from './queue.ts';
import { FIXER_HASH, fixSyntax } from './fix.ts';

export type Focus = { tables: string; feature: string };
export type Batch = { id: string; tier: Tier; focus: Focus; round: number; count: number };
export type Drafted = { question: string; sql: string | null; ordered: boolean };
export type Ask = (b: Batch) => Promise<{ prompt: string; items: Drafted[]; model?: string }>;

// 20-slot cycle = 30/35/25/10 % of batches; the plan is an infinite deterministic sequence cut at `total`,
// so a larger total always starts with the smaller plan (pilot batches are reused).
const CYCLE: Tier[] = ['medium', 'easy', 'hard', 'medium', 'easy', 'unanswerable', 'hard', 'medium', 'easy', 'medium',
  'hard', 'easy', 'medium', 'unanswerable', 'hard', 'easy', 'medium', 'hard', 'easy', 'medium'];

export type FocusPlan = Record<Tier, Focus[]>;

// The n-th batch of a tier takes that tier's n-th focus (cycling), so focuses fit their tier and repeat only after
// the tier's whole list has been used.
export function planBatches(total: number, focus: FocusPlan, size = 10): Batch[] {
  const seen: Record<string, number> = {};
  return Array.from({ length: Math.ceil(total / size) }, (_, k) => {
    const tier = CYCLE[k % CYCLE.length];
    const n = (seen[tier] = (seen[tier] ?? -1) + 1);
    const len = focus[tier].length;
    return { id: `b${String(k + 1).padStart(4, '0')}`, tier, focus: focus[tier][n % len], round: Math.floor(n / len) + 1, count: size };
  });
}

// A saved batch file is the source of truth: written atomically only after the teacher answered.
function checkItems(b: Batch, items: unknown): Drafted[] {
  const ok = Array.isArray(items) && items.length === b.count && items.every((d) =>
    d && typeof d.question === 'string' && d.question.trim() && (d.sql === null || typeof d.sql === 'string') && typeof d.ordered === 'boolean');
  if (!ok) throw new Error(`teacher returned ${Array.isArray(items) ? items.length : 'no'} valid items, expected ${b.count}`);
  return items as Drafted[];
}

// `fingerprint(b)` hashes the batch's exact prompt plus the request settings; a saved batch made under another
// prompt, model, provider or schema refuses the whole run before any call (never silently reused).
export async function draftBatches(batches: Batch[], draftsDir: string, ask: Ask,
  opts: { fingerprint: (b: Batch) => string; concurrency?: number; logFile?: string }): Promise<void> {
  const concurrency = opts.concurrency ?? 8;
  fs.mkdirSync(draftsDir, { recursive: true });
  const saved = batches.filter((b) => fs.existsSync(path.join(draftsDir, `${b.id}.json`)));
  const stale = saved.map((b) => [b.id, JSON.parse(fs.readFileSync(path.join(draftsDir, `${b.id}.json`), 'utf8')).fingerprint, opts.fingerprint(b)])
    .filter(([, was, now]) => was !== now);
  if (stale.length) {
    throw new Error(`saved batches were made with another configuration (fingerprint saved → now): ${
      stale.slice(0, 5).map(([id, was, now]) => `${id} ${was ?? 'none'} → ${now}`).join('; ')}${stale.length > 5 ? ` … ${stale.length} total` : ''}`);
  }
  const todo = batches.filter((b) => !saved.includes(b));
  await runQueue(todo, concurrency, async (b) => {
    try {
      const { prompt, items, model } = await ask(b);
      const valid = checkItems(b, items);
      const file = path.join(draftsDir, `${b.id}.json`);
      fs.writeFileSync(`${file}.tmp`, JSON.stringify({ batch: b, model, fingerprint: opts.fingerprint(b), prompt, items: valid }, null, 2) + '\n');
      fs.renameSync(`${file}.tmp`, file);
      console.log(`${b.id} ${b.tier} ok (${items.length})`);
    } catch (e) {
      const msg = `${new Date().toISOString()} ${b.id} ${b.tier} ${(e as { fatal?: boolean }).fatal ? 'FATAL' : 'FAILED'}: ${(e as Error).message.slice(0, 300)}`;
      console.log(msg);
      if (opts.logFile) fs.appendFileSync(opts.logFile, msg + '\n');
      if ((e as { fatal?: boolean }).fatal) throw e;
    }
  });
}

// Idempotent: stable ids t-<batch>-<k>; existing items (and their later statuses) are never touched.
export function importDrafts(draftsDir: string, itemsFile: string): number {
  const items = readItems(itemsFile);
  const have = new Set(items.map((i) => i.id));
  let added = 0;
  for (const f of fs.readdirSync(draftsDir).filter((f) => f.endsWith('.json')).sort()) {
    const { batch, items: drafted } = JSON.parse(fs.readFileSync(path.join(draftsDir, f), 'utf8')) as { batch: Batch; items: Drafted[] };
    drafted.forEach((d, k) => {
      const id = `t-${batch.id}-${String(k).padStart(2, '0')}`;
      if (have.has(id)) return;
      const label = d.sql === null ? null : fixSyntax(d.sql);
      const item: WorkItem = { id, batch: batch.id, tier: batch.tier, question: d.question, reference_sql: label,
        raw_sql: d.sql, repaired: label !== d.sql, fixer: FIXER_HASH,
        ordered: d.ordered, source: 'teacher', status: 'drafted', flags: [], expected: null };
      items.push(item); have.add(id); added++;
    });
  }
  writeItems(items, itemsFile);
  return added;
}
