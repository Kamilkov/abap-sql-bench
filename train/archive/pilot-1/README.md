# Pilot 1 — failed gate (2026-10-21)

Teacher DeepSeek-V4-Pro-0813, checker GLM-5.2, both via OpenRouter/DeepInfra, at commit in `costs.json`.
64/300 agreed (21%; hard 5/70) before decontamination → yield gate failed. Causes: ABAP dialect errors in
both models' SQL (alias without AS, missing blanks in function brackets, undeclared aliases, FROM
subqueries, date arithmetic; 57 teacher rejections were short dumps, which can also hide semantic errors)
and the checker returning the literal string "sql: null" for unanswerable questions (28/30 disputed).
Kept as evidence for the single permitted restart (spec addendum 2026-10-21f). Files: `work.jsonl` (all
items with statuses and errors), `drafts/` (raw teacher batches incl. prompts), `teach.log`, `prompts/`
(prompt and schema files used), `status.txt`, `costs.json`; per-call records stay in `train/teacher-calls.jsonl`.
