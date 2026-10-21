import { createHash } from 'node:crypto';
import type { Result } from './a4h.ts';
import { TIERS, type Tier, type WorkItem } from './items.ts';
import { judge, staticCheck } from './validate.ts';

export type Decision = {
  id: string;
  action: 'keep' | 'drop' | 'use_reference' | 'use_crosscheck' | 'rewrite';
  question?: string;
  tier?: Tier;
  ordered?: boolean;
};

const adjudicated = (i: WorkItem) =>
  Object.assign(i, { status: 'accepted', pipeline: 'adjudicated', checked_question: i.question, reason: undefined });

function useCrosscheck(i: WorkItem, d: Decision, fail: (m: string) => never): void {
  const sql = i.crosscheck_sql ?? null;
  if (sql === null) {
    if (i.reference_sql === null) fail('cross and reference are both UNANSWERABLE; use use_reference');
    if (d.tier !== 'unanswerable') fail(`reclassifying to UNANSWERABLE needs tier: "unanswerable"`);
    Object.assign(i, { tier: 'unanswerable', reference_sql: null, expected: null, ordered: false });
  } else {
    const out = i.crosscheck_result;
    if (!out) fail('cross SQL was never executed');
    const v = judge(sql, out);
    if (!v.ok || !out.ok) fail(`cross result failed judge: ${v.ok ? 'error' : v.reason}`);
    if (i.reference_sql === null) {
      if (!d.tier || d.tier === 'unanswerable') fail('reclassifying to answerable needs tier: easy|medium|hard');
      if (typeof d.ordered !== 'boolean') fail('reclassifying to answerable needs ordered: true|false');
    }
    Object.assign(i, { reference_sql: sql, expected: out.result as Result });
    if (d.tier) i.tier = d.tier;
    if (typeof d.ordered === 'boolean') i.ordered = d.ordered;
  }
  const problem = staticCheck(i);
  if (problem) fail(`result fails static check: ${problem}`);
  adjudicated(i);
}

// Pure: validates every decision against a copy and throws before anything is returned.
export function applyDecisions(items: WorkItem[], decisions: Decision[]): WorkItem[] {
  const out = structuredClone(items);
  decisions.forEach((d, n) => {
    const fail = (m: string): never => { throw new Error(`line ${n + 1} (${d.id} ${d.action}): ${m}`); };
    const i = out.find((x) => x.id === d.id) ?? fail(`unknown id ${d.id}`);
    if (d.tier !== undefined && !TIERS.includes(d.tier)) fail(`invalid tier ${String(d.tier)}`);
    if (d.ordered !== undefined && typeof d.ordered !== 'boolean') fail('ordered must be true or false');
    const need = (...s: WorkItem['status'][]) => { if (!s.includes(i.status)) fail(`not allowed on status ${i.status}`); };
    switch (d.action) {
      case 'keep': need('agreed'); i.status = 'accepted'; break;
      case 'drop': need('drafted', 'rejected', 'validated', 'agreed', 'disputed', 'accepted'); i.status = 'dropped'; break;
      case 'use_reference': need('disputed'); adjudicated(i); break;
      case 'use_crosscheck': need('disputed'); useCrosscheck(i, d, fail); break;
      case 'rewrite':
        need('agreed', 'disputed', 'accepted');
        if (!d.question?.trim()) fail('rewrite needs a question');
        Object.assign(i, {
          question: d.question!.trim(), source: 'codex+kamil', status: 'drafted', expected: null, reason: undefined,
          crosscheck_sql: undefined, crosscheck_result: undefined, checked_question: undefined, pipeline: undefined,
        });
        if (d.tier) i.tier = d.tier;
        if (typeof d.ordered === 'boolean') i.ordered = d.ordered;
        break;
      default: fail('unknown action');
    }
  });
  return out;
}

const table = (r: Result, max = 10) => {
  const head = `| ${r.columns.map((c) => c.name).join(' | ')} |\n|${r.columns.map(() => '---').join('|')}|\n`;
  const rows = r.rows.slice(0, max).map((row) => `| ${row.map((c) => c.trim().replace(/\|/g, '\\|')).join(' | ')} |`).join('\n');
  return head + rows + (r.rows.length > max ? `\n\n…${r.rows.length - max} more rows` : '');
};

export function renderSheet(items: WorkItem[]): string {
  const todo = items.filter((i) => i.status === 'agreed' || i.status === 'disputed');
  let md = `# Review sheet (${todo.length} items)\n\nWrite one JSON line per decision to \`review/decisions.jsonl\`, then \`npm run apply-review\` (the \`//\` notes below are explanations — leave them out):\n\n` +
    '```\n{"id":"q0001","action":"keep"}                      // agreed only\n{"id":"q0002","action":"drop"}\n' +
    '{"id":"q0003","action":"use_reference"}             // disputed only\n{"id":"q0004","action":"use_crosscheck"}            // disputed; add "tier" (+ "ordered") if answerability changes\n' +
    '{"id":"q0005","action":"rewrite","question":"…"}    // re-runs validate + cross-check; optional "tier", "ordered"\n```\n\n';
  for (const i of todo) {
    md += `---\n\n## ${i.id} · ${i.tier} · ${i.status.toUpperCase()}${i.ordered ? ' · ordered' : ''}\n\n**${i.question}**\n\n`;
    if (i.flags.length) md += `Flags: ${i.flags.join(', ')}\n\n`;
    if (i.reason) md += `Reason: ${i.reason}\n\n`;
    md += `Reference SQL:\n\n\`\`\`sql\n${i.reference_sql ?? 'UNANSWERABLE'}\n\`\`\`\n\n`;
    if (i.expected) md += `${table(i.expected)}\n\n`;
    if (i.status === 'disputed') {
      md += `Cross-check SQL:\n\n\`\`\`sql\n${i.crosscheck_sql ?? 'UNANSWERABLE'}\n\`\`\`\n\n`;
      const o = i.crosscheck_result;
      if (o) md += o.ok ? `${table(o.result)}\n\n` : `Error: ${o.error}\n\n`;
    }
  }
  return md;
}

// Short review: every disputed item, every flagged agreed item, and a seeded random sample of the other agreed ones.
export function shortlist(items: WorkItem[], sample: number, seed: string): WorkItem[] {
  const disputed = items.filter((i) => i.status === 'disputed');
  const agreed = items.filter((i) => i.status === 'agreed');
  const flagged = agreed.filter((i) => i.flags.length);
  const rank = (i: WorkItem) => createHash('sha256').update(seed + i.id).digest('hex');
  const rest = agreed.filter((i) => !i.flags.length).sort((a, b) => (rank(a) < rank(b) ? -1 : 1)).slice(0, sample);
  return [...disputed, ...flagged, ...rest];
}
