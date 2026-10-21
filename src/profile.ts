// Prompt material shared by the Codex test drafter and the training teacher: tier definitions and a live
// data profile (months with data, carriers, airports, statuses) so drafted questions hit populated values.
import { connect } from './a4h.ts';
import type { Tier } from './items.ts';

export const TIER_DEF: Record<Tier, string> = {
  easy: 'a single table, filters, sorting, simple counts.',
  medium: 'joins of 2–3 tables and/or GROUP BY aggregates.',
  hard: 'subqueries, HAVING, CASE, date arithmetic, currency handling, or top-N per group.',
  unanswerable: 'asks for data the database does not have, phrased as naturally as an answerable question.',
};

export async function profile(): Promise<string> {
  const a4h = await connect();
  const q = async (label: string, sql: string) => {
    const o = await a4h.run(sql);
    if (!o.ok) throw new Error(`profile ${label}: ${o.error}`);
    return `- ${label}: ${o.result.rows.map((r) => r.map((c) => c.trim()).join(' ')).join('; ')}`;
  };
  return [
    await q('Flights per month (YYYYMM count; months not listed have none)',
      'SELECT substring( flight_date, 1, 6 ) AS month, COUNT(*) AS flights FROM /dmo/flight GROUP BY substring( flight_date, 1, 6 ) ORDER BY month'),
    await q('Trips per begin month (YYYYMM count; months not listed have none)',
      'SELECT substring( begin_date, 1, 6 ) AS month, COUNT(*) AS travels FROM /dmo/travel GROUP BY substring( begin_date, 1, 6 ) ORDER BY month'),
    await q('Trips per status code', 'SELECT status, COUNT(*) AS travels FROM /dmo/travel GROUP BY status ORDER BY status'),
    await q('Carriers (id name currency)', 'SELECT carrier_id, name, currency_code FROM /dmo/carrier ORDER BY carrier_id'),
    await q('Airports (id city country)', 'SELECT airport_id, city, country FROM /dmo/airport ORDER BY airport_id'),
    await q('Travel statuses', 'SELECT travel_status, text FROM /dmo/trvl_stat_t WHERE language = \'E\''),
    await q('Customer countries (count)', 'SELECT country_code, COUNT(*) AS customers FROM /dmo/customer GROUP BY country_code ORDER BY country_code'),
  ].join('\n');
}
