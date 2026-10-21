import type { Result } from './a4h.ts';

type Mode = 'float' | 'dec' | 'date' | 'time' | 'char' | 'raw';

const kind = (t: string) => ('I8PNbsF'.includes(t) && t.length === 1 ? 'num' : t === 'D' ? 'date' : t === 'T' ? 'time' : 'char');

function modeOf(a: string, b: string): Mode {
  const ka = kind(a), kb = kind(b);
  if (ka === 'num' && kb === 'num') return a === 'F' || b === 'F' ? 'float' : 'dec';
  if (ka !== kb) return 'raw';
  return ka === 'num' ? 'dec' : ka;
}

function decimal(v: string): string {
  let s = v.trim();
  if (s.endsWith('-')) s = '-' + s.slice(0, -1); // ABAP renders negatives as "42.40-"
  const m = s.match(/^([+-]?)(\d*)(?:\.(\d*))?$/);
  if (!m) return s;
  const int = m[2].replace(/^0+/, '') || '0';
  const frac = (m[3] ?? '').replace(/0+$/, '');
  const out = frac ? `${int}.${frac}` : int;
  return m[1] === '-' && out !== '0' ? `-${out}` : out;
}

function canon(v: string, mode: Mode): string {
  switch (mode) {
    case 'dec': return decimal(v);
    case 'date': { const s = v.trim(); return s === '00000000' ? '' : s.replace(/^(\d{4})(\d{2})(\d{2})$/, '$1-$2-$3'); }
    case 'time': return v.trim().replace(/^(\d{2})(\d{2})(\d{2})$/, '$1:$2:$3');
    case 'char': return v.trimEnd();
    default: return v.trim();
  }
}

const num = (v: string) => Number(decimal(v)); // decimal() also fixes ABAP's trailing minus ("42.40-")

function floatEq(x: string, y: string): boolean {
  const a = num(x), b = num(y);
  if (!Number.isFinite(a) || !Number.isFinite(b)) return false; // invalid numbers never match
  return a === b || Math.abs(a - b) <= 1e-9 * Math.max(Math.abs(a), Math.abs(b));
}

const eq = (x: string, y: string, mode: Mode) => (mode === 'float' ? floatEq(x, y) : canon(x, mode) === canon(y, mode));

function columnsCompatible(xs: string[], ys: string[], mode: Mode): boolean {
  if (mode === 'float') {
    const a = xs.map(num).sort((p, q) => p - q);
    const b = ys.map(num).sort((p, q) => p - q);
    if (![...a, ...b].every(Number.isFinite)) return false;
    return a.every((v, i) => floatEq(String(v), String(b[i])));
  }
  const a = xs.map((v) => canon(v, mode)).sort();
  const b = ys.map((v) => canon(v, mode)).sort();
  return a.every((v, i) => v === b[i]);
}

function bipartite(n: number, edge: (r: number, c: number) => boolean): boolean {
  const owner = new Array<number>(n).fill(-1);
  const tryRow = (r: number, seen: boolean[]): boolean => {
    for (let c = 0; c < n; c++) {
      if (seen[c] || !edge(r, c)) continue;
      seen[c] = true;
      if (owner[c] === -1 || tryRow(owner[c], seen)) { owner[c] = r; return true; }
    }
    return false;
  };
  for (let r = 0; r < n; r++) if (!tryRow(r, new Array<boolean>(n).fill(false))) return false;
  return true;
}

function rowsMatch(a: string[][], b: string[][], modes: Mode[], ordered: boolean): boolean {
  if (ordered) return a.every((row, r) => row.every((v, i) => eq(v, b[r][i], modes[i])));
  const floats = modes.flatMap((m, i) => (m === 'float' ? [i] : []));
  const key = (row: string[]) => JSON.stringify(row.map((v, i) => (modes[i] === 'float' ? null : canon(v, modes[i]))));
  const group = (rows: string[][]) => {
    const g = new Map<string, string[][]>();
    for (const row of rows) g.set(key(row), [...(g.get(key(row)) ?? []), row]);
    return g;
  };
  const ga = group(a), gb = group(b);
  if (ga.size !== gb.size) return false;
  for (const [k, ra] of ga) {
    const rb = gb.get(k);
    if (!rb || rb.length !== ra.length) return false;
    if (floats.length === 0) continue;
    if (floats.length === 1) {
      const f = floats[0];
      const xs = ra.map((r) => r[f]), ys = rb.map((r) => r[f]);
      if (!columnsCompatible(xs, ys, 'float')) return false;
      continue;
    }
    if (!bipartite(ra.length, (r, c) => floats.every((f) => floatEq(ra[r][f], rb[c][f])))) return false;
  }
  return true;
}

// Grading core (spec "Grading rules"): injective column mapping, whole-row comparison, type-aware equality.
export function compareResults(ref: Result, cand: Result, ordered: boolean): { pass: boolean; reason: string } {
  if (ref.rows.length !== cand.rows.length) {
    return { pass: false, reason: `row count ${cand.rows.length} ≠ ${ref.rows.length}` };
  }
  const nr = ref.columns.length, nc = cand.columns.length;
  if (nc < nr) return { pass: false, reason: `only ${nc} columns, need ${nr}` };
  const col = (res: Result, j: number) => res.rows.map((r) => r[j]);
  const mode = (i: number, j: number) => modeOf(ref.columns[i].type, cand.columns[j].type);
  const ok = Array.from({ length: nr }, (_, i) =>
    Array.from({ length: nc }, (_, j) => columnsCompatible(col(ref, i), col(cand, j), mode(i, j))));

  const map: number[] = [];
  const used = new Array<boolean>(nc).fill(false);
  const search = (i: number): boolean => {
    if (i === nr) {
      const modes = map.map((j, k) => mode(k, j));
      const proj = cand.rows.map((r) => map.map((j) => r[j]));
      return rowsMatch(ref.rows, proj, modes, ordered);
    }
    for (let j = 0; j < nc; j++) {
      if (used[j] || !ok[i][j]) continue;
      used[j] = true; map[i] = j;
      if (search(i + 1)) return true;
      used[j] = false;
    }
    return false;
  };
  if (search(0)) return { pass: true, reason: 'match' };
  const unmatched = ref.columns.filter((_, i) => !ok[i].some(Boolean)).map((c) => c.name);
  return { pass: false, reason: unmatched.length ? `no matching column for ${unmatched.join(', ')}` : 'rows differ' };
}
