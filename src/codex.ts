import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

// Runs `codex exec` non-interactively in a fresh empty dir (read-only sandbox), returning schema-shaped JSON.
export async function askCodex<T>(prompt: string, schemaPath: string): Promise<T> {
  const work = fs.mkdtempSync(path.join(os.tmpdir(), 'codex-out-'));
  const empty = fs.mkdtempSync(path.join(os.tmpdir(), 'codex-cwd-'));
  const out = path.join(work, 'out.json');
  const args = ['exec', '-s', 'read-only', '--skip-git-repo-check', '--ephemeral',
    '--output-schema', path.resolve(schemaPath), '-o', out, '-C', empty, '-'];
  const child = spawn('codex', args, { stdio: ['pipe', 'ignore', 'pipe'] });
  let stderr = '';
  child.stderr.on('data', (d) => { stderr += d; });
  child.stdin.end(prompt);
  const code = await new Promise<number | null>((resolve, reject) => {
    child.on('error', reject);
    child.on('close', resolve);
  });
  if (code !== 0) throw new Error(`codex exited ${code}: ${stderr.trim().slice(-2000)}`);
  return JSON.parse(fs.readFileSync(out, 'utf8')) as T;
}
