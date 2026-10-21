For each question below, decide from its wording alone whether the person asks for the result rows in a specific order.

- `ordered`: the question asks to sort or rank the rows ("cheapest first", "sorted by date", "in order of …"), or asks for a top/bottom N or a ranking, and says how to order them.
- `unordered`: the question asks for a set of rows, a count, a total or a single value, and says nothing about the order of the rows.
- `ambiguous`: the question seems to want an order but leaves it unclear — e.g. which direction, or how to order rows that tie when ties are possible.

For `evidence`, copy the exact words from the question that decide it (an empty string if nothing in the question mentions an order).
Return one answer per question, with the question's id. Judge only the wording; do not imagine any data or query.

# Questions

{{QUESTIONS}}
