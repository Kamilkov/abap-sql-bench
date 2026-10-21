// Generates schema.md from the A4H data dictionary for the allowed /DMO/ tables.
import fs from 'node:fs';
import path from 'node:path';
import { connect } from '../src/a4h.ts';
import { REPO, TABLES } from '../src/items.ts';

const DIALECT = `## Dialect notes

- This is **ABAP SQL**, not ANSI SQL.
- Address a column of a table alias as \`alias~column\` (not \`alias.column\`).
- Sort with \`ORDER BY col ASCENDING\` / \`DESCENDING\`.
- Top-N: end the query with \`UP TO n ROWS\` (optionally \`OFFSET m\`). No \`LIMIT\`, no \`TOP\`.
- Not supported: \`WITH\` (CTEs), \`UNION\`, \`INTO\`. Exactly one \`SELECT\` statement.
- Every expression in the SELECT list (aggregates, CASE, arithmetic) needs an alias: \`COUNT(*) AS n\`.
- Supported: joins, subqueries, \`CASE\`, aggregates, \`GROUP BY\`, \`HAVING\`.
- Date literals are \`'YYYYMMDD'\` strings (e.g. \`'20260620'\`).
- Missing values from an outer join come back as blank / zero / \`00000000\`, never as NULL.
`;

const a4h = await connect();
let md = '# Schema: SAP flight reference model (/DMO/)\n\nAirline travel data: carriers, flight connections, scheduled flights, travel agencies, customers, travels (trips), bookings and booking supplements (meals, luggage…). Key columns are marked 🔑.\n\n';
for (const t of TABLES) {
  const head = await a4h.run(`SELECT ddtext FROM dd02t WHERE tabname = '${t}' AND ddlanguage = 'E' AND as4local = 'A'`);
  const cols = await a4h.run(
    `SELECT l~fieldname, l~keyflag, l~datatype, l~leng, l~decimals, t~ddtext FROM dd03l AS l ` +
    `LEFT OUTER JOIN dd04t AS t ON t~rollname = l~rollname AND t~ddlanguage = 'E' AND t~as4local = 'A' ` +
    `WHERE l~tabname = '${t}' AND l~as4local = 'A' ORDER BY l~position`);
  if (!cols.ok || !head.ok) throw new Error(`${t}: ${cols.ok ? '' : cols.error} ${head.ok ? '' : head.error}`);
  md += `## ${t}\n\n${(head.result.rows[0]?.[0] ?? '').trim().replace(/^Flight Reference Scenario: /, '')}\n\n| column | type | meaning |\n|---|---|---|\n`;
  for (const [f, key, dt, len, dec, text] of cols.result.rows) {
    const name = f.trim();
    if (name.startsWith('.') || name === 'CLIENT' || name === 'MANDT') continue;
    const size = Number(dec) ? `${Number(len)},${Number(dec)}` : `${Number(len)}`;
    md += `| ${key.trim() === 'X' ? '🔑 ' : ''}${name} | ${dt.trim()}(${size}) | ${text.trim().replace(/^Flight Reference Scenario: /, '')} |\n`;
  }
  md += '\n';
}
fs.writeFileSync(path.join(REPO, 'schema.md'), md + DIALECT);
console.log(`schema.md: ${TABLES.length} tables`);
