import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { askCodex } from '../src/codex.ts';

test('askCodex passes prompt on stdin, runs in an empty dir, returns parsed output', async () => {
  const fake = fs.mkdtempSync(path.join(os.tmpdir(), 'fakecodex-'));
  fs.writeFileSync(path.join(fake, 'codex'), `#!/bin/sh
cat > "$FAKE_DIR/stdin.txt"
while [ $# -gt 0 ]; do case "$1" in -o) OUT="$2"; shift;; -C) CD="$2"; shift;; esac; shift; done
ls -A "$CD" | wc -l | tr -d ' ' > "$FAKE_DIR/cdcount.txt"
echo '{"items":[{"q":1}]}' > "$OUT"
`, { mode: 0o755 });
  const oldPath = process.env.PATH;
  process.env.PATH = `${fake}:${oldPath}`;
  process.env.FAKE_DIR = fake;
  try {
    const out = await askCodex<{ items: { q: number }[] }>('hello prompt', '/dev/null');
    assert.deepEqual(out, { items: [{ q: 1 }] });
    assert.equal(fs.readFileSync(path.join(fake, 'stdin.txt'), 'utf8'), 'hello prompt');
    assert.equal(fs.readFileSync(path.join(fake, 'cdcount.txt'), 'utf8').trim(), '0');
  } finally {
    process.env.PATH = oldPath;
  }
});

test('askCodex rejects on non-zero exit', async () => {
  const fake = fs.mkdtempSync(path.join(os.tmpdir(), 'fakecodex-'));
  fs.writeFileSync(path.join(fake, 'codex'), '#!/bin/sh\ncat >/dev/null\necho boom >&2\nexit 3\n', { mode: 0o755 });
  const oldPath = process.env.PATH;
  process.env.PATH = `${fake}:${oldPath}`;
  try {
    await assert.rejects(askCodex('x', '/dev/null'), /boom/);
  } finally {
    process.env.PATH = oldPath;
  }
});
