import { fixSyntax } from './fix.ts';
import type { A4H, Outcome, Result } from './a4h.ts';
import { compareResults } from './compare.ts';
import { TIERS, type Tier, type WorkItem } from './items.ts';
import { foreignTables } from './validate.ts';

export type TestItem = Pick<WorkItem, 'id' | 'tier' | 'question' | 'reference_sql' | 'ordered' | 'expected'>;
export const UNANSWERABLE = 'UNANSWERABLE';

// Model output → SQL text or the UNANSWERABLE marker. A fenced block wins over surrounding prose.
export function extractAnswer(raw: string): string {
  const fenced = raw.match(/```[a-zA-Z]*\s*\n([\s\S]*?)```/)?.[1] ?? raw;
  const text = fenced.trim();
  return /^\W*UNANSWERABLE\W*$/i.test(text) ? UNANSWERABLE : text;
}

// Spec "Grading rules": compare against the reference result recaptured in this campaign.
export function grade(item: TestItem, ref: Result | null, answer: string | undefined, outcome: Outcome | null):
  { pass: boolean; reason: string } {
  if (!answer) return { pass: false, reason: 'no answer' };
  const said = answer === UNANSWERABLE;
  if (item.tier === 'unanswerable') return said ? { pass: true, reason: 'unanswerable' } : { pass: false, reason: 'answered with SQL' };
  if (said) return { pass: false, reason: 'said UNANSWERABLE' };
  const foreign = foreignTables(answer);
  if (foreign.length) return { pass: false, reason: `reads tables outside the benchmark: ${foreign.join(', ')}` };
  if (!outcome) return { pass: false, reason: 'not executed' };
  if (!outcome.ok) return { pass: false, reason: `sql error: ${outcome.error}` };
  if (!ref) return { pass: false, reason: 'no reference result' };
  return compareResults(ref, outcome.result, item.ordered);
}

// A short dump (HTTP 500) on candidate SQL is a verdict on that SQL. Anything else is infrastructure and aborts;
// a real outage also fails the next reference query and the closing fingerprint, which invalidate the campaign.
export async function runCandidate(a4h: A4H, sql: string): Promise<Outcome> {
  try {
    return await a4h.run(sql);
  } catch (e) {
    if (/^A4H HTTP 500:/.test((e as Error).message)) return { ok: false, error: 'server error (HTTP 500, short dump)' };
    throw e;
  }
}

// Shuffle control: every SQL answer moves to the next SQL-answered item; UNANSWERABLE answers stay put.
export function rotateAnswers<T extends { id: string; sql: string }>(answers: T[]): T[] {
  const sql = answers.filter((a) => a.sql !== UNANSWERABLE);
  return answers.map((a) => (a.sql === UNANSWERABLE ? a : { ...a, sql: sql[(sql.indexOf(a) + 1) % sql.length].sql }));
}

type AnswerLine = { id: string; sql: string; ms?: number; dataset_sha256?: string; model_identity?: string };

// Derived answer sets keep the source's provenance (dataset hash, model identity).
export function deriveAnswers<T extends AnswerLine>(mode: 'fix' | 'shuffle', answers: T[]): AnswerLine[] {
  if (mode === 'fix') return answers.map((a) => (a.sql === UNANSWERABLE ? a : { ...a, sql: fixSyntax(a.sql) }));
  return rotateAnswers(answers).map(({ id, sql, ms, dataset_sha256, model_identity }) => ({ id, sql, ms, dataset_sha256, model_identity }));
}

export type ItemResult = {
  id: string; tier: Tier; model: string; answer: string | null; pass: boolean; reason: string;
  sql_error: boolean; foreign: boolean; gen_ms: number | null; exec_ms: number | null;
};

const ratio = (a: number, b: number) => (b ? a / b : null);
// Nearest-rank percentile.
function pct(xs: number[], p: number): number | null {
  if (!xs.length) return null;
  const s = [...xs].sort((a, b) => a - b);
  return s[Math.ceil(p * s.length) - 1];
}
const latency = (xs: (number | null)[]) => {
  const v = xs.filter((x): x is number => x !== null);
  return { median: pct(v, 0.5), p95: pct(v, 0.95) };
};

export function summarize(rows: ItemResult[]) {
  const models = [...new Set(rows.map((r) => r.model))];
  return Object.fromEntries(models.map((m) => {
    const rs = rows.filter((r) => r.model === m);
    const pass = rs.filter((r) => r.pass).length;
    const tiers = Object.fromEntries(TIERS.map((t) => {
      const ts = rs.filter((r) => r.tier === t);
      const p = ts.filter((r) => r.pass).length;
      return [t, { n: ts.length, pass: p, accuracy: ratio(p, ts.length) }];
    })) as Record<Tier, { n: number; pass: number; accuracy: number | null }>;
    const said = rs.filter((r) => r.answer === UNANSWERABLE);
    const truly = rs.filter((r) => r.tier === 'unanswerable');
    const tp = said.filter((r) => r.tier === 'unanswerable').length;
    const sql = rs.filter((r) => r.answer && r.answer !== UNANSWERABLE);
    const errors = sql.filter((r) => r.sql_error).length;
    return [m, {
      n: rs.length, pass, accuracy: ratio(pass, rs.length), tiers,
      unanswerable: { said: said.length, precision: ratio(tp, said.length), recall: ratio(tp, truly.length) },
      sql_answers: sql.length, sql_errors: errors, sql_error_rate: ratio(errors, sql.length),
      foreign: rs.filter((r) => r.foreign).length,
      dumps: rs.filter((r) => /HTTP 500/.test(r.reason)).length,
      gen_ms: latency(rs.map((r) => r.gen_ms)), exec_ms: latency(rs.map((r) => r.exec_ms)),
    }];
  }));
}
