import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import type { TestItem } from './eval.ts';
import { REPO } from './items.ts';

export type DatasetRole = 'selection' | 'test';
export type DatasetRegistry = {
  datasets: Record<string, { path: string; sha256: string; role: DatasetRole }>;
  legacy_answers: Record<string, string>; // pre-registry answer files allowed on test-v1, by exact file hash
};
export type ModelEntry = { role: 'baseline' | 'candidate' | 'control'; identity?: string; derived_from?: string };
export type ModelRegistry = Record<string, ModelEntry>;

export const DATASETS = path.join(REPO, 'datasets.json');
export const MODELS = path.join(REPO, 'models.json');
export const MARKER = path.join(REPO, 'models', 'ft-v1.json');

export const sha256 = (data: string | Buffer) => createHash('sha256').update(data).digest('hex');
const readJson = <T>(file: string): T => JSON.parse(fs.readFileSync(file, 'utf8')) as T;

export function loadDataset(name: string, registryPath = DATASETS) {
  const reg = readJson<DatasetRegistry>(registryPath);
  const entry = reg.datasets[name];
  if (!entry) throw new Error(`dataset ${name}: not registered in ${path.basename(registryPath)}`);
  const raw = fs.readFileSync(path.resolve(path.dirname(registryPath), entry.path));
  const actual = sha256(raw);
  if (actual !== entry.sha256) throw new Error(`dataset ${name}: sha256 ${actual} ≠ registered ${entry.sha256}`);
  const items = raw.toString('utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l) as TestItem);
  return { name, items, sha256: actual, role: entry.role, legacy: reg.legacy_answers ?? {} };
}

// Test-role datasets: only registered models whose weights are unchanged; candidates only if frozen (spec Part B).
export function assertMayScore(
  dataset: { name: string; role: DatasetRole },
  model: { name: string; identity: string | null },
  opts: { models?: ModelRegistry; marker?: string } = {},
): void {
  if (dataset.role !== 'test') return;
  const models = opts.models ?? readJson<ModelRegistry>(MODELS);
  const entry = models[model.name];
  if (!entry) throw new Error(`unknown model ${model.name}: register it in models.json before scoring ${dataset.name}`);
  const root = entry.derived_from ? models[entry.derived_from] : entry;
  const rootName = entry.derived_from ?? model.name;
  if (!root?.identity || root.identity !== model.identity) {
    throw new Error(`model ${model.name}: identity ${model.identity} ≠ registered ${root?.identity} — weights changed?`);
  }
  if (root.role !== 'candidate') return;
  const markerFile = opts.marker ?? MARKER;
  const marker = fs.existsSync(markerFile) ? readJson<{ name: string; identity: string }>(markerFile) : null;
  if (!marker || marker.name !== rootName || marker.identity !== model.identity) {
    throw new Error(`model ${model.name}: not the frozen candidate (models/ft-v1.json) — test scoring refused`);
  }
}

// Mutable tags (Ollama) can change under a running generation: re-check the digest around every answer.
export function digestGuard(getDigest: () => Promise<string>, identity: string): () => Promise<void> {
  return async () => {
    const now = await getDigest();
    if (now !== identity) throw new Error(`model behind the tag changed (${identity} → ${now}) — generation stopped`);
  };
}

// Every answer line must come from the same dataset and model; legacy files only by allowlisted hash.
export function checkAnswerLines(
  lines: { id: string; dataset_sha256?: string; model_identity?: string }[],
  ctx: { datasetSha: string; file: string; fileSha: string; legacy: Record<string, string> },
): { identity: string | null } {
  if (lines.every((l) => l.dataset_sha256 === undefined && l.model_identity === undefined)) {
    if (ctx.legacy[ctx.file] !== ctx.fileSha) throw new Error(`${ctx.file}: no provenance and not an allowlisted legacy file`);
    return { identity: null };
  }
  const bad = lines.find((l) => l.dataset_sha256 !== ctx.datasetSha);
  if (bad) throw new Error(`${ctx.file}: answer for dataset ${bad.dataset_sha256} ≠ ${ctx.datasetSha}`);
  const ids = new Set(lines.map((l) => l.model_identity));
  if (ids.size !== 1 || ids.has(undefined)) throw new Error(`${ctx.file}: mixed or missing model identity`);
  return { identity: [...ids][0]! };
}
