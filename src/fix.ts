import { createHash } from 'node:crypto';
import fs from 'node:fs';
// Deterministic syntax fixer for small-model output (a benchmark arm, not part of grading): adds the AS that
// ABAP SQL requires before table aliases, turns alias.column into alias~column and puts the blanks ABAP SQL requires
// inside aggregate brackets (SUM(x) → SUM( x )). String literals are untouched.
// Frozen (spec addendum 2026-10-21f): the training pipeline records this file's hash with every repaired label.
export const FIXER_HASH = createHash('sha256').update(fs.readFileSync(import.meta.filename)).digest('hex');

const NOT_ALIAS = 'AS|ON|WHERE|GROUP|ORDER|INNER|LEFT|RIGHT|CROSS|FULL|OUTER|JOIN|HAVING|UP|UNION';
const ALIAS = new RegExp(`\\b(FROM|JOIN)(\\s+)([\\w/]+)(\\s+)(?!(?:${NOT_ALIAS})\\b)([A-Za-z_]\\w*)\\b`, 'gi');

export function fixSyntax(sql: string): string {
  return spaceAggregates(sql.split(/('[^']*'|`[^`]*`)/).map((part, i) => (i % 2 ? part : part
    .replace(ALIAS, '$1$2$3$4AS $5')
    .replace(/\b([A-Za-z_]\w*)\.([A-Za-z_]\w*)/g, '$1~$2'))).join(''));
}

// Bracket-matching scan (not a regex) so nested brackets and literals containing "(" or ")" stay intact.
function spaceAggregates(sql: string): string {
  let out = '', quote = '', depth = 0;
  const open: number[] = []; // depths of aggregate brackets still open
  for (let i = 0; i < sql.length; i++) {
    const ch = sql[i];
    if (quote) { out += ch; if (ch === quote) quote = ''; continue; }
    if (ch === "'" || ch === '`') { quote = ch; out += ch; continue; }
    if (ch === '(') {
      depth++;
      if (/\b(COUNT|SUM|MIN|MAX|AVG)\s*$/i.test(out)) {
        open.push(depth);
        out += /\s/.test(sql[i + 1] ?? ' ') ? '(' : '( ';
        continue;
      }
    } else if (ch === ')') {
      if (open.at(-1) === depth) { open.pop(); if (!/\s$/.test(out)) out += ' '; }
      depth--;
    }
    out += ch;
  }
  return out;
}
