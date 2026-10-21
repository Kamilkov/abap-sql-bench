# Label audit — does the SQL/result answer the question? (50 pairs)

## 1. t-b0019-02 · easy

**Show the names and cities of agencies in France, ordered by name.**

```sql
SELECT a~name, a~city FROM /dmo/agency AS a WHERE a~country_code = 'FR' ORDER BY a~name ASCENDING, a~agency_id ASCENDING
```

Order matters: yes (two-ordered) — deepseek: "ordered by name" · z-ai: "ordered by name"

| NAME | CITY |
|---|---|
| Hitchhiker | Issy-les-Moulineaux |

## 2. t-b0002-06 · easy

**What is the total number of occupied seats on flights in February 2027?**

```sql
SELECT SUM( f~seats_occupied ) AS total_occupied_seats FROM /dmo/flight AS f WHERE f~flight_date BETWEEN '20270201' AND '20270228'
```

Order matters: no (two-unordered) — deepseek: "" · z-ai: ""

| TOTAL_OCCUPIED_SEATS |
|---|
| 475659 |

## 3. t-b0025-05 · easy

**For each customer who has bookings in September 2026, show the customer ID and the number of bookings, ordered by number of bookings descending, then by customer ID ascending.**

Teacher SQL (raw):

```sql
SELECT b~customer_id, COUNT(*) AS bookings
FROM /dmo/booking AS b
WHERE b~booking_date >= '20260901' AND b~booking_date <= '20260930'
GROUP BY b~customer_id
ORDER BY bookings DESCENDING, b~customer_id ASCENDING
```

Label (after the frozen fixer):

```sql
SELECT b~customer_id, COUNT( * ) AS bookings
FROM /dmo/booking AS b
WHERE b~booking_date >= '20260901' AND b~booking_date <= '20260930'
GROUP BY b~customer_id
ORDER BY bookings DESCENDING, b~customer_id ASCENDING
```

Order matters: yes (two-ordered) — deepseek: "ordered by number of bookings descending, then by customer ID ascending." · z-ai: "ordered by number of bookings descending, then by customer ID ascending"

| CUSTOMER_ID | BOOKINGS |
|---|---|
| 000321 | 10 |
| 000498 | 8 |
| 000236 | 6 |
| 000280 | 6 |
| 000303 | 6 |
| 000457 | 6 |
| 000485 | 6 |
| 000599 | 6 |
| 000686 | 6 |
| 000726 | 6 |

## 4. t-b0012-03 · easy

**How many carriers are there in the carrier table?**

Teacher SQL (raw):

```sql
SELECT COUNT(*) AS carrier_count
FROM /dmo/carrier AS c
```

Label (after the frozen fixer):

```sql
SELECT COUNT( * ) AS carrier_count
FROM /dmo/carrier AS c
```

Order matters: no (two-unordered) — deepseek: "" · z-ai: ""

| CARRIER_COUNT |
|---|
| 21 |

## 5. t-b0005-06 · easy

**Count the number of customers in Canada.**

Teacher SQL (raw):

```sql
SELECT COUNT(*) AS customer_count FROM /dmo/customer AS c WHERE c~country_code = 'CA'
```

Label (after the frozen fixer):

```sql
SELECT COUNT( * ) AS customer_count FROM /dmo/customer AS c WHERE c~country_code = 'CA'
```

Order matters: no (two-unordered) — deepseek: "" · z-ai: ""

| CUSTOMER_COUNT |
|---|
| 0 |

## 6. t-b0022-01 · easy

**How many trips have the status 'Booked'?**

```sql
SELECT COUNT( * ) AS number_of_trips FROM /dmo/travel AS t WHERE t~status = 'B'
```

Order matters: no (two-unordered) — deepseek: "" · z-ai: ""

| NUMBER_OF_TRIPS |
|---|
| 1313 |

## 7. t-b0019-04 · easy

**List the agency name, city, and phone number for agencies in Italy.**

```sql
SELECT a~name, a~city, a~phone_number FROM /dmo/agency AS a WHERE a~country_code = 'IT' ORDER BY a~city ASCENDING, a~agency_id ASCENDING
```

Order matters: no (two-unordered) — deepseek: "" · z-ai: ""

| NAME | CITY | PHONE_NUMBER |
|---|---|---|
| Bella Italia | Roma | +39 6 893546721 |

## 8. t-b0025-07 · easy

**List the distinct carriers that have bookings with a flight date in October 2026, ordered by carrier ID ascending.**

```sql
SELECT DISTINCT b~carrier_id
FROM /dmo/booking AS b
WHERE b~flight_date >= '20261001' AND b~flight_date <= '20261031'
ORDER BY b~carrier_id ASCENDING
```

Order matters: yes (two-ordered) — deepseek: "ordered by carrier ID ascending." · z-ai: "ordered by carrier ID ascending"

| CARRIER_ID |
|---|
| AA |
| AS |
| B6 |
| DE |
| DL |
| JL |
| LH |
| NQ |
| SQ |
| TR |

## 9. t-b0009-03 · easy

**Which airports are located in London?**

```sql
SELECT a~airport_id, a~name FROM /dmo/airport AS a WHERE a~city = 'London' ORDER BY a~airport_id ASCENDING
```

Order matters: no (two-unordered) — deepseek: "" · z-ai: ""

| AIRPORT_ID | NAME |
|---|---|
| LCY | London City Airport |
| LGW | Gatwick Airport |
| LHR | Heathrow Airport |

## 10. t-b0012-01 · easy

**Which carriers use euros? Return carrier ID and name, sorted by carrier ID.**

```sql
SELECT c~carrier_id AS carrier_id, c~name AS carrier_name
FROM /dmo/carrier AS c
WHERE c~currency_code = 'EUR'
ORDER BY c~carrier_id ASCENDING
```

Order matters: yes (two-ordered) — deepseek: "sorted by carrier ID" · z-ai: "sorted by carrier ID."

| CARRIER_ID | CARRIER_NAME |
|---|---|
| AF | Air France |
| AZ | Alitalia Societa Aerea Italiana S.p.A. |
| DE | Condor |
| LH | Deutsche Lufthansa AG |
| NG | AL-Naser Wings |

## 11. t-b0025-06 · easy

**How many bookings were made for flights departing in February 2027?**

Teacher SQL (raw):

```sql
SELECT COUNT(*) AS bookings
FROM /dmo/booking AS b
WHERE b~flight_date >= '20270201' AND b~flight_date <= '20270228'
```

Label (after the frozen fixer):

```sql
SELECT COUNT( * ) AS bookings
FROM /dmo/booking AS b
WHERE b~flight_date >= '20270201' AND b~flight_date <= '20270228'
```

Order matters: no (two-unordered) — deepseek: "" · z-ai: ""

| BOOKINGS |
|---|
| 587 |

## 12. t-b0017-03 · medium

**How many trips with a booking fee greater than 50 are there per status? Show the status text and the count.**

Teacher SQL (raw):

```sql
SELECT s~text AS status_text, COUNT(*) AS trips FROM /dmo/travel AS t INNER JOIN /dmo/trvl_stat_t AS s ON s~travel_status = t~status AND s~language = 'E' WHERE t~booking_fee > 50 GROUP BY s~text ORDER BY s~text ASCENDING
```

Label (after the frozen fixer):

```sql
SELECT s~text AS status_text, COUNT( * ) AS trips FROM /dmo/travel AS t INNER JOIN /dmo/trvl_stat_t AS s ON s~travel_status = t~status AND s~language = 'E' WHERE t~booking_fee > 50 GROUP BY s~text ORDER BY s~text ASCENDING
```

Order matters: no (two-unordered) — deepseek: "" · z-ai: ""

| STATUS_TEXT | TRIPS |
|---|---|
| Booked | 131 |
| New | 223 |
| Planned | 133 |

## 13. t-b0008-02 · medium

**Which agencies arranged trips for customers from Germany in December 2026? Show the agency name and the number of distinct customers, highest number first, then by agency name.**

```sql
SELECT a~name AS agency_name, COUNT( DISTINCT t~customer_id ) AS customers FROM /dmo/travel AS t INNER JOIN /dmo/agency AS a ON t~agency_id = a~agency_id INNER JOIN /dmo/customer AS c ON t~customer_id = c~customer_id WHERE t~begin_date BETWEEN '20261201' AND '20261231' AND c~country_code = 'DE' GROUP BY a~name ORDER BY customers DESCENDING, a~name ASCENDING
```

Order matters: yes (two-ordered) — deepseek: "highest number first, then by agency name" · z-ai: "highest number first, then by agency name"

| AGENCY_NAME | CUSTOMERS |
|---|---|
| Fly High | 9 |
| Maxitrip | 9 |
| Intertravel | 5 |
| Kangeroos | 5 |
| Not Only By Bike | 5 |
| Trans World Travel | 5 |
| All British Air Planes | 4 |
| Burns Nuclear | 4 |
| Fly Now, Pay Later | 4 |
| Hendrik's | 4 |

## 14. t-b0028-00 · medium

**In October 2026, how many distinct customers did each carrier carry? Show the carrier name and the number of distinct customers, ordered by most distinct customers first, then by carrier name.**

```sql
SELECT c~name AS carrier_name,
       COUNT( DISTINCT b~customer_id ) AS distinct_customers
FROM /dmo/booking AS b
INNER JOIN /dmo/carrier AS c ON c~carrier_id = b~carrier_id
WHERE b~flight_date BETWEEN '20261001' AND '20261031'
GROUP BY c~name
ORDER BY distinct_customers DESCENDING, c~name ASCENDING
```

Order matters: yes (two-ordered) — deepseek: "ordered by most distinct customers first, then by carrier name." · z-ai: "ordered by most distinct customers first, then by carrier name"

| CARRIER_NAME | DISTINCT_CUSTOMERS |
|---|---|
| American Airlines Inc. | 71 |
| United Airlines, Inc. | 62 |
| Delta Air Lines, Inc. | 55 |
| JetBlue | 34 |
| Alaska Airlines | 33 |
| Condor | 30 |
| Deutsche Lufthansa AG | 28 |
| Singapore Airlines Limited | 27 |
| Japan Airlines Co., Ltd. | 7 |
| Scoot | 7 |

## 15. t-b0017-09 · medium

**What is the total booking fee for each status for trips that started in the first quarter of 2027? Show the status text and the total fee, rounded to 2 decimals.**

```sql
SELECT s~text AS status_text, ROUND( SUM( t~booking_fee ), 2 ) AS total_booking_fee FROM /dmo/travel AS t INNER JOIN /dmo/trvl_stat_t AS s ON s~travel_status = t~status AND s~language = 'E' WHERE t~begin_date BETWEEN '20270101' AND '20270331' GROUP BY s~text ORDER BY s~text ASCENDING
```

Order matters: no (two-unordered) — deepseek: "" · z-ai: ""

| STATUS_TEXT | TOTAL_BOOKING_FEE |
|---|---|
| Booked | 3570.00 |
| New | 5940.00 |
| Planned | 3580.00 |

## 16. t-b0024-02 · medium

**For each carrier, show the carrier name and the total number of flights in the first quarter of 2027, including carriers with none shown as 0.**

```sql
SELECT c~name AS carrier_name, COUNT( f~carrier_id ) AS flights FROM /dmo/carrier AS c LEFT OUTER JOIN /dmo/flight AS f ON c~carrier_id = f~carrier_id AND f~flight_date BETWEEN '20270101' AND '20270331' GROUP BY c~carrier_id, c~name ORDER BY c~name ASCENDING
```

Order matters: no (two-unordered) — deepseek: "" · z-ai: ""

| CARRIER_NAME | FLIGHTS |
|---|---|
| AL-Naser Wings | 0 |
| Air Canada | 0 |
| Air France | 0 |
| Air Japan | 240 |
| Air Pacific Limited t/a Fiji Airway | 0 |
| Alaska Airlines | 480 |
| Alitalia Societa Aerea Italiana S.p.A. | 0 |
| American Airlines Inc. | 1620 |
| British Airways p.l.c. | 0 |
| Cobaltair Ltd. dba Cobalt | 0 |

## 17. t-b0001-07 · medium

**For each carrier, what is the total number of seats occupied on all their flights in September 2026? Show carriers with no occupied seats as 0.**

```sql
SELECT c~name AS carrier_name, SUM( f~seats_occupied ) AS total_occupied_seats FROM /dmo/carrier AS c LEFT OUTER JOIN /dmo/flight AS f ON c~carrier_id = f~carrier_id AND f~flight_date BETWEEN '20260901' AND '20260930' GROUP BY c~carrier_id, c~name ORDER BY c~name ASCENDING
```

Order matters: no (two-unordered) — deepseek: "" · z-ai: ""

| CARRIER_NAME | TOTAL_OCCUPIED_SEATS |
|---|---|
| AL-Naser Wings | 0 |
| Air Canada | 0 |
| Air France | 0 |
| Air Japan | 19529 |
| Air Pacific Limited t/a Fiji Airway | 0 |
| Alaska Airlines | 25749 |
| Alitalia Societa Aerea Italiana S.p.A. | 0 |
| American Airlines Inc. | 86438 |
| British Airways p.l.c. | 0 |
| Cobaltair Ltd. dba Cobalt | 0 |

## 18. t-b0021-00 · medium

**How many flights did each carrier operate from Frankfurt to New York in October 2026? Include carriers with none, shown as 0.**

```sql
SELECT c~name AS carrier_name, COUNT( f~flight_date ) AS flights FROM /dmo/carrier AS c LEFT OUTER JOIN /dmo/connection AS co ON c~carrier_id = co~carrier_id AND co~airport_from_id = 'FRA' AND co~airport_to_id = 'JFK' LEFT OUTER JOIN /dmo/flight AS f ON co~carrier_id = f~carrier_id AND co~connection_id = f~connection_id AND f~flight_date BETWEEN '20261001' AND '20261031' GROUP BY c~name ORDER BY c~name ASCENDING
```

Order matters: no (two-unordered) — deepseek: "" · z-ai: ""

| CARRIER_NAME | FLIGHTS |
|---|---|
| AL-Naser Wings | 0 |
| Air Canada | 0 |
| Air France | 0 |
| Air Japan | 0 |
| Air Pacific Limited t/a Fiji Airway | 0 |
| Alaska Airlines | 0 |
| Alitalia Societa Aerea Italiana S.p.A. | 0 |
| American Airlines Inc. | 0 |
| British Airways p.l.c. | 0 |
| Cobaltair Ltd. dba Cobalt | 0 |

## 19. t-b0030-09 · medium

**What is the average number of empty seats per flight for each carrier in March 2027? Show carriers with at least one flight only, ordered by carrier name.**

```sql
SELECT c~name AS carrier_name, AVG( f~seats_max - f~seats_occupied ) AS avg_empty_seats FROM /dmo/flight AS f INNER JOIN /dmo/carrier AS c ON f~carrier_id = c~carrier_id WHERE f~flight_date BETWEEN '20270301' AND '20270331' GROUP BY c~name ORDER BY c~name ASCENDING
```

Order matters: yes (two-ordered) — deepseek: "ordered by carrier name" · z-ai: "ordered by carrier name."

| CARRIER_NAME | AVG_EMPTY_SEATS |
|---|---|
| Air Japan | 9.2000000000000000E+01 |
| Alaska Airlines | 6.3375000000000000E+01 |
| American Airlines Inc. | 5.7296296296296298E+01 |
| Condor | 1.1225000000000000E+02 |
| Delta Air Lines, Inc. | 7.1733333333333334E+01 |
| Deutsche Lufthansa AG | 1.3512500000000000E+02 |
| Japan Airlines Co., Ltd. | 7.5000000000000000E+01 |
| JetBlue | 6.7833333333333329E+01 |
| Scoot | 1.1500000000000000E+02 |
| Singapore Airlines Limited | 9.9299999999999997E+01 |

## 20. t-b0010-00 · medium

**Which airports does Delta fly out of in October 2026? Give me the city and airport name.**

```sql
SELECT DISTINCT a~city AS city, a~name AS airport_name FROM /dmo/connection AS c INNER JOIN /dmo/airport AS a ON c~airport_from_id = a~airport_id WHERE c~carrier_id = 'DL' AND c~connection_id IN ( SELECT f~connection_id FROM /dmo/flight AS f WHERE f~carrier_id = 'DL' AND f~flight_date BETWEEN '20261001' AND '20261031' ) ORDER BY a~city ASCENDING, a~name ASCENDING
```

Order matters: no (two-unordered) — deepseek: "" · z-ai: ""

| CITY | AIRPORT_NAME |
|---|---|
| Frankfurt/Main | Frankfurt Airport |
| Havana | José Martí International Airport |
| Miami, Florida | Miami International Airport |
| New York City, New York | John F. Kennedy International Airport |
| San Francisco, California | San Francisco International Airport |

## 21. t-b0028-04 · medium

**For each carrier with more than 20 distinct customers in December 2026, list the carrier name and the distinct customer count. Order by carrier name.**

```sql
SELECT c~name AS carrier_name,
       COUNT( DISTINCT b~customer_id ) AS distinct_customers
FROM /dmo/booking AS b
INNER JOIN /dmo/carrier AS c ON c~carrier_id = b~carrier_id
WHERE b~flight_date BETWEEN '20261201' AND '20261231'
GROUP BY c~name
HAVING COUNT( DISTINCT b~customer_id ) > 20
ORDER BY c~name ASCENDING
```

Order matters: yes (two-ordered) — deepseek: "Order by carrier name" · z-ai: "Order by carrier name."

| CARRIER_NAME | DISTINCT_CUSTOMERS |
|---|---|
| Alaska Airlines | 32 |
| American Airlines Inc. | 82 |
| Delta Air Lines, Inc. | 67 |
| Deutsche Lufthansa AG | 42 |
| JetBlue | 37 |
| Singapore Airlines Limited | 37 |
| United Airlines, Inc. | 79 |

## 22. t-b0008-07 · medium

**For each agency, show the agency name and the number of distinct customers they served in September 2026, only for agencies that served at least 2 customers. Order by number of customers descending, then by agency name.**

```sql
SELECT a~name AS agency_name, COUNT( DISTINCT t~customer_id ) AS customers FROM /dmo/travel AS t INNER JOIN /dmo/agency AS a ON t~agency_id = a~agency_id WHERE t~begin_date BETWEEN '20260901' AND '20260930' GROUP BY a~name HAVING COUNT( DISTINCT t~customer_id ) >= 2 ORDER BY customers DESCENDING, a~name ASCENDING
```

Order matters: yes (two-ordered) — deepseek: "Order by number of customers descending, then by agency name" · z-ai: "Order by number of customers descending, then by agency name"

| AGENCY_NAME | CUSTOMERS |
|---|---|
| Kangeroos | 6 |
| Fly Now, Pay Later | 5 |
| Happy Holiday | 5 |
| Maxitrip | 5 |
| The Ultimate Answer | 5 |
| Up 'n' Away | 5 |
|  | 4 |
| Cap Travels Ltd. | 4 |
| Flights and More | 4 |
| Fly & Smile | 4 |

## 23. t-b0024-05 · medium

**Which carriers had more than 100 flights in October 2026? Return the carrier names and the number of flights.**

```sql
SELECT c~name AS carrier_name, COUNT( f~carrier_id ) AS flights FROM /dmo/carrier AS c INNER JOIN /dmo/flight AS f ON c~carrier_id = f~carrier_id WHERE f~flight_date BETWEEN '20261001' AND '20261031' GROUP BY c~carrier_id, c~name HAVING COUNT( f~carrier_id ) > 100 ORDER BY flights DESCENDING, c~name ASCENDING
```

Order matters: no (two-unordered) — deepseek: "" · z-ai: ""

| CARRIER_NAME | FLIGHTS |
|---|---|
| American Airlines Inc. | 837 |
| United Airlines, Inc. | 620 |
| Delta Air Lines, Inc. | 465 |
| JetBlue | 372 |
| Singapore Airlines Limited | 310 |
| Alaska Airlines | 248 |
| Deutsche Lufthansa AG | 248 |
| Air Japan | 124 |
| Condor | 124 |
| Japan Airlines Co., Ltd. | 124 |

## 24. t-b0030-08 · medium

**What is the total number of seats occupied on flights departing from Frankfurt in October 2026?**

```sql
SELECT SUM( f~seats_occupied ) AS occupied_seats FROM /dmo/flight AS f INNER JOIN /dmo/connection AS con ON f~carrier_id = con~carrier_id AND f~connection_id = con~connection_id INNER JOIN /dmo/airport AS a ON con~airport_from_id = a~airport_id WHERE a~city = 'Frankfurt/Main' AND f~flight_date BETWEEN '20261001' AND '20261031'
```

Order matters: no (two-unordered) — deepseek: "" · z-ai: ""

| OCCUPIED_SEATS |
|---|
| 75312 |

## 25. t-b0024-01 · medium

**Which carriers had no flights at all in September 2026? Return the carrier names.**

```sql
SELECT c~name AS carrier_name FROM /dmo/carrier AS c LEFT OUTER JOIN /dmo/flight AS f ON c~carrier_id = f~carrier_id AND f~flight_date BETWEEN '20260901' AND '20260930' GROUP BY c~carrier_id, c~name HAVING COUNT( f~carrier_id ) = 0 ORDER BY c~name ASCENDING
```

Order matters: no (two-unordered) — deepseek: "" · z-ai: ""

| CARRIER_NAME |
|---|
| AL-Naser Wings |
| Air Canada |
| Air France |
| Air Pacific Limited t/a Fiji Airway |
| Alitalia Societa Aerea Italiana S.p.A. |
| British Airways p.l.c. |
| Cobaltair Ltd. dba Cobalt |
| Qantas Airways Ltd. |
| South African Airways |
| Sundair GmbH |

## 26. t-b0017-02 · medium

**What is the total booking fee for trips in each status? Show the status text and the total fee, rounded to 2 decimals.**

```sql
SELECT s~text AS status_text, ROUND( SUM( t~booking_fee ), 2 ) AS total_booking_fee FROM /dmo/travel AS t INNER JOIN /dmo/trvl_stat_t AS s ON s~travel_status = t~status AND s~language = 'E' GROUP BY s~text ORDER BY s~text ASCENDING
```

Order matters: no (two-unordered) — deepseek: "" · z-ai: ""

| STATUS_TEXT | TOTAL_BOOKING_FEE |
|---|---|
| Booked | 34130.00 |
| New | 62730.00 |
| Planned | 34560.00 |

## 27. t-b0020-01 · medium

**Which carriers have more than 50 bookings for flights in November 2026? Show carrier names and the number of bookings.**

Teacher SQL (raw):

```sql
SELECT c~name AS carrier_name, COUNT(*) AS bookings FROM /dmo/booking AS b INNER JOIN /dmo/carrier AS c ON b~carrier_id = c~carrier_id WHERE b~flight_date BETWEEN '20261101' AND '20261130' GROUP BY c~name HAVING COUNT(*) > 50 ORDER BY c~name ASCENDING
```

Label (after the frozen fixer):

```sql
SELECT c~name AS carrier_name, COUNT( * ) AS bookings FROM /dmo/booking AS b INNER JOIN /dmo/carrier AS c ON b~carrier_id = c~carrier_id WHERE b~flight_date BETWEEN '20261101' AND '20261130' GROUP BY c~name HAVING COUNT( * ) > 50 ORDER BY c~name ASCENDING
```

Order matters: no (two-unordered) — deepseek: "" · z-ai: ""

| CARRIER_NAME | BOOKINGS |
|---|---|
| American Airlines Inc. | 136 |
| Delta Air Lines, Inc. | 103 |
| JetBlue | 67 |
| Singapore Airlines Limited | 65 |
| United Airlines, Inc. | 119 |

## 28. t-b0023-02 · hard

**Show the carrier names and the number of flights for the two carriers with the most flights in January 2027. Sort by number of flights descending, then by carrier name.**

Teacher SQL (raw):

```sql
SELECT c~name AS carrier_name, COUNT(*) AS n_flights FROM /dmo/flight AS f INNER JOIN /dmo/carrier AS c ON c~carrier_id = f~carrier_id WHERE f~flight_date BETWEEN '20270101' AND '20270131' GROUP BY c~name, f~carrier_id ORDER BY n_flights DESCENDING, carrier_name ASCENDING UP TO 2 ROWS
```

Label (after the frozen fixer):

```sql
SELECT c~name AS carrier_name, COUNT( * ) AS n_flights FROM /dmo/flight AS f INNER JOIN /dmo/carrier AS c ON c~carrier_id = f~carrier_id WHERE f~flight_date BETWEEN '20270101' AND '20270131' GROUP BY c~name, f~carrier_id ORDER BY n_flights DESCENDING, carrier_name ASCENDING UP TO 2 ROWS
```

Order matters: yes (two-ordered) — deepseek: "Sort by number of flights descending, then by carrier name" · z-ai: "Sort by number of flights descending, then by carrier name"

| CARRIER_NAME | N_FLIGHTS |
|---|---|
| American Airlines Inc. | 837 |
| United Airlines, Inc. | 620 |

## 29. t-b0027-07 · hard

**Which customers have total EUR booking value over 2000 EUR? Show customer ID, last name, and total.**

```sql
SELECT b~customer_id AS customer_id, cu~last_name AS last_name, SUM( b~flight_price ) AS total_eur FROM /dmo/booking AS b INNER JOIN /dmo/customer AS cu ON b~customer_id = cu~customer_id WHERE b~currency_code = 'EUR' GROUP BY b~customer_id, cu~last_name HAVING SUM( b~flight_price ) > 2000 ORDER BY total_eur DESCENDING, customer_id ASCENDING
```

Order matters: no (two-unordered) — deepseek: "" · z-ai: ""

| CUSTOMER_ID | LAST_NAME | TOTAL_EUR |
|---|---|---|
| 000444 | Gahl | 55303.00 |
| 000725 | Fischer | 54182.00 |
| 000066 | Columbo | 52382.00 |
| 000234 | Heller | 49778.00 |
| 000543 | Schneider | 47448.00 |
| 000516 | Moyano | 46472.00 |
| 000519 | Moyano | 43576.00 |
| 000262 | Henry | 42648.00 |
| 000145 | Koller | 41488.00 |
| 000416 | Illner | 40425.00 |

## 30. t-b0018-05 · hard

**For trips starting in September 2026, categorize each trip as 'Short' if it lasted 0 to 3 days, 'Medium' if 4 to 7 days, and 'Long' if more than 7 days. Count the number of trips in each category, ordered by category name.**

Teacher SQL (raw):

```sql
SELECT CASE
  WHEN DATS_DAYS_BETWEEN( t~begin_date, t~end_date ) <= 3 THEN 'Short'
  WHEN DATS_DAYS_BETWEEN( t~begin_date, t~end_date ) <= 7 THEN 'Medium'
  ELSE 'Long'
END AS duration_category,
COUNT(*) AS trip_count
FROM /dmo/travel AS t
WHERE t~begin_date >= '20260901' AND t~begin_date <= '20260930'
GROUP BY CASE
  WHEN DATS_DAYS_BETWEEN( t~begin_date, t~end_date ) <= 3 THEN 'Short'
  WHEN DATS_DAYS_BETWEEN( t~begin_date, t~end_date ) <= 7 THEN 'Medium'
  ELSE 'Long'
END
ORDER BY duration_category ASCENDING
```

Label (after the frozen fixer):

```sql
SELECT CASE
  WHEN DATS_DAYS_BETWEEN( t~begin_date, t~end_date ) <= 3 THEN 'Short'
  WHEN DATS_DAYS_BETWEEN( t~begin_date, t~end_date ) <= 7 THEN 'Medium'
  ELSE 'Long'
END AS duration_category,
COUNT( * ) AS trip_count
FROM /dmo/travel AS t
WHERE t~begin_date >= '20260901' AND t~begin_date <= '20260930'
GROUP BY CASE
  WHEN DATS_DAYS_BETWEEN( t~begin_date, t~end_date ) <= 3 THEN 'Short'
  WHEN DATS_DAYS_BETWEEN( t~begin_date, t~end_date ) <= 7 THEN 'Medium'
  ELSE 'Long'
END
ORDER BY duration_category ASCENDING
```

Order matters: yes (two-ordered) — deepseek: "ordered by category name" · z-ai: "ordered by category name."

| DURATION_CATEGORY | TRIP_COUNT |
|---|---|
| Medium | 74 |
| Short | 65 |

## 31. t-b0007-00 · hard

**Which carriers had no flights in November 2026? Return carrier names.**

```sql
SELECT c~name AS carrier_name FROM /dmo/carrier AS c WHERE c~carrier_id NOT IN ( SELECT f~carrier_id FROM /dmo/flight AS f WHERE f~flight_date >= '20261101' AND f~flight_date <= '20261130' ) ORDER BY c~name ASCENDING
```

Order matters: no (two-unordered) — deepseek: "" · z-ai: ""

| CARRIER_NAME |
|---|
| AL-Naser Wings |
| Air Canada |
| Air France |
| Air Pacific Limited t/a Fiji Airway |
| Alitalia Societa Aerea Italiana S.p.A. |
| British Airways p.l.c. |
| Cobaltair Ltd. dba Cobalt |
| Qantas Airways Ltd. |
| South African Airways |
| Sundair GmbH |

## 32. t-b0003-01 · hard

**Which agencies have at least 2 travels with booking fee less than 50? Show agency name and the count.**

Teacher SQL (raw):

```sql
SELECT a~name AS agency_name, COUNT(*) AS travel_count FROM /dmo/travel AS t INNER JOIN /dmo/agency AS a ON t~agency_id = a~agency_id WHERE t~booking_fee < 50 GROUP BY a~name HAVING COUNT(*) >= 2 ORDER BY travel_count DESCENDING, agency_name ASCENDING
```

Label (after the frozen fixer):

```sql
SELECT a~name AS agency_name, COUNT( * ) AS travel_count FROM /dmo/travel AS t INNER JOIN /dmo/agency AS a ON t~agency_id = a~agency_id WHERE t~booking_fee < 50 GROUP BY a~name HAVING COUNT( * ) >= 2 ORDER BY travel_count DESCENDING, agency_name ASCENDING
```

Order matters: no (two-unordered) — deepseek: "" · z-ai: ""

| AGENCY_NAME | TRAVEL_COUNT |
|---|---|
| Super Agency | 114 |
| Real Weird Vacation | 111 |
| Hot Socks Travel | 110 |
| No Return | 109 |
| Maxitrip | 108 |
| Asia By Plane | 106 |
| Travel from Walldorf | 106 |
| Aussie Travel | 104 |
| The Ultimate Answer | 104 |
| Trans World Travel | 104 |

## 33. t-b0003-02 · hard

**Which carriers have more than 5 flights in September 2026? Show carrier name and the number of flights.**

Teacher SQL (raw):

```sql
SELECT c~name AS carrier_name, COUNT(*) AS flight_count FROM /dmo/flight AS f INNER JOIN /dmo/carrier AS c ON f~carrier_id = c~carrier_id WHERE f~flight_date BETWEEN '20260901' AND '20260930' GROUP BY c~name HAVING COUNT(*) > 5 ORDER BY flight_count DESCENDING, carrier_name ASCENDING
```

Label (after the frozen fixer):

```sql
SELECT c~name AS carrier_name, COUNT( * ) AS flight_count FROM /dmo/flight AS f INNER JOIN /dmo/carrier AS c ON f~carrier_id = c~carrier_id WHERE f~flight_date BETWEEN '20260901' AND '20260930' GROUP BY c~name HAVING COUNT( * ) > 5 ORDER BY flight_count DESCENDING, carrier_name ASCENDING
```

Order matters: no (two-unordered) — deepseek: "" · z-ai: ""

| CARRIER_NAME | FLIGHT_COUNT |
|---|---|
| American Airlines Inc. | 756 |
| United Airlines, Inc. | 560 |
| Delta Air Lines, Inc. | 420 |
| JetBlue | 336 |
| Singapore Airlines Limited | 280 |
| Alaska Airlines | 224 |
| Deutsche Lufthansa AG | 224 |
| Air Japan | 112 |
| Condor | 112 |
| Japan Airlines Co., Ltd. | 112 |

## 34. t-b0015-06 · hard

**In November 2026, for each carrier show the carrier name and the number of flights in three price bands: 'budget' (under 300), 'standard' (300 to under 1000), and 'premium' (1000 or more). Show only carriers that have at least one flight in every band.**

```sql
SELECT c~name AS carrier_name, COUNT( CASE WHEN f~price < 300 THEN 1 END ) AS budget_flights, COUNT( CASE WHEN f~price >= 300 AND f~price < 1000 THEN 1 END ) AS standard_flights, COUNT( CASE WHEN f~price >= 1000 THEN 1 END ) AS premium_flights FROM /dmo/flight AS f INNER JOIN /dmo/carrier AS c ON c~carrier_id = f~carrier_id WHERE f~flight_date BETWEEN '20261101' AND '20261130' GROUP BY c~name HAVING COUNT( CASE WHEN f~price < 300 THEN 1 END ) > 0 AND COUNT( CASE WHEN f~price >= 300 AND f~price < 1000 THEN 1 END ) > 0 AND COUNT( CASE WHEN f~price >= 1000 THEN 1 END ) > 0 ORDER BY c~name ASCENDING
```

Order matters: no (two-unordered) — deepseek: "" · z-ai: ""

| CARRIER_NAME | BUDGET_FLIGHTS | STANDARD_FLIGHTS | PREMIUM_FLIGHTS |
|---|---|---|---|
| American Airlines Inc. | 146 | 248 | 416 |
| Delta Air Lines, Inc. | 32 | 28 | 390 |

## 35. t-b0015-02 · hard

**In January 2027, which carriers had more than 200 flights in the price bucket 'premium' (price at least 1200)? Return the carrier name and the premium flight count, highest count first, then by carrier name.**

```sql
SELECT c~name AS carrier_name, COUNT( CASE WHEN f~price >= 1200 THEN 1 END ) AS premium_flights FROM /dmo/flight AS f INNER JOIN /dmo/carrier AS c ON c~carrier_id = f~carrier_id WHERE f~flight_date BETWEEN '20270101' AND '20270131' GROUP BY c~name HAVING COUNT( CASE WHEN f~price >= 1200 THEN 1 END ) > 200 ORDER BY premium_flights DESCENDING, c~name ASCENDING
```

Order matters: yes (two-ordered) — deepseek: "highest count first, then by carrier name" · z-ai: "highest count first, then by carrier name"

| CARRIER_NAME | PREMIUM_FLIGHTS |
|---|---|
| United Airlines, Inc. | 418 |
| Delta Air Lines, Inc. | 403 |
| American Airlines Inc. | 400 |
| JetBlue | 372 |
| Singapore Airlines Limited | 310 |
| Alaska Airlines | 248 |
| Deutsche Lufthansa AG | 248 |

## 36. t-b0027-01 · hard

**Which carriers have total EUR supplement sales across all bookings of at least 500 EUR? Show carrier name and the rounded total.**

```sql
SELECT c~name AS carrier_name, ROUND( SUM( s~price ), 2 ) AS total_eur FROM /dmo/book_suppl AS s INNER JOIN /dmo/booking AS b ON s~travel_id = b~travel_id AND s~booking_id = b~booking_id INNER JOIN /dmo/carrier AS c ON b~carrier_id = c~carrier_id WHERE s~currency_code = 'EUR' GROUP BY c~name HAVING SUM( s~price ) >= 500 ORDER BY total_eur DESCENDING, carrier_name ASCENDING
```

Order matters: no (two-unordered) — deepseek: "" · z-ai: ""

| CARRIER_NAME | TOTAL_EUR |
|---|---|
| American Airlines Inc. | 52416.80 |
| Singapore Airlines Limited | 49243.70 |
| Deutsche Lufthansa AG | 44909.80 |
| Alitalia Societa Aerea Italiana S.p.A. | 32564.20 |
| United Airlines, Inc. | 30422.00 |
| Japan Airlines Co., Ltd. | 25724.00 |
| Delta Air Lines, Inc. | 8464.40 |
| JetBlue | 4910.00 |
| Alaska Airlines | 3754.70 |
| Air Japan | 2211.90 |

## 37. t-b0007-07 · hard

**Which carriers flew every month from September 2026 through February 2027? Return carrier names.**

```sql
SELECT c~name AS carrier_name FROM /dmo/carrier AS c WHERE c~carrier_id IN ( SELECT f~carrier_id FROM /dmo/flight AS f WHERE f~flight_date >= '20260901' AND f~flight_date <= '20260930' ) AND c~carrier_id IN ( SELECT f~carrier_id FROM /dmo/flight AS f WHERE f~flight_date >= '20261001' AND f~flight_date <= '20261031' ) AND c~carrier_id IN ( SELECT f~carrier_id FROM /dmo/flight AS f WHERE f~flight_date >= '20261101' AND f~flight_date <= '20261130' ) AND c~carrier_id IN ( SELECT f~carrier_id FROM /dmo/flight AS f WHERE f~flight_date >= '20261201' AND f~flight_date <= '20261231' ) AND c~carrier_id IN ( SELECT f~carrier_id FROM /dmo/flight AS f WHERE f~flight_date >= '20270101' AND f~flight_date <= '20270131' ) AND c~carrier_id IN ( SELECT f~carrier_id FROM /dmo/flight AS f WHERE f~flight_date >= '20270201' AND f~flight_date <= '20270228' ) ORDER BY c~name ASCENDING
```

Order matters: no (two-unordered) — deepseek: "" · z-ai: ""

| CARRIER_NAME |
|---|
| Air Japan |
| Alaska Airlines |
| American Airlines Inc. |
| Condor |
| Delta Air Lines, Inc. |
| Deutsche Lufthansa AG |
| Japan Airlines Co., Ltd. |
| JetBlue |
| Scoot |
| Singapore Airlines Limited |

## 38. t-b0003-09 · hard

**What is the average number of flights per carrier in January 2027 for carriers with more than 10 flights that month? Show carrier name and flight count.**

Teacher SQL (raw):

```sql
SELECT c~name AS carrier_name, COUNT(*) AS flight_count FROM /dmo/flight AS f INNER JOIN /dmo/carrier AS c ON f~carrier_id = c~carrier_id WHERE f~flight_date BETWEEN '20270101' AND '20270131' GROUP BY c~name HAVING COUNT(*) > 10 ORDER BY flight_count DESCENDING, carrier_name ASCENDING
```

Label (after the frozen fixer):

```sql
SELECT c~name AS carrier_name, COUNT( * ) AS flight_count FROM /dmo/flight AS f INNER JOIN /dmo/carrier AS c ON f~carrier_id = c~carrier_id WHERE f~flight_date BETWEEN '20270101' AND '20270131' GROUP BY c~name HAVING COUNT( * ) > 10 ORDER BY flight_count DESCENDING, carrier_name ASCENDING
```

Order matters: no (two-unordered) — deepseek: "" · z-ai: ""

| CARRIER_NAME | FLIGHT_COUNT |
|---|---|
| American Airlines Inc. | 837 |
| United Airlines, Inc. | 620 |
| Delta Air Lines, Inc. | 465 |
| JetBlue | 372 |
| Singapore Airlines Limited | 310 |
| Alaska Airlines | 248 |
| Deutsche Lufthansa AG | 248 |
| Air Japan | 124 |
| Condor | 124 |
| Japan Airlines Co., Ltd. | 124 |

## 39. t-b0003-03 · hard

**Which agencies have a total booking fee across all their travels exceeding 500? Show agency name and total booking fee.**

```sql
SELECT a~name AS agency_name, SUM( t~booking_fee ) AS total_booking_fee FROM /dmo/travel AS t INNER JOIN /dmo/agency AS a ON t~agency_id = a~agency_id GROUP BY a~name HAVING SUM( t~booking_fee ) > 500 ORDER BY total_booking_fee DESCENDING, agency_name ASCENDING
```

Order matters: no (two-unordered) — deepseek: "" · z-ai: ""

| AGENCY_NAME | TOTAL_BOOKING_FEE |
|---|---|
| Hendrik's | 3510.00 |
| Maxitrip | 3130.00 |
| Hot Socks Travel | 3070.00 |
| Real Weird Vacation | 3060.00 |
| Cap Travels Ltd. | 3010.00 |
| Flights and More | 3000.00 |
| Rocky Horror Tours | 2990.00 |
| Fly Now, Pay Later | 2980.00 |
| Not Only By Bike | 2980.00 |
| No Return | 2960.00 |

## 40. t-b0006-09 · unanswerable

**What is the total number of sick days taken by pilots in 2026?**

```sql
UNANSWERABLE
```





## 41. t-b0026-09 · unanswerable

**For each airport in November 2026, what percentage of departing flights left within 15 minutes of their scheduled time?**

```sql
UNANSWERABLE
```





## 42. t-b0006-04 · unanswerable

**Which pilot has the most total flight hours across all flights in the first quarter of 2027?**

```sql
UNANSWERABLE
```





## 43. t-b0014-06 · unanswerable

**Show me the seat assignment for each passenger on British Airways flight 178 from London Heathrow to New York JFK on September 28, 2026.**

```sql
UNANSWERABLE
```





## 44. t-b0026-04 · unanswerable

**For each carrier in September 2026, show the average number of minutes between scheduled and actual arrival time, including carriers with no flights as 0.**

```sql
UNANSWERABLE
```





## 45. t-b0014-00 · unanswerable

**Which seat numbers on Lufthansa flight LH 402 from Frankfurt to Newark on October 15, 2026 are still free?**

```sql
UNANSWERABLE
```





## 46. t-b0006-01 · unanswerable

**What is the average age of the flight crew on Air France flights departing from Paris in September 2026?**

```sql
UNANSWERABLE
```





## 47. t-b0014-01 · unanswerable

**What is the seat map for the Boeing 747-8 operating Japan Airlines flight 6 from Tokyo Narita to New York JFK on November 3, 2026?**

```sql
UNANSWERABLE
```





## 48. t-b0014-07 · unanswerable

**How many middle seats were occupied on Singapore Airlines flight 25 from Frankfurt to Singapore on October 20, 2026?**

```sql
UNANSWERABLE
```





## 49. t-b0006-03 · unanswerable

**For each flight in November 2026, show the flight date and the name of the captain.**

```sql
UNANSWERABLE
```





## 50. t-b0026-06 · unanswerable

**Which routes in February 2027 had an average departure delay greater than 45 minutes?**

```sql
UNANSWERABLE
```




