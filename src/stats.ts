import fs from 'node:fs';
import { sqlSkeleton } from './skeleton.ts';

// Exact two-sided McNemar test (pre-registered, spec Part C): b = baseline pass & candidate fail, c = the reverse.
export function mcnemarExact(b: number, c: number): number {
  const n = b + c;
  if (n === 0) return 1;
  let logC = 0, tail = 0; // log C(n,0) = 0
  for (let k = 0; k <= Math.min(b, c); k++) {
    if (k > 0) logC += Math.log(n - k + 1) - Math.log(k);
    tail += Math.exp(logC - n * Math.LN2);
  }
  return Math.min(1, 2 * tail);
}

export function primaryVerdict(r: { candidateAcc: number; baselineAcc: number; p: number }): 'success' | 'not significant' | 'not higher' {
  if (r.candidateAcc <= r.baselineAcc) return 'not higher';
  return r.p < 0.05 ? 'success' : 'not significant';
}

export function seenSplit(test: { id: string; reference_sql: string | null }[], trainSkeletons: Set<string>):
  Map<string, 'seen' | 'unseen' | 'unanswerable'> {
  return new Map(test.map((t) => [t.id, t.reference_sql === null ? 'unanswerable' : trainSkeletons.has(sqlSkeleton(t.reference_sql)) ? 'seen' : 'unseen']));
}

export function terciles(values: Map<string, number>): Map<string, 1 | 2 | 3> {
  const sorted = [...values].sort((a, b) => a[1] - b[1]);
  return new Map(sorted.map(([id], k) => [id, (Math.floor((3 * k) / sorted.length) + 1) as 1 | 2 | 3]));
}

// Group-size discipline: cells under 20 items are reported but flagged; empty cells say so.
export function cell(pass: number, n: number): string {
  if (n === 0) return 'empty';
  const s = `${((100 * pass) / n).toFixed(1)}% (${pass}/${n})`;
  return n < 20 ? `${s} — too small` : s;
}

// Pre-registered primary comparison (spec Part C): the frozen candidate, no fixer, vs Qwen zero-shot + 3-rule fixer.
export const PRIMARY_BASELINE = 'qwen3-4b-instruct-2507-q8_0-fixed';
export function primaryPair(markerFile: string): { candidate: string; baseline: string } {
  if (!fs.existsSync(markerFile)) throw new Error(`${markerFile} missing — no frozen candidate`);
  return { candidate: (JSON.parse(fs.readFileSync(markerFile, 'utf8')) as { name: string }).name, baseline: PRIMARY_BASELINE };
}

// Only the frozen candidate scored on the registered test-v1 may yield the pre-registered verdict.
export function assertPrimaryCampaign(
  meta: { dataset: string; dataset_sha256: string; answers: Record<string, { identity: string | null }> },
  marker: { name: string; identity: string },
  registeredTestSha: string,
): void {
  if (meta.dataset !== 'test-v1') throw new Error(`primary result needs dataset test-v1, campaign used ${meta.dataset}`);
  if (meta.dataset_sha256 !== registeredTestSha) throw new Error('campaign dataset hash differs from the registered test-v1 hash');
  if (meta.answers[marker.name]?.identity !== marker.identity) {
    throw new Error(`candidate identity ${meta.answers[marker.name]?.identity} ≠ frozen ${marker.identity}`);
  }
}

// "Seen" means trained on: skeletons of training pairs outside the validation split.
export function trainedSkeletons(items: { id: string; skeleton: string | null }[], valIds: Set<string>): Set<string> {
  return new Set(items.filter((i) => !valIds.has(i.id) && i.skeleton !== null).map((i) => i.skeleton!));
}
