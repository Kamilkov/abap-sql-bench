import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { readItems, writeItems, nextIds, type WorkItem } from '../src/items.ts';

const item = (id: string): WorkItem => ({
  id, batch: 'b1', tier: 'easy', question: 'How many carriers?', reference_sql: 'SELECT COUNT(*) FROM /dmo/carrier',
  ordered: false, source: 'codex', status: 'drafted', flags: [], expected: null,
});

test('writeItems/readItems round-trip', () => {
  const file = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'items-')), 'work', 'items.jsonl');
  const items = [item('q0001'), item('q0002')];
  writeItems(items, file);
  assert.deepEqual(readItems(file), items);
});
test('readItems on missing file is empty', () => {
  assert.deepEqual(readItems(path.join(os.tmpdir(), 'nope-' + Date.now(), 'x.jsonl')), []);
});
test('nextIds continues after the highest id', () => {
  assert.deepEqual(nextIds([item('q0003'), item('q0007')], 2), ['q0008', 'q0009']);
  assert.deepEqual(nextIds([], 1), ['q0001']);
});

import { itemsFileArg, ITEMS, REPO } from '../src/items.ts';
test('itemsFileArg defaults to work/items.jsonl and resolves --items relative to the repo', () => {
  assert.equal(itemsFileArg([]), ITEMS);
  assert.equal(itemsFileArg(['--items', 'train/work.jsonl']), path.join(REPO, 'train/work.jsonl'));
  assert.equal(itemsFileArg(['--via', 'teacher', '--items', '/tmp/x.jsonl']), '/tmp/x.jsonl');
});
