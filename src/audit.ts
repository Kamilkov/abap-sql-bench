import { createHash } from 'node:crypto';
import { TIERS, type Tier, type WorkItem } from './items.ts';

export const AUDIT_HARD_MIN = 12;

// Stratified sample for Kamil's label audit: proportional to the pool's tier mix, at least 3 per tier and
// at least 12 hard. A tier with too few survivors for its quota stops the pilot (never a silently smaller quota).
export function auditSample(kept: WorkItem[], n = 50, seed = 'audit-1'): WorkItem[] {
  const by = (t: string) => kept.filter((i) => i.tier === t);
  const quota = Object.fromEntries(TIERS.map((t) => [t, Math.max(t === 'hard' ? AUDIT_HARD_MIN : 3, Math.round((n * by(t).length) / kept.length))]));
  const largest = TIERS.filter((t) => t !== 'hard').reduce((a, b) => (quota[a] >= quota[b] ? a : b));
  quota[largest] += n - TIERS.reduce((s, t) => s + quota[t], 0);
  const short = TIERS.filter((t) => by(t).length < quota[t]).map((t) => `${t}: ${by(t).length} survivors < quota ${quota[t]}`);
  if (short.length) throw new Error(`audit sample impossible — ${short.join('; ')}`);
  const h = (i: WorkItem) => createHash('sha256').update(seed + i.id).digest('hex');
  return TIERS.flatMap((t) => by(t).sort((a, b) => (h(a) < h(b) ? -1 : 1)).slice(0, quota[t]));
}

// Gate: exactly the saved 50 pairs labelled, ≥ 12 of them hard, at most 2 wrong overall and at most 1 wrong hard.
// Reported as "k/50 audited labels incorrect", not a population rate.
export function auditGate(labels: { id: string; correct: boolean }[], sample: { id: string; tier: Tier }[]):
  { wrong: number; hardWrong: number; hard: number; total: number; pass: boolean } {
  const ids = new Set(labels.map((l) => l.id));
  const exact = ids.size === labels.length && labels.length === sample.length && sample.every((s) => ids.has(s.id));
  const hardIds = new Set(sample.filter((s) => s.tier === 'hard').map((s) => s.id));
  const wrong = labels.filter((l) => !l.correct).length;
  const hardWrong = labels.filter((l) => !l.correct && hardIds.has(l.id)).length;
  return { wrong, hardWrong, hard: hardIds.size, total: labels.length,
    pass: exact && sample.length === 50 && hardIds.size >= AUDIT_HARD_MIN && wrong <= 2 && hardWrong <= 1 };
}

// Binds the labels to the exact pairs that were shown (question + SQL), so a changed pair invalidates the audit.
type Shown = { id: string; question: string; reference_sql: string | null; raw_sql?: string | null; repaired?: boolean; ordered?: boolean;
  ordered_reason?: string; ordered_judges?: { verdict: string; evidence: string; by: string }[] };
export function sampleHash(items: Shown[]): string {
  return createHash('sha256').update(JSON.stringify(items.map((i) => [i.id, i.question, i.reference_sql, i.raw_sql ?? null, i.ordered ?? null]))).digest('hex');
}

// The label, plus the teacher's raw SQL whenever the frozen fixer changed it.
export function sqlBlock(i: Shown): string {
  const fence = (s: string | null) => `\`\`\`sql\n${s ?? 'UNANSWERABLE'}\n\`\`\``;
  return i.repaired ? `Teacher SQL (raw):\n\n${fence(i.raw_sql ?? null)}\n\nLabel (after the frozen fixer):\n\n${fence(i.reference_sql)}` : fence(i.reference_sql);
}

// Ordering decision (addendum 2026-10-21h), so the audit also checks the flag used for validation grading.
export function orderingLine(i: Shown): string {
  if (!i.ordered_reason) return '';
  const ev = (i.ordered_judges ?? []).map((j) => `${j.by.split('/')[0]}: "${j.evidence}"`).join(' · ');
  return `Order matters: ${i.ordered ? 'yes' : 'no'} (${i.ordered_reason}) — ${ev}`;
}
