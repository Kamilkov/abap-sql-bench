import { loadCreds } from './creds.ts';

export type Column = { name: string; type: string };
export type Result = { columns: Column[]; rows: string[][]; totalRows: number };
export type Outcome = { ok: true; result: Result } | { ok: false; error: string };
export type A4H = { run(sql: string, maxRows?: number): Promise<Outcome> };

const decode = (s: string) =>
  s.replace(/&(lt|gt|quot|apos|amp);/g, (_, e: string) => ({ lt: '<', gt: '>', quot: '"', apos: "'", amp: '&' })[e]!);

export function parseResponse(status: number, body: string): Outcome {
  if (status === 400) {
    const msg = body.match(/<message[^>]*>([^<]*)<\/message>/)?.[1];
    return { ok: false, error: msg ? decode(msg) : 'HTTP 400' };
  }
  // Anything else is infrastructure (auth, gateway, dump), not a verdict on the SQL.
  if (status !== 200) throw new Error(`A4H HTTP ${status}: ${body.slice(0, 200)}`);
  const columns: Column[] = [];
  const cells: string[][] = [];
  for (const [, block] of body.matchAll(/<dataPreview:columns>([\s\S]*?)<\/dataPreview:columns>/g)) {
    const name = block.match(/dataPreview:name="([^"]*)"/)?.[1] ?? '';
    const type = block.match(/dataPreview:type="([^"]*)"/)?.[1] ?? '';
    columns.push({ name: decode(name), type });
    cells.push([...block.matchAll(/<dataPreview:data(?:\/>|>([^<]*)<\/dataPreview:data>)/g)].map((m) => decode(m[1] ?? '')));
  }
  const rows = (cells[0] ?? []).map((_, i) => cells.map((col) => col[i]));
  const totalRows = Number(body.match(/<dataPreview:totalRows>(\d+)/)?.[1] ?? rows.length);
  return { ok: true, result: { columns, rows, totalRows } };
}

// The endpoint appends its own UP TO n ROWS and rejects one in the query, so we lift it out.
export function splitTopN(sql: string): { sql: string; limit?: number; offset: number } {
  let s = sql.trim().replace(/[.;]\s*$/, '').trimEnd();
  const m = s.match(/\s+UP\s+TO\s+(\d+)\s+ROWS(?:\s+OFFSET\s+(\d+))?$/i);
  if (!m) return { sql: s, offset: 0 };
  s = s.slice(0, m.index).trimEnd();
  return { sql: s, limit: Number(m[1]), offset: Number(m[2] ?? 0) };
}

// The endpoint embeds the SQL in ABAP source: lines are cut at 255 chars and a `*` in column 1 is a comment.
// So whitespace outside literals is flattened, long SQL is wrapped at spaces outside '…'/`…` literals, and
// every continuation line starts with a space.
export function stripComments(sql: string): string {
  return sql.split(/\r?\n/).filter((l) => !l.startsWith('*')).map((line) => {
    let quote = '';
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (quote) { if (ch === quote) quote = ''; }
      else if (ch === "'" || ch === '`') quote = ch;
      else if (ch === '"') return line.slice(0, i);
    }
    return line;
  }).join('\n');
}

export function wrapSql(sql: string, max = 255): string {
  sql = stripComments(sql);
  let flat = '';
  let quote = '';
  for (const ch of sql) {
    if (quote) { if (ch === quote) quote = ''; flat += ch; }
    else if (ch === "'" || ch === '`') { quote = ch; flat += ch; }
    else flat += /\s/.test(ch) ? ' ' : ch;
  }
  const lines: string[] = [];
  let start = 0, lastBreak = -1;
  quote = '';
  for (let i = 0; i < flat.length; i++) {
    const ch = flat[i];
    if (quote) { if (ch === quote) quote = ''; }
    else if (ch === "'" || ch === '`') quote = ch;
    else if (ch === ' ') lastBreak = i;
    const limit = lines.length ? max - 1 : max;
    if (i - start >= limit && lastBreak > start) {
      lines.push(flat.slice(start, lastBreak));
      start = lastBreak + 1;
    }
  }
  lines.push(flat.slice(start));
  return lines.join('\n ');
}

export async function connect(opts: { baseUrl?: string; client?: string } = {}): Promise<A4H> {
  const base = opts.baseUrl ?? 'http://localhost:50000';
  const client = opts.client ?? '001';
  const { user, password } = loadCreds();
  const auth = 'Basic ' + Buffer.from(`${user}:${password}`).toString('base64');
  let csrf = '';
  let cookie = '';

  async function login() {
    const r = await fetch(`${base}/sap/bc/adt/discovery?sap-client=${client}`, {
      headers: { authorization: auth, 'x-csrf-token': 'fetch' },
    });
    await r.text();
    if (!r.ok) throw new Error(`A4H login failed: HTTP ${r.status}`);
    csrf = r.headers.get('x-csrf-token') ?? '';
    cookie = r.headers.getSetCookie().map((c) => c.split(';')[0]).join('; ');
  }

  async function post(sql: string, rowNumber: number) {
    return fetch(`${base}/sap/bc/adt/datapreview/freestyle?rowNumber=${rowNumber}&sap-client=${client}`, {
      method: 'POST',
      headers: {
        authorization: auth, cookie, 'x-csrf-token': csrf, 'content-type': 'text/plain',
        accept: 'application/xml, application/vnd.sap.adt.datapreview.table.v1+xml',
      },
      body: wrapSql(sql),
    });
  }

  await login();
  return {
    async run(sql, maxRows = 1001) {
      const top = splitTopN(sql);
      const rowNumber = top.limit === undefined ? maxRows : top.limit + top.offset;
      let r = await post(top.sql, rowNumber);
      if (r.status === 403) {
        await r.text();
        await login();
        r = await post(top.sql, rowNumber);
      }
      const out = parseResponse(r.status, await r.text());
      if (out.ok && top.offset) out.result.rows = out.result.rows.slice(top.offset);
      return out;
    },
  };
}
