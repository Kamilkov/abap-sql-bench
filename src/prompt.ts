// The one answer prompt (prompts/answer.md + schema.md), shared by evaluation (generate.ts) and training export.
import fs from 'node:fs';
import path from 'node:path';
import { REPO } from './items.ts';

export function promptParts(fewshot = false): [string, string] {
  const examples = !fewshot ? '' : '# Examples\n\n' + fs.readFileSync(path.join(REPO, 'prompts/fewshot.jsonl'), 'utf8')
    .split('\n').filter(Boolean).map((l) => JSON.parse(l)).map((e) => `Question: ${e.question}\nAnswer:\n${e.sql}\n\n`).join('');
  const [head, tail] = fs.readFileSync(path.join(REPO, 'prompts/answer.md'), 'utf8')
    .replace('{{SCHEMA}}', fs.readFileSync(path.join(REPO, 'schema.md'), 'utf8').trim())
    .replace('# Question', examples + '# Question')
    .split('{{QUESTION}}');
  return [head, tail];
}

export function answerPrompt(question: string, fewshot = false): string {
  const [head, tail] = promptParts(fewshot);
  return head + question + tail;
}
