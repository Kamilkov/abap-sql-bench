# Text-to-ABAP-SQL Test Set Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A pipeline that drafts (Codex), validates (A4H), cross-checks (second Codex pass), lets Kamil review, and freezes ~300 text-to-ABAP-SQL test items.

**Architecture:** Small pure modules in `src/` (credentials, A4H client + XML parser, result comparison, item store, Codex wrapper) with thin CLI scripts in `scripts/`, one per pipeline step. Pipeline state lives in one committed file, `work/items.jsonl`; each script moves items between statuses. The final artefacts are `testset.jsonl`, `schema.md` and `fingerprint.json`.

**Tech Stack:** TypeScript run natively by Node 26 (type stripping), `node:test`, `typescript` + `@types/node` as the only (dev) dependencies, `codex` CLI 0.163.

**Spec:** `docs/superpowers/specs/2026-10-20-text-to-abap-sql-testset-design.md`. Read it, including its "Live endpoint findings" section, which overrides earlier spec text where they conflict.

## Global Constraints

- `tsconfig.json`: `strict`, `noEmit`, `erasableSyntaxOnly`, `allowImportingTsExtensions`, `module`/`moduleResolution` `nodenext`, `target` `esnext`. No enums or namespaces. Imports use `.ts` extensions. Done = `npx tsc --noEmit` clean + `node --test` green.
- A4H: `http://localhost:50000` (existing SSH tunnel), client `001`, endpoint `POST /sap/bc/adt/datapreview/freestyle?rowNumber=<n>&sap-client=001`, body = SQL as `text/plain`. Read-only. Never touch the `a4h25` container.
- Credentials are only loaded through `loadCreds()` (Task 1) and never logged, printed or written to a file.
- Validation thresholds (apply to reference **and** cross-check results): reject on SQL error, 0 rows, an **effective** result over 1,000 rows, or an incomplete result. Effective size = `totalRows` without `UP TO`, else `min(limit, max(0, totalRows - offset))`. Complete = returned rows equal the effective size.
- Unanswerable marker: the literal string `UNANSWERABLE`.
- Claude never writes or judges reference SQL. Reference SQL comes only from Codex drafts, the Codex cross-check, or Kamil.
- Today-relative wording is forbidden in questions, matched case-insensitively: `today|tomorrow|yesterday|upcoming|recent|current|this (week|month|quarter|year)|last (week|month|quarter|year)|next (week|month|quarter|year)`.
- Allowed tables (13): `/DMO/AGENCY`, `/DMO/CUSTOMER`, `/DMO/CARRIER`, `/DMO/CONNECTION`, `/DMO/FLIGHT`, `/DMO/AIRPORT`, `/DMO/TRAVEL`, `/DMO/BOOKING`, `/DMO/BOOK_SUPPL`, `/DMO/SUPPLEMENT`, `/DMO/SUPPL_TEXT`, `/DMO/TRVL_STAT_T`, `/DMO/BOOK_STAT_T`.

## Review Focus

1. **Codex SQL with a trailing `.`/`;`, or `UP TO … ROWS` followed by `OFFSET`.** Expect the trailing punctuation to be stripped and `OFFSET` to be honoured. Pinned in Task 2 (`splitTopN` tests).
2. **Character values that differ only in case or leading spaces** (`'Lufthansa'` vs `'LUFTHANSA'`). Expect them to be unequal: only trailing spaces are trimmed. Pinned in Task 3.
3. **Duplicate rows in the reference** (the candidate used `DISTINCT`). Expect a fail, because the comparison counts how often each row occurs. Pinned in Task 3.
4. **A review decision for an unknown id, or an action that doesn't fit the item's status** (e.g. `keep` on a disputed item). Expect the whole decisions file to be rejected, with nothing written. Pinned in Task 8.
5. **An explicit top-N whose `totalRows` exceeds 1,000** (e.g. "5 most expensive flights"). Expect it to be accepted: the 1,000-row cap applies only to queries without `UP TO`. Pinned in Task 6.

---

### Task 1: Scaffold + credential loader

**Files:**
- Create: `package.json`, `tsconfig.json`, `.gitignore` (`.env`, `node_modules/`, `tmp/`)
- Create: `src/creds.ts`
- Test: `test/creds.test.ts`

**Interfaces:**
- Produces: `loadCreds(paths?: { projectEnv: string; secrets: string }): { user: string; password: string }`. Default paths: `<repo>/.env` and `$HOME/.config/ai/secrets.env`.

`package.json`: `"type": "module"`, `"private": true`, scripts `test` = `node --test test/`, `typecheck` = `tsc --noEmit`, plus one script per CLI in later tasks (`draft`, `validate`, `crosscheck`, `review`, `apply-review`, `freeze`, `status`, `schema`), each `node scripts/<name>.ts`.

- [ ] **Step 1: Write failing tests** in `test/creds.test.ts`. Use temp files written with `fs.mkdtempSync`:
  - `project .env pair wins`: `.env` has `SAP_USER=a`, `SAP_PASSWORD=b`; secrets has both prefixed and unprefixed pairs → `{user:'a', password:'b'}`.
  - `prefixed pair beats unprefixed`: no `.env` file; secrets has `ABAP_SQL_BENCH__SAP_USER=p`, `ABAP_SQL_BENCH__SAP_PASSWORD=q`, `SAP_USER=x`, `SAP_PASSWORD=y` → `{user:'p', password:'q'}`.
  - `falls through only when both keys absent`: secrets has only `SAP_USER=x`, `SAP_PASSWORD=y` → `{user:'x', password:'y'}`.
  - `half-configured source fails, no fall-through`: secrets has `ABAP_SQL_BENCH__SAP_USER=p`, `SAP_USER=x`, `SAP_PASSWORD=y` → throws; the message contains `ABAP_SQL_BENCH__SAP_PASSWORD` and does not contain `p`, `x` or `y` as values (assert the message has no `=`).
  - `empty value fails`: `.env` has `SAP_USER=`, `SAP_PASSWORD=b` → throws, naming `SAP_USER`.
  - `ignores other projects' keys`: secrets has only `SUPPLY_CHAIN_RESCUE__SAP_USER`/`_PASSWORD` → throws.
  - `does not populate process.env`: after a successful load, `process.env.SAP_PASSWORD` equals its value from before the call.
- [ ] **Step 2: Run** `node --test test/creds.test.ts`. Expected: FAIL (module not found).
- [ ] **Step 3: Implement `loadCreds`** in `src/creds.ts` with `util.parseEnv(fs.readFileSync(...))`. A missing file counts as "both keys absent". Sources are tried in the spec's order.
- [ ] **Step 4: Run** `npm install -D typescript @types/node && npm test && npm run typecheck`. Expected: all pass, tsc clean.
- [ ] **Step 5: Commit** `feat: scaffold and selective credential loader`.

### Task 2: A4H client (parser, top-N split, runner)

**Files:**
- Create: `src/a4h.ts`
- Create: `test/fixtures/ok.xml`, `test/fixtures/error.xml`. These are real responses saved during Step 1 with `curl`, using credentials from `loadCreds` via a one-off `node -e`. The response body contains no credentials.
- Test: `test/a4h.test.ts`, `test/a4h.live.test.ts` (skipped unless `A4H_LIVE=1`)

**Interfaces:**
- Produces:
  - `type Column = { name: string; type: string }`
  - `type Result = { columns: Column[]; rows: string[][]; totalRows: number }`. `rows[i][j]` is the raw cell text with XML entities decoded; the trailing space is kept.
  - `type Outcome = { ok: true; result: Result } | { ok: false; error: string }`
  - `parseResponse(status: number, body: string): Outcome`
  - `splitTopN(sql: string): { sql: string; limit?: number; offset: number }`
  - `connect(opts?: { baseUrl?: string; client?: string }): Promise<A4H>` with `type A4H = { run(sql: string, maxRows?: number): Promise<Outcome> }`. `maxRows` defaults to 1000. With an explicit `limit`, `run` uses `rowNumber = limit + offset` and drops the first `offset` rows.

- [ ] **Step 1: Capture fixtures.** `ok.xml` comes from `SELECT carrier_id, name FROM /dmo/carrier ORDER BY carrier_id` with `rowNumber=3`. `error.xml` comes from `SELECT nope FROM /dmo/flight`.
- [ ] **Step 2: Write failing tests:**
  - `parses columns, types, rows, totalRows` from `ok.xml`: 2 columns of type `C`, 3 rows, `totalRows` 21.
  - `parses error message`: status 400 + `error.xml` → `{ok:false, error:'Unknown column name "NOPE".'}`.
  - `decodes entities and empty cells`: an inline XML with `&amp;` and `<dataPreview:data/>` gives `'A&B'` and `''`.
  - `splitTopN`:
    - `'SELECT a FROM t ORDER BY a UP TO 5 ROWS'` → `{sql:'SELECT a FROM t ORDER BY a', limit:5, offset:0}`
    - `'… UP TO 5 ROWS OFFSET 10.'` → `limit:5, offset:10`
    - `'SELECT a FROM t;'` → `{sql:'SELECT a FROM t', offset:0}`
    - case-insensitive (`up to 3 rows`).
  - Live test `runs a query and reports SQL errors`: a valid query → `ok`; the invalid one → `ok:false`; `SELECT … UP TO 2 ROWS OFFSET 1` returns 2 rows equal to rows 2–3 of the same query without `UP TO`.
- [ ] **Step 3: Run** `node --test test/a4h.test.ts`. Expected: FAIL.
- [ ] **Step 4: Implement** the parser with regexes over the columnar format. Columns are `dataPreview:columns` blocks, each holding one `metadata` element and its `dataSet`; rows are built by zipping the columns. The runner does a CSRF fetch on `/sap/bc/adt/discovery` with `x-csrf-token: fetch`, reuses the session cookie, and refetches once on a 403.
- [ ] **Step 5: Run** `npm test && A4H_LIVE=1 node --test test/a4h.live.test.ts && npm run typecheck`. Expected: PASS.
- [ ] **Step 6: Commit** `feat: A4H freestyle client`.

### Task 3: Result comparison (grader core)

**Files:**
- Create: `src/compare.ts`
- Test: `test/compare.test.ts`

**Interfaces:**
- Consumes: `Result`, `Column` (Task 2).
- Produces: `compareResults(ref: Result, cand: Result, ordered: boolean): { pass: boolean; reason: string }`.

Value kinds come from the column type:
- numeric: `I 8 P N b s F`
- date: `D` (`YYYYMMDD` → `YYYY-MM-DD`; `00000000` → `''`)
- time: `T` (`HHMMSS` → `HH:MM:SS`)
- char: everything else, with trailing whitespace trimmed only.

How a reference column and a candidate column are compared:
- **Both numeric, at least one `F`:** float mode. Values are parsed with `Number` and are equal iff `|a-b| <= 1e-9 * max(|a|,|b|)` (both 0 → equal). No canonical string, so no rounding.
- **Both numeric, no `F`:** exact decimal string. Trim, keep the sign, strip leading zeros and trailing fractional zeros and a dangling `.`; `-0` → `0`. No rounding.
- **Kinds differ:** compare the trimmed raw strings.

Matching algorithm:
- Search for an injective mapping by backtracking over reference columns.
- The row counts must be equal.
- Prune each pairing with a necessary condition: the two columns' values, sorted (numerically in float mode), must be pairwise equal under that pairing's equality. For one dimension, sorted pairwise comparison is exact even with tolerance.
- Accept the first complete mapping under which the full row tuples match:
  - **ordered:** positionally, cell by cell, with each pairing's equality.
  - **unordered, no float pairing:** multiset of canonical row keys.
  - **unordered with float pairings:** group rows by the canonical key of the non-float cells (groups must have equal sizes). Within a group with one float column, sort both sides by it and compare pairwise. With several float columns, find a perfect bipartite matching (Kuhn's augmenting paths) where an edge means all float cells are equal within tolerance.

- [ ] **Step 1: Write failing tests.** Build each `Result` with a small helper.
  - `extra candidate columns allowed`: reference `[name]`, candidate `[id,name]` with the same names → pass.
  - `column order and names ignored` → pass.
  - `missing column fails`.
  - `injective: one candidate column cannot serve two reference columns`: reference `[a,b]` with identical values in both, candidate `[a]` → fail.
  - `whole-row matching`: reference rows `(1,x),(2,y)`, candidate `(1,y),(2,x)` → fail. Each column matches on its own, but the rows don't.
  - `multiset duplicates count`: reference has `(LH)` twice, candidate once → fail.
  - `ordered compares sequence`: same rows in a different order → pass when `ordered` is false, fail when true.
  - `decimal exact`: `'42.40 '` (P) vs `'42.4'` (P) → pass; `'42.4'` vs `'42 '` (I) → fail; `'00000001'` (N) vs `'1 '` (I) → pass.
  - `float tolerance`: `'7.5075000000000000E+03'` (F) vs `'7507.50 '` (P) → pass; `'3.3468263888888887E+03'` (F) vs `'3346.83'` (P) → fail; `'1.00000000049'` (F) vs `'1.00000000051'` (F) → pass (reviewer's counterexample to rounding); `'1.000000002'` (F) vs `'1.0'` (F) → fail.
  - `float multiset matching`: reference rows `(A, 1.0000000001), (A, 2.0)`, candidate `(A, 2.0), (A, 1.0)` (F) → pass; candidate `(A, 2.0), (A, 1.1)` → fail.
  - `float bipartite`: two float columns, rows within a group swapped in order and each within tolerance → pass.
  - `dates`: `'20260620'` (D) vs `'20260620'` (D) → pass.
  - `char case and leading spaces significant`: `'Lufthansa'` vs `'LUFTHANSA'` → fail; `' LH'` vs `'LH'` → fail; `'LH  '` vs `'LH'` → pass.
- [ ] **Step 2: Run** `node --test test/compare.test.ts`. Expected: FAIL.
- [ ] **Step 3: Implement** as specified above.
- [ ] **Step 4: Run** `npm test && npm run typecheck`. Expected: PASS.
- [ ] **Step 5: Commit** `feat: injective, type-aware result comparison`.

### Task 4: Item store + schema.md

**Files:**
- Create: `src/items.ts`, `scripts/schema.ts`, `scripts/status.ts`
- Create: `schema.md` (generated, then the wording is hand-polished)
- Test: `test/items.test.ts`

**Interfaces:**
- Produces:
  - `type Tier = 'easy' | 'medium' | 'hard' | 'unanswerable'`
  - `type Status = 'drafted' | 'rejected' | 'validated' | 'agreed' | 'disputed' | 'accepted' | 'dropped'`
  - `type WorkItem = { id: string; batch: string; tier: Tier; question: string; reference_sql: string | null; ordered: boolean; source: 'codex' | 'codex+kamil'; status: Status; reason?: string; flags: string[]; expected: Result | null; crosscheck_sql?: string | null; crosscheck_result?: Outcome | null; checked_question?: string; pipeline?: 'agree' | 'adjudicated' }`
  - `readItems(path?: string): WorkItem[]` and `writeItems(items: WorkItem[], path?: string): void`. The default path is `work/items.jsonl`. Writes go to a temp file followed by a rename.
  - `nextIds(items: WorkItem[], n: number): string[]` returns `q0001`-style ids continuing after the highest existing id.

`scripts/schema.ts` builds `schema.md` from the A4H data dictionary:
- For each allowed table, it queries `DD03L` (fieldname, keyflag, position, datatype, leng, decimals), skipping `.INCLUDE` rows and `MANDT`/`CLIENT`.
- Short descriptions come from `DD04T` (`rollname`, `ddlanguage = 'E'`, `as4local = 'A'`).
- It writes one section per table, with key columns marked.

It then appends this fixed **Dialect notes** section:
- ABAP SQL, not ANSI.
- Column of an alias: `alias~column`.
- Sort with `ASCENDING`/`DESCENDING`.
- Top-N as a trailing `UP TO n ROWS [OFFSET m]`.
- No `WITH`, no `UNION`, no `INTO`, one `SELECT` only.
- Date literals are `'YYYYMMDD'`.
- Missing outer-join values come back as blank/zero, never NULL.

`scripts/status.ts` prints a tier × status count table.

- [ ] **Step 1: Write failing tests:** `writeItems`/`readItems` round-trip, and `nextIds` after `q0007` returns `['q0008','q0009']` and on an empty list returns `['q0001']`.
- [ ] **Step 2: Run.** Expected: FAIL. **Step 3: Implement.** **Step 4: Run** `npm test && npm run typecheck && npm run schema`. Expected: PASS, and `schema.md` lists all 13 tables.
- [ ] **Step 5:** Hand-polish the column meanings in `schema.md` (builder's call), then commit `feat: item store and schema.md`.

### Task 5: Codex wrapper + draft step

**Files:**
- Create: `src/codex.ts`, `scripts/draft.ts`
- Create: `prompts/draft.md`, `prompts/draft.schema.json`
- Test: `test/codex.test.ts`

**Interfaces:**
- Consumes: `readItems`, `writeItems`, `nextIds` (Task 4); `schema.md`.
- Produces: `askCodex<T>(prompt: string, schemaPath: string): Promise<T>`. It runs `codex exec -s read-only --skip-git-repo-check --ephemeral --output-schema <schemaPath> -o <tmp>/out.json -C <fresh empty tmp dir> -`, with the prompt on stdin, then parses `out.json` and throws on a non-zero exit.

Draft details:
- `prompts/draft.schema.json` is strict JSON Schema (`additionalProperties:false`, all fields required): `{items: [{question: string, reference_sql: string|null, ordered: boolean}]}`.
- `prompts/draft.md` contains:
  - the tier definition from the spec;
  - the full `schema.md`;
  - the rules: plain English with no SAP jargon; explicit dates only; name the columns to return where it would otherwise be ambiguous; every ordered or top-N question states a complete tie-breaker, and its `ORDER BY` ends in a unique key; `ordered: true` only when the question asks for an order; unanswerable items have `reference_sql: null`;
  - the existing questions in that tier, so it avoids repeats.
- `npm run draft -- --tier <tier> --count <n>` (default 10):
  - saves the raw Codex output to `drafts/<YYYYMMDD-HHMMSS>-<tier>.json`;
  - appends `WorkItem`s with status `drafted`, `source: 'codex'`, `flags: []`, `expected: null`.

- [ ] **Step 1: Write a failing test:** `askCodex` against a fake `codex` executable. Put a stub script on `PATH` that writes a fixed JSON to the `-o` path. The test checks that the parsed object comes back, the prompt arrives on stdin, and `-C` points to an empty directory.
- [ ] **Step 2: Run.** Expected: FAIL. **Step 3: Implement.** **Step 4: Run** `npm test && npm run typecheck`. Expected: PASS.
- [ ] **Step 5: Live smoke:** `npm run draft -- --tier easy --count 3`. Expected: 3 `drafted` items in `work/items.jsonl` plus one file in `drafts/`.
- [ ] **Step 6: Commit** `feat: codex draft step`. Commit `drafts/` and `work/`.

### Task 6: Validate step

**Files:**
- Create: `src/validate.ts`, `scripts/validate.ts`
- Test: `test/validate.test.ts`

**Interfaces:**
- Consumes: `A4H`, `Outcome`, `splitTopN` (Task 2); `WorkItem` (Task 4).
- Produces:
  - `staticCheck(item: WorkItem): string | null`. It returns a reject reason: today-relative wording (Global Constraints regex), `ordered` without `ORDER BY`, a non-unanswerable item without SQL, or an unanswerable item with SQL.
  - `judge(sql: string, outcome: Outcome): { ok: true } | { ok: false; reason: string }`. Reasons: `sql error: <msg>`, `0 rows`, `effective N > 1000`, `incomplete: got R of N`. It uses the effective size from Global Constraints, so it covers `UP TO 2000 ROWS` too.
  - `nearDuplicates(items: WorkItem[]): Map<string, string>`, mapping an id to the earlier id it duplicates. Lowercase word-token Jaccard ≥ 0.8.

`npm run validate` processes every `drafted` item:
1. static check;
2. run unless unanswerable;
3. `judge`;
4. `validated` with `expected` set, or `rejected` with `reason`.

Afterwards it adds flags `near-dup:<id>` and `same-result:<id>` (identical sorted, trimmed rows) across non-rejected items.

- [ ] **Step 1: Write failing tests:**
  - `staticCheck` rejects `"Which flights depart this month?"` and `"List recent bookings"`, but accepts `"List flights on 2026-06-20"`.
  - `judge` → `0 rows` on an empty result.
  - `judge` rejects `totalRows: 5000` without `UP TO` and **accepts** `'… ORDER BY price DESCENDING, flight_date UP TO 5 ROWS'` with `totalRows: 20560` and 5 rows; rejects `'… UP TO 2000 ROWS'` returning 2,000 rows (`effective 2000 > 1000`); rejects no-`UP TO` with `totalRows: 1500` and 1,000 rows returned; accepts `UP TO 5 ROWS OFFSET 20558` with `totalRows: 20560` and 2 rows.
  - `nearDuplicates` pairs `"List all carriers that fly from Frankfurt to New York"` with `"List the carriers that fly from Frankfurt to New York"` (Jaccard 9/11 ≈ 0.82), and does **not** pair `"How many carriers are there?"` with `"How many carriers are there in total?"` (5/7 ≈ 0.71).
- [ ] **Step 2: Run.** Expected: FAIL. **Step 3: Implement.** **Step 4: Run** `npm test && npm run typecheck && npm run validate`. Expected: the 3 smoke items are validated or rejected with reasons.
- [ ] **Step 5: Commit** `feat: validate step`.

### Task 7: Cross-check step

**Files:**
- Create: `scripts/crosscheck.ts`, `prompts/crosscheck.md`, `prompts/crosscheck.schema.json`
- Test: `test/crosscheck.test.ts`

**Interfaces:**
- Consumes: `askCodex` (Task 5), `A4H` (Task 2), `compareResults` (Task 3), `judge` (Task 6).
- Produces: `decide(item: WorkItem, crossSql: string | null, crossOutcome: Outcome | null): Pick<WorkItem, 'status' | 'pipeline' | 'checked_question' | 'crosscheck_sql' | 'crosscheck_result' | 'reason'>`. The cross outcome is always stored, so the review sheet shows the evidence behind a dispute without re-running anything.

Cross-check details:
- `crosscheck.schema.json`: `{answers: [{id: string, sql: string|null}]}`, where `null` means `UNANSWERABLE`.
- `prompts/crosscheck.md` contains **only** `schema.md` plus `{id, question}` pairs. It must never include `reference_sql`, `ordered` or tier. The prompt says to answer with SQL, or `null` when the data can't answer the question.

`decide` rules. The script **executes every non-null cross SQL** before calling `decide`, and `crosscheck_result` is persisted in every branch: `null` only when the cross answer was `UNANSWERABLE`.
- Item unanswerable and cross `null` → `agreed`.
- Item answerable and cross `null` → `disputed`.
- Item unanswerable and cross gave SQL → `disputed`, with the executed outcome stored and reason `cross answered with SQL` (plus the judge reason if it failed), so adjudication has evidence.
- Both have SQL → apply `judge` to the cross outcome first. A failed `judge` (error, empty, over the ceiling, incomplete) → `disputed`, with the judge reason. Otherwise `compareResults(expected, cross, item.ordered).pass === false` → `disputed`, with the reason. Otherwise `agreed`.
- `agreed` sets `pipeline: 'agree'` and `checked_question: item.question`.

`npm run crosscheck` sends `validated` items in batches of 10.

- [ ] **Step 1: Write failing tests** for `decide`, covering every branch above, with hand-built `Result`s. Include `truncated cross result is disputed`: the reference has 1,000 rows; the cross result returns the same 1,000 rows with `totalRows: 2000` and no `UP TO` → `disputed` with reason `effective 2000 > 1000`, never `agreed`. Also assert that `crosscheck_result` is stored in every branch that ran SQL. Also `prompt never contains reference SQL`: build the prompt for an item whose `reference_sql` is `'SELECT secret_marker FROM x'` and assert `secret_marker` is absent.
- [ ] **Step 2: Run.** Expected: FAIL. **Step 3: Implement**, exporting `buildPrompt(items)` from the script module for the test. **Step 4: Run** `npm test && npm run typecheck && npm run crosscheck`. Expected: the smoke items end up `agreed`/`disputed`.
- [ ] **Step 5: Commit** `feat: independent codex cross-check`.

### Task 8: Review sheet + apply decisions

**Files:**
- Create: `src/review.ts`, `scripts/review.ts`, `scripts/apply-review.ts`
- Test: `test/review.test.ts`

**Interfaces:**
- Consumes: `WorkItem`, `readItems`, `writeItems` (Task 4).
- Produces:
  - `type Decision = { id: string; action: 'keep' | 'drop' | 'use_reference' | 'use_crosscheck' | 'rewrite'; question?: string; tier?: Tier; ordered?: boolean }`
  - `applyDecisions(items: WorkItem[], decisions: Decision[]): WorkItem[]`. It is pure and throws on any invalid decision, before changing anything.

What the two scripts do:
- `npm run review` writes `review/sheet.md` for every `agreed` and `disputed` item. Each entry shows the id, tier, flags, question, reference SQL, the first 10 rows of the reference result, and for disputed items also the cross SQL, its first 10 rows and the reason. It ends with the decision-line format to use.
- Kamil writes decisions to `review/decisions.jsonl`.
- `npm run apply-review` applies them and then renames the file to `review/applied-<timestamp>.jsonl`.

Rules for `applyDecisions`:
- `keep` is allowed only on `agreed` → `accepted`.
- `use_reference` / `use_crosscheck` are allowed only on `disputed` → `accepted` with `pipeline: 'adjudicated'` and `checked_question = question`.
- `use_crosscheck` sets `reference_sql = crosscheck_sql` and `expected` from the stored `crosscheck_result`. It is allowed only if that stored result passed `judge`; an unanswerable cross answer has nothing to judge.
- **When `use_crosscheck` changes answerability**, the decision must say how to reclassify, and the result must pass `staticCheck` (Task 6). Otherwise it throws.
  - answerable → `UNANSWERABLE`: `tier: 'unanswerable'` is required; `reference_sql` and `expected` become `null`.
  - unanswerable → SQL: `tier` (`easy|medium|hard`) and `ordered` are required.
- `drop` → `dropped`.
- `rewrite` needs a `question` and is allowed on `agreed`, `disputed` or `accepted`. It sets `question`, `source: 'codex+kamil'`, `status: 'drafted'` and clears `expected`, `crosscheck_sql`, `checked_question` and `pipeline`.
- An unknown id, a disallowed action, or a `rewrite` without `question` throws, naming the offending line.

- [ ] **Step 1: Write failing tests:**
  - every allowed transition above;
  - `keep on disputed throws and returns nothing changed`;
  - `unknown id throws`;
  - `rewrite resets to drafted and clears checked_question`.
  - `use_crosscheck to unanswerable without tier throws`; with `tier: 'unanswerable'` → `accepted`, `reference_sql` and `expected` are `null`.
  - `use_crosscheck from unanswerable needs tier and ordered`: without them it throws; with `tier: 'medium', ordered: false` → `accepted`, with `expected` from the stored cross result.
  - `use_crosscheck refuses a cross result that failed judge`.
  - `unanswerable → SQL → adjudicated answerable, end to end`: an unanswerable item plus a cross SQL with a passing outcome goes through `decide` (Task 7) → `disputed` with `crosscheck_result` set, then through `applyDecisions` with `{action:'use_crosscheck', tier:'easy', ordered:false}` → `accepted`, `pipeline: 'adjudicated'`, and `expected` equal to that outcome's result.
- [ ] **Step 2: Run.** Expected: FAIL. **Step 3: Implement.** **Step 4: Run** `npm test && npm run typecheck`. Expected: PASS.
- [ ] **Step 5: Commit** `feat: review sheet and decisions`.

### Task 9: Fingerprint + freeze

**Files:**
- Create: `src/fingerprint.ts`, `scripts/freeze.ts`
- Test: `test/freeze.test.ts`

**Interfaces:**
- Consumes: `A4H` (Task 2), `WorkItem` (Task 4), the allowed tables (Global Constraints).
- Produces:
  - `fingerprint(a4h: A4H): Promise<Record<string, string>>`. For each table it reads `SELECT * FROM <t> ORDER BY PRIMARY KEY` with `maxRows` 1,000,000, asserts `rows.length === totalRows`, and records the SHA-256 of `JSON.stringify({columns, rows})`.
  - `freezable(items: WorkItem[]): { ok: true; items: WorkItem[] } | { ok: false; problems: string[] }`. Only `accepted` items are frozen. Any item still `drafted`/`validated`/`agreed`/`disputed` is a problem, as is any `accepted` item whose `checked_question !== question`.

`npm run freeze`:
0. If `testset.jsonl` or `fingerprint.json` already exists, refuse and exit non-zero. A frozen release is never overwritten; a new release is a deliberate manual step outside this plan.
1. `freezable`;
2. fingerprint;
3. re-run every reference SQL and recapture `expected`, aborting if any now fails `judge`;
4. fingerprint again; a mismatch aborts;
5. Write both files to `tmp/` first. Only after both are fully written, rename `fingerprint.json` into place, then `testset.jsonl`. Print a tier-count summary to stdout. Any earlier failure leaves no published file.

Each line of `testset.jsonl` has exactly the spec fields `id, tier, question, reference_sql, ordered, expected ({columns, rows} | null), source, pipeline`.

Frozen items are never edited. Retirement is out of scope until the first post-freeze fix is needed (YAGNI).

- [ ] **Step 1: Write failing tests** for `freezable`, plus `refuses when testset.jsonl exists` (export the guard as `assertNotFrozen(dir: string): void` and test it on a temp dir): rejects a pending `agreed` item; rejects `accepted` with `checked_question` ≠ `question`; passes when everything is `accepted`/`rejected`/`dropped` and returns only the accepted ones.
- [ ] **Step 2: Run.** Expected: FAIL. **Step 3: Implement.** **Step 4: Run** `npm test && npm run typecheck`, then the live check `A4H_LIVE=1 node -e` calling `fingerprint` twice. Expected: identical hashes, 13 tables.
- [ ] **Step 5: Commit** `feat: fingerprint and freeze`.

### Task 10: Pilot run (no new code)

- [ ] **Step 1:** Draft 5 items per tier (`npm run draft -- --tier <t> --count 5` ×4), then `npm run validate`, `npm run crosscheck`, `npm run review`, `npm run status`.
- [ ] **Step 2:** Report to Kamil:
  - the status table;
  - the rejection reasons;
  - the agreement rate (agreed ÷ cross-checked);
  - a link to `review/sheet.md` for his first review round.

  Success: the pipeline runs end to end. An agreement rate far below about 75% means the draft or cross-check prompts need work before scaling to 300.
- [ ] **Step 3: Commit** the pilot state: `chore: pilot batch`.
