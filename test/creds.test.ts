import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { loadCreds, loadSecret } from '../src/creds.ts';

function setup(env: string | null, secrets: string | null) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'creds-'));
  const projectEnv = path.join(dir, '.env');
  const secretsPath = path.join(dir, 'secrets.env');
  if (env !== null) fs.writeFileSync(projectEnv, env);
  if (secrets !== null) fs.writeFileSync(secretsPath, secrets);
  return { projectEnv, secrets: secretsPath };
}

const ALL = 'ABAP_SQL_BENCH__SAP_USER=p\nABAP_SQL_BENCH__SAP_PASSWORD=q\nSAP_USER=x\nSAP_PASSWORD=y\n';

test('project .env pair wins', () => {
  assert.deepEqual(loadCreds(setup('SAP_USER=a\nSAP_PASSWORD=b\n', ALL)), { user: 'a', password: 'b' });
});

test('prefixed pair beats unprefixed', () => {
  assert.deepEqual(loadCreds(setup(null, ALL)), { user: 'p', password: 'q' });
});

test('falls through only when both keys absent', () => {
  assert.deepEqual(loadCreds(setup(null, 'SAP_USER=x\nSAP_PASSWORD=y\n')), { user: 'x', password: 'y' });
});

test('half-configured source fails, no fall-through', () => {
  assert.throws(
    () => loadCreds(setup(null, 'ABAP_SQL_BENCH__SAP_USER=p\nSAP_USER=x\nSAP_PASSWORD=y\n')),
    (e: Error) => e.message.includes('ABAP_SQL_BENCH__SAP_PASSWORD') && !e.message.includes('='),
  );
});

test('empty value fails', () => {
  assert.throws(() => loadCreds(setup('SAP_USER=\nSAP_PASSWORD=b\n', ALL)), /SAP_USER/);
});

test("ignores other projects' keys", () => {
  assert.throws(() =>
    loadCreds(setup(null, 'SUPPLY_CHAIN_RESCUE__SAP_USER=s\nSUPPLY_CHAIN_RESCUE__SAP_PASSWORD=t\n')),
  );
});

test('does not populate process.env', () => {
  const before = process.env.SAP_PASSWORD;
  loadCreds(setup('SAP_USER=a\nSAP_PASSWORD=zzz-unique\n', null));
  assert.equal(process.env.SAP_PASSWORD, before);
});

test('loadSecret: project .env beats secrets.env', () => {
  assert.equal(loadSecret('ANTHROPIC_API_KEY', setup('ANTHROPIC_API_KEY=a\n', 'ANTHROPIC_API_KEY=b\n')), 'a');
  assert.equal(loadSecret('ANTHROPIC_API_KEY', setup(null, 'OTHER=x\nANTHROPIC_API_KEY=b\n')), 'b');
});

test('loadSecret: missing or empty fails with the name only', () => {
  assert.throws(() => loadSecret('ANTHROPIC_API_KEY', setup(null, 'OTHER=secretvalue\n')), /^Error: Missing or empty ANTHROPIC_API_KEY$/);
  assert.throws(() => loadSecret('ANTHROPIC_API_KEY', setup('ANTHROPIC_API_KEY=\n', 'ANTHROPIC_API_KEY=b\n')), /Missing or empty/);
});
