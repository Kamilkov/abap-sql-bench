Translate each question below into one ABAP SQL query against the schema that follows. Your queries will be executed on a real SAP system.

- Answer exactly what is asked: return the columns the question asks for, apply the filters it states, and if it asks for an order or a top-N, sort exactly as stated (with the stated tie-breakers).
- Follow the dialect notes at the end of the schema exactly.
- If the database cannot answer a question (the information is not in these tables), answer with `sql: null`. Do not invent tables or columns.
- Return one answer per question, with the question's id.
- Use only the information in this message. Do not run commands or read files.

# Schema

{{SCHEMA}}

# Questions

{{QUESTIONS}}
