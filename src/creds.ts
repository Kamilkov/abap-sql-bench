import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { parseEnv } from 'node:util';

const REPO = path.resolve(import.meta.dirname, '..');

function readEnv(file: string): Record<string, string> {
  try {
    return parseEnv(fs.readFileSync(file, 'utf8')) as Record<string, string>;
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === 'ENOENT') return {};
    throw e;
  }
}

// Selective credential lookup (spec "Constraints"): a source is skipped only when neither key is present.
export function loadCreds(
  paths: { projectEnv: string; secrets: string } = {
    projectEnv: path.join(REPO, '.env'),
    secrets: path.join(os.homedir(), '.config/ai/secrets.env'),
  },
): { user: string; password: string } {
  const secrets = readEnv(paths.secrets);
  const sources: [string, Record<string, string>, string, string][] = [
    [paths.projectEnv, readEnv(paths.projectEnv), 'SAP_USER', 'SAP_PASSWORD'],
    [paths.secrets, secrets, 'ABAP_SQL_BENCH__SAP_USER', 'ABAP_SQL_BENCH__SAP_PASSWORD'],
    [paths.secrets, secrets, 'SAP_USER', 'SAP_PASSWORD'],
  ];
  for (const [file, env, userKey, passKey] of sources) {
    if (!(userKey in env) && !(passKey in env)) continue;
    const missing = [userKey, passKey].filter((k) => !env[k]);
    if (missing.length) throw new Error(`Missing or empty ${missing.join(', ')} in ${file}`);
    return { user: env[userKey], password: env[passKey] };
  }
  throw new Error(`No SAP credentials: set SAP_USER/SAP_PASSWORD or ABAP_SQL_BENCH__SAP_USER/ABAP_SQL_BENCH__SAP_PASSWORD`);
}

// Single API key, same selective lookup: the first file that has the key decides; present-but-empty fails.
export function loadSecret(
  key: string,
  paths: { projectEnv: string; secrets: string } = {
    projectEnv: path.join(REPO, '.env'),
    secrets: path.join(os.homedir(), '.config/ai/secrets.env'),
  },
): string {
  for (const file of [paths.projectEnv, paths.secrets]) {
    const env = readEnv(file);
    if (!(key in env)) continue;
    if (!env[key]) break;
    return env[key];
  }
  throw new Error(`Missing or empty ${key}`);
}
