// Step 1: Codex drafts items for one tier → drafts/<ts>-<tier>.json + work/items.jsonl (status drafted).
import fs from 'node:fs';
import path from 'node:path';
import { parseArgs } from 'node:util';
import { profile, TIER_DEF } from '../src/profile.ts';
import { askCodex } from '../src/codex.ts';
import { readItems, writeItems, nextIds, REPO, TIERS, type Tier, type WorkItem } from '../src/items.ts';
import { itemsFileArg } from '../src/items.ts';


const { values } = parseArgs({ options: { items: { type: 'string' }, tier: { type: 'string' }, count: { type: 'string', default: '10' } } });
const tier = values.tier as Tier;
if (!TIERS.includes(tier)) throw new Error(`--tier must be one of ${TIERS.join(', ')}`);
const count = Number(values.count);


const itemsFile = itemsFileArg();
const items = readItems(itemsFile);
const prompt = fs.readFileSync(path.join(REPO, 'prompts/draft.md'), 'utf8')
  .replace('{{COUNT}}', String(count))
  .replace('{{TIER}}', tier)
  .replace('{{TIER_DEF}}', TIER_DEF[tier])
  .replace('{{SCHEMA}}', fs.readFileSync(path.join(REPO, 'schema.md'), 'utf8'))
  .replace('{{PROFILE}}', await profile())
  .replace('{{EXISTING}}', items.filter((i) => i.tier === tier).map((i) => `- ${i.question}`).join('\n') || '(none)');

const out = await askCodex<{ items: { question: string; reference_sql: string | null; ordered: boolean }[] }>(
  prompt, path.join(REPO, 'prompts/draft.schema.json'));
const batch = `${new Date().toISOString().replace(/[-:]/g, '').replace('T', '-').slice(0, 15)}-${tier}`;
fs.writeFileSync(path.join(REPO, 'drafts', `${batch}.json`), JSON.stringify(out, null, 2) + '\n');
fs.writeFileSync(path.join(REPO, 'drafts', `${batch}.prompt.md`), prompt); // the exact prompt + data profile, for audit
const ids = nextIds(items, out.items.length);
const added: WorkItem[] = out.items.map((d, k) => ({
  id: ids[k], batch, tier, question: d.question, reference_sql: d.reference_sql, ordered: d.ordered,
  source: 'codex', status: 'drafted', flags: [], expected: null,
}));
writeItems([...items, ...added], itemsFile);
console.log(`drafted ${added.length} ${tier} items (${ids[0]}…${ids.at(-1)}) → drafts/${batch}.json`);
