// Derived answer sets (no model call):
//   fix     → <name>-fixed.jsonl     zero-shot SQL passed through the deterministic syntax fixer
//   shuffle → <name>-shuffled.jsonl  grader control: each SQL answer graded against the next SQL item
//   node scripts/derive.ts fix|shuffle answers/<name>.jsonl
import fs from 'node:fs';
import { deriveAnswers } from '../src/eval.ts';

const [mode, file] = process.argv.slice(2);
if ((mode !== 'fix' && mode !== 'shuffle') || !file) throw new Error('usage: derive.ts fix|shuffle <answers.jsonl>');
const answers = fs.readFileSync(file, 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l)).filter((a) => !a.error);
const out = deriveAnswers(mode, answers);
const dest = file.replace(/\.jsonl$/, mode === 'fix' ? '-fixed.jsonl' : '-shuffled.jsonl');
fs.writeFileSync(dest, out.map((a) => JSON.stringify(a)).join('\n') + '\n');
console.log(`${out.length} answers → ${dest}`);
