import fs from 'node:fs';
import path from 'node:path';
import { decide } from './crosscheck.ts';
import { REPO, type WorkItem } from './items.ts';

// Ordering metadata by two fresh question-only judgments (spec addendum 2026-10-21h). The teacher's flag never votes.
export type Verdict = 'ordered' | 'unordered' | 'ambiguous';
export type Judgment = { verdict: Verdict; evidence: string; by: string };

export function buildOrderPrompt(items: Pick<WorkItem, 'id' | 'question'>[]): string {
  const questions = items.map((i) => JSON.stringify({ id: i.id, question: i.question })).join('\n');
  return fs.readFileSync(path.join(REPO, 'prompts/order.md'), 'utf8').replace('{{QUESTIONS}}', questions);
}

export function checkJudgments(ids: string[], out: unknown): { id: string; ordering: Verdict; evidence: string }[] {
  const a = (out as { answers?: unknown } | null)?.answers;
  const ok = Array.isArray(a) && a.length === ids.length
    && a.every((x) => x && typeof x.id === 'string' && ['ordered', 'unordered', 'ambiguous'].includes(x.ordering) && typeof x.evidence === 'string')
    && new Set(a.map((x) => x.id)).size === ids.length && a.every((x) => ids.includes(x.id));
  if (!ok) throw new Error(`ordering judgments invalid: expected one {id, ordering, evidence} for each of ${ids.length} ids`);
  return a;
}

export function orderingDecision(a: Judgment, b: Judgment): { final: boolean | null; reason: string } {
  if (a.verdict === 'ordered' && b.verdict === 'ordered') return { final: true, reason: 'two-ordered' };
  if (a.verdict === 'unordered' && b.verdict === 'unordered') return { final: false, reason: 'two-unordered' };
  return { final: null, reason: `unresolved: ${a.by}=${a.verdict} ${b.by}=${b.verdict}` };
}

// Final flag from the two judgments, then the stored comparison is recomputed locally (no SQL is re-run).
export function applyOrdering(item: WorkItem, a: Judgment, b: Judgment): WorkItem {
  const d = orderingDecision(a, b);
  const meta = { ordered_teacher: item.ordered_teacher ?? item.ordered, ordered_judges: [a, b], ordered_reason: d.reason };
  if (d.final === null) return { ...item, ...meta, status: 'dropped', reason: `ordering:${d.reason}` };
  const next = { ...item, ...meta, ordered: d.final };
  return { ...next, ...decide(next, item.crosscheck_sql ?? null, item.crosscheck_result ?? null) };
}
