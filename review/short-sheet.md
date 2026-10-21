# Review sheet (38 items)

Write one JSON line per decision to `review/decisions.jsonl`, then `npm run apply-review` (the `//` notes below are explanations — leave them out):

```
{"id":"q0001","action":"keep"}                      // agreed only
{"id":"q0002","action":"drop"}
{"id":"q0003","action":"use_reference"}             // disputed only
{"id":"q0004","action":"use_crosscheck"}            // disputed; add "tier" (+ "ordered") if answerability changes
{"id":"q0005","action":"rewrite","question":"…"}    // re-runs validate + cross-check; optional "tier", "ordered"
```

---

## q0151 · easy · AGREED

**How many different destination airports do the listed routes serve?**

Flags: same-result:q0026

Reference SQL:

```sql
SELECT COUNT( DISTINCT airport_to_id ) AS destination_count FROM /dmo/connection
```

| DESTINATION_COUNT |
|---|
| 9 |

---

## q0207 · easy · AGREED · ordered

**Show the 10 flights with the most occupied seats, including airline codes, route numbers, dates and occupied seat counts. Sort by occupied seats, highest first, then by date, airline code and route number.**

Flags: near-dup:q0173

Reference SQL:

```sql
SELECT carrier_id, connection_id, flight_date, seats_occupied FROM /DMO/FLIGHT ORDER BY seats_occupied DESCENDING, flight_date ASCENDING, carrier_id ASCENDING, connection_id ASCENDING UP TO 10 ROWS
```

| CARRIER_ID | CONNECTION_ID | FLIGHT_DATE | SEATS_OCCUPIED |
|---|---|---|---|
| AA | 0018 | 20270415 | 446 |
| AZ | 0789 | 20270416 | 441 |
| JL | 0408 | 20270417 | 432 |
| AZ | 0788 | 20260621 | 422 |
| LH | 0401 | 20260620 | 403 |
| LH | 0403 | 20260916 | 356 |
| LH | 0403 | 20260919 | 356 |
| LH | 0402 | 20261016 | 356 |
| LH | 0454 | 20261017 | 356 |
| LH | 0403 | 20261021 | 356 |

---

## q0245 · medium · AGREED

**Which cities have more than one listed airport? Return city names, country codes, and airport counts.**

Flags: same-result:q0071

Reference SQL:

```sql
SELECT a~city, a~country, COUNT(*) AS airport_count FROM /dmo/airport AS a GROUP BY a~city, a~country HAVING COUNT(*) > 1
```

| CITY | COUNTRY | AIRPORT_COUNT |
|---|---|---|
| Berlin | DE | 3 |
| Paris | FR | 2 |
| Osaka, Honshu | JP | 2 |
| Moscow | RU | 2 |
| London | UK | 3 |

---

## q0263 · easy · AGREED

**How many customers are recorded in total?**

Flags: same-result:q0110

Reference SQL:

```sql
SELECT COUNT(*) AS customer_count FROM /DMO/CUSTOMER
```

| CUSTOMER_COUNT |
|---|
| 728 |

---

## q0292 · easy · AGREED

**How many trips are recorded in total?**

Flags: same-result:q0236

Reference SQL:

```sql
SELECT COUNT(*) AS trip_count FROM /DMO/TRAVEL
```

| TRIP_COUNT |
|---|
| 5137 |

---

## q0293 · easy · AGREED

**How many different customers have trips recorded?**

Flags: same-result:q0110

Reference SQL:

```sql
SELECT COUNT( DISTINCT t~customer_id ) AS customer_count FROM /DMO/TRAVEL AS t
```

| CUSTOMER_COUNT |
|---|
| 728 |

---

## q0294 · easy · AGREED · ordered

**Which 10 customers have the most flight bookings? Show customer numbers and booking counts, largest count first, then by customer number.**

Flags: near-dup:q0147

Reference SQL:

```sql
SELECT b~customer_id, COUNT(*) AS booking_count FROM /DMO/BOOKING AS b GROUP BY b~customer_id ORDER BY booking_count DESCENDING, b~customer_id ASCENDING UP TO 10 ROWS
```

| CUSTOMER_ID | BOOKING_COUNT |
|---|---|
| 000238 | 37 |
| 000465 | 35 |
| 000315 | 34 |
| 000482 | 34 |
| 000052 | 33 |
| 000138 | 33 |
| 000499 | 32 |
| 000057 | 31 |
| 000108 | 31 |
| 000257 | 31 |

---

## q0330 · medium · AGREED

**How many customers are recorded under each personal title? Return titles and customer counts, including a group for customers without a title.**

Flags: same-result:q0150

Reference SQL:

```sql
SELECT c~title, COUNT(*) AS customer_count FROM /dmo/customer AS c GROUP BY c~title
```

| TITLE | CUSTOMER_COUNT |
|---|---|
| Mr. | 469 |
| Mrs. | 259 |

---

## q0153 · medium · AGREED · ordered

**Which five departure airports have the widest variety of aircraft types scheduled in October 2026? Return airport codes, names, and aircraft type counts, most types first, then by airport code.**

Reference SQL:

```sql
SELECT a~airport_id, a~name, COUNT( DISTINCT f~plane_type_id ) AS aircraft_type_count FROM /dmo/airport AS a INNER JOIN /dmo/connection AS c ON c~airport_from_id = a~airport_id INNER JOIN /dmo/flight AS f ON f~carrier_id = c~carrier_id AND f~connection_id = c~connection_id WHERE f~flight_date BETWEEN '20261001' AND '20261031' GROUP BY a~airport_id, a~name ORDER BY aircraft_type_count DESCENDING, a~airport_id ASCENDING UP TO 5 ROWS
```

| AIRPORT_ID | NAME | AIRCRAFT_TYPE_COUNT |
|---|---|---|
| JFK | John F. Kennedy International Airport | 11 |
| SFO | San Francisco International Airport | 10 |
| FRA | Frankfurt Airport | 8 |
| EWR | Newark Liberty International Airport | 6 |
| MIA | Miami International Airport | 6 |

---

## q0332 · medium · AGREED · ordered

**Which 10 passengers have bookings on the most different aircraft types? Return customer IDs, first and last names, and aircraft type counts, most types first, then by customer ID.**

Reference SQL:

```sql
SELECT c~customer_id, c~first_name, c~last_name, COUNT( DISTINCT f~plane_type_id ) AS aircraft_type_count FROM /dmo/customer AS c INNER JOIN /dmo/booking AS b ON b~customer_id = c~customer_id INNER JOIN /dmo/flight AS f ON f~carrier_id = b~carrier_id AND f~connection_id = b~connection_id AND f~flight_date = b~flight_date GROUP BY c~customer_id, c~first_name, c~last_name ORDER BY aircraft_type_count DESCENDING, c~customer_id ASCENDING UP TO 10 ROWS
```

| CUSTOMER_ID | FIRST_NAME | LAST_NAME | AIRCRAFT_TYPE_COUNT |
|---|---|---|---|
| 000185 | Irene | Goelke | 13 |
| 000449 | James | Benjamin | 13 |
| 000681 | Hendrik | Meier | 13 |
| 000154 | Friedrich | Hoffen | 12 |
| 000191 | Anna | Goelke | 12 |
| 000344 | Jasmin | Kreiss | 12 |
| 000387 | Sophie | Zimmermann | 12 |
| 000405 | Ruth | Kramer | 12 |
| 000532 | Ludwig | Schneider | 12 |
| 000589 | Jean | Lautenbach | 12 |

---

## q0241 · easy · AGREED

**How many agencies are based in each country? Show country codes and agency counts.**

Reference SQL:

```sql
SELECT country_code, COUNT(*) AS agency_count FROM /DMO/AGENCY GROUP BY country_code
```

| COUNTRY_CODE | AGENCY_COUNT |
|---|---|
| AT | 1 |
| AU | 1 |
| CA | 1 |
| CH | 1 |
| DE | 20 |
| FR | 1 |
| GB | 6 |
| IT | 1 |
| JP | 1 |
| RU | 1 |

…4 more rows

---

## q0073 · easy · AGREED

**How many flight bookings are recorded in total?**

Reference SQL:

```sql
SELECT COUNT(*) AS booking_count FROM /dmo/booking AS b
```

| BOOKING_COUNT |
|---|
| 13144 |

---

## q0276 · medium · AGREED

**How much has been charged for add-ons on each airline's bookings, for airlines with purchased add-ons, separately by currency? Return airline codes and names, currency codes, purchased entry counts, and total add-on charges.**

Reference SQL:

```sql
SELECT c~carrier_id, c~name, s~currency_code, COUNT(*) AS entry_count, SUM( s~price ) AS total_addon_charges FROM /dmo/carrier AS c INNER JOIN /dmo/booking AS b ON b~carrier_id = c~carrier_id INNER JOIN /dmo/book_suppl AS s ON s~travel_id = b~travel_id AND s~booking_id = b~booking_id GROUP BY c~carrier_id, c~name, s~currency_code
```

| CARRIER_ID | NAME | CURRENCY_CODE | ENTRY_COUNT | TOTAL_ADDON_CHARGES |
|---|---|---|---|---|
| AA | American Airlines Inc. | EUR | 4113 | 52416.80 |
| AZ | Alitalia Societa Aerea Italiana S.p.A. | EUR | 2575 | 32564.20 |
| DL | Delta Air Lines, Inc. | EUR | 653 | 8464.40 |
| LH | Deutsche Lufthansa AG | EUR | 3474 | 44909.80 |
| JL | Japan Airlines Co., Ltd. | EUR | 2079 | 25724.00 |
| SQ | Singapore Airlines Limited | EUR | 3886 | 49243.70 |
| UA | United Airlines, Inc. | EUR | 2363 | 30422.00 |
| AS | Alaska Airlines | EUR | 304 | 3754.70 |
| B6 | JetBlue | EUR | 387 | 4910.00 |
| DE | Condor | EUR | 163 | 1987.30 |

…2 more rows

---

## q0165 · hard · AGREED

**For each airline flying in October 2026, how many scheduled flights used aircraft with under 300 seats, and how many used aircraft with at least 300 seats? Return airline codes, names, and both counts.**

Reference SQL:

```sql
SELECT c~carrier_id, c~name, SUM( CASE WHEN f~seats_max < 300 THEN 1 ELSE 0 END ) AS under_300_seats, SUM( CASE WHEN f~seats_max >= 300 THEN 1 ELSE 0 END ) AS at_least_300_seats FROM /DMO/FLIGHT AS f INNER JOIN /DMO/CARRIER AS c ON c~carrier_id = f~carrier_id WHERE f~flight_date BETWEEN '20261001' AND '20261031' GROUP BY c~carrier_id, c~name
```

| CARRIER_ID | NAME | UNDER_300_SEATS | AT_LEAST_300_SEATS |
|---|---|---|---|
| AA | American Airlines Inc. | 837 | 0 |
| B6 | JetBlue | 372 | 0 |
| DL | Delta Air Lines, Inc. | 465 | 0 |
| UA | United Airlines, Inc. | 558 | 62 |
| AS | Alaska Airlines | 248 | 0 |
| JL | Japan Airlines Co., Ltd. | 124 | 0 |
| SQ | Singapore Airlines Limited | 248 | 62 |
| LH | Deutsche Lufthansa AG | 124 | 124 |
| NQ | Air Japan | 124 | 0 |
| DE | Condor | 0 | 124 |

…1 more rows

---

## q0341 · medium · AGREED · ordered

**Show 10 airline and airport-pair combinations where the airline offers connections in both directions. Return airline codes and names and both airport codes, putting the alphabetically earlier airport first. Sort by airline code, then by the first and second airport codes.**

Reference SQL:

```sql
SELECT DISTINCT a~carrier_id, a~name, c1~airport_from_id AS first_airport, c1~airport_to_id AS second_airport FROM /dmo/carrier AS a INNER JOIN /dmo/connection AS c1 ON c1~carrier_id = a~carrier_id INNER JOIN /dmo/connection AS c2 ON c2~carrier_id = c1~carrier_id AND c2~airport_from_id = c1~airport_to_id AND c2~airport_to_id = c1~airport_from_id WHERE c1~airport_from_id < c1~airport_to_id ORDER BY a~carrier_id ASCENDING, first_airport ASCENDING, second_airport ASCENDING UP TO 10 ROWS
```

| CARRIER_ID | NAME | FIRST_AIRPORT | SECOND_AIRPORT |
|---|---|---|---|
| AA | American Airlines Inc. | EWR | MIA |
| AA | American Airlines Inc. | HAV | MIA |
| AA | American Airlines Inc. | JFK | SFO |
| AS | Alaska Airlines | JFK | SFO |
| AZ | Alitalia Societa Aerea Italiana S.p.A. | NRT | VCE |
| B6 | JetBlue | JFK | SFO |
| DE | Condor | FRA | JFK |
| DE | Condor | FRA | SFO |
| DL | Delta Air Lines, Inc. | FRA | JFK |
| DL | Delta Air Lines, Inc. | HAV | MIA |

---

## q0038 · medium · AGREED

**For each airline with scheduled flights, show its code and name, the number of different aircraft types it uses, and its smallest and largest aircraft seating capacities.**

Reference SQL:

```sql
SELECT c~carrier_id, c~name, COUNT( DISTINCT f~plane_type_id ) AS aircraft_type_count, MIN( f~seats_max ) AS smallest_capacity, MAX( f~seats_max ) AS largest_capacity FROM /dmo/carrier AS c INNER JOIN /dmo/flight AS f ON f~carrier_id = c~carrier_id GROUP BY c~carrier_id, c~name
```

| CARRIER_ID | NAME | AIRCRAFT_TYPE_COUNT | SMALLEST_CAPACITY | LARGEST_CAPACITY |
|---|---|---|---|---|
| NQ | Air Japan | 1 | 250 | 250 |
| AS | Alaska Airlines | 3 | 160 | 178 |
| AZ | Alitalia Societa Aerea Italiana S.p.A. | 2 | 260 | 475 |
| AA | American Airlines Inc. | 7 | 128 | 475 |
| DE | Condor | 1 | 310 | 310 |
| DL | Delta Air Lines, Inc. | 5 | 160 | 238 |
| LH | Deutsche Lufthansa AG | 6 | 260 | 475 |
| JL | Japan Airlines Co., Ltd. | 5 | 216 | 475 |
| B6 | JetBlue | 1 | 190 | 190 |
| TR | Scoot | 1 | 250 | 250 |

…2 more rows

---

## q0159 · medium · AGREED · ordered

**Which 10 add-ons appear on bookings with the widest range of airlines? Return add-on codes, category codes, and airline counts, most airlines first, then by add-on code.**

Reference SQL:

```sql
SELECT s~supplement_id, s~supplement_category, COUNT( DISTINCT b~carrier_id ) AS airline_count FROM /dmo/supplement AS s INNER JOIN /dmo/book_suppl AS bs ON bs~supplement_id = s~supplement_id INNER JOIN /dmo/booking AS b ON b~travel_id = bs~travel_id AND b~booking_id = bs~booking_id GROUP BY s~supplement_id, s~supplement_category ORDER BY airline_count DESCENDING, s~supplement_id ASCENDING UP TO 10 ROWS
```

| SUPPLEMENT_ID | SUPPLEMENT_CATEGORY | AIRLINE_COUNT |
|---|---|---|
| BV-0001 | BV | 12 |
| BV-0002 | BV | 12 |
| BV-0004 | BV | 12 |
| BV-0005 | BV | 12 |
| BV-0006 | BV | 12 |
| BV-0007 | BV | 12 |
| BV-0008 | BV | 12 |
| LU-0001 | LU | 12 |
| LU-0002 | LU | 12 |
| LU-0003 | LU | 12 |

---

## q0042 · medium · AGREED

**For each departure airport with listed connections, show its code and name and the earliest and latest scheduled departure times.**

Reference SQL:

```sql
SELECT a~airport_id, a~name, MIN( c~departure_time ) AS earliest_departure, MAX( c~departure_time ) AS latest_departure FROM /dmo/airport AS a INNER JOIN /dmo/connection AS c ON c~airport_from_id = a~airport_id GROUP BY a~airport_id, a~name
```

| AIRPORT_ID | NAME | EARLIEST_DEPARTURE | LATEST_DEPARTURE |
|---|---|---|---|
| SFO | San Francisco International Airport | 011500 | 235900 |
| SIN | Singapore Changi Airport | 005000 | 235500 |
| EWR | Newark Liberty International Airport | 055000 | 215600 |
| VCE | Venice Marco Polo Airport | 132500 | 132500 |
| NRT | Narita International Airport | 082000 | 190000 |
| FRA | Frankfurt Airport | 083500 | 201000 |
| JFK | John F. Kennedy International Airport | 060000 | 215000 |
| MIA | Miami International Airport | 070000 | 214300 |
| HAV | José Martí International Airport | 092000 | 182500 |

---

## q0268 · easy · AGREED

**What are the shortest and longest listed route distances in each measurement unit? Show unit codes and both distances.**

Reference SQL:

```sql
SELECT distance_unit, MIN( distance ) AS shortest_distance, MAX( distance ) AS longest_distance FROM /DMO/CONNECTION GROUP BY distance_unit
```

| DISTANCE_UNIT | SHORTEST_DISTANCE | LONGEST_DISTANCE |
|---|---|---|
| KM | 520 | 13523 |

---

## q0212 · easy · AGREED

**For each airline that has listed routes, what are the earliest and latest departure times among those routes? Show airline codes and both times.**

Reference SQL:

```sql
SELECT carrier_id, MIN( departure_time ) AS earliest_departure_time, MAX( departure_time ) AS latest_departure_time FROM /DMO/CONNECTION GROUP BY carrier_id
```

| CARRIER_ID | EARLIEST_DEPARTURE_TIME | LATEST_DEPARTURE_TIME |
|---|---|---|
| AA | 055000 | 214300 |
| AS | 061800 | 223300 |
| AZ | 132500 | 142600 |
| B6 | 060000 | 235900 |
| DE | 114000 | 163000 |
| DL | 070000 | 205500 |
| JL | 080500 | 201000 |
| LH | 102500 | 215000 |
| NQ | 005000 | 184000 |
| SQ | 011500 | 235500 |

…2 more rows

---

## q0048 · hard · AGREED

**Which customers had at least three trips starting in June 2026? Return customer numbers, first and last names, trip counts, and the number of different agencies they used for those trips.**

Reference SQL:

```sql
SELECT c~customer_id, c~first_name, c~last_name, COUNT(*) AS trip_count, COUNT( DISTINCT t~agency_id ) AS agency_count FROM /dmo/customer AS c INNER JOIN /dmo/travel AS t ON t~customer_id = c~customer_id WHERE t~begin_date BETWEEN '20260601' AND '20260630' GROUP BY c~customer_id, c~first_name, c~last_name HAVING COUNT(*) >= 3
```

| CUSTOMER_ID | FIRST_NAME | LAST_NAME | TRIP_COUNT | AGENCY_COUNT |
|---|---|---|---|---|
| 000093 | Sophie | Detemple | 3 | 2 |
| 000665 | Harish | Madeira | 6 | 6 |
| 000072 | Theresia | Neubasler | 4 | 4 |
| 000138 | August | Wohl | 3 | 3 |
| 000697 | Amelie | Leisert | 5 | 5 |
| 000582 | Illya | Lautenbach | 4 | 4 |
| 000583 | Illya | Lautenbach | 6 | 6 |
| 000466 | Ruth | Miguel | 3 | 3 |
| 000640 | Kristina | Kirk | 3 | 3 |
| 000478 | Dominik | Sessler | 3 | 2 |

…385 more rows

---

## q0065 · unanswerable · AGREED

**For flights scheduled in January 2027, list each carrier's name and the number of flights canceled because of mechanical problems.**

Reference SQL:

```sql
UNANSWERABLE
```

---

## q0287 · hard · AGREED

**Which extras were purchased on more than one flight booking within the same trip starting in October 2026? Return trip numbers, extra codes, the number of bookings containing each extra, and its purchase count.**

Reference SQL:

```sql
SELECT t~travel_id, s~supplement_id, COUNT( DISTINCT s~booking_id ) AS booking_count, COUNT(*) AS purchase_count FROM /dmo/travel AS t INNER JOIN /dmo/book_suppl AS s ON s~travel_id = t~travel_id WHERE t~begin_date BETWEEN '20261001' AND '20261031' GROUP BY t~travel_id, s~supplement_id HAVING COUNT( DISTINCT s~booking_id ) > 1
```

| TRAVEL_ID | SUPPLEMENT_ID | BOOKING_COUNT | PURCHASE_COUNT |
|---|---|---|---|
| 00004161 | ML-0031 | 2 | 2 |
| 00004171 | BV-0006 | 2 | 2 |
| 00004260 | ML-0026 | 2 | 2 |
| 00004314 | ML-0006 | 2 | 2 |
| 00004394 | ML-0023 | 2 | 2 |
| 00004419 | BV-0006 | 2 | 2 |
| 00004441 | ML-0001 | 2 | 2 |
| 00004448 | ML-0015 | 2 | 2 |
| 00004455 | LU-0001 | 2 | 2 |
| 00004469 | ML-0034 | 2 | 2 |

…20 more rows

---

## q0116 · medium · AGREED · ordered

**Which 10 airline connections have the most flight bookings? Return airline codes and names, connection numbers, departure and arrival airport codes, and booking counts, most bookings first, then by airline code and connection number.**

Reference SQL:

```sql
SELECT c~carrier_id, c~name, n~connection_id, n~airport_from_id, n~airport_to_id, COUNT(*) AS booking_count FROM /DMO/BOOKING AS b INNER JOIN /DMO/CONNECTION AS n ON n~carrier_id = b~carrier_id AND n~connection_id = b~connection_id INNER JOIN /DMO/CARRIER AS c ON c~carrier_id = n~carrier_id GROUP BY c~carrier_id, c~name, n~connection_id, n~airport_from_id, n~airport_to_id ORDER BY booking_count DESCENDING, c~carrier_id ASCENDING, n~connection_id ASCENDING UP TO 10 ROWS
```

| CARRIER_ID | NAME | CONNECTION_ID | AIRPORT_FROM_ID | AIRPORT_TO_ID | BOOKING_COUNT |
|---|---|---|---|---|---|
| AZ | Alitalia Societa Aerea Italiana S.p.A. | 0789 | NRT | VCE | 773 |
| JL | Japan Airlines Co., Ltd. | 0408 | FRA | NRT | 744 |
| LH | Deutsche Lufthansa AG | 0401 | JFK | FRA | 704 |
| AA | American Airlines Inc. | 0018 | SFO | JFK | 693 |
| SQ | Singapore Airlines Limited | 0002 | SIN | SFO | 684 |
| AZ | Alitalia Societa Aerea Italiana S.p.A. | 0788 | VCE | NRT | 643 |
| SQ | Singapore Airlines Limited | 0012 | SIN | NRT | 517 |
| SQ | Singapore Airlines Limited | 0011 | NRT | SIN | 505 |
| UA | United Airlines, Inc. | 0058 | SFO | FRA | 487 |
| LH | Deutsche Lufthansa AG | 0402 | FRA | EWR | 486 |

---

## q0143 · easy · AGREED · ordered

**Show the 10 cheapest flights priced in euros in October 2026, including airline codes, route numbers, dates and prices. Sort by price, lowest first, then date, airline code and route number.**

Reference SQL:

```sql
SELECT carrier_id, connection_id, flight_date, price FROM /dmo/flight WHERE currency_code = 'EUR' AND flight_date BETWEEN '20261001' AND '20261031' ORDER BY price ASCENDING, flight_date ASCENDING, carrier_id ASCENDING, connection_id ASCENDING UP TO 10 ROWS
```

| CARRIER_ID | CONNECTION_ID | FLIGHT_DATE | PRICE |
|---|---|---|---|
| DE | 2016 | 20261007 | 2279.00 |
| LH | 0405 | 20261007 | 2279.00 |
| LH | 0400 | 20261008 | 2279.00 |
| LH | 0400 | 20261010 | 2279.00 |
| LH | 0401 | 20261013 | 2279.00 |
| DE | 2017 | 20261014 | 2279.00 |
| LH | 0405 | 20261019 | 2279.00 |
| DE | 2017 | 20261024 | 2279.00 |
| LH | 0402 | 20261023 | 2300.00 |
| LH | 0400 | 20261016 | 2341.00 |

---

## q0216 · medium · AGREED · ordered

**Show the 10 earliest-made bookings for flights in October 2026. Return trip IDs, booking numbers, booking dates, flight dates, passenger first and last names, and airline names, earliest booking date first, then by trip ID and booking number.**

Reference SQL:

```sql
SELECT b~travel_id, b~booking_id, b~booking_date, b~flight_date, p~first_name, p~last_name, c~name FROM /dmo/booking AS b INNER JOIN /dmo/customer AS p ON p~customer_id = b~customer_id INNER JOIN /dmo/carrier AS c ON c~carrier_id = b~carrier_id WHERE b~flight_date BETWEEN '20261001' AND '20261031' ORDER BY b~booking_date ASCENDING, b~travel_id ASCENDING, b~booking_id ASCENDING UP TO 10 ROWS
```

| TRAVEL_ID | BOOKING_ID | BOOKING_DATE | FLIGHT_DATE | FIRST_NAME | LAST_NAME | NAME |
|---|---|---|---|---|---|---|
| 00004173 | 0001 | 20260814 | 20261031 | Horst | Neubasler | Scoot |
| 00004173 | 0002 | 20260814 | 20261031 | Simon | Goelke | Scoot |
| 00004173 | 0003 | 20260814 | 20261031 | Ruth | Montero | Scoot |
| 00004298 | 0001 | 20260814 | 20261011 | Allen | Cesari | Condor |
| 00004298 | 0002 | 20260814 | 20261011 | Allen | Gahl | Condor |
| 00004298 | 0003 | 20260814 | 20261016 | Allen | Cesari | Condor |
| 00004298 | 0004 | 20260814 | 20261016 | Allen | Gahl | Condor |
| 00004314 | 0001 | 20260814 | 20261024 | Ruth | Picard | Singapore Airlines Limited |
| 00004314 | 0002 | 20260814 | 20261024 | Benjamin | Gutenberg | Singapore Airlines Limited |
| 00004314 | 0003 | 20260814 | 20261024 | Ida | Miguel | Singapore Airlines Limited |

---

## q0311 · medium · AGREED · ordered

**Which 10 airline connections have the largest difference between their highest and lowest occupied-seat counts across scheduled flights? Return airline codes and names, connection numbers, departure and arrival airport codes, both seat counts, and the difference, largest difference first, then by airline code and connection number.**

Reference SQL:

```sql
SELECT c~carrier_id, c~name, n~connection_id, n~airport_from_id, n~airport_to_id, MIN( f~seats_occupied ) AS lowest_occupied, MAX( f~seats_occupied ) AS highest_occupied, MAX( f~seats_occupied ) - MIN( f~seats_occupied ) AS seat_difference FROM /dmo/flight AS f INNER JOIN /dmo/connection AS n ON n~carrier_id = f~carrier_id AND n~connection_id = f~connection_id INNER JOIN /dmo/carrier AS c ON c~carrier_id = f~carrier_id GROUP BY c~carrier_id, c~name, n~connection_id, n~airport_from_id, n~airport_to_id ORDER BY seat_difference DESCENDING, c~carrier_id ASCENDING, n~connection_id ASCENDING UP TO 10 ROWS
```

| CARRIER_ID | NAME | CONNECTION_ID | AIRPORT_FROM_ID | AIRPORT_TO_ID | LOWEST_OCCUPIED | HIGHEST_OCCUPIED | SEAT_DIFFERENCE |
|---|---|---|---|---|---|---|---|
| JL | Japan Airlines Co., Ltd. | 0408 | FRA | NRT | 100 | 432 | 332 |
| LH | Deutsche Lufthansa AG | 0401 | JFK | FRA | 118 | 403 | 285 |
| LH | Deutsche Lufthansa AG | 0403 | EWR | FRA | 117 | 356 | 239 |
| LH | Deutsche Lufthansa AG | 0402 | FRA | EWR | 145 | 356 | 211 |
| LH | Deutsche Lufthansa AG | 0454 | FRA | SFO | 145 | 356 | 211 |
| LH | Deutsche Lufthansa AG | 0455 | SFO | FRA | 145 | 356 | 211 |
| SQ | Singapore Airlines Limited | 0011 | NRT | SIN | 105 | 310 | 205 |
| AZ | Alitalia Societa Aerea Italiana S.p.A. | 0788 | VCE | NRT | 221 | 422 | 201 |
| AA | American Airlines Inc. | 0018 | SFO | JFK | 247 | 446 | 199 |
| SQ | Singapore Airlines Limited | 0637 | NRT | SIN | 134 | 330 | 196 |

---

## q0304 · medium · AGREED · ordered

**Which 10 aircraft type and add-on combinations have the most purchased add-on entries? Return aircraft types, add-on codes, and entry counts, most entries first, then alphabetically by aircraft type and add-on code.**

Reference SQL:

```sql
SELECT f~plane_type_id, s~supplement_id, COUNT(*) AS entry_count FROM /dmo/book_suppl AS s INNER JOIN /dmo/booking AS b ON b~travel_id = s~travel_id AND b~booking_id = s~booking_id INNER JOIN /dmo/flight AS f ON f~carrier_id = b~carrier_id AND f~connection_id = b~connection_id AND f~flight_date = b~flight_date GROUP BY f~plane_type_id, s~supplement_id ORDER BY entry_count DESCENDING, f~plane_type_id ASCENDING, s~supplement_id ASCENDING UP TO 10 ROWS
```

| PLANE_TYPE_ID | SUPPLEMENT_ID | ENTRY_COUNT |
|---|---|---|
| A380-800 | ML-0013 | 116 |
| A380-800 | ML-0014 | 113 |
| A380-800 | ML-0018 | 109 |
| A380-800 | ML-0030 | 108 |
| A380-800 | ML-0020 | 107 |
| A380-800 | ML-0017 | 104 |
| A380-800 | ML-0019 | 104 |
| A380-800 | ML-0031 | 104 |
| A380-800 | BV-0007 | 103 |
| A380-800 | ML-0027 | 103 |

---

## q0239 · easy · AGREED

**How many scheduled flights are priced in each currency? Show currency codes and flight counts.**

Reference SQL:

```sql
SELECT currency_code, COUNT(*) AS flight_count FROM /DMO/FLIGHT GROUP BY currency_code
```

| CURRENCY_CODE | FLIGHT_COUNT |
|---|---|
| SGD | 2168 |
| USD | 14776 |
| JPY | 1444 |
| EUR | 2172 |

---

## q0124 · medium · AGREED · ordered

**Which 10 departure-country and arrival-country pairs have the most listed connections? Count each airline's numbered connection separately and keep each direction separate. Return both country codes and connection counts, most connections first, then by departure country and arrival country.**

Reference SQL:

```sql
SELECT d~country AS departure_country, a~country AS arrival_country, COUNT(*) AS connection_count FROM /DMO/CONNECTION AS n INNER JOIN /DMO/AIRPORT AS d ON d~airport_id = n~airport_from_id INNER JOIN /DMO/AIRPORT AS a ON a~airport_id = n~airport_to_id GROUP BY d~country, a~country ORDER BY connection_count DESCENDING, d~country ASCENDING, a~country ASCENDING UP TO 10 ROWS
```

| DEPARTURE_COUNTRY | ARRIVAL_COUNTRY | CONNECTION_COUNT |
|---|---|---|
| US | US | 60 |
| DE | US | 11 |
| US | DE | 11 |
| CU | US | 6 |
| JP | SG | 6 |
| SG | JP | 6 |
| US | CU | 6 |
| SG | US | 5 |
| US | SG | 5 |
| DE | JP | 1 |

---

## q0122 · medium · AGREED · ordered

**Which 10 flights in October 2026 have the highest listed prices in US dollars? Return airline codes and names, connection numbers, flight dates, departure and arrival airport codes, and prices, highest price first, then by date, airline code, and connection number.**

Reference SQL:

```sql
SELECT f~carrier_id, c~name, f~connection_id, f~flight_date, n~airport_from_id, n~airport_to_id, f~price FROM /DMO/FLIGHT AS f INNER JOIN /DMO/CARRIER AS c ON c~carrier_id = f~carrier_id INNER JOIN /DMO/CONNECTION AS n ON n~carrier_id = f~carrier_id AND n~connection_id = f~connection_id WHERE f~flight_date BETWEEN '20261001' AND '20261031' AND f~currency_code = 'USD' ORDER BY f~price DESCENDING, f~flight_date ASCENDING, f~carrier_id ASCENDING, f~connection_id ASCENDING UP TO 10 ROWS
```

| CARRIER_ID | NAME | CONNECTION_ID | FLIGHT_DATE | AIRPORT_FROM_ID | AIRPORT_TO_ID | PRICE |
|---|---|---|---|---|---|---|
| UA | United Airlines, Inc. | 0001 | 20261002 | SFO | SIN | 13117.00 |
| UA | United Airlines, Inc. | 0029 | 20261024 | SFO | SIN | 13117.00 |
| UA | United Airlines, Inc. | 0028 | 20261007 | SIN | SFO | 12846.00 |
| UA | United Airlines, Inc. | 0029 | 20261015 | SFO | SIN | 12846.00 |
| UA | United Airlines, Inc. | 0002 | 20261003 | SIN | SFO | 12711.00 |
| UA | United Airlines, Inc. | 0002 | 20261025 | SIN | SFO | 12711.00 |
| UA | United Airlines, Inc. | 0002 | 20261029 | SIN | SFO | 12711.00 |
| UA | United Airlines, Inc. | 0002 | 20261002 | SIN | SFO | 12441.00 |
| UA | United Airlines, Inc. | 0001 | 20261023 | SFO | SIN | 12441.00 |
| UA | United Airlines, Inc. | 0028 | 20261028 | SIN | SFO | 12441.00 |

---

## q0253 · hard · AGREED · ordered

**Which 20 customers have the most trips that overlap another of their trips, counting shared start or end dates as overlaps? Return customer numbers, first and last names, and overlapping-trip counts, highest count first, then customer number.**

Reference SQL:

```sql
SELECT c~customer_id, c~first_name, c~last_name, COUNT(*) AS overlapping_trip_count FROM /dmo/customer AS c INNER JOIN /dmo/travel AS t ON t~customer_id = c~customer_id WHERE EXISTS ( SELECT * FROM /dmo/travel AS other WHERE other~customer_id = t~customer_id AND other~travel_id <> t~travel_id AND other~begin_date <= t~end_date AND other~end_date >= t~begin_date ) GROUP BY c~customer_id, c~first_name, c~last_name ORDER BY overlapping_trip_count DESCENDING, c~customer_id ASCENDING UP TO 20 ROWS
```

| CUSTOMER_ID | FIRST_NAME | LAST_NAME | OVERLAPPING_TRIP_COUNT |
|---|---|---|---|
| 000293 | Illya | Legrand | 14 |
| 000425 | Chantal | Pratt | 13 |
| 000185 | Irene | Goelke | 12 |
| 000602 | Hendrik | Prinz | 12 |
| 000693 | Adam | Leisert | 12 |
| 000069 | Thilo | Neubasler | 11 |
| 000072 | Theresia | Neubasler | 11 |
| 000190 | Uli | Goelke | 11 |
| 000191 | Anna | Goelke | 11 |
| 000274 | Kristina | Henry | 11 |

…10 more rows

---

## q0156 · medium · AGREED · ordered

**Which 10 passengers have the most add-on entries attached to their flight bookings? Return customer IDs, first and last names, add-on entry counts, and counts of different add-ons, most entries first, then by customer ID.**

Reference SQL:

```sql
SELECT c~customer_id, c~first_name, c~last_name, COUNT(*) AS addon_entry_count, COUNT( DISTINCT s~supplement_id ) AS distinct_addon_count FROM /dmo/customer AS c INNER JOIN /dmo/booking AS b ON b~customer_id = c~customer_id INNER JOIN /dmo/book_suppl AS s ON s~travel_id = b~travel_id AND s~booking_id = b~booking_id GROUP BY c~customer_id, c~first_name, c~last_name ORDER BY addon_entry_count DESCENDING, c~customer_id ASCENDING UP TO 10 ROWS
```

| CUSTOMER_ID | FIRST_NAME | LAST_NAME | ADDON_ENTRY_COUNT | DISTINCT_ADDON_COUNT |
|---|---|---|---|---|
| 000624 | Benjamin | Pan | 59 | 37 |
| 000357 | Allen | Cesari | 56 | 38 |
| 000253 | Kristina | Simonen | 55 | 36 |
| 000269 | Johann | Henry | 55 | 31 |
| 000495 | Lothar | Montero | 55 | 32 |
| 000389 | Sophie | Zimmermann | 54 | 36 |
| 000399 | Astrid | Kramer | 54 | 32 |
| 000635 | Theresia | Lindwurm | 53 | 34 |
| 000057 | Lee | Columbo | 52 | 36 |
| 000238 | Friedrich | Heller | 52 | 28 |

---

## q0056 · unanswerable · AGREED

**For flights in October 2026, list each carrier's name and the number of distinct pilots assigned to its flights.**

Reference SQL:

```sql
UNANSWERABLE
```

---

## q0117 · medium · AGREED · ordered

**Which 10 passengers have bookings to the most different destination airports? Return customer IDs, first and last names, and destination counts, most destinations first, then by customer ID.**

Reference SQL:

```sql
SELECT c~customer_id, c~first_name, c~last_name, COUNT( DISTINCT n~airport_to_id ) AS destination_count FROM /DMO/CUSTOMER AS c INNER JOIN /DMO/BOOKING AS b ON b~customer_id = c~customer_id INNER JOIN /DMO/CONNECTION AS n ON n~carrier_id = b~carrier_id AND n~connection_id = b~connection_id GROUP BY c~customer_id, c~first_name, c~last_name ORDER BY destination_count DESCENDING, c~customer_id ASCENDING UP TO 10 ROWS
```

| CUSTOMER_ID | FIRST_NAME | LAST_NAME | DESTINATION_COUNT |
|---|---|---|---|
| 000005 | Anna | Buchholm | 9 |
| 000037 | Astrid | Gutenberg | 9 |
| 000046 | Mathilde | Gutenberg | 9 |
| 000047 | Benjamin | Gutenberg | 9 |
| 000053 | Salvador | Fischmann | 9 |
| 000057 | Lee | Columbo | 9 |
| 000061 | Ulla | Columbo | 9 |
| 000068 | Johann | Columbo | 9 |
| 000069 | Thilo | Neubasler | 9 |
| 000072 | Theresia | Neubasler | 9 |

---

## q0192 · medium · AGREED

**For each departure country in October 2026, how many different airlines and aircraft types are scheduled to fly from it? Return country codes and both counts.**

Reference SQL:

```sql
SELECT a~country, COUNT( DISTINCT f~carrier_id ) AS airline_count, COUNT( DISTINCT f~plane_type_id ) AS aircraft_type_count FROM /DMO/FLIGHT AS f INNER JOIN /DMO/CONNECTION AS c ON c~carrier_id = f~carrier_id AND c~connection_id = f~connection_id INNER JOIN /DMO/AIRPORT AS a ON a~airport_id = c~airport_from_id WHERE f~flight_date BETWEEN '20261001' AND '20261031' GROUP BY a~country
```

| COUNTRY | AIRLINE_COUNT | AIRCRAFT_TYPE_COUNT |
|---|---|---|
| US | 8 | 18 |
| DE | 6 | 8 |
| CU | 2 | 2 |
| JP | 4 | 4 |
| SG | 5 | 5 |

---

## q0235 · easy · AGREED

**How many agencies have at least one trip recorded?**

Reference SQL:

```sql
SELECT COUNT( DISTINCT agency_id ) AS agency_count FROM /DMO/TRAVEL
```

| AGENCY_COUNT |
|---|
| 50 |

---

## q0119 · medium · AGREED

**For each airline and booking currency combination with at least one flight booking, show the airline code and name, currency, number of flight bookings, and total recorded flight charges.**

Reference SQL:

```sql
SELECT c~carrier_id, c~name, b~currency_code, COUNT(*) AS booking_count, SUM( b~flight_price ) AS total_flight_charges FROM /DMO/CARRIER AS c INNER JOIN /DMO/BOOKING AS b ON b~carrier_id = c~carrier_id GROUP BY c~carrier_id, c~name, b~currency_code
```

| CARRIER_ID | NAME | CURRENCY_CODE | BOOKING_COUNT | TOTAL_FLIGHT_CHARGES |
|---|---|---|---|---|
| NQ | Air Japan | JPY | 168 | 563617.00 |
| AS | Alaska Airlines | USD | 286 | 703224.00 |
| AZ | Alitalia Societa Aerea Italiana S.p.A. | EUR | 1416 | 5752153.00 |
| AA | American Airlines Inc. | USD | 2693 | 3376400.00 |
| DE | Condor | EUR | 176 | 902884.00 |
| DL | Delta Air Lines, Inc. | USD | 642 | 1490639.00 |
| LH | Deutsche Lufthansa AG | EUR | 2076 | 5369762.00 |
| JL | Japan Airlines Co., Ltd. | JPY | 1247 | 4621642.00 |
| B6 | JetBlue | USD | 377 | 992343.00 |
| TR | Scoot | SGD | 91 | 325911.00 |

…2 more rows

