import { test } from 'node:test';
import assert from 'node:assert/strict';
import { connect } from '../src/a4h.ts';

test('runs a query and reports SQL errors', { skip: process.env.A4H_LIVE !== '1' }, async () => {
  const a4h = await connect();
  const base = 'SELECT carrier_id, name FROM /dmo/carrier ORDER BY carrier_id';
  const all = await a4h.run(base);
  assert.ok(all.ok);
  assert.equal((await a4h.run('SELECT nope FROM /dmo/flight')).ok, false);
  const page = await a4h.run(`${base} UP TO 2 ROWS OFFSET 1`);
  assert.ok(page.ok);
  assert.deepEqual(page.result.rows, all.result.rows.slice(1, 3));
});

test('long single-line SQL (>255 chars) runs', { skip: process.env.A4H_LIVE !== '1' }, async () => {
  const a4h = await connect();
  const sql = `SELECT l~fieldname, l~keyflag, l~datatype, l~leng, l~decimals, t~ddtext FROM dd03l AS l LEFT OUTER JOIN dd04t AS t ON t~rollname = l~rollname AND t~ddlanguage = 'E' AND t~as4local = 'A' WHERE l~tabname = '/DMO/AGENCY' AND l~as4local = 'A' ORDER BY l~position`;
  const out = await a4h.run(sql);
  assert.ok(out.ok, out.ok ? '' : out.error);
});
