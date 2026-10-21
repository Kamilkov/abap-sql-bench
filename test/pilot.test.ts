import { test } from 'node:test';
import assert from 'node:assert/strict';
import { checkerProvenance, pilotFunnel, pilotGate } from '../src/pilot.ts';
import type { Status, Tier } from '../src/items.ts';

const T = 0.912;
const it = (tier: Tier, status: Status, reason?: string) => ({ tier, status, reason, decontam: status === 'agreed' ? T : undefined });
const many = (n: number, tier: Tier, status: Status, reason?: string) => Array.from({ length: n }, () => it(tier, status, reason));

test('pilotFunnel counts drafted, execution-valid, cross-checked and kept per tier, with reasons', () => {
  const items = [
    ...many(5, 'hard', 'agreed'), ...many(2, 'hard', 'dropped', 'decontam:cosine:q0001 0.93'),
    ...many(2, 'hard', 'disputed'), ...many(1, 'hard', 'rejected', 'Unknown column X'),
  ];
  const hard = pilotFunnel(items, T).find((r) => r.tier === 'hard')!;
  assert.deepEqual({ ...hard, reasons: { ...hard.reasons } },
    { tier: 'hard', drafted: 10, valid: 9, crosschecked: 7, kept: 5, yield: 0.5, repaired: 0, checkerRepaired: 0, reasons: { rejected: 1, disputed: 2, 'decontam:cosine': 2 } });
  assert.equal(pilotFunnel(items, T).at(-1)!.tier, 'total');
});
test('pilotGate needs overall yield ≥ 40% and hard yield ≥ 25%', () => {
  const base = [...many(10, 'medium', 'agreed'), ...many(10, 'unanswerable', 'agreed')];
  const ok = [...base, ...many(50, 'easy', 'agreed'), ...many(25, 'hard', 'agreed'), ...many(75, 'hard', 'disputed')];
  assert.deepEqual(pilotGate(pilotFunnel(ok, T)), { pass: true, failures: [] });
  const weakHard = [...base, ...many(80, 'easy', 'agreed'), ...many(24, 'hard', 'agreed'), ...many(76, 'hard', 'disputed')];
  const g = pilotGate(pilotFunnel(weakHard, T));
  assert.deepEqual(g, { pass: false, failures: ['hard yield 24.0% < 25%'] });
  const weakAll = [...base, ...many(5, 'easy', 'agreed'), ...many(95, 'easy', 'rejected', 'x'), ...many(30, 'hard', 'agreed'), ...many(70, 'hard', 'disputed')];
  assert.deepEqual(pilotGate(pilotFunnel(weakAll, T)).failures, ['overall yield 25.0% < 40%']);
});
test('pilotGate fails a tier with no drafts instead of dividing by zero', () => {
  assert.equal(pilotGate(pilotFunnel(many(10, 'easy', 'agreed'), T)).pass, false);
});
test('pilot counts only pairs stamped with the frozen threshold as kept (reviewer counterexample)', () => {
  const tiers: Tier[] = ['easy', 'medium', 'hard', 'unanswerable'];
  const unstamped = tiers.flatMap((t) => Array.from({ length: 10 }, () => ({ tier: t, status: 'agreed' as Status })));
  const f = pilotFunnel(unstamped, T);
  assert.equal(f.at(-1)!.kept, 0);
  assert.equal(f.at(-1)!.reasons['not-decontaminated'], 40);
  const g = pilotGate(f);
  assert.equal(g.pass, false);
  assert.match(g.failures.join(), /40 pairs not decontaminated with the frozen threshold/);
  const stale = tiers.flatMap((t) => Array.from({ length: 10 }, () => ({ tier: t, status: 'agreed' as Status, decontam: 0.5 })));
  assert.equal(pilotFunnel(stale, T).at(-1)!.kept, 0);
});
test('pilot counts only validated-or-later items as execution-valid and fails an unfinished pilot', () => {
  const items = [...many(4, 'easy', 'drafted'), ...many(3, 'easy', 'validated'), ...many(3, 'easy', 'agreed')];
  const easy = pilotFunnel(items, T)[0];
  assert.equal(easy.valid, 6);
  assert.equal(easy.reasons['pending-validation'], 4);
  assert.equal(easy.reasons['pending-crosscheck'], 3);
  assert.match(pilotGate(pilotFunnel(items, T)).failures.join(), /7 pairs still pending/);
});
test('checkerProvenance requires one recorded checker for every cross-checked pair', () => {
  const ok = [{ status: 'agreed' as Status, crosscheck_by: 'c1' }, { status: 'disputed' as Status, crosscheck_by: 'c1' }, { status: 'validated' as Status }];
  assert.deepEqual(checkerProvenance(ok), []);
  assert.match(checkerProvenance([...ok, { status: 'agreed', crosscheck_by: 'c2' }]).join(), /2 checkers: c1, c2/);
  assert.match(checkerProvenance([...ok, { status: 'disputed' }]).join(), /1 cross-checked pairs without a recorded checker/);
});
test('checkerProvenance also covers pairs later dropped by decontamination', () => {
  const ok = [{ status: 'agreed' as Status, crosscheck_by: 'c1' }];
  assert.match(checkerProvenance([...ok, { status: 'dropped', reason: 'decontam:cosine:q1 0.95' }]).join(), /1 cross-checked pairs without/);
  assert.match(checkerProvenance([...ok, { status: 'dropped', reason: 'decontam:jaccard:q2', crosscheck_by: 'c2' }]).join(), /2 checkers/);
  assert.deepEqual(checkerProvenance([...ok, { status: 'dropped', reason: 'other' }]), []);
});

test('pilotFunnel reports teacher and checker repairs per tier', () => {
  const items = [{ ...it('hard', 'agreed'), repaired: true, crosscheck_repaired: true }, { ...it('hard', 'rejected', 'x'), repaired: true },
    { ...it('hard', 'disputed'), repaired: false, crosscheck_repaired: false }];
  const hard = pilotFunnel(items, T).find((r) => r.tier === 'hard')!;
  assert.equal(hard.repaired, 2);
  assert.equal(hard.checkerRepaired, 1);
});
