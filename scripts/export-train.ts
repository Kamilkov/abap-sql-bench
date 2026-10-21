// Kept (cross-checked, decontaminated) training pairs → train/items.jsonl, train/{train,val}.chat.jsonl,
// train/val.items.jsonl; registers dataset `val` (role selection). Refuses to overwrite without --force.
import fs from 'node:fs';
import path from 'node:path';
import { DATASETS } from '../src/datasets.ts';
import { assertDecontaminated, embed, readThreshold } from '../src/decontam.ts';
import { buildExport, registerDataset, tierMix } from '../src/export.ts';
import { readItems, REPO } from '../src/items.ts';

const dir = path.join(REPO, 'train');
if (fs.existsSync(path.join(dir, 'items.jsonl')) && !process.argv.includes('--force')) {
  throw new Error('train/items.jsonl exists; re-export only before training, with --force');
}
const work = readItems(path.join(dir, 'work.jsonl'));
assertDecontaminated(work, readThreshold(path.join(dir, 'threshold.json')).threshold);
const kept = work.filter((i) => i.status === 'agreed');
const unans = kept.filter((i) => i.reference_sql === null);
const vecs = await embed(unans.map((i) => i.question), { cacheFile: path.join(dir, 'embeddings.jsonl') });
const ex = buildExport(kept, new Map(unans.map((i, k) => [i.id, vecs[k]])));
const valIds = new Set(ex.valItems.map((i) => i.id));
console.log(tierMix(ex.canonical.filter((i) => !valIds.has(i.id)), ex.canonical)); // throws on drift
const jsonl = (rows: unknown[]) => rows.map((r) => JSON.stringify(r)).join('\n') + '\n';
fs.writeFileSync(path.join(dir, 'items.jsonl'), jsonl(ex.canonical));
fs.writeFileSync(path.join(dir, 'val.items.jsonl'), jsonl(ex.valItems));
fs.writeFileSync(path.join(dir, 'train.chat.jsonl'), jsonl(ex.trainChat));
fs.writeFileSync(path.join(dir, 'val.chat.jsonl'), jsonl(ex.valChat));
registerDataset(DATASETS, 'val', 'train/val.items.jsonl', 'selection');
console.log(`exported ${ex.canonical.length} pairs: train ${ex.trainChat.length}, val ${ex.valChat.length}; registered dataset val`);
