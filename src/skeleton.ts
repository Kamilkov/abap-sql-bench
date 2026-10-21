import { createHash } from 'node:crypto';
import { stripComments } from './a4h.ts';

// Query shape: constants → ?, table aliases → a1, a2… (single pass, no collisions), column aliases → ?.
export function sqlSkeleton(sql: string): string {
  let s = stripComments(sql).trim().replace(/[.;]\s*$/, '');
  s = s.replace(/'[^']*'|`[^`]*`/g, '?').toLowerCase();
  s = s.replace(/\b\d+(\.\d+)?\b/g, '?');
  const tableAlias = new Map<string, string>();
  for (const m of s.matchAll(/\b(?:from|join)\s+[\/\w]+\s+as\s+(\w+)/g)) {
    if (!tableAlias.has(m[1])) tableAlias.set(m[1], `§${tableAlias.size + 1}`); // § can't collide with any SQL word
  }
  const columnAlias = new Set([...s.matchAll(/\bas\s+(\w+)/g)].map((m) => m[1]).filter((a) => !tableAlias.has(a)));
  s = s.replace(/\b(\w+)~/g, (all, a: string) => (tableAlias.has(a) ? `${tableAlias.get(a)}~` : all));
  s = s.replace(/\b(as\s+)(\w+)\b/g, (_all, as: string, a: string) => as + (tableAlias.get(a) ?? '?'));
  s = s.replace(/(^|[^~\w])(\w+)\b/g, (all, pre: string, w: string) => (columnAlias.has(w) && !tableAlias.has(w) ? `${pre}?` : all));
  return s.replace(/§/g, 'a').replace(/\s+/g, ' ').trim();
}

export function cosine(a: number[], b: number[]): number {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) { dot += a[i] * b[i]; na += a[i] ** 2; nb += b[i] ** 2; }
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

export const UNANSWERABLE_GROUP_COSINE = 0.8;

// Grouped split: answerables by skeleton, unanswerables by single-link embedding clusters (cosine ≥ 0.80);
// whole groups go to val in seeded hash order until valShare is reached.
export function groupSplit(
  items: { id: string; skeleton: string | null; question: string }[],
  emb: Map<string, number[]>,
  valShare = 0.05,
  seed = 'split-1',
): { train: string[]; val: string[]; groups: Map<string, string> } {
  const parent = new Map(items.map((i) => [i.id, i.id]));
  const find = (x: string): string => (parent.get(x) === x ? x : find(parent.get(x)!));
  const unans = items.filter((i) => i.skeleton === null && emb.has(i.id));
  for (let i = 0; i < unans.length; i++) for (let j = 0; j < i; j++) {
    if (cosine(emb.get(unans[i].id)!, emb.get(unans[j].id)!) >= UNANSWERABLE_GROUP_COSINE) parent.set(find(unans[i].id), find(unans[j].id));
  }
  const groups = new Map<string, string[]>();
  for (const i of items) {
    const key = i.skeleton !== null ? `s:${i.skeleton}` : `u:${find(i.id)}`;
    groups.set(key, [...(groups.get(key) ?? []), i.id]);
  }
  const order = [...groups.keys()].sort((a, b) => {
    const h = (k: string) => createHash('sha256').update(seed + k).digest('hex');
    return h(a) < h(b) ? -1 : 1;
  });
  // Whole groups go to val until valShare; a group that would push val past maxShare is skipped (never split).
  const maxShare = 0.08;
  const val: string[] = [];
  for (const k of order) {
    if (val.length >= valShare * items.length) break;
    if (val.length + groups.get(k)!.length > maxShare * items.length) continue;
    val.push(...groups.get(k)!);
  }
  if (val.length < valShare * items.length) {
    throw new Error(`infeasible split: only ${val.length} of ${items.length} items fit in val (need ${valShare * 100}%) without splitting a group or exceeding 8%`);
  }
  const v = new Set(val);
  const groupOf = new Map([...groups].flatMap(([key, ids]) => ids.map((id) => [id, key] as [string, string])));
  return { train: items.filter((i) => !v.has(i.id)).map((i) => i.id), val, groups: groupOf };
}
