import { test } from 'node:test';
import assert from 'node:assert/strict';
import { auditSample, auditGate, orderingLine, sampleHash, sqlBlock } from '../src/audit.ts';
import { TIERS, type Tier, type WorkItem } from '../src/items.ts';

const item = (id: string, tier: Tier): WorkItem => ({ id, batch: 'b', tier, question: id, reference_sql: null, ordered: false,
  source: 'teacher', status: 'agreed', flags: [], expected: null });
const pool = (counts: Record<Tier, number>) => TIERS.flatMap((t) => Array.from({ length: counts[t] }, (_, k) => item(`${t}${k}`, t)));

test('auditSample covers every tier, 50 items, deterministic', () => {
  const p = pool({ easy: 300, medium: 350, hard: 250, unanswerable: 100 });
  const s = auditSample(p);
  assert.equal(s.length, 50);
  for (const t of TIERS) assert.ok(s.filter((i) => i.tier === t).length >= 3, t);
  assert.deepEqual(s.map((i) => i.id), auditSample(p).map((i) => i.id));
});
const sample50 = Array.from({ length: 50 }, (_, k) => ({ id: `x${k}`, tier: (k < 12 ? 'hard' : 'easy') as Tier }));
test('auditGate passes at 2 wrong and fails at 3', () => {
  const labels = (wrong: number) => sample50.map((s, k) => ({ id: s.id, correct: k < 50 - wrong }));
  assert.deepEqual(auditGate(labels(2), sample50), { wrong: 2, hardWrong: 0, hard: 12, total: 50, pass: true });
  assert.equal(auditGate(labels(3), sample50).pass, false);
});
test('auditGate fails on an incomplete label file', () => {
  assert.equal(auditGate(sample50.slice(0, 49).map((s) => ({ id: s.id, correct: true })), sample50).pass, false);
});
test('auditGate requires exactly the saved sample ids, each once', () => {
  const all = sample50.map((s) => ({ id: s.id, correct: true }));
  assert.equal(auditGate(all, sample50).pass, true);
  assert.equal(auditGate(Array.from({ length: 50 }, () => ({ id: 'x0', correct: true })), sample50).pass, false);
  assert.equal(auditGate([...all.slice(1), { id: 'other', correct: true }], sample50).pass, false);
});
test('auditSample takes at least 12 hard pairs even when hard is a small share', () => {
  const s = auditSample(pool({ easy: 400, medium: 400, hard: 60, unanswerable: 100 }));
  assert.equal(s.length, 50);
  assert.ok(s.filter((i) => i.tier === 'hard').length >= 12);
  for (const t of TIERS) assert.ok(s.filter((i) => i.tier === t).length >= 3, t);
});
test('auditSample stops when a tier has too few survivors for its quota', () => {
  assert.throws(() => auditSample(pool({ easy: 400, medium: 400, hard: 11, unanswerable: 100 })), /hard: 11 survivors < quota 12/);
});
test('auditGate allows at most 1 wrong hard pair and needs ≥ 12 hard', () => {
  const sample = Array.from({ length: 50 }, (_, k) => ({ id: `x${k}`, tier: (k < 12 ? 'hard' : 'easy') as Tier }));
  const labels = (wrongIds: number[]) => sample.map((s, k) => ({ id: s.id, correct: !wrongIds.includes(k) }));
  assert.equal(auditGate(labels([0, 20]), sample).pass, true);
  assert.deepEqual(auditGate(labels([0, 1]), sample), { wrong: 2, hardWrong: 2, hard: 12, total: 50, pass: false });
  const fewHard = sample.map((s, k) => ({ ...s, tier: (k < 11 ? 'hard' : 'easy') as Tier }));
  assert.equal(auditGate(labels([]), fewHard).pass, false);
});

test('the audit sheet shows raw and repaired SQL when the fixer changed it, and the hash covers both', () => {
  const base = { id: 'x', question: 'q', reference_sql: 'SELECT a FROM /dmo/flight AS f', raw_sql: 'SELECT a FROM /dmo/flight f', repaired: true };
  const md = sqlBlock(base);
  assert.match(md, /Teacher SQL \(raw\)/);
  assert.match(md, /Label \(after the frozen fixer\)/);
  assert.ok(md.includes(base.raw_sql) && md.includes(base.reference_sql));
  assert.equal(sqlBlock({ ...base, repaired: false, raw_sql: base.reference_sql }).includes('raw'), false);
  assert.notEqual(sampleHash([base]), sampleHash([{ ...base, raw_sql: 'SELECT b FROM /dmo/flight f' }]));
});
test('the audit sheet shows the ordering decision with both judges\' evidence, and the hash covers the flag', () => {
  const i = { id: 'x', question: 'q', reference_sql: 'S', ordered: true, ordered_reason: 'two-ordered',
    ordered_judges: [{ verdict: 'ordered' as const, evidence: 'cheapest first', by: 'deepseek/x' }, { verdict: 'ordered' as const, evidence: 'cheapest first, then by date', by: 'z-ai/y' }] };
  const line = orderingLine(i);
  assert.match(line, /Order matters: yes \(two-ordered\)/);
  assert.ok(line.includes('cheapest first, then by date'));
  assert.notEqual(sampleHash([i]), sampleHash([{ ...i, ordered: false }]));
});
