// Step 3: an independent second pass (Codex, or the open-weight checker GLM-5.2 with --via checker) answers each validated
// question from the question alone; every non-null SQL is executed.
//   node scripts/crosscheck.ts [--items <file>] [--via codex|checker]
import fs from 'node:fs';
import path from 'node:path';
import { connect } from '../src/a4h.ts';
import { runCandidate } from '../src/eval.ts';
import { askCodex } from '../src/codex.ts';
import { createHash } from 'node:crypto';
import { buildPrompt, checkAnswers, crosscheckArgs, decide, interleave, repairChecker } from '../src/crosscheck.ts';
import { FIXER_HASH } from '../src/fix.ts';
import { itemsFileArg, readItems, writeItems, REPO } from '../src/items.ts';
import { askTeacher, CHECKER, settingsHash } from '../src/teacher.ts';
import { runQueue } from '../src/queue.ts';
import { foreignTables } from '../src/validate.ts';

const file = itemsFileArg();
const { via } = crosscheckArgs(process.argv.slice(2));
const items = readItems(file);
const todo = interleave(items.filter((i) => i.status === 'validated'));
const schema = fs.readFileSync(path.join(REPO, 'schema.md'), 'utf8');
const schemaFile = path.join(REPO, 'prompts/crosscheck.schema.json');
const a4h = await connect();
type Out = { answers: { id: string; sql: string | null }[] };
const checkerSchema = JSON.parse(fs.readFileSync(schemaFile, 'utf8'));
// Checker provenance: model@quant # request settings . prompt template (incl. ABAP rules) . frozen fixer.
const promptHash = createHash('sha256').update(buildPrompt([], '')).digest('hex');
const by = via === 'checker'
  ? `${CHECKER.canonical}@${CHECKER.quantization}#${settingsHash(CHECKER, checkerSchema).slice(0, 12)}.p${promptHash.slice(0, 8)}.f${FIXER_HASH.slice(0, 8)}`
  : 'codex';

const batches = Array.from({ length: Math.ceil(todo.length / 10) }, (_, k) => todo.slice(10 * k, 10 * k + 10));
// The hosted checker handles parallel requests; Codex runs one at a time. A fatal checker error (policy refusal,
// compliance violation) stops dispatching and fails the run; a malformed answer batch stays validated.
try {
  await runQueue(batches, via === 'checker' ? 8 : 1, async (batch) => {
    let answers: Out['answers'];
    try {
      const out = via === 'checker'
        ? await askTeacher<Out>(buildPrompt(batch, schema), checkerSchema, { endpoint: CHECKER })
        : await askCodex<Out>(buildPrompt(batch, schema), schemaFile);
      answers = checkAnswers(batch.map((i) => i.id), out);
    } catch (e) {
      if ((e as { fatal?: boolean }).fatal) throw e;
      console.log(`batch ${batch[0].id}… failed (${(e as Error).message.slice(0, 200)}) — items stay validated`);
      return;
    }
    for (const item of batch) {
      const answer = answers.find((x) => x.id === item.id)!;
      // Training pipeline: the frozen fixer repairs checker SQL (raw kept); Codex answers are used as given.
      const { sql, ...raw } = via === 'checker' ? repairChecker(answer.sql) : { sql: answer.sql };
      // Never execute SQL that reads outside the benchmark tables.
      const outcome = sql === null || foreignTables(sql).length ? null : await runCandidate(a4h, sql);
      Object.assign(item, decide(item, sql, outcome), raw, { crosscheck_by: by });
      console.log(`${item.id} ${item.status}${item.reason ? ` — ${item.reason}` : ''}`);
    }
    writeItems(items, file);
  });
} catch (e) {
  console.error(`FATAL — cross-check stopped: ${(e as Error).message.slice(0, 300)}`);
  process.exit(1);
}
