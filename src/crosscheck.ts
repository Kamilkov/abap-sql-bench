import fs from 'node:fs';
import { fixSyntax } from './fix.ts';
import path from 'node:path';
import type { Outcome } from './a4h.ts';
import { compareResults } from './compare.ts';
import { REPO, type WorkItem } from './items.ts';
import { foreignTables, judge } from './validate.ts';

type Decision = Pick<WorkItem, 'status' | 'pipeline' | 'checked_question' | 'crosscheck_sql' | 'crosscheck_result' | 'reason'>;

// Independence: only id + question go to the second Codex pass — never reference SQL, tier or ordered.
export function buildPrompt(items: WorkItem[], schema: string): string {
  const questions = items.map((i) => JSON.stringify({ id: i.id, question: i.question })).join('\n');
  return fs.readFileSync(path.join(REPO, 'prompts/crosscheck.md'), 'utf8')
    .replace('{{ABAP_RULES}}', fs.readFileSync(path.join(REPO, 'prompts/abap-rules.md'), 'utf8').trim())
    .replace('{{SCHEMA}}', schema)
    .replace('{{QUESTIONS}}', questions);
}

// Round-robin by tier so no cross-check batch is all one tier (which would prime the answer, e.g. all-unanswerable).
export function interleave(items: WorkItem[]): WorkItem[] {
  const groups = new Map<string, WorkItem[]>();
  for (const i of items) groups.set(i.tier, [...(groups.get(i.tier) ?? []), i]);
  const out: WorkItem[] = [];
  for (let k = 0; out.length < items.length; k++) for (const g of groups.values()) if (g[k]) out.push(g[k]);
  return out;
}

export function decide(item: WorkItem, crossSql: string | null, crossOutcome: Outcome | null): Decision {
  const base = { crosscheck_sql: crossSql, crosscheck_result: crossOutcome };
  const disputed = (reason: string): Decision =>
    ({ ...base, status: 'disputed', reason, pipeline: undefined, checked_question: undefined });
  const agreed: Decision = { ...base, status: 'agreed', pipeline: 'agree', checked_question: item.question, reason: undefined };

  const foreign = crossSql ? foreignTables(crossSql) : [];
  if (foreign.length) return disputed(`cross reads tables outside the benchmark: ${foreign.join(', ')}`);
  if (item.reference_sql === null) {
    if (crossSql === null) return agreed;
    const v = crossOutcome ? judge(crossSql, crossOutcome) : { ok: false as const, reason: 'not executed' };
    return disputed(`cross answered with SQL${v.ok ? '' : `; ${v.reason}`}`);
  }
  if (crossSql === null) return disputed('cross answered UNANSWERABLE');
  if (!crossOutcome) return disputed('cross SQL not executed');
  const v = judge(crossSql, crossOutcome);
  if (!v.ok) return disputed(v.reason);
  if (!crossOutcome.ok || !item.expected) return disputed('no reference result');
  const cmp = compareResults(item.expected, crossOutcome.result, item.ordered);
  return cmp.pass ? agreed : disputed(`results differ: ${cmp.reason}`);
}

// CLI options: --via codex (default) | checker; the checker may only be pointed at an explicit item file.
export function crosscheckArgs(argv: string[]): { via: 'codex' | 'checker' } {
  const via = argv.includes('--via') ? argv[argv.indexOf('--via') + 1] : 'codex';
  if (via !== 'codex' && via !== 'checker') throw new Error('--via codex|checker');
  if (via === 'checker' && !argv.includes('--items')) throw new Error('--via checker needs an explicit --items <file>');
  return { via };
}

// The checker's payload is untrusted: exactly one {id, sql: string|null} per batch id, or the batch fails.
export function checkAnswers(ids: string[], out: unknown): { id: string; sql: string | null }[] {
  const answers = (out as { answers?: unknown } | null)?.answers;
  const ok = Array.isArray(answers) && answers.length === ids.length
    && answers.every((a) => a && typeof a.id === 'string' && (a.sql === null || typeof a.sql === 'string'))
    && new Set(answers.map((a) => a.id)).size === ids.length && answers.every((a) => ids.includes(a.id));
  if (!ok) throw new Error(`checker answers invalid: expected one {id, sql} for each of ${ids.length} ids`);
  return answers as { id: string; sql: string | null }[];
}

// Training pipeline only: the frozen three-rule fixer repairs checker SQL before execution; the raw answer is kept.
export function repairChecker(sql: string | null): { sql: string | null; crosscheck_raw_sql: string | null; crosscheck_repaired: boolean } {
  const fixed = sql === null ? null : fixSyntax(sql);
  return { sql: fixed, crosscheck_raw_sql: sql, crosscheck_repaired: fixed !== sql };
}
