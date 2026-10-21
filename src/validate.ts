import type { Outcome } from './a4h.ts';
import { TABLES, type WorkItem } from './items.ts';

const RELATIVE = /\b(today|tomorrow|yesterday|upcoming|recent|current|(this|last|next) (week|month|quarter|year))\b/i;

// Tables read in FROM/JOIN (incl. subqueries) that are not among the 13 fingerprinted benchmark tables.
export function foreignTables(sql: string): string[] {
  const noLiterals = sql.replace(/'[^']*'|`[^`]*`/g, "''");
  const read = [...noLiterals.matchAll(/\b(?:FROM|JOIN)[\s(]+([\/\w]+)/gi)].map((m) => m[1].toUpperCase());
  return [...new Set(read.filter((t) => !TABLES.includes(t)))];
}

export function staticCheck(item: WorkItem): string | null {
  if (RELATIVE.test(item.question)) return 'today-relative wording';
  const foreign = item.reference_sql ? foreignTables(item.reference_sql) : [];
  if (foreign.length) return `reads tables outside the benchmark: ${foreign.join(', ')}`;
  const unanswerable = item.tier === 'unanswerable';
  if (unanswerable && item.reference_sql !== null) return 'unanswerable item has SQL';
  if (!unanswerable && !item.reference_sql) return 'answerable item has no SQL';
  if (item.ordered && !/\bORDER\s+BY\b/i.test(item.reference_sql ?? '')) return 'ordered without ORDER BY';
  return null;
}

// Size gate for any executed SQL (reference or cross-check). totalRows is unreliable (wrong for aggregates
// without GROUP BY), so run() fetches 1,001 rows and the returned count decides.
export function judge(_sql: string, outcome: Outcome): { ok: true } | { ok: false; reason: string } {
  if (!outcome.ok) return { ok: false, reason: `sql error: ${outcome.error}` };
  const n = outcome.result.rows.length;
  if (n === 0) return { ok: false, reason: '0 rows' };
  if (n > 1000) return { ok: false, reason: 'more than 1000 rows' };
  return { ok: true };
}

const tokens = (q: string) => new Set(q.toLowerCase().match(/[a-z0-9]+/g) ?? []);

export function jaccard(a: string, b: string): number {
  const x = tokens(a), y = tokens(b);
  const inter = [...x].filter((t) => y.has(t)).length;
  const union = new Set([...x, ...y]).size;
  return union ? inter / union : 0;
}

export function nearDuplicates(items: WorkItem[]): Map<string, string> {
  const sets = items.map((i) => tokens(i.question));
  const dup = new Map<string, string>();
  for (let i = 0; i < items.length; i++) {
    for (let j = 0; j < i; j++) {
      const inter = [...sets[i]].filter((t) => sets[j].has(t)).length;
      const union = new Set([...sets[i], ...sets[j]]).size;
      if (union && inter / union >= 0.8) { dup.set(items[i].id, items[j].id); break; }
    }
  }
  return dup;
}
