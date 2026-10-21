// One Codex pass that makes "each X" questions explicit about Xs without data; changed items go back to drafted.
import fs from 'node:fs';
import path from 'node:path';
import { askCodex } from '../src/codex.ts';
import { applyClarification, clarifyCandidates } from '../src/clarify.ts';
import { readItems, writeItems, REPO } from '../src/items.ts';
import { itemsFileArg } from '../src/items.ts';

const itemsFile = itemsFileArg();
const items = readItems(itemsFile);
const todo = clarifyCandidates(items);
const log: { id: string; before: string; after: string }[] = [];
const template = fs.readFileSync(path.join(REPO, 'prompts/clarify.md'), 'utf8');
for (let k = 0; k < todo.length; k += 10) {
  const batch = todo.slice(k, k + 10);
  const list = batch.map((i) => JSON.stringify({ id: i.id, question: i.question, reference_sql: i.reference_sql })).join('\n');
  const { answers } = await askCodex<{ answers: { id: string; question: string }[] }>(
    template.replace('{{ITEMS}}', list), path.join(REPO, 'prompts/clarify.schema.json'));
  for (const i of batch) {
    const a = answers.find((x) => x.id === i.id);
    const before = i.question;
    if (a && applyClarification(i, a.question)) log.push({ id: i.id, before, after: i.question });
  }
  writeItems(items, itemsFile);
}
fs.appendFileSync(path.join(REPO, 'review', 'clarified.jsonl'), log.map((l) => JSON.stringify(l)).join('\n') + (log.length ? '\n' : ''));
console.log(`checked ${todo.length}, clarified ${log.length} → review/clarified.jsonl`);
