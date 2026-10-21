import { TIERS, type Status, type Tier } from './items.ts';

export type FunnelRow = { tier: Tier | 'total'; drafted: number; valid: number; crosschecked: number; kept: number; yield: number;
  repaired: number; checkerRepaired: number; reasons: Record<string, number> };
type PilotItem = { tier: Tier; status: Status; reason?: string; decontam?: number; repaired?: boolean; crosscheck_repaired?: boolean };

// Per-tier pilot funnel: drafted → execution-valid → cross-checked → kept after decontamination with the frozen
// threshold. Reasons separate incorrect SQL (rejected, disputed) from test overlap (decontam:<rule>) and unfinished work.
export function pilotFunnel(items: PilotItem[], threshold: number): FunnelRow[] {
  const isKept = (i: PilotItem) => i.status === 'agreed' && i.decontam === threshold;
  const reasonOf = (i: PilotItem): string | null =>
    isKept(i) ? null
      : i.status === 'agreed' ? 'not-decontaminated'
      : i.status === 'drafted' ? 'pending-validation'
      : i.status === 'validated' ? 'pending-crosscheck'
      : i.status === 'dropped' ? i.reason?.match(/^(decontam:[\w-]+|ordering:unresolved)/)?.[0] ?? 'dropped'
      : i.status;
  const row = (tier: FunnelRow['tier'], its: PilotItem[]): FunnelRow => {
    const reasons: Record<string, number> = {};
    for (const r of its.map(reasonOf)) if (r) reasons[r] = (reasons[r] ?? 0) + 1;
    const kept = its.filter(isKept).length;
    const decontamDropped = its.filter((i) => i.status === 'dropped' && i.reason?.startsWith('decontam:')).length;
    const crosschecked = its.filter((i) => i.status === 'agreed').length + decontamDropped;
    const valid = crosschecked + its.filter((i) => i.status === 'validated' || i.status === 'disputed').length;
    return { tier, drafted: its.length, valid, crosschecked, kept, yield: its.length ? kept / its.length : 0,
      repaired: its.filter((i) => i.repaired).length, checkerRepaired: its.filter((i) => i.crosscheck_repaired).length, reasons };
  };
  return [...TIERS.map((t) => row(t, items.filter((i) => i.tier === t))), row('total', items)];
}

// Practical pilot acceptance rules (not statistical guarantees): a finished pilot, overall yield ≥ 40%, hard yield ≥ 25%.
export function pilotGate(funnel: FunnelRow[]): { pass: boolean; failures: string[] } {
  const pct = (r: FunnelRow) => `${(r.yield * 100).toFixed(1)}%`;
  const total = funnel.find((r) => r.tier === 'total')!;
  const hard = funnel.find((r) => r.tier === 'hard')!;
  const pending = (total.reasons['pending-validation'] ?? 0) + (total.reasons['pending-crosscheck'] ?? 0);
  const unstamped = total.reasons['not-decontaminated'] ?? 0;
  const failures = [
    ...funnel.filter((r) => r.drafted === 0).map((r) => `${r.tier}: no drafts`),
    ...(pending ? [`${pending} pairs still pending validation or cross-check`] : []),
    ...(unstamped ? [`${unstamped} pairs not decontaminated with the frozen threshold`] : []),
    ...(total.yield < 0.4 ? [`overall yield ${pct(total)} < 40%`] : []),
    ...(hard.yield < 0.25 ? [`hard yield ${pct(hard)} < 25%`] : []),
  ];
  return { pass: failures.length === 0, failures };
}

// Every cross-checked pair must name the one checker configuration that judged it.
// Pairs dropped by decontamination were cross-checked first, so they count too.
export function checkerProvenance(items: { status: Status; reason?: string; crosscheck_by?: string }[]): string[] {
  const checked = items.filter((i) => i.status === 'agreed' || i.status === 'disputed'
    || (i.status === 'dropped' && (i.reason?.startsWith('decontam:') || i.reason?.startsWith('ordering:'))));
  const missing = checked.filter((i) => !i.crosscheck_by).length;
  const by = [...new Set(checked.map((i) => i.crosscheck_by).filter(Boolean))].sort();
  return [
    ...(missing ? [`${missing} cross-checked pairs without a recorded checker`] : []),
    ...(by.length > 1 ? [`${by.length} checkers: ${by.join(', ')}`] : []),
  ];
}
