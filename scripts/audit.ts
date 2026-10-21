// Kamil's label audit of kept pilot pairs (spec Part A).
//   node scripts/audit.ts            → review/audit.md + review/audit.jsonl (set "correct": true|false per line)
//   node scripts/audit.ts --apply    → "k/50 audited labels incorrect, h/H hard" + gate
import fs from 'node:fs';
import path from 'node:path';
import { auditGate, auditSample, orderingLine, sampleHash, sqlBlock } from '../src/audit.ts';
import { readItems, REPO } from '../src/items.ts';

const dir = path.join(REPO, 'review');
if (process.argv.includes('--apply')) {
  const labels = fs.readFileSync(path.join(dir, 'audit.jsonl'), 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l));
  if (labels.some((l) => typeof l.correct !== 'boolean')) throw new Error('audit.jsonl: every line needs "correct": true or false');
  const saved = JSON.parse(fs.readFileSync(path.join(dir, 'audit.sample.json'), 'utf8')) as { ids: string[]; hash: string };
  const current = readItems(path.join(REPO, 'train', 'work.jsonl')).filter((i) => saved.ids.includes(i.id));
  const shown = saved.ids.map((id) => current.find((i) => i.id === id)!);
  if (shown.some((i) => !i) || sampleHash(shown) !== saved.hash) {
    throw new Error('audited pairs changed since the audit sheet was written — regenerate the sheet and re-audit');
  }
  const g = auditGate(labels, shown);
  console.log(`${g.wrong}/${g.total} audited labels incorrect, ${g.hardWrong}/${g.hard} hard — gate ${g.pass ? 'PASSED' : 'FAILED'} (≤ 2 wrong, ≤ 1 wrong hard, ≥ 12 hard)`);
  process.exit(g.pass ? 0 : 1);
}
const kept = readItems(path.join(REPO, 'train', 'work.jsonl')).filter((i) => i.status === 'agreed');
const sample = auditSample(kept);
const table = (i: (typeof sample)[number]) => !i.expected ? '' : [
  `| ${i.expected.columns.map((c) => c.name).join(' | ')} |`, `|${i.expected.columns.map(() => '---').join('|')}|`,
  ...i.expected.rows.slice(0, 10).map((r) => `| ${r.map((c) => c.trim()).join(' | ')} |`),
].join('\n');
fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(path.join(dir, 'audit.md'), `# Label audit — does the SQL/result answer the question? (${sample.length} pairs)\n\n` +
  sample.map((i, k) => `## ${k + 1}. ${i.id} · ${i.tier}\n\n**${i.question}**\n\n${sqlBlock(i)}\n\n${orderingLine(i)}\n\n${table(i)}\n`).join('\n'));
fs.writeFileSync(path.join(dir, 'audit.jsonl'), sample.map((i) => JSON.stringify({ id: i.id, correct: null })).join('\n') + '\n');
fs.writeFileSync(path.join(dir, 'audit.sample.json'), JSON.stringify({ ids: sample.map((i) => i.id), hash: sampleHash(sample) }, null, 2) + '\n');
console.log(`wrote review/audit.md + review/audit.jsonl (${sample.length} pairs)`);
