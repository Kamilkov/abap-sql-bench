import { test } from 'node:test';
import assert from 'node:assert/strict';
import { FIXER_HASH, fixSyntax } from '../src/fix.ts';

test('inserts AS before a table alias', () => {
  assert.equal(fixSyntax('SELECT A~NAME FROM /DMO/AIRPORT A WHERE A~CITY = \'x\''),
    'SELECT A~NAME FROM /DMO/AIRPORT AS A WHERE A~CITY = \'x\'');
});
test('inserts AS for joined tables too, any case', () => {
  assert.equal(fixSyntax('select s~a from /dmo/supplement s left join /DMO/SUPPL_TEXT ps on s~a = ps~a'),
    'select s~a from /dmo/supplement AS s left join /DMO/SUPPL_TEXT AS ps on s~a = ps~a');
});
test('leaves existing AS and keyword-followed tables alone', () => {
  const sql = 'SELECT a FROM /DMO/FLIGHT AS f INNER JOIN /DMO/CARRIER AS c ON c~x = f~x WHERE 1 = 1';
  assert.equal(fixSyntax(sql), sql);
  for (const kw of ['WHERE', 'GROUP BY a', 'ORDER BY a', 'INNER JOIN x', 'LEFT OUTER JOIN x', 'UP TO 5 ROWS', 'HAVING x', 'ON x']) {
    assert.equal(fixSyntax(`SELECT a FROM /DMO/FLIGHT ${kw}`), `SELECT a FROM /DMO/FLIGHT ${kw}`);
  }
});
test('turns alias.column into alias~column', () => {
  assert.equal(fixSyntax('SELECT C.NAME, c.carrier_id FROM /DMO/CARRIER AS C'), 'SELECT C~NAME, c~carrier_id FROM /DMO/CARRIER AS C');
});
test('never touches string literals or decimals', () => {
  assert.equal(fixSyntax("SELECT a FROM /DMO/AIRPORT A WHERE a~x = 'St. Louis' AND a~y = 'b.c FROM x y' AND a~z > 1.5"),
    "SELECT a FROM /DMO/AIRPORT AS A WHERE a~x = 'St. Louis' AND a~y = 'b.c FROM x y' AND a~z > 1.5");
  assert.equal(fixSyntax("SELECT a FROM /DMO/AIRPORT WHERE city = 'LONDON'"), "SELECT a FROM /DMO/AIRPORT WHERE city = 'LONDON'");
});
test('is idempotent', () => {
  const once = fixSyntax('SELECT A.NAME FROM /DMO/AIRPORT A JOIN /DMO/CITY B ON A.X = B.X');
  assert.equal(fixSyntax(once), once);
});

test('puts blanks inside aggregate brackets', () => {
  assert.equal(fixSyntax('SELECT SUM(f~price) AS s, count(DISTINCT b~id) AS n, MAX(x), MIN(y), AVG(z) FROM /DMO/FLIGHT AS f'),
    'SELECT SUM( f~price ) AS s, count( DISTINCT b~id ) AS n, MAX( x ), MIN( y ), AVG( z ) FROM /DMO/FLIGHT AS f');
});
test('aggregate rule finds the matching bracket and leaves inner brackets alone', () => {
  assert.equal(fixSyntax('SELECT SUM(a * (b + c)) AS s FROM /DMO/FLIGHT'), 'SELECT SUM( a * (b + c) ) AS s FROM /DMO/FLIGHT');
});
test('aggregate rule keeps COUNT(*) valid and spaced brackets unchanged', () => {
  assert.equal(fixSyntax('SELECT COUNT(*) AS n FROM /DMO/FLIGHT'), 'SELECT COUNT( * ) AS n FROM /DMO/FLIGHT');
  const spaced = 'SELECT SUM( x ) AS s FROM /DMO/FLIGHT';
  assert.equal(fixSyntax(spaced), spaced);
});
test('aggregate rule never touches literals', () => {
  assert.equal(fixSyntax("SELECT COUNT(x) AS n FROM /DMO/FLIGHT WHERE a = 'SUM(b)' AND c = 'MAX('"),
    "SELECT COUNT( x ) AS n FROM /DMO/FLIGHT WHERE a = 'SUM(b)' AND c = 'MAX('");
});
test('aggregate rule leaves other functions and words ending in an aggregate name alone', () => {
  assert.equal(fixSyntax('SELECT ROUND(x, 2) AS r, CHECKSUM(y) AS c FROM /DMO/FLIGHT'), 'SELECT ROUND(x, 2) AS r, CHECKSUM(y) AS c FROM /DMO/FLIGHT');
});

test('the three-rule fixer is frozen (spec addendum 2026-10-21f): any change to src/fix.ts must be deliberate', () => {
  assert.equal(FIXER_HASH, '08abbbcf9725abc474adcbfe262b160aeb62de6ea7004dc96a33e1c80586434d');
});
