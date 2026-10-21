import { test } from 'node:test';
import assert from 'node:assert/strict';
import { runQueue } from '../src/queue.ts';

test('runQueue processes every item with bounded concurrency', async () => {
  const seen: number[] = [];
  let live = 0, peak = 0;
  await runQueue([1, 2, 3, 4, 5], 2, async (n) => { live++; peak = Math.max(peak, live); await new Promise((r) => setTimeout(r, 2)); seen.push(n); live--; });
  assert.deepEqual(seen.sort(), [1, 2, 3, 4, 5]);
  assert.equal(peak, 2);
});
test('runQueue stops dispatching after an error and rethrows it once in-flight work settles', async () => {
  const started: number[] = [];
  await assert.rejects(runQueue([1, 2, 3], 1, async (n) => { started.push(n); throw new Error(`fatal ${n}`); }), /fatal 1/);
  assert.deepEqual(started, [1]);
});
