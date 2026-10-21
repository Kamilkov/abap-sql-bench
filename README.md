# abap-sql-bench

A text-to-ABAP-SQL benchmark, and an attempt to fine-tune a small local model on it.

The question: can a 4B model running in Ollama on a Mac learn to turn plain-English questions into ABAP SQL,
with training data written by larger open-weight models? Every answer is graded by running it on an SAP
A4H system (the `/DMO/` flight reference model) and comparing the result rows, not the SQL text.

**Status: the fine-tuning experiment was stopped before training.** The training data failed the
pre-registered human audit (8 of 50 pairs wrong). All 8 had passed execution on A4H and an independent
cross-check by a second model from another lab, because both models made the same mistake (adding up
amounts in different currencies). The test set and the baselines stand on their own.

## Results

Baselines on the frozen test set (308 questions: 93 easy, 106 medium, 77 hard, 32 unanswerable),
% answered correctly. Campaign `results/2026-10-20-fixer3`.

| Model | Overall | Easy | Medium | Hard | Unanswerable |
|---|---:|---:|---:|---:|---:|
| Claude Opus 5.5 | 100.0 | 100.0 | 100.0 | 100.0 | 100.0 |
| Qwen3-4B-Instruct-2507 q8_0, plain | 14.6 | 16.1 | 0.0 | 0.0 | 93.8 |
| Qwen3-4B, 6 worked examples | 28.9 | 51.6 | 9.4 | 2.6 | 90.6 |
| Qwen3-4B + 3-rule syntax fixer | 52.9 | 73.1 | 50.0 | 15.6 | 93.8 |

A shuffle control (each Claude answer graded against the wrong question) passes 0 of 276 answerable items,
so the grader is not lenient.

Training-data pilots (teacher DeepSeek-V4-Pro, checker GLM-5.2, both via OpenRouter):

| Pilot | Kept | Hard kept | Outcome |
|---|---:|---:|---|
| 1 | 64/300 | 5/70 | failed the yield gate (ABAP dialect errors; checker returned the string `"sql: null"`) |
| 2, original procedure | 136/300 | 11/70 | failed the hard-yield gate |
| 2, disclosed ordering amendment | 132/300 (44.0%) | 18/70 (25.7%) | passed the yield gates, failed the human audit (8/50) |

Total API spend: $0.64. No GPU was rented.

## How it was built

- **Test set:** drafted by OpenAI Codex, every reference query run on A4H, an independent second Codex pass,
  disputes reviewed by hand, frozen with a fingerprint of the data (`testset.jsonl`, `fingerprint.json`,
  tag `testset-v1`). Claude never wrote or judged test items.
- **Grading:** `src/compare.ts` compares result rows (injective column mapping, multiset of rows,
  type-aware normalisation). Short dumps on invalid SQL count as SQL errors.
- **Training-data pipeline:** teacher drafts → execution on A4H → blind cross-check → decontamination
  against the test set (Jaccard, embedding cosine with a hand-calibrated threshold, identical results) →
  ordering judgment → human audit. Gates were written down before any paid call; every change after a
  failure is a dated addendum in `docs/superpowers/specs/2026-10-20-training-data-finetune-design.md`.
- **Evidence:** both failed pilots are archived in `train/archive/`, every API call (model, provider,
  usage, cost) is in `train/teacher-calls.jsonl`, and the audit labels are in `review/audit.jsonl`.

## Layout

| Path | What |
|---|---|
| `testset.jsonl`, `fingerprint.json`, `schema.md` | the frozen test set, its data fingerprint, the schema the models see |
| `src/`, `scripts/`, `test/` | TypeScript pipeline (Node 26, `node:test`) |
| `prompts/` | every prompt and JSON schema used |
| `answers/`, `results/` | model answers and graded campaigns |
| `train/`, `review/` | training-data pilots, calibration and audit labels |
| `pod/`, `docs/runbook-runpod.md` | LoRA training and GGUF export scripts (written, reviewed, never run) |
| `docs/superpowers/` | design specs and implementation plans |

## Running it

You need your own SAP A4H system with the `/DMO/` flight model, reachable at `http://localhost:50000`
(an SSH tunnel), and credentials in `.env` (`SAP_USER`, `SAP_PASSWORD`). Then:

```bash
npm install
npm test
npm run typecheck
npm run campaign -- <campaign-id> --dataset test-v1 answers/test-v1/*.jsonl
```

Results depend on the data in your system: a campaign checks the data fingerprint against `fingerprint.json`
before and after the run.

## Licence

MIT, see `LICENSE`.
