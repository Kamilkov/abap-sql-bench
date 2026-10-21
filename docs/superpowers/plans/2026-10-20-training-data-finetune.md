# Training Data + Fine-tune Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Generate ~3,000 decontaminated, cross-checked training pairs with a self-hosted open-weight teacher, LoRA-fine-tune Qwen3-4B on Runpod, and evaluate it against the pre-registered criteria.

**Architecture:** Mac-side TypeScript drives everything (teacher calls over HTTP, A4H validation, decontamination, export, campaigns) by reusing the existing pipeline modules; Pod-side Python only trains/exports the student; the teacher and checker are hosted open-weight models reached via OpenRouter (revision 2026-10-21b). A committed dataset registry plus a frozen-model marker make "no test scoring before freeze" enforced, not conventional.

**Tech Stack:** Node 26 TypeScript (type stripping, `node:test`, no runtime deps), vLLM, TRL (SFT, assistant-only loss), llama.cpp GGUF export, Ollama, Voyage embeddings, Runpod.

**Spec:** `docs/superpowers/specs/2026-10-20-training-data-finetune-design.md` (Part C is the pre-registration — never edit it; additions go in a dated addendum at the end of the spec).

## Global Constraints

- Budget: **€35 hard cap; stop and ask Kamil if the projected total passes €30.** Every paid step appends to `results/costs.md` (`date | item | amount | running total`).
- Teacher: `deepseek/deepseek-v4-pro-0813` (MIT), cross-check: `z-ai/glm-5.2` (MIT), both via OpenRouter pinned to DeepInfra (fp8 / fp4), reasoning off (spec addendum 2026-10-21b). Pilot gate failure → one prompt-fix restart; a second failure → stop and ask Kamil. Student: `Qwen/Qwen3-4B-Instruct-2507`. Fine-tuned Ollama name `abap-sql-qwen3-4b-ft:q8_0`.
- Frozen, never edited: `testset.jsonl`, `fingerprint.json`, `schema.md`, `prompts/answer.md`.
- Only `src/decontam.ts` / `scripts/decontam.ts` and the campaign may read `testset.jsonl`; teacher-facing code never does.
- Claude never writes or judges test items, training labels, calibration labels or audit labels — Kamil labels; Codex drafts the fresh set.
- Credentials: locally via `loadSecret` from `$HOME/.config/ai/secrets.env` with project-prefixed names `ABAP_SQL_BENCH__TEACHER_API_KEY` and `ABAP_SQL_BENCH__VOYAGE_API_KEY` (falls back to `VOYAGE_API_KEY`); Kamil adds values himself. `ABAP_SQL_BENCH__TEACHER_API_KEY` is Kamil's OpenRouter key (credit limit $25); requests go to `https://openrouter.ai/api` with `provider: {only: ['deepinfra'], quantizations, require_parameters: true, allow_fallbacks: false, data_collection: 'deny'}`. Never logged or committed.
- **Execution order and review gates:** code tasks 1–10, 13 (code steps) and 14 (code steps) first → **independent review (Gate A) before any paid step** → Task 11 pilot → Task 12 → **independent freeze/provenance review (Gate B) before any test-role scoring** → Task 13 step 5, Task 14 scoring.
- A4H read-only through the tunnel; never restart `a4h25`. Campaigns keep the fingerprint before/after rule.
- `npm test` and `npm run typecheck` green before every commit. No new runtime dependencies.
- Kamil is new to Runpod: any step he performs is written as numbered clicks/commands in `docs/runbook-runpod.md`.

## Review Focus

1. **Teacher returns malformed or truncated JSON** → that request is logged and retried once, then skipped; already-written items are kept; the run never crashes mid-file. Pinned in Task 2 (`askTeacher rejects invalid JSON`) and Task 3 (`teach skips a failed batch and keeps going`).
2. **Crash or Pod stop mid-generation** (incl. between saving a batch and importing it) → rerunning imports every saved batch exactly once and drafts only missing batches. Pinned in Task 3.
3. **A dataset file changes after registration** (hand edit, regenerated val) → generation, resume and campaign refuse with the expected and actual hash. Pinned in Task 1.
4. **The same question drafted in two batches** → within-train dedupe keeps the first. Pinned in Task 6.
5. **A training record whose SQL is very long or contains template control text** → Pod preflight fails before training. Pinned in Task 9 preflight.

---

### Task 1: Dataset and model registries, test-scoring guard

**Files:**
- Create: `src/datasets.ts`, `datasets.json`, `models.json`, `test/datasets.test.ts`
- Modify: `scripts/generate.ts`, `scripts/campaign.ts`, `scripts/derive.ts`, `package.json`; `git mv answers/*.jsonl answers/test-v1/`

**Interfaces:**
- `datasets.json`: `{ [name]: { path; sha256; role: 'selection' | 'test' } }`, initial `test-v1 → testset.jsonl` (role `test`).
- `models.json`: `{ [name]: { role: 'baseline' | 'candidate' | 'control'; identity: string } }`. Identity = Ollama manifest digest (from `GET /api/tags` → `digest`) for local models, `claude-opus-5-5@high` for Claude; controls (shuffle) and derived arms (`*-fixed`) carry `derived_from: <name>` and inherit the parent's identity. Initial entries: the existing baseline arms.
- `loadDataset(name, registryPath?) → { name; items: TestItem[]; sha256; role }` — throws `dataset <name>: sha256 <actual> ≠ registered <expected>`.
- `modelIdentity(name, opts) → Promise<string>` — asks Ollama for the current digest (or returns the Claude identity).
- `assertMayScore(dataset, model: { name; identity }, opts?: { models?: string; marker?: string })` — on a `test` dataset: unknown model → throw; registered identity ≠ current identity → throw; role `candidate` → `models/ft-v1.json` must exist and its `{name, identity}` must equal the model's. Selection datasets: candidates allowed, unknown models allowed.
- Answer lines carry `dataset_sha256` and `model_identity`; files at `answers/<dataset>/<model>.jsonl`. `derive.ts` copies both fields from its source file.
- Historical answers: `datasets.json` gets `legacy_answers: { [file]: sha256 }` for the six existing `answers/test-v1/*.jsonl` files; campaign accepts lines without the new fields **only** for files whose current hash is on that allowlist.

- [ ] **Step 1: Failing tests** (temp registries/files, fake identity resolver):
  - `loadDataset throws on hash mismatch` (append a byte → both hashes in the message);
  - `assertMayScore refuses an unknown model on test`; `refuses a candidate without marker`; `refuses a candidate whose identity differs from the marker` (same name, new digest); `allows the frozen candidate`; `refuses a baseline whose weights changed`; `allows anything on selection`;
  - `derived answers keep dataset and model provenance`;
  - `legacy file accepted only while its hash is allowlisted` (edit one byte → refused).
- [ ] **Step 2: Run** `node --test test/datasets.test.ts` → FAIL.
- [ ] **Step 3: Implement**; `generate.ts` and `campaign.ts` take a required `--dataset`, resolve each model's identity and call `assertMayScore` before any request/execution, and on resume or scoring refuse lines whose `dataset_sha256`/`model_identity` differ from the current ones; `summary.json` records dataset, hash and every model identity.
- [ ] **Step 4: Run** `npm test && npm run typecheck` → PASS. Then `node scripts/campaign.ts reprod-check --dataset test-v1 answers/test-v1/claude-opus-5-5-high.jsonl` (write-free window) → 100%; delete `results/reprod-check`.
- [ ] **Step 5: Commit** `feat: dataset and model registries with identity-checked test guard`.

### Task 2: Teacher client

> Revised 2026-10-21b: defaults are now OpenRouter, `TEACHER`/`CHECKER` endpoints (`src/teacher.ts`); the vLLM/tunnel text below is historical.

**Files:** Create `src/teacher.ts`, `test/teacher.test.ts`

**Interfaces:**
- Produces: `askTeacher<T>(prompt: string, schema: object, opts?: { url?: string; apiKey?: string; model?: string; maxTokens?: number }): Promise<T>` — POST `${url}/v1/chat/completions` with `response_format: { type: 'json_schema', json_schema: { name: 'out', schema, strict: true } }`, `temperature: 0.7`, `max_tokens` default 8192; defaults: url `http://127.0.0.1:8000` (SSH tunnel), key `loadSecret('ABAP_SQL_BENCH__TEACHER_API_KEY')`, model `Qwen/Qwen3-Coder-30B-A3B-Instruct`. Retries network/5xx/429 like `generate.ts`'s `post` (move `post` into `src/http.ts` and reuse it in both). Throws on `finish_reason !== 'stop'` or unparsable JSON.

- [ ] **Step 1: Failing tests** against a local `node:http` fake server: `askTeacher returns parsed JSON and sends the bearer key and schema`; `askTeacher rejects invalid JSON` (server returns `{"items": [`); `askTeacher rejects finish_reason length`; `askTeacher retries a 503 then succeeds`.
- [ ] **Step 2: Run** → FAIL. **Step 3: Implement.** **Step 4:** `npm test && npm run typecheck` → PASS.
- [ ] **Step 5: Commit** `feat: OpenAI-compatible teacher client`.

### Task 3: Training-pair generation

**Files:**
- Create: `src/profile.ts` (move `profile()` out of `scripts/draft.ts`, which then imports it), `scripts/teach.ts`, `prompts/teach.md`, `prompts/teach.schema.json`, `prompts/focus.json`, `test/teach.test.ts`
- Modify: `src/items.ts` (export `TRAIN_ITEMS = 'train/work.jsonl'`)

**Interfaces:**
- Consumes: `askTeacher` (Task 2), `readItems/writeItems/nextIds(items, n, prefix)` — add `prefix` param (default `'q'`); training ids use `t`.
- Produces: `train/work.jsonl` (WorkItem per draft, `status: 'drafted'`, `source: 'teacher'` — widen `WorkItem.source` to include it), `train/drafts/<batch>.json` (raw teacher output + the exact prompt), `planBatches(total: number, focus: Focus[], mix = {easy: .30, medium: .35, hard: .25, unanswerable: .10}): Batch[]` with `type Batch = { id: string; tier: Tier; focus: Focus; count: number }`, deterministic ids `b0001…`.
- `prompts/teach.md`: `prompts/draft.md`'s rules verbatim (incl. "each X") + `{{SCHEMA}}`, `{{PROFILE}}`, `{{TIER}}`, `{{TIER_DEF}}`, `{{FOCUS}}`, `{{COUNT}}`; **no** existing-questions list. `prompts/focus.json`: ~40 `{tables, feature}` combos over the 13 tables × features (filter, join, GROUP BY, HAVING, subquery, CASE, date arithmetic, top-N, outer join with zeros).
- **Saved batches are authoritative.** A batch is written to `train/drafts/<batch-id>.json` via temp file + rename only after the teacher returns; `importDrafts(draftsDir, itemsFile)` then (re)builds work items idempotently with stable ids `t-<batch-id>-<index>` (existing ids are left untouched, so later statuses survive). Every run = draft missing batches → `importDrafts`. A crash anywhere leaves either no file (batch redrafted) or a file that the next import picks up.
- `planBatches` is **prefix-stable**: `planBatches(4500)` starts with exactly `planBatches(300)`, so extending the pilot reuses its batches.
- CLI: `npm run teach -- --total 300 [--concurrency 8]`; batches of 10.

- [ ] **Step 1: Failing tests:** `planBatches hits the tier mix within one batch`; `planBatches is deterministic`; `teach skips a failed batch and keeps going` (fake teacher throws on batch 2 of 3 → items from 1 and 3 written, batch 2 absent from drafts); `teach resumes without duplicates` (run twice → same item count); `crash after saving a batch but before import → next run imports it once` (simulate by writing a draft file, then running import twice); `extending total keeps the pilot batches` (`planBatches(4500).slice(0, n)` deep-equals `planBatches(300)`); `teach never reads the test set` (assert the sources of `scripts/teach.ts`, `src/teacher.ts`, `src/profile.ts`, `prompts/teach.md` contain no `testset`).
- [ ] **Step 2: Run** → FAIL. **Step 3: Implement** (inject the teacher function for tests). **Step 4:** `npm test && npm run typecheck` → PASS.
- [ ] **Step 5: Commit** `feat: teacher-driven training-pair generation`.

### Task 4: Validate + cross-check training pairs

**Files:** Modify `scripts/validate.ts`, `scripts/crosscheck.ts`, `scripts/status.ts`, `src/crosscheck.ts`; Test `test/crosscheck.test.ts`

**Interfaces:**
- `validate.ts`, `crosscheck.ts` and `status.ts` take `--items <path>` (default `work/items.jsonl`) and `crosscheck.ts` takes `--via codex|checker` (default `codex`; revised 2026-10-21b from `teacher`). With `--via checker`, the cross-check prompt is `buildPrompt` (unchanged — only `{id, question}`) sent through `askTeacher` with `prompts/crosscheck.schema.json`.
- Training outcome: `agreed` = kept; `disputed` = dropped as unresolved (no review). `decide()` is reused unchanged — it already treats a cross SQL error on an unanswerable item as disputed.

- [ ] **Step 1: Failing test:** `unanswerable item with a failing cross SQL is disputed, not agreed` (exists — confirm it covers the training rule); add `buildPrompt with teacher wording contains no reference SQL` if the prompt changes. Add a script-level test that `--items` routes reads/writes to the given file (temp file).
- [ ] **Step 2–4:** Run → FAIL → implement → `npm test && npm run typecheck` PASS.
- [ ] **Step 5: Commit** `feat: validate and cross-check any item file, teacher as cross-checker`.

### Task 5: SQL skeletons and grouped split

**Files:** Create `src/skeleton.ts`, `test/skeleton.test.ts`

**Interfaces:**
- Produces: `sqlSkeleton(sql: string): string` — strip comments (reuse `stripComments` — export it from `src/a4h.ts`), replace `'…'`/`` `…` `` literals and numbers with `?`, lowercase, collapse whitespace, rename table aliases to `a1, a2, …` in order of appearance, drop a trailing `UP TO n ROWS [OFFSET m]` count to `UP TO ? ROWS`.
- `groupSplit(items: {id: string; skeleton: string | null; question: string}[], emb: Map<string, number[]>, valShare = 0.05, seed = 'split-1'): { train: string[]; val: string[] }` — group answerables by skeleton; unanswerables by single-link clusters of question **embedding cosine ≥ 0.80** (spec's embedding clustering; 0.80 is the plan's documented rule, recorded in the addendum written in Task 11) — takes the embeddings map from Task 6 as a parameter; assign whole groups to val by seeded hash order until ≥ `valShare` of items.

- [ ] **Step 1: Failing tests:** `same query with different constants has the same skeleton`; `different alias names have the same skeleton`; `different join has a different skeleton`; `string literals with spaces don't leak into the skeleton`; `groupSplit never splits a group`; `paraphrased unanswerables with no shared words land in one group` (fixture embeddings with cosine 0.9 for "Which pilots operate each flight?" / "List the aviators assigned to every departure"); `groupSplit val share is between 5% and 8%` on 200 synthetic items; `groupSplit is deterministic per seed`.
- [ ] **Step 2–4:** FAIL → implement → PASS (`npm test && npm run typecheck`).
- [ ] **Step 5: Commit** `feat: SQL skeletons and grouped train/val split`.

### Task 6: Decontamination and calibration

**Files:** Create `src/decontam.ts`, `scripts/decontam.ts` (subcommands `embed`, `calibrate`, `calibrate-apply`, `apply`), `test/decontam.test.ts`

**Interfaces:**
- `VOYAGE_MODEL` constant (builder picks a current Voyage text model, records id + `input_type: 'query'` in the addendum).
- `embed(texts: string[]): Promise<number[][]>` — Voyage REST via `post` (Task 2), batches of 128, cached in `train/embeddings.jsonl` keyed by `sha256(model + text)`.
- `cosine(a: number[], b: number[]): number`; `jaccard(a: string, b: string): number` (reuse the tokenizer from `nearDuplicates`, exported).
- `calibrationSample(pairs: {trainId; testId; cos}[], seed): { top: Pair[]; band: Pair[] }` — `top` = 60 highest cosine (one row per train↔test pair, best test match per train item), `band` = 20 seeded-random from ranks 61–300.
- `thresholdFrom(labelled: {cos: number; label: 'duplicate' | 'paraphrase' | 'distinct'}[], top: Pair[]): number` — min cos of duplicate/paraphrase − 0.01; if none, max cos in `top` + 0.01.
- `decontaminate(train: TrainItem[], test: TestItem[], emb: Map<string, number[]>, threshold: number): Map<id, 'jaccard' | 'cosine' | 'result' | 'train-dup'>` — rules 1–3 from the spec (result rule only when > 2 cells, trimmed sorted rows) + within-train Jaccard ≥ 0.8 keeping the first by id.
- `decontam.ts calibrate` writes `review/calibration.md` (80 pairs: train question, test question, cos) and an empty `review/calibration.jsonl` template `{trainId, testId, label: ""}`; after Kamil labels, `calibrate-apply` writes `train/threshold.json` once, prints the threshold and appends the addendum block (model id, labelled pairs file, threshold) to the spec.
- `scripts/decontam.ts apply` (threshold read from the frozen `train/threshold.json`, written once by `calibrate-apply`) marks drops (`status: 'dropped'`, `reason: 'decontam:<rule>:<testId>'`) in `train/work.jsonl` and writes `results/decontamination.md` (counts per rule, cosine histogram in 0.05 bins, 10 closest kept pairs).

- [ ] **Step 1: Failing tests:** `thresholdFrom uses lowest paraphrase minus 0.01`; `thresholdFrom with no paraphrase uses top max plus 0.01`; `decontaminate drops by each rule` (one fixture per rule); `result rule ignores single-cell results`; `within-train duplicate keeps the first id`; `calibrationSample band excludes the top 60`.
- [ ] **Step 2–4:** FAIL → implement → PASS.
- [ ] **Step 5: Commit** `feat: decontamination and threshold calibration`.

### Task 7: Human label audit

**Files:** Create `scripts/audit.ts`, `src/audit.ts`, `test/audit.test.ts`

**Interfaces:**
- `auditSample(kept: WorkItem[], n = 50, seed = 'audit-1'): WorkItem[]` — stratified by tier proportional to the mix (at least 3 per tier).
- `auditGate(labels: {id: string; correct: boolean}[]): { wrong: number; total: number; pass: boolean }` — `pass` iff `wrong ≤ 2` and `total = 50`.
- `scripts/audit.ts` writes `review/audit.md` (question, SQL, first 10 result rows) + `review/audit.jsonl` template; `--apply` prints `k/50 audited labels incorrect` and the gate.

- [ ] **Step 1: Failing tests:** `auditSample covers every tier`; `auditGate passes at 2 wrong and fails at 3`; `auditGate fails on an incomplete label file`.
- [ ] **Step 2–4:** FAIL → implement → PASS. **Step 5: Commit** `feat: human label audit sheet and gate`.

### Task 8: Shared answer prompt and training export

**Files:** Create `src/prompt.ts`, `scripts/export-train.ts`, `test/prompt.test.ts`; Modify `scripts/generate.ts` (use `src/prompt.ts`)

**Interfaces:**
- `answerPrompt(question: string, fewshot = false): string` — exactly what `generate.ts` sends today (`head + question + tail`), moved here; `generate.ts` imports it.
- `scripts/export-train.ts` (after decontam): kept = `agreed` items in `train/work.jsonl` → `train/items.jsonl` (canonical TestItem + `skeleton`, `group`), `groupSplit` → `train/train.chat.jsonl`, `train/val.chat.jsonl` (`{messages: [{role: 'user', content: answerPrompt(q)}, {role: 'assistant', content: sql ?? 'UNANSWERABLE'}]}`), `train/val.items.jsonl`; registers `val` (role `selection`) in `datasets.json` with its hash. Refuses to overwrite an existing `train/items.jsonl` unless `--force` (re-export only before training).

- [ ] **Step 1: Failing tests:** `answerPrompt matches the prompt generate.ts used for the baseline` (golden: rebuild from `prompts/answer.md` + `schema.md` for one question and compare byte-for-byte); `export puts whole groups in val`; `export writes UNANSWERABLE as the assistant answer for null SQL`; `export registers val with the file's sha256`.
- [ ] **Step 2–4:** FAIL → implement → PASS. Re-run `generate.ts --dataset test-v1 ollama --model qwen3:4b-instruct-2507-q8_0 --limit 3` into a temp dir and diff against existing answers for those ids → identical SQL (greedy decoding), proving the prompt is unchanged.
- [ ] **Step 5: Commit** `feat: shared answer prompt and training export`.

### Task 9: Pod scripts (serve, train, export)

> Revised 2026-10-21b: `pod/serve.sh` and `pod/requirements-serve.txt` removed — no self-hosted teacher.

**Files:** Create `pod/serve.sh`, `pod/train.py`, `pod/export.sh`, `pod/requirements.txt` (pinned versions), `pod/Modelfile`

**Interfaces:**
- `pod/serve.sh`: `vllm serve Qwen/Qwen3-Coder-30B-A3B-Instruct --quantization fp8 --max-model-len 16384 --host 127.0.0.1 --port 8000` — key from the injected `VLLM_API_KEY` env, bound to localhost only (reached via SSH tunnel; no proxy port exposed).
- `pod/train.py --data /workspace/train --out /workspace/out [--check-only]`:
  - **Preflight (always runs first)** with a separately configured ceiling `--max-length 4096` (not derived from the data): report max/p99 token length; then build the **trainer's own processed batches** (same collator/masking as training) and assert for every record: total length ≤ ceiling; prompt tokens all have label `-100`; supervised label tokens are non-empty and decode exactly to the assistant answer + the template's end-of-turn token; no answer contains template control tokens. Abort on any failure. `--check-only` stops here.
  - TRL `SFTTrainer` with assistant-only loss (`assistant_only_loss=True` / completion-only collator per the installed TRL version), LoRA (r 16, alpha 32, dropout 0.05, all linear layers — builder may adjust), lr 2e-4, epochs 3, eval each epoch on `val.chat.jsonl` with the same masking, save each epoch; write `out/metrics.json` (val loss per epoch, chosen epoch = lowest val loss).
- `pod/export.sh <adapter-dir>`: merge LoRA into the base → `convert_hf_to_gguf.py --outtype q8_0` → `out/abap-sql-qwen3-4b-ft.q8_0.gguf` + its sha256.
- `pod/Modelfile`: `FROM ./abap-sql-qwen3-4b-ft.q8_0.gguf` + **TEMPLATE/PARAMETER lines copied from `ollama show --modelfile qwen3:4b-instruct-2507-q8_0`** so the fine-tune runs under the baseline's template.

- [ ] **Step 1:** Write the scripts; `pod/train.py --check-only` must exit non-zero on fixtures in `pod/fixtures/`: a record longer than the 4096 ceiling, a record whose answer would be truncated, and a record with an empty answer — and exit zero on a valid sample. Run these on the Pod before Task 11's spend continues (CPU is enough; tokenizer only).
- [ ] **Step 2:** Verified on the Pod in Task 12 (no local GPU). Locally: `python3 -m py_compile pod/train.py`.
- [ ] **Step 3: Commit** `feat: pod scripts for teacher serving, LoRA training and GGUF export`.

### Task 10: Runpod runbook

**Files:** Create `docs/runbook-runpod.md`

Numbered, first-timer steps, each with what Kamil should see: add his SSH public key to Runpod; create a Pod (GPU: one 48 GB card, e.g. L40S/A6000/A40 class; template: official PyTorch; 100 GB volume; **expose SSH only, no HTTP port**; add the Pod environment secret `VLLM_API_KEY`); open the web terminal; `git clone`/upload `pod/`; `pip install -r pod/requirements.txt`; `huggingface-cli login` (Kamil types his own token); start `pod/serve.sh`; on the Mac add the same key to `~/.config/ai/secrets.env` as `ABAP_SQL_BENCH__TEACHER_API_KEY` (Kamil types it); open the tunnel `ssh -N -L 8000:localhost:8000 root@<pod-ip> -p <port>` (values from the Pod's Connect tab); health check `curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:8000/v1/models` with the key header → 200; **stop vs terminate** (stop keeps disk billing, terminate ends all billing); the training section (upload `train/*.chat.jsonl`, run `train.py --check-only`, then train, then `export.sh`); downloading `out/` to the Mac (`runpodctl send`/`receive` or `scp`); `ollama create abap-sql-qwen3-4b-ft:q8_0 -f pod/Modelfile`; terminating the Pod; recording cost in `results/costs.md`.

- [ ] **Step 1:** Write it; have a fresh reader check every command exists in the referenced tools' current docs (WebFetch Runpod/vLLM/TRL docs once). **Step 2: Commit** `docs: runpod runbook`.

### Task 11: Pilot (gate) — procedure

Prerequisite: Gate A review passed.

- [ ] Kamil sets up the OpenRouter key (runbook §0); no Pod for the pilot. Record OpenRouter spend in `results/costs.md`.
- [ ] `npm run teach -- --total 300` → `node scripts/validate.ts --items train/work.jsonl` → `node scripts/crosscheck.ts --items train/work.jsonl --via checker`; health check first with `node scripts/teacher-health.ts`.
- [ ] `node scripts/decontam.ts embed` (test + cross-checked train questions; cached by text hash) → `node scripts/decontam.ts calibrate` → **Kamil labels 80 pairs** in `review/calibration.jsonl` → `node scripts/decontam.ts calibrate-apply` (writes `train/threshold.json` once + the spec addendum).
- [ ] `node scripts/decontam.ts apply` on the pilot (reads the frozen `train/threshold.json`).
- [ ] `node scripts/pilot.ts` → per-tier funnel + yield gate (overall ≥ 40% **and** hard ≥ 25%, spec addendum 2026-10-21). Failure → prompt fix + pilot restart (below); a second failure → stop and ask Kamil.
- [ ] `node scripts/audit.ts` on the **survivors** → **Kamil labels 50** in `review/audit.jsonl` → `node scripts/audit.ts --apply` (checks the labels match the saved sample; ≥ 12 hard, ≤ 2 wrong, ≤ 1 wrong hard; too few survivors in a tier stops the pilot). Gate fails → prompt fix + pilot restart (below); a second failure → stop and ask Kamil.
- [ ] **Restart / teacher switch invalidates:** `train/` (drafts, work, embeddings of train items), `review/audit.*`; calibration labels and threshold are kept only if the restart is a prompt fix with the same teacher, otherwise recalibrated. All changes happen before full generation and are logged in the addendum.
- [ ] Commit pilot data, labels, addendum: `chore: pilot — yield X%, threshold T, audit k/50`. Stop the Pod if Kamil pauses.

### Task 12: Full generation, decontamination, export, training — procedure

- [ ] `npm run teach -- --total 4500` (pilot batches reused) → `node scripts/validate.ts --items train/work.jsonl` → `node scripts/crosscheck.ts --items train/work.jsonl --via checker` → `node scripts/decontam.ts embed` (embeds only new items) → `node scripts/decontam.ts apply` → kept count (cumulative counts in `results/decontamination.md`). < 3,000 → generate more within budget; accept ≥ 2,500; never change rules.
- [ ] `node scripts/export-train.ts` → commit `train/` + `results/decontamination.md`.
- [ ] On the Pod (runbook): upload chat files, `train.py --check-only` (PASS), train, `export.sh` on the chosen epoch, download, `ollama create`. Terminate the Pod. Cost entry.
- [ ] Model selection (training-side only): `generate.ts --dataset val ollama --model abap-sql-qwen3-4b-ft:q8_0` → `campaign.ts ft-val-1 --dataset val …` (also the baseline Qwen+fixer for context). A second training run only for a failure visible on train/val (crash, diverging val loss, broken output format on val) — log the reason in the addendum.
- [ ] Freeze: register the model in `models.json` (role `candidate`, identity = its Ollama digest), write `models/ft-v1.json` `{name: 'abap-sql-qwen3-4b-ft-q8_0', identity, gguf_sha256, frozen_at}` (registry key = sanitised Ollama tag), commit, `git tag ft-v1`.
- [ ] **Gate B:** independent review of the freeze and provenance (marker, registries, val-only selection log) before any test-role scoring.

### Task 13: Statistics and final report

**Files:** Create `src/stats.ts`, `scripts/report-ft.ts`, `test/stats.test.ts`

**Interfaces:**
- `mcnemarExact(b: number, c: number): number` — two-sided exact p = min(1, 2·P(X ≤ min(b,c))), X ~ Binomial(b+c, 0.5); `b` = baseline pass & candidate fail, `c` = the reverse.
- `seenSplit(test: TestItem[], trainSkeletons: Set<string>): Map<id, 'seen' | 'unseen' | 'unanswerable'>`.
- `terciles(values: Map<id, number>): Map<id, 1 | 2 | 3>`.
- `scripts/report-ft.ts <campaign-id> --candidate <model> --baseline <model>` writes `results/<campaign-id>/finetune-report.md`: primary result (accuracies, difference, b, c, p, verdict per the pre-registration), per-tier table, seen/unseen table per tier for candidate and baseline with improvement and **group sizes; cells < 20 marked "too small", empty cells "empty"**, improvement per tier × similarity tercile.

- [ ] **Step 1: Failing tests:** `mcnemarExact(0, 0) = 1`; `mcnemarExact(10, 0) ≈ 0.001953`; `mcnemarExact(5, 15) ≈ 0.04139`; `seenSplit marks unanswerables separately`; `report marks a 12-item cell too small` (fixture).
- [ ] **Step 2–4:** FAIL → implement → PASS.
- [ ] **Step 5:** Final campaign (write-free window): `generate.ts --dataset test-v1` for the candidate; `campaign.ts ft-final --dataset test-v1` with candidate, candidate+fixer (`derive.ts`), Qwen+fixer, Qwen zero-shot, Claude, shuffle → `report-ft.ts`. Commit `results: fine-tune final campaign`.

### Task 14: Fresh test set — procedure + small changes

**Files:** Modify `scripts/freeze.ts` (`--items <path> --out <file>`; when `--out` ≠ `testset.jsonl`, compare against the existing `fingerprint.json` instead of writing one), `scripts/draft.ts`/`review.ts`/`apply-review.ts`/`clarify.ts` (`--items`); test `test/freeze.test.ts` (`freeze to a new out file never touches testset.jsonl or fingerprint.json`).

- [ ] TDD the `--out` change (FAIL → implement → PASS → commit).
- [ ] Pipeline in `work/fresh.jsonl`: Codex drafts ~60 (mix as test set) → validate → cross-check (Codex) → clarify → screen with `decontaminate` against `train/items.jsonl` (same threshold) → Kamil reviews → `freeze --items work/fresh.jsonl --out testset-fresh-v1.jsonl` → register `fresh-v1` (role `test`).
- [ ] Score: candidate, Qwen+fixer, Claude (`generate.ts --dataset fresh-v1 claude`, ≈ $1, cost entry) → `campaign.ts ft-fresh --dataset fresh-v1 …` → append to the report. Commit and tag `testset-fresh-v1`.
