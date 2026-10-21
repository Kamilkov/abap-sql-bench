// Ordering stage (spec addendum 2026-10-21h), after the cross-check, identical for pilot and full run:
// two fresh question-only judgments (teacher and checker models) decide each answerable cross-checked pair's
// `ordered`; disagreement or "ambiguous" excludes the pair; comparisons are recomputed locally.
//   node scripts/ordering.ts --items train/work.jsonl
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { itemsFileArg, readItems, writeItems, REPO } from '../src/items.ts';
import { applyOrdering, buildOrderPrompt, checkJudgments, type Judgment } from '../src/ordering.ts';
import { runQueue } from '../src/queue.ts';
import { askTeacher, CHECKER, settingsHash, TEACHER, type Endpoint } from '../src/teacher.ts';

if (!process.argv.includes('--items')) throw new Error('ordering.ts needs an explicit --items <file>');
const file = itemsFileArg();
const items = readItems(file);
const schema = JSON.parse(fs.readFileSync(path.join(REPO, 'prompts/order.schema.json'), 'utf8'));
const promptHash = createHash('sha256').update(buildOrderPrompt([])).digest('hex').slice(0, 8);
const by = (ep: Endpoint) => `${ep.canonical}@${ep.quantization}#${settingsHash(ep, schema).slice(0, 12)}.p${promptHash}`;
const todo = items.filter((i) => i.reference_sql !== null && (i.status === 'agreed' || i.status === 'disputed') && !i.ordered_reason);
const batches = Array.from({ length: Math.ceil(todo.length / 20) }, (_, k) => todo.slice(20 * k, 20 * k + 20));

try {
  await runQueue(batches, 4, async (batch) => {
    const ids = batch.map((i) => i.id);
    let judged: Judgment[][];
    try {
      judged = await Promise.all([TEACHER, CHECKER].map(async (ep) => {
        const out = checkJudgments(ids, await askTeacher(buildOrderPrompt(batch), schema, { endpoint: ep, maxTokens: 4096 }));
        return ids.map((id) => { const x = out.find((o) => o.id === id)!; return { verdict: x.ordering, evidence: x.evidence, by: by(ep) }; });
      }));
    } catch (e) {
      if ((e as { fatal?: boolean }).fatal) throw e;
      console.log(`batch ${ids[0]}… failed (${(e as Error).message.slice(0, 200)}) — stays unjudged`);
      return;
    }
    batch.forEach((item, k) => {
      const next = applyOrdering(item, judged[0][k], judged[1][k]);
      Object.assign(item, next);
      console.log(`${item.id} ${item.ordered_reason} → ${item.status}`);
    });
    writeItems(items, file);
  });
} catch (e) {
  console.error(`FATAL — ordering stopped: ${(e as Error).message.slice(0, 300)}`);
  process.exit(1);
}
