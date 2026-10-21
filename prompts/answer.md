Translate the question at the end into one ABAP SQL query against the schema that follows. The query will be executed on a real SAP system.

- Answer exactly what is asked: return the columns the question asks for, apply the filters it states, and if it asks for an order or a top-N, sort exactly as stated (with the stated tie-breakers).
- Follow the dialect notes at the end of the schema exactly.
- If the database cannot answer the question (the information is not in these tables), reply with exactly `UNANSWERABLE`. Do not invent tables or columns.
- Reply with the query only (or `UNANSWERABLE`): no explanation, no markdown.

# Schema

{{SCHEMA}}

# Question

{{QUESTION}}
