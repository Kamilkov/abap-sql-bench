import { test } from 'node:test';
import assert from 'node:assert/strict';
import { compareResults } from '../src/compare.ts';
import type { Result } from '../src/a4h.ts';

const R = (cols: string, rows: string[][]): Result => ({
  columns: cols.split(' ').map((c) => { const [name, type] = c.split(':'); return { name, type }; }),
  rows, totalRows: rows.length,
});
const pass = (a: Result, b: Result, ordered = false) => compareResults(a, b, ordered).pass;

test('extra candidate columns allowed', () => {
  assert.ok(pass(R('NAME:C', [['Lufthansa'], ['Air France']]), R('ID:C NAME:C', [['LH', 'Lufthansa'], ['AF', 'Air France']])));
});
test('column order and names ignored', () => {
  assert.ok(pass(R('A:C B:I', [['x', '1 ']]), R('Q:I P:C', [['1 ', 'x']])));
});
test('missing column fails', () => {
  assert.ok(!pass(R('A:C B:C', [['x', 'y']]), R('A:C', [['x']])));
});
test('injective: one candidate column cannot serve two reference columns', () => {
  assert.ok(!pass(R('A:I B:I', [['1 ', '1 '], ['2 ', '2 ']]), R('A:I', [['1 '], ['2 ']])));
});
test('whole-row matching', () => {
  assert.ok(!pass(R('N:I S:C', [['1 ', 'x'], ['2 ', 'y']]), R('N:I S:C', [['1 ', 'y'], ['2 ', 'x']])));
});
test('multiset duplicates count', () => {
  assert.ok(!pass(R('C:C', [['LH'], ['LH']]), R('C:C', [['LH']])));
});
test('ordered compares sequence', () => {
  const a = R('C:C', [['LH'], ['AF']]);
  const b = R('C:C', [['AF'], ['LH']]);
  assert.ok(pass(a, b, false));
  assert.ok(!pass(a, b, true));
});
test('decimal exact', () => {
  assert.ok(pass(R('X:P', [['42.40 ']]), R('X:P', [['42.4']])));
  assert.ok(!pass(R('X:P', [['42.4']]), R('X:I', [['42 ']])));
  assert.ok(pass(R('X:N', [['00000001']]), R('X:I', [['1 ']])));
});
test('float tolerance', () => {
  assert.ok(pass(R('X:F', [['7.5075000000000000E+03']]), R('X:P', [['7507.50 ']])));
  assert.ok(!pass(R('X:F', [['3.3468263888888887E+03']]), R('X:P', [['3346.83']])));
  assert.ok(pass(R('X:F', [['1.00000000049']]), R('X:F', [['1.00000000051']])));
  assert.ok(!pass(R('X:F', [['1.000000002']]), R('X:F', [['1.0']])));
});
test('float multiset matching', () => {
  const ref = R('K:C V:F', [['A', '1.0000000001'], ['A', '2.0']]);
  assert.ok(pass(ref, R('K:C V:F', [['A', '2.0'], ['A', '1.0']])));
  assert.ok(!pass(ref, R('K:C V:F', [['A', '2.0'], ['A', '1.1']])));
});
test('float bipartite', () => {
  const ref = R('K:C V:F W:F', [['A', '1.0', '5.0'], ['A', '2.0', '3.0']]);
  assert.ok(pass(ref, R('K:C V:F W:F', [['A', '2.0000000000001', '3.0'], ['A', '1.0', '5.0000000000001']])));
  assert.ok(!pass(ref, R('K:C V:F W:F', [['A', '2.0', '5.0'], ['A', '1.0', '3.0']])));
});
test('dates', () => {
  assert.ok(pass(R('D:D', [['20260620']]), R('D:D', [['20260620']])));
});
test('char case and leading spaces significant', () => {
  assert.ok(!pass(R('S:C', [['Lufthansa']]), R('S:C', [['LUFTHANSA']])));
  assert.ok(!pass(R('S:C', [[' LH']]), R('S:C', [['LH']])));
  assert.ok(pass(R('S:C', [['LH  ']]), R('S:C', [['LH']])));
});
test('row count mismatch fails', () => {
  assert.ok(!pass(R('S:C', [['a']]), R('S:C', [['a'], ['b']])));
});
test('float mode understands ABAP trailing-minus negatives', () => {
  assert.ok(pass(R('X:F', [['-4.24E+01']]), R('X:P', [['42.40-']])));
});
test('invalid or non-finite numbers never match', () => {
  assert.ok(!pass(R('K:C V:F', [['A', 'nonsense']]), R('K:C V:F', [['A', 'different']])));
  assert.ok(!pass(R('V:F', [['nonsense']]), R('V:F', [['nonsense']])));
  assert.ok(!pass(R('V:F', [['1E309']]), R('V:F', [['1']])));
});
