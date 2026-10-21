// Pilot teacher check (spec addendum 2026-10-21): per-tier funnel with rejection reasons + yield gate.
//   node scripts/pilot.ts   → table + "gate PASSED|FAILED"; exit 1 on failure
import path from 'node:path';
import { readItems, REPO } from '../src/items.ts';
import { readThreshold } from '../src/decontam.ts';
import { checkerProvenance, pilotFunnel, pilotGate } from '../src/pilot.ts';

const items = readItems(path.join(REPO, 'train', 'work.jsonl'));
const funnel = pilotFunnel(items, readThreshold(path.join(REPO, 'train', 'threshold.json')).threshold);
console.log(['tier'.padEnd(13), ...['drafted', 'passed val', 'x-checked', 'kept', 'yield', 'fix:teach', 'fix:check'].map((h) => h.padStart(10)), '  reasons'].join(''));
for (const r of funnel) {
  console.log([r.tier.padEnd(13), ...[r.drafted, r.valid, r.crosschecked, r.kept].map((n) => String(n).padStart(10)),
    `${(r.yield * 100).toFixed(1)}%`.padStart(10), String(r.repaired).padStart(10), String(r.checkerRepaired).padStart(10), '  ' + Object.entries(r.reasons).map(([k, v]) => `${k} ${v}`).join(', ')].join(''));
}
const g = pilotGate(funnel);
const failures = [...g.failures, ...checkerProvenance(items)];
console.log(`gate ${failures.length ? `FAILED — ${failures.join('; ')}` : 'PASSED'}`);
process.exit(failures.length ? 1 : 0);
