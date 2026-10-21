import fs from 'node:fs';
import path from 'node:path';
import type { Outcome, Result } from './a4h.ts';

export type Tier = 'easy' | 'medium' | 'hard' | 'unanswerable';
export type Status = 'drafted' | 'rejected' | 'validated' | 'agreed' | 'disputed' | 'accepted' | 'dropped';
export type WorkItem = {
  id: string;
  batch: string;
  tier: Tier;
  question: string;
  reference_sql: string | null;
  ordered: boolean;
  source: 'codex' | 'codex+kamil' | 'teacher';
  status: Status;
  reason?: string;
  flags: string[];
  expected: Result | null;
  crosscheck_sql?: string | null;
  crosscheck_result?: Outcome | null;
  raw_sql?: string | null; // teacher SQL before the frozen fixer; reference_sql is the repaired label
  repaired?: boolean;
  fixer?: string; // FIXER_HASH
  crosscheck_raw_sql?: string | null;
  crosscheck_repaired?: boolean;
  crosscheck_by?: string;
  ordered_teacher?: boolean; // the teacher's original flag (diagnosis only; addendum 2026-10-21h)
  ordered_judges?: { verdict: 'ordered' | 'unordered' | 'ambiguous'; evidence: string; by: string }[];
  ordered_reason?: string; // which checker (model@quant#settings) produced crosscheck_sql
  checked_question?: string;
  pipeline?: 'agree' | 'adjudicated';
  decontam?: number; // threshold of the decontamination run that kept this training pair
};

export const REPO = path.resolve(import.meta.dirname, '..');
export const ITEMS = path.join(REPO, 'work', 'items.jsonl');
export const TIERS: Tier[] = ['easy', 'medium', 'hard', 'unanswerable'];
export const TABLES = [
  '/DMO/AGENCY', '/DMO/CUSTOMER', '/DMO/CARRIER', '/DMO/CONNECTION', '/DMO/FLIGHT', '/DMO/AIRPORT', '/DMO/TRAVEL',
  '/DMO/BOOKING', '/DMO/BOOK_SUPPL', '/DMO/SUPPLEMENT', '/DMO/SUPPL_TEXT', '/DMO/TRVL_STAT_T', '/DMO/BOOK_STAT_T',
];

export function readItems(file = ITEMS): WorkItem[] {
  if (!fs.existsSync(file)) return [];
  return fs.readFileSync(file, 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l) as WorkItem);
}

export function writeItems(items: WorkItem[], file = ITEMS): void {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const tmp = `${file}.tmp`;
  fs.writeFileSync(tmp, items.map((i) => JSON.stringify(i)).join('\n') + (items.length ? '\n' : ''));
  fs.renameSync(tmp, file);
}

export function nextIds(items: WorkItem[], n: number): string[] {
  const max = Math.max(0, ...items.map((i) => Number(i.id.slice(1))));
  return Array.from({ length: n }, (_, k) => `q${String(max + k + 1).padStart(4, '0')}`);
}

// `--items <path>` selects the item file (test-set work file by default, train/work.jsonl for training data).
export function itemsFileArg(argv: string[] = process.argv.slice(2)): string {
  const k = argv.indexOf('--items');
  return k < 0 ? ITEMS : path.resolve(REPO, argv[k + 1]);
}
