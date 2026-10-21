// Applies review/decisions.jsonl atomically (all or nothing), then archives it.
import fs from 'node:fs';
import path from 'node:path';
import { readItems, writeItems, REPO } from '../src/items.ts';
import { itemsFileArg } from '../src/items.ts';
import { applyDecisions, type Decision } from '../src/review.ts';

const file = path.join(REPO, 'review', 'decisions.jsonl');
const decisions = fs.readFileSync(file, 'utf8').split('\n').filter((l) => l.trim()).map((l) => JSON.parse(l) as Decision);
const itemsFile = itemsFileArg();
writeItems(applyDecisions(readItems(itemsFile), decisions), itemsFile);
const archived = path.join(REPO, 'review', `applied-${new Date().toISOString().replace(/[:.]/g, '-')}.jsonl`);
fs.renameSync(file, archived);
console.log(`applied ${decisions.length} decisions → ${path.relative(REPO, archived)}`);
