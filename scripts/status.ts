import { itemsFileArg, readItems, TIERS, type Status } from '../src/items.ts';

const STATUSES: Status[] = ['drafted', 'rejected', 'validated', 'agreed', 'disputed', 'accepted', 'dropped'];
const file = itemsFileArg();
const items = readItems(file);
console.log(['tier'.padEnd(13), ...STATUSES.map((s) => s.padStart(10))].join(''));
for (const t of TIERS) {
  console.log([t.padEnd(13), ...STATUSES.map((s) => String(items.filter((i) => i.tier === t && i.status === s).length).padStart(10))].join(''));
}
console.log(`total ${items.length}`);
