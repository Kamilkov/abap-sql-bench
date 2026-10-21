import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseResponse, splitTopN, wrapSql } from '../src/a4h.ts';

const fx = (f: string) => fs.readFileSync(new URL(`./fixtures/${f}`, import.meta.url), 'utf8');

test('parses columns, types, rows, totalRows', () => {
  const o = parseResponse(200, fx('ok.xml'));
  assert.ok(o.ok);
  assert.deepEqual(o.result.columns, [{ name: 'CARRIER_ID', type: 'C' }, { name: 'NAME', type: 'C' }]);
  assert.equal(o.result.rows.length, 3);
  assert.equal(o.result.rows[0].length, 2);
  assert.equal(o.result.totalRows, 21);
});

test('parses error message', () => {
  assert.deepEqual(parseResponse(400, fx('error.xml')), { ok: false, error: 'Unknown column name "NOPE".' });
});

test('decodes entities and empty cells', () => {
  const xml = '<dataPreview:tableData><dataPreview:totalRows>2</dataPreview:totalRows>' +
    '<dataPreview:columns><dataPreview:metadata dataPreview:name="A" dataPreview:type="C" dataPreview:description="A"/>' +
    '<dataPreview:dataSet><dataPreview:data>A&amp;B</dataPreview:data><dataPreview:data/></dataPreview:dataSet></dataPreview:columns></dataPreview:tableData>';
  const o = parseResponse(200, xml);
  assert.ok(o.ok);
  assert.deepEqual(o.result.rows, [['A&B'], ['']]);
});

test('splitTopN: plain UP TO', () => {
  assert.deepEqual(splitTopN('SELECT a FROM t ORDER BY a UP TO 5 ROWS'), { sql: 'SELECT a FROM t ORDER BY a', limit: 5, offset: 0 });
});
test('splitTopN: OFFSET and trailing period', () => {
  assert.deepEqual(splitTopN('SELECT a FROM t ORDER BY a UP TO 5 ROWS OFFSET 10.'), { sql: 'SELECT a FROM t ORDER BY a', limit: 5, offset: 10 });
});
test('splitTopN: trailing semicolon, no limit', () => {
  assert.deepEqual(splitTopN('SELECT a FROM t;'), { sql: 'SELECT a FROM t', offset: 0 });
});
test('splitTopN: case-insensitive', () => {
  assert.deepEqual(splitTopN('select a from t order by a up to 3 rows'), { sql: 'select a from t order by a', limit: 3, offset: 0 });
});

test('wrapSql keeps lines ≤255 chars and never breaks inside a string literal', () => {
  const lit = `'${'New York '.repeat(10).trim()}'`;
  const sql = `SELECT a FROM t WHERE ${Array.from({ length: 30 }, (_, i) => `col${i} = ${lit}`).join(' OR ')}`;
  const wrapped = wrapSql(sql);
  const lines = wrapped.split('\n');
  assert.ok(lines.length > 1);
  assert.ok(lines.every((l) => l.length <= 255));
  assert.equal(wrapped.replace(/\n /g, ' '), sql);
  assert.ok(lines.every((l) => (l.match(/'/g) ?? []).length % 2 === 0));
});
test('wrapSql leaves short SQL unchanged', () => {
  assert.equal(wrapSql('SELECT a FROM t'), 'SELECT a FROM t');
});

test('wrapSql never starts a line with * (ABAP column-1 comment)', () => {
  const sql = 'SELECT ' + 'a'.repeat(247) + ' * 2 AS d, COUNT( * ) AS n FROM t';
  const lines = wrapSql(sql).split('\n');
  assert.ok(lines.length > 1);
  assert.ok(lines.every((l) => !l.startsWith('*') && l.length <= 255));
});
test('wrapSql turns existing newlines into safe continuation lines', () => {
  const lines = wrapSql('SELECT carrier_id,\n* comment-looking\nFROM t').split('\n');
  assert.ok(lines.every((l) => !l.startsWith('*')));
});
test('wrapSql treats backquote literals as literals', () => {
  const lit = '`' + 'x '.repeat(200) + '`';
  const sql = `SELECT a FROM t WHERE b = ${lit} AND c = ${lit}`;
  const lines = wrapSql(sql).split('\n');
  assert.ok(lines.every((l) => (l.match(/`/g) ?? []).length % 2 === 0));
});
test('parseResponse throws on infrastructure errors instead of reporting a SQL error', () => {
  assert.throws(() => parseResponse(500, '<html>Internal error</html>'), /HTTP 500/);
  assert.throws(() => parseResponse(401, ''), /HTTP 401/);
});
test('wrapSql drops ABAP comments outside literals before flattening', () => {
  const sql = `* full-line comment\nSELECT carrier_id, " end-of-line comment\n name FROM /dmo/carrier WHERE name <> 'a " b' "trailing`;
  const flat = wrapSql(sql);
  assert.ok(!flat.includes('comment'));
  assert.ok(flat.includes(`'a " b'`));
  assert.ok(flat.startsWith('SELECT carrier_id,'));
  assert.ok(flat.includes('name FROM /dmo/carrier'));
});
