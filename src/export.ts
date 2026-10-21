import fs from 'node:fs';
import path from 'node:path';
import { sha256, type DatasetRegistry, type DatasetRole } from './datasets.ts';
import type { TestItem } from './eval.ts';
import { TIERS, type WorkItem } from './items.ts';
import { answerPrompt } from './prompt.ts';
import { groupSplit, sqlSkeleton } from './skeleton.ts';

export type Canonical = TestItem & { skeleton: string | null; group: string };
export type ChatRecord = { messages: [{ role: 'user'; content: string }, { role: 'assistant'; content: string }] };

// Kept training pairs → canonical items + chat records with exactly the evaluation prompt; grouped split.
export function buildExport(kept: WorkItem[], emb: Map<string, number[]>, seed = 'split-1') {
  const withSkel = kept.map((i) => ({ ...i, skeleton: i.reference_sql ? sqlSkeleton(i.reference_sql) : null }));
  const { val, groups } = groupSplit(withSkel, emb, 0.05, seed);
  const v = new Set(val);
  const canonical: Canonical[] = withSkel.map((i) => ({ id: i.id, tier: i.tier, question: i.question, reference_sql: i.reference_sql,
    ordered: i.ordered, expected: i.expected, skeleton: i.skeleton, group: groups.get(i.id)! }));
  const chat = (i: Canonical): ChatRecord => ({ messages: [
    { role: 'user', content: answerPrompt(i.question) },
    { role: 'assistant', content: i.reference_sql ?? 'UNANSWERABLE' },
  ] });
  return {
    canonical,
    valItems: canonical.filter((i) => v.has(i.id)),
    trainChat: canonical.filter((i) => !v.has(i.id)).map(chat),
    valChat: canonical.filter((i) => v.has(i.id)).map(chat),
  };
}

export function registerDataset(registryPath: string, name: string, file: string, role: DatasetRole): void {
  const reg = JSON.parse(fs.readFileSync(registryPath, 'utf8')) as DatasetRegistry;
  reg.datasets[name] = { path: file, sha256: sha256(fs.readFileSync(path.resolve(path.dirname(registryPath), file))), role };
  fs.writeFileSync(registryPath, JSON.stringify(reg, null, 2) + '\n');
}

// Guard: a tier's share in train may not drift more than 3 points from its share in all kept pairs.
export function tierMix(train: { tier: string }[], all: { tier: string }[], tolerance = 0.03): string {
  const share = (rows: { tier: string }[], t: string) => rows.filter((r) => r.tier === t).length / rows.length;
  const lines = TIERS.map((t) => `${t}: train ${(100 * share(train, t)).toFixed(1)}% / all ${(100 * share(all, t)).toFixed(1)}%`);
  const off = TIERS.filter((t) => Math.abs(share(train, t) - share(all, t)) > tolerance);
  if (off.length) throw new Error(`train tier mix drifted for ${off.join(', ')}: ${lines.join('; ')}`);
  return lines.join('\n');
}
