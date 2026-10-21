// Training-pair generation with the hosted teacher (DeepSeek-V4-Pro via OpenRouter): draft missing batches → import all saved batches.
//   node scripts/teach.ts --total 300 [--concurrency 8]
import fs from 'node:fs';
import path from 'node:path';
import { parseArgs } from 'node:util';
import { profile, TIER_DEF } from '../src/profile.ts';
import { createHash } from 'node:crypto';
import { askTeacher, settingsHash, TEACHER } from '../src/teacher.ts';
import { FIXER_HASH } from '../src/fix.ts';
import type { Batch } from '../src/teach.ts';
import { draftBatches, importDrafts, planBatches, type Drafted, type FocusPlan } from '../src/teach.ts';
import { REPO } from '../src/items.ts';

const { values: opt } = parseArgs({ options: { total: { type: 'string' }, concurrency: { type: 'string', default: '8' } } });
if (!opt.total) throw new Error('usage: teach.ts --total <n>');
const read = (f: string) => fs.readFileSync(path.join(REPO, f), 'utf8');
const focus = JSON.parse(read('prompts/focus.json')) as FocusPlan;
const schema = JSON.parse(read('prompts/teach.schema.json'));
const base = read('prompts/teach.md').replace('{{ABAP_RULES}}', read('prompts/abap-rules.md').trim()).replace('{{SCHEMA}}', read('schema.md').trim()).replace('{{PROFILE}}', await profile());

const promptFor = (b: Batch) => base.replace('{{COUNT}}', String(b.count)).replace('{{TIER}}', b.tier).replace('{{TIER_DEF}}', TIER_DEF[b.tier])
  .replace('{{FOCUS_TABLES}}', b.focus.tables).replace('{{FOCUS_FEATURE}}', b.focus.feature)
  .replace(/\{\{ROUND\}\}/g, String(b.round));
const settings = settingsHash(TEACHER, schema);
try {
  await draftBatches(planBatches(Number(opt.total), focus), path.join(REPO, 'train', 'drafts'), async (b) => {
  const prompt = promptFor(b);
  const out = await askTeacher<{ items: Drafted[] }>(prompt, schema);
  return { prompt, items: out.items, model: TEACHER.canonical };
}, {
  // Pipeline version: request settings + frozen fixer + exact prompt (rules included).
  fingerprint: (b) => createHash('sha256').update(settings + FIXER_HASH + promptFor(b)).digest('hex'),
  concurrency: Number(opt.concurrency), logFile: path.join(REPO, 'train', 'teach.log'),
});
} catch (e) {
  // Policy refusal, compliance violation or stale saved batches: stop; saved batches stay on disk for the next run.
  console.error(`FATAL — generation stopped: ${(e as Error).message.slice(0, 300)}`);
  process.exit(1);
}
const added = importDrafts(path.join(REPO, 'train', 'drafts'), path.join(REPO, 'train', 'work.jsonl'));
console.log(`imported ${added} new items → train/work.jsonl`);
