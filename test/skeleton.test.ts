import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sqlSkeleton, groupSplit } from '../src/skeleton.ts';

test('same query with different constants has the same skeleton', () => {
  assert.equal(
    sqlSkeleton("SELECT carrier_id FROM /dmo/flight WHERE price > 500 AND currency_code = 'EUR'"),
    sqlSkeleton("select carrier_id from /DMO/FLIGHT where price > 1200 and currency_code = 'USD'"));
});
test('different alias names have the same skeleton', () => {
  assert.equal(
    sqlSkeleton('SELECT f~carrier_id FROM /dmo/flight AS f INNER JOIN /dmo/carrier AS c ON c~carrier_id = f~carrier_id'),
    sqlSkeleton('SELECT x~carrier_id FROM /dmo/flight AS x INNER JOIN /dmo/carrier AS y ON y~carrier_id = x~carrier_id'));
});
test('different join has a different skeleton', () => {
  assert.notEqual(
    sqlSkeleton('SELECT f~carrier_id FROM /dmo/flight AS f INNER JOIN /dmo/carrier AS c ON c~carrier_id = f~carrier_id'),
    sqlSkeleton('SELECT f~carrier_id FROM /dmo/flight AS f LEFT OUTER JOIN /dmo/carrier AS c ON c~carrier_id = f~carrier_id'));
});
test("string literals with spaces don't leak into the skeleton", () => {
  const s = sqlSkeleton("SELECT name FROM /dmo/airport WHERE city = 'New York' ORDER BY name UP TO 5 ROWS");
  assert.ok(!/new|york/.test(s));
  assert.ok(s.includes('up to ? rows'));
});

const fixture = (n: number) => Array.from({ length: n }, (_, k) => ({ id: `t${k}`, skeleton: `s${Math.floor(k / 2)}`, question: `q${k}` }));
test('groupSplit never splits a group', () => {
  const items = fixture(200);
  const { val } = groupSplit(items, new Map(), 0.05, 'seed-a');
  const v = new Set(val);
  for (let g = 0; g < 100; g++) assert.equal(v.has(`t${2 * g}`), v.has(`t${2 * g + 1}`));
});
test('groupSplit val share is between 5% and 8%', () => {
  const { train, val } = groupSplit(fixture(200), new Map(), 0.05, 'seed-a');
  assert.equal(train.length + val.length, 200);
  assert.ok(val.length >= 10 && val.length <= 16, String(val.length));
});
test('groupSplit is deterministic per seed', () => {
  assert.deepEqual(groupSplit(fixture(200), new Map(), 0.05, 'x'), groupSplit(fixture(200), new Map(), 0.05, 'x'));
  assert.notDeepEqual(groupSplit(fixture(200), new Map(), 0.05, 'x').val, groupSplit(fixture(200), new Map(), 0.05, 'y').val);
});
test('paraphrased unanswerables with no shared words land in one group', () => {
  const items = [
    { id: 'u1', skeleton: null, question: 'Which pilots operate each flight?' },
    { id: 'u2', skeleton: null, question: 'List the aviators assigned to every departure' },
    ...fixture(60),
  ];
  const emb = new Map([['u1', [1, 0, 0]], ['u2', [0.9, 0.436, 0]]]); // cosine ≈ 0.90
  for (const seed of ['a', 'b', 'c', 'd', 'e', 'f']) {
    const v = new Set(groupSplit(items, emb, 0.05, seed).val);
    assert.equal(v.has('u1'), v.has('u2'), seed);
  }
});

test('alias renaming never collides with existing a<N> aliases', () => {
  const s = sqlSkeleton('SELECT a2~x FROM /dmo/flight AS a2 INNER JOIN /dmo/carrier AS a1 ON a1~carrier_id = a2~carrier_id');
  assert.equal(s, sqlSkeleton('SELECT f~x FROM /dmo/flight AS f INNER JOIN /dmo/carrier AS c ON c~carrier_id = f~carrier_id'));
  assert.ok(s.includes('a1~carrier_id = a2~carrier_id') || s.includes('a2~carrier_id = a1~carrier_id'));
  assert.ok(!/(a\d)~carrier_id = \1~carrier_id/.test(s));
});
test('column alias names do not change the skeleton, incl. ORDER BY references', () => {
  assert.equal(
    sqlSkeleton('SELECT carrier_id, COUNT(*) AS flights FROM /dmo/flight GROUP BY carrier_id ORDER BY flights DESCENDING'),
    sqlSkeleton('SELECT carrier_id, COUNT(*) AS n FROM /dmo/flight GROUP BY carrier_id ORDER BY n DESCENDING'));
});
test('groupSplit skips a group that would push val past 8%', () => {
  const items = [
    ...Array.from({ length: 40 }, (_, k) => ({ id: `big${k}`, skeleton: 'one-huge-skeleton', question: `b${k}` })),
    ...Array.from({ length: 160 }, (_, k) => ({ id: `t${k}`, skeleton: `s${k}`, question: `q${k}` })),
  ];
  for (const seed of ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']) {
    const { val } = groupSplit(items, new Map(), 0.05, seed);
    assert.ok(val.length <= 16, `${seed}: ${val.length}`);
    assert.ok(!val.some((id) => id.startsWith('big')), seed);
  }
});
test('a column alias named like a generated table alias does not change the skeleton', () => {
  assert.equal(sqlSkeleton('SELECT f~carrier_id AS a1 FROM /dmo/flight AS f'), sqlSkeleton('SELECT f~carrier_id AS label FROM /dmo/flight AS f'));
});
test('groupSplit reports an infeasible split instead of an empty val set', () => {
  const items = Array.from({ length: 100 }, (_, k) => ({ id: `t${k}`, skeleton: `g${Math.floor(k / 10)}`, question: `q${k}` }));
  assert.throws(() => groupSplit(items, new Map(), 0.05, 'x'), /infeasible/);
});
test('groupSplit refuses a val set below the requested share (96/4 when 95/5 was asked)', () => {
  const items = [
    ...Array.from({ length: 4 }, (_, k) => ({ id: `small${k}`, skeleton: 'small', question: `s${k}` })),
    ...Array.from({ length: 96 }, (_, k) => ({ id: `t${k}`, skeleton: `g${Math.floor(k / 12)}`, question: `q${k}` })),
  ];
  assert.throws(() => groupSplit(items, new Map(), 0.05, 'x'), /infeasible/);
});
