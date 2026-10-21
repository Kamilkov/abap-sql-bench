ABAP SQL rules (each one checked on this SAP system; a query that breaks any of them fails):
- Put a blank after every opening and before every closing bracket of a function or aggregate: `SUM( b~flight_price )`, `ROUND( SUM( b~flight_price ), 2 )`, `COUNT( DISTINCT b~customer_id )`, `CONCAT_WITH_SPACE( c~first_name, c~last_name, 1 )`. Only `COUNT(*)` may be written without blanks.
- Give every table an alias with `AS` (`FROM /dmo/flight AS f`) and prefix columns with that alias and `~` (`f~carrier_id`); a column prefix must be a declared alias or the full table name, never a shortened table name.
- Every expression or aggregate in the SELECT list needs an alias (`COUNT(*) AS flights`).
- Dates are `YYYYMMDD` values: no arithmetic on dates; use `DATS_DAYS_BETWEEN( start_date, end_date )` for a number of days.
- Subqueries only in WHERE or HAVING (`WHERE f~carrier_id IN ( SELECT … )`), never in FROM; no WITH, UNION, INTO or LIMIT (use `UP TO n ROWS`); sort with `ASCENDING` / `DESCENDING`.
