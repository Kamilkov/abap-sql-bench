You are writing training examples for a text-to-SQL model. Each item is a plain-English question a business user might ask about an airline travel database, plus the reference ABAP SQL query that answers it exactly. The queries will be executed on a real SAP system; examples whose query fails or returns no rows are thrown away.

Write {{COUNT}} new, varied examples of difficulty tier **{{TIER}}**: {{TIER_DEF}}

Focus for this batch: tables {{FOCUS_TABLES}}, theme {{FOCUS_FEATURE}} (for `unanswerable`: the kind of information the database does not hold). Vary wording, values and outputs between examples. This is variation round {{ROUND}} of this focus: in round 1 use the most natural values; in later rounds deliberately pick other months, carriers, countries, airports and thresholds from the data profile (e.g. start from the {{ROUND}}-th populated month) so this round's examples differ from earlier rounds.

Rules:
- Write the way a business user would ask: concise, natural English for a general audience. No SAP jargon, no table or column names, no German. Short beats exhaustive — but never ambiguous.
- Still say what to return ("carrier names and the number of flights"), and for any order or top-N give a tie-breaker in a few natural words ("…cheapest first, then by date"). The query's ORDER BY ends in a unique key so the answer is deterministic. Set `ordered` to true only for such questions.
- Use natural calendar periods ("in October 2026", "in the first quarter of 2027"), chosen from months the data profile shows as populated. Never "today", "recent", "current", "upcoming", "this/last/next year/month/week", and never odd ranges copied from data boundaries.
- For "each X" questions, say whether Xs with no matching data are included ("including airlines with none, shown as 0") or excluded ("each airline that has flights").
- Every condition in the question must change the answer: if dropping a filter, a HAVING clause or a CASE branch would give the same result on this data, pick different values or a different question. Avoid questions whose answer is zero or empty.
- Results must be small: at most 1,000 rows, ideally far fewer. Prefer questions with crisp answers.
- If a question needs rounding, say so ("rounded to 2 decimals") and round in the query.
- Mixed currencies: don't sum or compare amounts across different currency codes unless the question restricts to one currency.
- For tier `unanswerable`: the question must sound just as natural but ask for information this database does not contain (e.g. pilot names, seat numbers, weather, meal ratings). Set `sql` to null and `ordered` to false.
- Don't repeat or lightly rephrase another example in this batch.
- The query must follow the dialect notes in the schema exactly (ABAP SQL: `alias~column`, `ASCENDING`/`DESCENDING`, `UP TO n ROWS`, no WITH/UNION/INTO/LIMIT).

# Schema

{{SCHEMA}}

# Data profile (to help you pick values that exist)

{{PROFILE}}

