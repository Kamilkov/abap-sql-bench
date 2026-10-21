// Writes review/sheet.md (all agreed + disputed), or with --sample N a short sheet:
// disputed + flagged + N seeded-random agreed items → review/short-sheet.md (+ the sample's ids).
import fs from 'node:fs';
import path from 'node:path';
import { parseArgs } from 'node:util';
import { readItems, REPO } from '../src/items.ts';
import { itemsFileArg } from '../src/items.ts';
import { renderSheet, shortlist } from '../src/review.ts';

const { values } = parseArgs({ options: { items: { type: 'string' }, sample: { type: 'string' }, seed: { type: 'string', default: 'review-1' } } });
fs.mkdirSync(path.join(REPO, 'review'), { recursive: true });
const itemsFile = itemsFileArg();
const items = readItems(itemsFile);
const short = values.sample !== undefined;
const chosen = short ? shortlist(items, Number(values.sample), values.seed!) : items;
const prefix = values.items ? `${path.basename(values.items, '.jsonl')}.` : '';
const file = path.join(REPO, 'review', prefix + (short ? 'short-sheet.md' : 'sheet.md'));
fs.writeFileSync(file, renderSheet(chosen));
if (short) {
  const sampled = chosen.filter((i) => i.status === 'agreed' && !i.flags.length).map((i) => i.id);
  fs.writeFileSync(path.join(REPO, 'review', 'sample-ids.txt'), `seed ${values.seed}\n${sampled.join('\n')}\n`);
}
console.log(`wrote ${path.relative(REPO, file)} (${chosen.filter((i) => ['agreed', 'disputed'].includes(i.status)).length} items)`);
