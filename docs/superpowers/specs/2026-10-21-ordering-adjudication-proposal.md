# Proposal — ordering adjudication (NOT ADOPTED — superseded by spec addendum 2026-10-21h)

> Not adopted: the teacher flag acted as a deciding vote, so automated yield could not exceed the original
> result, and pilot-only human adjudication would have qualified a pipeline the full run does not use.

**Context.** Pilot 2 failed under the original procedure (spec addendum 2026-10-21g). The teacher's
`ordered` flag is unreliable (true on 140/180 pairs), and the cross-check compares row order whenever the flag
is set. This amendment corrects ordering **metadata** only. It is introduced after inspecting failures and
is not a continuation of the exhausted restart allowance.

## Procedure

1. **Independent ordering judgment from the question alone.**
   - The judge sees only `{id, question}`: never either SQL answer, execution results, the teacher's flag or
     any pass/fail status.
   - The judge is GLM-5.2, the checker model, with a separate prompt `prompts/order.md`, the same pinned
     OpenRouter/DeepInfra settings and the same live compliance checks.
   - It returns `ordered`, `unordered` or `ambiguous`, plus `evidence`: the wording that decides it,
     e.g. "cheapest first", "top 5", or none.
   - The prompt states: top-N, ranking and "X first" requests are `ordered`. A request for an order with
     no clear tie-breaker where ties are possible is `ambiguous`.
2. **Decision rule. Two independent "yes" or two independent "no", nothing else:**

   | Teacher flag | Judge | Final |
   |---|---|---|
   | true | `ordered` | ordered |
   | false | `unordered` | unordered |
   | any other combination, or `ambiguous` | — | **unresolved** |

   Unresolved pairs are never turned into `unordered`. They are excluded from training and validation
   (`dropped`, reason `ordering:unresolved`) unless Kamil adjudicates them (step 5).
3. **Applied to every pilot-2 pair, not just the disputes.** That covers all 180 answerable validated pairs,
   including those already agreed (an agreed pair can become unresolved). Unanswerables have no order.
4. **Reuses the existing SQL and execution results.**
   - No SQL is regenerated and no query is re-executed.
   - The comparison between the teacher's result and the checker's stored result is recomputed locally
     with the final flag.
   - Every item keeps `ordered_teacher` (original), `ordered_judge {verdict, evidence, by}`,
     `ordered_final` and `ordered_reason` (`two-yes`, `two-no`, `unresolved: …`, `kamil: …`).
   - The original statuses stay in the pilot-2 snapshot.
5. **Kamil adjudication (optional, pilot only).**
   - Kamil may resolve unresolved pairs from a sheet that shows the question, both judgments and the
     evidence wording. He sees no SQL and no results.
   - He chooses ordered, unordered or drop. A drop is required where an order is asked but tie-breaking
     is ambiguous.
   - For the full run, where unresolved pairs could reach hundreds, they are simply excluded.
6. **Unchanged:**
   - overall yield ≥ 40% and hard ≥ 25% after decontamination, with unresolved pairs counted as losses;
   - decontamination and the frozen threshold;
   - the 50-pair audit (≥ 12 hard, ≤ 2 wrong, ≤ 1 wrong hard). The audit sheet will also show each
     pair's final ordering decision and its evidence, so Kamil's audit covers the flag too.
7. **Reporting.**
   - The pilot report shows pilot 2 under the original procedure (failed) next to the amended procedure,
     with per-tier counts for two-yes, two-no, unresolved and Kamil-resolved.
   - The article discloses the amendment and that it came after the failure.

## Cost and effort
- About 180 questions to judge in batches of 20, roughly $0.02.
- Kamil: an optional unresolved-pair sheet in the pilot; the size is unknown until the judge runs.

## Not part of this proposal
The AND rule (disagreement → unordered) and any change to the hard share or to the gates.
