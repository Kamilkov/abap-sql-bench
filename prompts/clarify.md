Below are questions from a text-to-SQL benchmark, each with the reference ABAP SQL that defines its correct answer.

Some questions say "each X" / "every X" (airline, agency, customer, airport, route, add-on…) without saying whether Xs that have no matching data are part of the answer. Two careful readers could then write different, equally reasonable queries.

For each question:
- If it is already unambiguous on this point, return it **exactly unchanged**.
- If the reference SQL only returns Xs that have matching data (inner join, or grouping on the data table), add a short phrase that says so, e.g. "each airline **that has flights in October 2026**".
- If the reference SQL returns every X including those without data, add e.g. "**including airlines with none (shown as 0)**".
- Change nothing else: keep all other wording, outputs, ordering and tie-breakers identical. The clarified question must be answered exactly by the reference SQL.

# Questions

{{ITEMS}}
