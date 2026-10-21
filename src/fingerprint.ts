import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import type { A4H, Result } from './a4h.ts';
import { compareResults } from './compare.ts';
import { TABLES, type WorkItem } from './items.ts';

// Content hash per allowed table (full read in primary-key order). Verification only — see spec "Data stability".
export async function fingerprint(a4h: A4H): Promise<Record<string, string>> {
  const out: Record<string, string> = {};
  for (const t of TABLES) {
    const o = await a4h.run(`SELECT * FROM ${t} ORDER BY PRIMARY KEY`, 1_000_000);
    if (!o.ok) throw new Error(`fingerprint ${t}: ${o.error}`);
    if (o.result.rows.length !== o.result.totalRows) throw new Error(`fingerprint ${t}: partial read`);
    out[t] = createHash('sha256').update(JSON.stringify({ columns: o.result.columns, rows: o.result.rows })).digest('hex');
  }
  return out;
}

export function freezable(items: WorkItem[]): { ok: true; items: WorkItem[] } | { ok: false; problems: string[] } {
  const problems: string[] = [];
  for (const i of items) {
    if (['drafted', 'validated', 'agreed', 'disputed'].includes(i.status)) problems.push(`${i.id} still ${i.status}`);
    if (i.status === 'accepted' && i.checked_question !== i.question) problems.push(`${i.id} wording changed since cross-check`);
  }
  return problems.length ? { ok: false, problems } : { ok: true, items: items.filter((i) => i.status === 'accepted') };
}

// Main release writes testset.jsonl + fingerprint.json; any other --out (e.g. the fresh set) writes only that file
// and must match the existing fingerprint instead of replacing it.
export function freezePlan(out: string): { guardFiles: string[]; writesFingerprint: boolean } {
  return out === 'testset.jsonl'
    ? { guardFiles: ['testset.jsonl', 'fingerprint.json'], writesFingerprint: true }
    : { guardFiles: [out], writesFingerprint: false };
}

export function assertNotFrozen(dir: string, files = ['testset.jsonl', 'fingerprint.json']): void {
  for (const f of files) {
    if (fs.existsSync(path.join(dir, f))) throw new Error(`already frozen: ${f} exists; a new release is a manual step`);
  }
}

// Freeze must publish what was reviewed: a recaptured answer that differs goes back to review.
export function recaptureDiff(item: Pick<WorkItem, 'id' | 'expected' | 'ordered'>, recaptured: Result): string | null {
  if (!item.expected) return `${item.id}: no reviewed result to compare against`;
  const cmp = compareResults(item.expected, recaptured, item.ordered);
  return cmp.pass ? null : `${item.id}: answer changed since review (${cmp.reason})`;
}
