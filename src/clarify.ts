import type { WorkItem } from './items.ts';

const EACH = /\b(each|every|per|for all)\s+(\w+\s+){0,2}(airlines?|carriers?|agenc(y|ies)|customers?|airports?|routes?|connections?|supplements?|add-ons?)\b/i;

// Agreed items whose "each X" may silently exclude Xs without data (both Codex runs can agree on that reading).
export function clarifyCandidates(items: WorkItem[]): WorkItem[] {
  return items.filter((i) => i.status === 'agreed' && EACH.test(i.question) && !/LEFT\s+OUTER\s+JOIN/i.test(i.reference_sql ?? ''));
}

// A clarified question re-enters validate + independent cross-check; SQL and source stay (Codex wrote both).
export function applyClarification(item: WorkItem, question: string): boolean {
  const q = question.trim();
  if (q === item.question.trim()) return false;
  Object.assign(item, {
    question: q, status: 'drafted', expected: null, reason: undefined,
    crosscheck_sql: undefined, crosscheck_result: undefined, checked_question: undefined, pipeline: undefined,
  });
  return true;
}
