# Campaign results

Each folder is one campaign (`node scripts/campaign.ts <id> answers/*.jsonl`): `items.jsonl` (one graded row per
item × model), `summary.json` (metrics plus answer-file hashes) and `summary.md` (the table). Every campaign checks the
13-table fingerprint against `fingerprint.json` before and after, and recaptures each reference result interleaved
with the model answers.

| campaign | arms | notes |
|---|---|---|
| `2026-10-20-baseline` | Claude Opus 5.5 (effort high), Qwen3-4B-Instruct-2507 q8_0 zero-shot | first baseline |
| `2026-10-20-arms` | the same two, plus the Claude shuffle control, Qwen few-shot and Qwen + 2-rule syntax fixer | superseded: its fixer arm used the first fixer (commit c5ccc2c). The answers file was regenerated since, but the graded SQL is still in `items.jsonl` |
| `2026-10-20-fixer3` | Claude, shuffle control, Qwen zero-shot, few-shot, zero-shot + fixer, few-shot + fixer (3-rule fixer) | **use this one**: all six arms ran on the same data state |

Arms:
- `claude-opus-5-5-high-shuffled` is a **grader control**, not a model. Each SQL answer is graded against the next
  SQL-answered item, and UNANSWERABLE answers stay on their own items. It passes 0 of 276 answerable items, so its
  10.4% is exactly the 32 unanswerable items. `compareResults` is not lenient, and Claude's 100% is real.
- `…-fewshot` uses the same prompt plus 6 worked examples (`prompts/fewshot.jsonl`). Claude wrote them for the
  prompt. Each one ran on A4H, and none is closer than Jaccard 0.48 to any test question.
- `…-fixed` / `…-fewshot-fixed` are Qwen's zero-shot / few-shot SQL after `src/fix.ts`, a deterministic rewrite that
  adds `AS` before table aliases, turns `alias.column` into `alias~column` and puts blanks inside aggregate brackets
  (`SUM(x)` → `SUM( x )`). Literals are untouched. `schema.md` stays frozen, so every arm sees the same prompt.

## Short dumps (ST22)

On some invalid SQL, the freestyle data-preview endpoint (`CL_ADT_DP_ABSTRACT_SQL_HANDLER`, during its row-count
rewrite `SELECT 1 AS DUMMY …`) crashes with a short dump (HTTP 500) instead of returning HTTP 400. The dumps are
mostly `STRING_LENGTH_NEGATIVE`, with an occasional `REGEX_COMPILE_ERROR`. In the first two campaigns, every dump came from
Qwen SQL that put a table alias without `AS`. Fixed SQL can still dump on other invalid shapes. The grader counts a dump as an SQL error for that answer (`runCandidate`), and
nothing is worked around. Dumps per campaign (user DEVELOPER, client 001, 2026-10-20 UTC):

| run | window (UTC) | dumps |
|---|---|---:|
| aborted first baseline attempt (before `runCandidate`) | 17:57 | 1 |
| `2026-10-20-baseline` | 17:58–18:04 | 32 |
| `2026-10-20-arms` | 18:43–18:49 | 33 |
| `2026-10-20-fixer3` | 18:57–19:05 | 40 (zero-shot 32, few-shot 1, zero-shot + fixer 3, few-shot + fixer 4) |

You can delete these 106 entries in ST22. `summary.json` has a `dumps` count per arm for future campaigns.
