# Review sheet (292 items)

Write one JSON line per decision to `review/decisions.jsonl`, then `npm run apply-review` (the `//` notes below are explanations — leave them out):

```
{"id":"q0001","action":"keep"}                      // agreed only
{"id":"q0002","action":"drop"}
{"id":"q0003","action":"use_reference"}             // disputed only
{"id":"q0004","action":"use_crosscheck"}            // disputed; add "tier" (+ "ordered") if answerability changes
{"id":"q0005","action":"rewrite","question":"…"}    // re-runs validate + cross-check; optional "tier", "ordered"
```

---

## q0026 · easy · AGREED

**How many different currencies do the airlines use?**

Reference SQL:

```sql
SELECT COUNT( DISTINCT c~currency_code ) AS currency_count FROM /dmo/carrier AS c
```

| CURRENCY_COUNT |
|---|
| 9 |

---

## q0027 · easy · AGREED · ordered

**Which airlines have 'Air' in their name? Show their airline codes, names and currency codes, sorted by airline code.**

Reference SQL:

```sql
SELECT c~carrier_id, c~name, c~currency_code FROM /dmo/carrier AS c WHERE c~name LIKE '%Air%' ORDER BY c~carrier_id ASCENDING
```

| CARRIER_ID | NAME | CURRENCY_CODE |
|---|---|---|
| AA | American Airlines Inc. | USD |
| AC | Air Canada | CAD |
| AF | Air France | EUR |
| AS | Alaska Airlines | USD |
| BA | British Airways p.l.c. | GBP |
| DL | Delta Air Lines, Inc. | USD |
| FJ | Air Pacific Limited t/a Fiji Airway | USD |
| JL | Japan Airlines Co., Ltd. | JPY |
| NQ | Air Japan | JPY |
| QF | Qantas Airways Ltd. | AUD |

…3 more rows

---

## q0028 · easy · AGREED

**What city and country code are listed for JFK airport?**

Reference SQL:

```sql
SELECT a~city, a~country FROM /dmo/airport AS a WHERE a~airport_id = 'JFK'
```

| CITY | COUNTRY |
|---|---|
| New York City, New York | US |

---

## q0029 · easy · AGREED

**How many airports are listed in Japan?**

Reference SQL:

```sql
SELECT COUNT(*) AS airport_count FROM /dmo/airport AS a WHERE a~country = 'JP'
```

| AIRPORT_COUNT |
|---|
| 4 |

---

## q0030 · easy · AGREED

**How many customers are there in each country? Show country codes and customer counts.**

Reference SQL:

```sql
SELECT c~country_code, COUNT(*) AS customer_count FROM /dmo/customer AS c GROUP BY c~country_code
```

| COUNTRY_CODE | CUSTOMER_COUNT |
|---|---|
| AT | 19 |
| BE | 11 |
| CH | 5 |
| DE | 476 |
| ES | 30 |
| FR | 47 |
| IT | 12 |
| SI | 2 |
| US | 126 |

---

## q0031 · easy · AGREED · ordered

**List customers with addresses in Switzerland, showing customer numbers, first names, last names and cities, sorted by last name, then first name and customer number.**

Reference SQL:

```sql
SELECT c~customer_id, c~first_name, c~last_name, c~city FROM /dmo/customer AS c WHERE c~country_code = 'CH' ORDER BY c~last_name ASCENDING, c~first_name ASCENDING, c~customer_id ASCENDING
```

| CUSTOMER_ID | FIRST_NAME | LAST_NAME | CITY |
|---|---|---|---|
| 000110 | Claire | Benz | Genève |
| 000232 | Claire | Buehler | Genève |
| 000092 | Claire | Detemple | Genève |
| 000499 | Claire | Domenech | Genève |
| 000382 | Claire | Zimmermann | Genève |

---

## q0032 · easy · AGREED · ordered

**List trips starting in March 2027, showing trip numbers and start and end dates, earliest start first, then by trip number.**

Reference SQL:

```sql
SELECT t~travel_id, t~begin_date, t~end_date FROM /dmo/travel AS t WHERE t~begin_date BETWEEN '20270301' AND '20270331' ORDER BY t~begin_date ASCENDING, t~travel_id ASCENDING
```

| TRAVEL_ID | BEGIN_DATE | END_DATE |
|---|---|---|
| 00004400 | 20270301 | 20270416 |
| 00004610 | 20270301 | 20270417 |
| 00004670 | 20270301 | 20270416 |
| 00004809 | 20270301 | 20270301 |
| 00004866 | 20270301 | 20270415 |
| 00004917 | 20270301 | 20270301 |
| 00005130 | 20270301 | 20270416 |

---

## q0033 · easy · AGREED

**How many trips are there in each status? Show status codes and trip counts.**

Reference SQL:

```sql
SELECT t~status, COUNT(*) AS trip_count FROM /dmo/travel AS t GROUP BY t~status
```

| STATUS | TRIP_COUNT |
|---|---|
| N | 2544 |
| B | 1313 |
| P | 1280 |

---

## q0034 · easy · AGREED · ordered

**List scheduled flights in March 2027, showing airline codes, route numbers, flight dates, aircraft types and seat capacities, sorted by date, then airline code and route number.**

Reference SQL:

```sql
SELECT f~carrier_id, f~connection_id, f~flight_date, f~plane_type_id, f~seats_max FROM /dmo/flight AS f WHERE f~flight_date BETWEEN '20270301' AND '20270331' ORDER BY f~flight_date ASCENDING, f~carrier_id ASCENDING, f~connection_id ASCENDING
```

| CARRIER_ID | CONNECTION_ID | FLIGHT_DATE | PLANE_TYPE_ID | SEATS_MAX |
|---|---|---|---|---|
| AA | 0015 | 20270301 | A321-200 | 190 |
| AA | 0016 | 20270301 | A321-200 | 190 |
| AA | 0017 | 20270301 | 737-800 | 160 |
| AA | 0076 | 20270301 | A321-200 | 190 |
| AA | 0148 | 20270301 | A321-200 | 190 |
| AA | 0149 | 20270301 | A321-200 | 190 |
| AA | 0166 | 20270301 | A321-200 | 190 |
| AA | 0177 | 20270301 | A321-200 | 190 |
| AA | 0179 | 20270301 | A321-200 | 190 |
| AA | 0234 | 20270301 | A321-200 | 190 |

…104 more rows

---

## q0035 · easy · AGREED

**How many different aircraft types are used across all scheduled flights?**

Reference SQL:

```sql
SELECT COUNT( DISTINCT f~plane_type_id ) AS aircraft_type_count FROM /dmo/flight AS f
```

| AIRCRAFT_TYPE_COUNT |
|---|
| 23 |

---

## q0036 · medium · AGREED · ordered

**Which 10 customers have the most trips? Return their IDs, first and last names, trip counts, and the number of different agencies they used, most trips first, then by customer ID.**

Reference SQL:

```sql
SELECT c~customer_id, c~first_name, c~last_name, COUNT(*) AS trip_count, COUNT( DISTINCT t~agency_id ) AS agency_count FROM /dmo/customer AS c INNER JOIN /dmo/travel AS t ON t~customer_id = c~customer_id GROUP BY c~customer_id, c~first_name, c~last_name ORDER BY trip_count DESCENDING, c~customer_id ASCENDING UP TO 10 ROWS
```

| CUSTOMER_ID | FIRST_NAME | LAST_NAME | TRIP_COUNT | AGENCY_COUNT |
|---|---|---|---|---|
| 000438 | Ruth | Gahl | 16 | 15 |
| 000531 | Gisela | Sommer | 15 | 13 |
| 000185 | Irene | Goelke | 14 | 12 |
| 000274 | Kristina | Henry | 14 | 13 |
| 000293 | Illya | Legrand | 14 | 12 |
| 000465 | Ida | Miguel | 14 | 12 |
| 000610 | Guillermo | Prinz | 14 | 13 |
| 000050 | Matthias | Fischmann | 13 | 12 |
| 000052 | Salvador | Fischmann | 13 | 11 |
| 000238 | Friedrich | Heller | 13 | 13 |

---

## q0037 · medium · AGREED · ordered

**Which 10 trips starting in October 2026 have the most flight bookings? Return trip IDs, the trip customers' first and last names, and booking counts, most bookings first, then by trip ID.**

Reference SQL:

```sql
SELECT t~travel_id, c~first_name, c~last_name, COUNT(*) AS booking_count FROM /dmo/travel AS t INNER JOIN /dmo/customer AS c ON c~customer_id = t~customer_id INNER JOIN /dmo/booking AS b ON b~travel_id = t~travel_id WHERE t~begin_date BETWEEN '20261001' AND '20261031' GROUP BY t~travel_id, c~first_name, c~last_name ORDER BY booking_count DESCENDING, t~travel_id ASCENDING UP TO 10 ROWS
```

| TRAVEL_ID | FIRST_NAME | LAST_NAME | BOOKING_COUNT |
|---|---|---|---|
| 00004156 | Christoph | Trensch | 6 |
| 00004171 | Anneliese | Waldmann | 6 |
| 00004173 | Horst | Neubasler | 6 |
| 00004245 | Andreas | Mustermann | 6 |
| 00004257 | Matthias | Marshall | 6 |
| 00004260 | Adam | Matthaeus | 6 |
| 00004314 | Ruth | Picard | 6 |
| 00004347 | Kurt | Kramer | 6 |
| 00004380 | Walter | Henry | 6 |
| 00004385 | Anna | Schneider | 6 |

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

## q0039 · medium · AGREED · ordered

**Which 10 airport pairs have connections offered by the most different airlines, treating each direction separately? Return departure and arrival airport codes and names, plus airline counts, highest count first, then by departure code and arrival code.**

Reference SQL:

```sql
SELECT c~airport_from_id, a~name AS departure_airport_name, c~airport_to_id, z~name AS arrival_airport_name, COUNT( DISTINCT c~carrier_id ) AS airline_count FROM /dmo/connection AS c INNER JOIN /dmo/airport AS a ON a~airport_id = c~airport_from_id INNER JOIN /dmo/airport AS z ON z~airport_id = c~airport_to_id GROUP BY c~airport_from_id, a~name, c~airport_to_id, z~name ORDER BY airline_count DESCENDING, c~airport_from_id ASCENDING, c~airport_to_id ASCENDING UP TO 10 ROWS
```

| AIRPORT_FROM_ID | DEPARTURE_AIRPORT_NAME | AIRPORT_TO_ID | ARRIVAL_AIRPORT_NAME | AIRLINE_COUNT |
|---|---|---|---|---|
| FRA | Frankfurt Airport | JFK | John F. Kennedy International Airport | 4 |
| JFK | John F. Kennedy International Airport | FRA | Frankfurt Airport | 4 |
| JFK | John F. Kennedy International Airport | SFO | San Francisco International Airport | 4 |
| NRT | Narita International Airport | SIN | Singapore Changi Airport | 4 |
| SFO | San Francisco International Airport | JFK | John F. Kennedy International Airport | 4 |
| SIN | Singapore Changi Airport | NRT | Narita International Airport | 4 |
| FRA | Frankfurt Airport | SFO | San Francisco International Airport | 3 |
| SFO | San Francisco International Airport | FRA | Frankfurt Airport | 3 |
| EWR | Newark Liberty International Airport | FRA | Frankfurt Airport | 2 |
| EWR | Newark Liberty International Airport | MIA | Miami International Airport | 2 |

---

## q0040 · medium · AGREED · ordered

**Which 10 combinations of agency country and customer country account for the most trips? Return both country codes and trip counts, most trips first, then by agency country and customer country.**

Reference SQL:

```sql
SELECT a~country_code AS agency_country, c~country_code AS customer_country, COUNT(*) AS trip_count FROM /dmo/travel AS t INNER JOIN /dmo/agency AS a ON a~agency_id = t~agency_id INNER JOIN /dmo/customer AS c ON c~customer_id = t~customer_id GROUP BY a~country_code, c~country_code ORDER BY trip_count DESCENDING, a~country_code ASCENDING, c~country_code ASCENDING UP TO 10 ROWS
```

| AGENCY_COUNTRY | CUSTOMER_COUNTRY | TRIP_COUNT |
|---|---|---|
| DE | DE | 1310 |
| US | DE | 912 |
| DE | US | 392 |
| GB | DE | 355 |
| US | US | 248 |
| DE | FR | 121 |
| DE | ES | 96 |
| GB | US | 96 |
| CA | DE | 85 |
| US | FR | 82 |

---

## q0041 · medium · AGREED

**For each add-on category with at least one offered add-on, how many different add-ons are offered and how many currencies are used for their catalog prices? Return category codes and both counts.**

Reference SQL:

```sql
SELECT s~supplement_category, COUNT(*) AS addon_count, COUNT( DISTINCT s~currency_code ) AS currency_count FROM /dmo/supplement AS s GROUP BY s~supplement_category
```

| SUPPLEMENT_CATEGORY | ADDON_COUNT | CURRENCY_COUNT |
|---|---|---|
| ML | 36 | 1 |
| BV | 9 | 1 |
| LU | 3 | 1 |

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

## q0043 · medium · AGREED · ordered

**Which 10 agencies have the highest total booking fees on trips priced in euros? Return agency IDs, names, and total booking fees in euros, highest total first, then by agency ID.**

Reference SQL:

```sql
SELECT a~agency_id, a~name, SUM( t~booking_fee ) AS total_booking_fees FROM /dmo/agency AS a INNER JOIN /dmo/travel AS t ON t~agency_id = a~agency_id WHERE t~currency_code = 'EUR' GROUP BY a~agency_id, a~name ORDER BY total_booking_fees DESCENDING, a~agency_id ASCENDING UP TO 10 ROWS
```

| AGENCY_ID | NAME | TOTAL_BOOKING_FEES |
|---|---|---|
| 070042 | The Ultimate Answer | 1290.00 |
| 070048 | Rocky Horror Tours | 1190.00 |
| 070021 | Special Agency Peru | 1160.00 |
| 070030 | Trans World Travel | 1130.00 |
| 070036 | Fly Now, Pay Later | 1080.00 |
| 070017 | Super Agency | 1050.00 |
| 070046 | Hendrik's | 1050.00 |
| 070035 | Hitchhiker | 1040.00 |
| 070041 | Maxitrip | 1010.00 |
| 070022 | Caribian Dreams | 940.00 |

---

## q0044 · medium · AGREED

**For each airline with flight bookings for November 2026 departures, show its code and name, the number of bookings, and the number of distinct passengers.**

Reference SQL:

```sql
SELECT c~carrier_id, c~name, COUNT(*) AS booking_count, COUNT( DISTINCT b~customer_id ) AS passenger_count FROM /dmo/carrier AS c INNER JOIN /dmo/booking AS b ON b~carrier_id = c~carrier_id WHERE b~flight_date BETWEEN '20261101' AND '20261130' GROUP BY c~carrier_id, c~name
```

| CARRIER_ID | NAME | BOOKING_COUNT | PASSENGER_COUNT |
|---|---|---|---|
| AA | American Airlines Inc. | 136 | 68 |
| SQ | Singapore Airlines Limited | 65 | 36 |
| LH | Deutsche Lufthansa AG | 16 | 9 |
| UA | United Airlines, Inc. | 119 | 66 |
| DL | Delta Air Lines, Inc. | 103 | 52 |
| DE | Condor | 4 | 3 |
| B6 | JetBlue | 67 | 32 |
| NQ | Air Japan | 28 | 16 |
| AS | Alaska Airlines | 43 | 26 |
| JL | Japan Airlines Co., Ltd. | 16 | 9 |

…1 more rows

---

## q0045 · medium · AGREED · ordered

**Which 10 flights in October 2026 have the most unoccupied seats? Return airline codes and names, connection numbers, dates, departure and arrival airport codes, and unoccupied seat counts, most unoccupied seats first, then by date, airline code, and connection number.**

Reference SQL:

```sql
SELECT f~carrier_id, a~name, f~connection_id, f~flight_date, c~airport_from_id, c~airport_to_id, f~seats_max - f~seats_occupied AS unoccupied_seats FROM /dmo/flight AS f INNER JOIN /dmo/carrier AS a ON a~carrier_id = f~carrier_id INNER JOIN /dmo/connection AS c ON c~carrier_id = f~carrier_id AND c~connection_id = f~connection_id WHERE f~flight_date BETWEEN '20261001' AND '20261031' ORDER BY unoccupied_seats DESCENDING, f~flight_date ASCENDING, f~carrier_id ASCENDING, f~connection_id ASCENDING UP TO 10 ROWS
```

| CARRIER_ID | NAME | CONNECTION_ID | FLIGHT_DATE | AIRPORT_FROM_ID | AIRPORT_TO_ID | UNOCCUPIED_SEATS |
|---|---|---|---|---|---|---|
| LH | Deutsche Lufthansa AG | 0454 | 20261002 | FRA | SFO | 219 |
| LH | Deutsche Lufthansa AG | 0455 | 20261001 | SFO | FRA | 215 |
| LH | Deutsche Lufthansa AG | 0402 | 20261023 | FRA | EWR | 215 |
| LH | Deutsche Lufthansa AG | 0403 | 20261002 | EWR | FRA | 212 |
| LH | Deutsche Lufthansa AG | 0403 | 20261006 | EWR | FRA | 212 |
| LH | Deutsche Lufthansa AG | 0455 | 20261023 | SFO | FRA | 212 |
| LH | Deutsche Lufthansa AG | 0403 | 20261013 | EWR | FRA | 208 |
| SQ | Singapore Airlines Limited | 0637 | 20261017 | NRT | SIN | 203 |
| SQ | Singapore Airlines Limited | 0637 | 20261030 | NRT | SIN | 203 |
| SQ | Singapore Airlines Limited | 0638 | 20261001 | SIN | NRT | 199 |

---

## q0046 · hard · AGREED · ordered

**For each flight connection that has flights in October 2026, which flight had the most occupied seats? Break ties by earliest date. Return carrier code, connection number, flight date, occupied seats, and seat capacity, sorted by carrier code, connection number, then date.**

Reference SQL:

```sql
SELECT f~carrier_id, f~connection_id, f~flight_date, f~seats_occupied, f~seats_max FROM /dmo/flight AS f WHERE f~flight_date BETWEEN '20261001' AND '20261031' AND NOT EXISTS ( SELECT * FROM /dmo/flight AS g WHERE g~carrier_id = f~carrier_id AND g~connection_id = f~connection_id AND g~flight_date BETWEEN '20261001' AND '20261031' AND ( g~seats_occupied > f~seats_occupied OR ( g~seats_occupied = f~seats_occupied AND g~flight_date < f~flight_date ) ) ) ORDER BY f~carrier_id ASCENDING, f~connection_id ASCENDING, f~flight_date ASCENDING
```

| CARRIER_ID | CONNECTION_ID | FLIGHT_DATE | SEATS_OCCUPIED | SEATS_MAX |
|---|---|---|---|---|
| AA | 0015 | 20261008 | 186 | 190 |
| AA | 0016 | 20261007 | 182 | 190 |
| AA | 0017 | 20261023 | 150 | 160 |
| AA | 0076 | 20261029 | 178 | 190 |
| AA | 0148 | 20261031 | 180 | 190 |
| AA | 0149 | 20261023 | 186 | 190 |
| AA | 0166 | 20261014 | 184 | 190 |
| AA | 0177 | 20261011 | 182 | 190 |
| AA | 0179 | 20261008 | 186 | 190 |
| AA | 0234 | 20261021 | 182 | 190 |

…104 more rows

---

## q0047 · hard · AGREED

**Which agencies handled at least three trips starting in October 2026? Return agency numbers, names, trip counts, and distinct customer counts.**

Reference SQL:

```sql
SELECT a~agency_id, a~name, COUNT(*) AS trip_count, COUNT( DISTINCT t~customer_id ) AS customer_count FROM /dmo/agency AS a INNER JOIN /dmo/travel AS t ON t~agency_id = a~agency_id WHERE t~begin_date BETWEEN '20261001' AND '20261031' GROUP BY a~agency_id, a~name HAVING COUNT(*) >= 3
```

| AGENCY_ID | NAME | TRIP_COUNT | CUSTOMER_COUNT |
|---|---|---|---|
| 070021 | Special Agency Peru | 4 | 4 |
| 070018 | Wang Chong | 3 | 3 |
| 070019 | Around the World | 3 | 3 |
| 070007 | Hot Socks Travel | 8 | 8 |
| 070048 | Rocky Horror Tours | 4 | 4 |
| 070009 | Honauer Reisen GmbH | 10 | 10 |
| 070033 | Fly & Smile | 4 | 4 |
| 070034 | Supercheap | 3 | 3 |
| 070045 |  | 3 | 3 |
| 070016 | Ali's Bazar | 4 | 4 |

…24 more rows

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

## q0049 · hard · AGREED

**Which currencies were used by at least two carriers for flights in October 2026? Return each currency, the number of carriers, and the lowest and highest flight prices in that currency.**

Reference SQL:

```sql
SELECT f~currency_code, COUNT( DISTINCT f~carrier_id ) AS carrier_count, MIN( f~price ) AS lowest_price, MAX( f~price ) AS highest_price FROM /dmo/flight AS f WHERE f~flight_date BETWEEN '20261001' AND '20261031' GROUP BY f~currency_code HAVING COUNT( DISTINCT f~carrier_id ) >= 2
```

| CURRENCY_CODE | CARRIER_COUNT | LOWEST_PRICE | HIGHEST_PRICE |
|---|---|---|---|
| USD | 5 | 192.00 | 13117.00 |
| JPY | 2 | 1984.00 | 8910.00 |
| SGD | 2 | 1984.00 | 13117.00 |
| EUR | 2 | 2279.00 | 9319.00 |

---

## q0050 · hard · AGREED

**For each carrier with flights in November 2026, how many flights were at least 90% full and how many were below 90% full? Return carrier codes, names, and both flight counts.**

Reference SQL:

```sql
SELECT c~carrier_id, c~name, SUM( CASE WHEN f~seats_occupied * 10 >= f~seats_max * 9 THEN 1 ELSE 0 END ) AS flights_at_least_90_percent, SUM( CASE WHEN f~seats_occupied * 10 < f~seats_max * 9 THEN 1 ELSE 0 END ) AS flights_below_90_percent FROM /dmo/carrier AS c INNER JOIN /dmo/flight AS f ON f~carrier_id = c~carrier_id WHERE f~flight_date BETWEEN '20261101' AND '20261130' GROUP BY c~carrier_id, c~name
```

| CARRIER_ID | NAME | FLIGHTS_AT_LEAST_90_PERCENT | FLIGHTS_BELOW_90_PERCENT |
|---|---|---|---|
| AA | American Airlines Inc. | 120 | 690 |
| B6 | JetBlue | 47 | 313 |
| DL | Delta Air Lines, Inc. | 65 | 385 |
| UA | United Airlines, Inc. | 82 | 518 |
| AS | Alaska Airlines | 30 | 210 |
| JL | Japan Airlines Co., Ltd. | 20 | 100 |
| SQ | Singapore Airlines Limited | 29 | 271 |
| LH | Deutsche Lufthansa AG | 31 | 209 |
| NQ | Air Japan | 18 | 102 |
| DE | Condor | 18 | 102 |

…1 more rows

---

## q0051 · hard · AGREED

**Which departure airports had flights operated by at least two carriers in October 2026? Return airport codes, names, carrier counts, and scheduled flight counts.**

Reference SQL:

```sql
SELECT a~airport_id, a~name, COUNT( DISTINCT f~carrier_id ) AS carrier_count, COUNT(*) AS flight_count FROM /dmo/airport AS a INNER JOIN /dmo/connection AS n ON n~airport_from_id = a~airport_id INNER JOIN /dmo/flight AS f ON f~carrier_id = n~carrier_id AND f~connection_id = n~connection_id WHERE f~flight_date BETWEEN '20261001' AND '20261031' GROUP BY a~airport_id, a~name HAVING COUNT( DISTINCT f~carrier_id ) >= 2
```

| AIRPORT_ID | NAME | CARRIER_COUNT | FLIGHT_COUNT |
|---|---|---|---|
| FRA | Frankfurt Airport | 6 | 372 |
| JFK | John F. Kennedy International Airport | 7 | 837 |
| EWR | Newark Liberty International Airport | 3 | 310 |
| SFO | San Francisco International Airport | 8 | 837 |
| NRT | Narita International Airport | 4 | 217 |
| SIN | Singapore Changi Airport | 5 | 310 |
| MIA | Miami International Airport | 3 | 465 |
| HAV | José Martí International Airport | 2 | 186 |

---

## q0052 · hard · AGREED

**For each trip status, show the longest trip starting in October 2026, choosing the lowest trip number if tied. Return the status code, trip number, start and end dates, and the number of days between those dates.**

Reference SQL:

```sql
SELECT t~status, t~travel_id, t~begin_date, t~end_date, DATS_DAYS_BETWEEN( t~begin_date, t~end_date ) AS duration_days FROM /dmo/travel AS t WHERE t~begin_date BETWEEN '20261001' AND '20261031' AND NOT EXISTS ( SELECT * FROM /dmo/travel AS u WHERE u~status = t~status AND u~begin_date BETWEEN '20261001' AND '20261031' AND ( DATS_DAYS_BETWEEN( u~begin_date, u~end_date ) > DATS_DAYS_BETWEEN( t~begin_date, t~end_date ) OR ( DATS_DAYS_BETWEEN( u~begin_date, u~end_date ) = DATS_DAYS_BETWEEN( t~begin_date, t~end_date ) AND u~travel_id < t~travel_id ) ) )
```

| STATUS | TRAVEL_ID | BEGIN_DATE | END_DATE | DURATION_DAYS |
|---|---|---|---|---|
| N | 00004150 | 20261015 | 20261022 | 7 |
| B | 00004161 | 20261011 | 20261018 | 7 |
| P | 00004339 | 20261003 | 20261010 | 7 |

---

## q0053 · hard · AGREED

**Which agencies booked flights with at least three different carriers for trips starting in October 2026? Return agency numbers, names, the number of carriers, and the number of flight bookings for those trips.**

Reference SQL:

```sql
SELECT a~agency_id, a~name, COUNT( DISTINCT b~carrier_id ) AS carrier_count, COUNT(*) AS booking_count FROM /dmo/agency AS a INNER JOIN /dmo/travel AS t ON t~agency_id = a~agency_id INNER JOIN /dmo/booking AS b ON b~travel_id = t~travel_id WHERE t~begin_date BETWEEN '20261001' AND '20261031' GROUP BY a~agency_id, a~name HAVING COUNT( DISTINCT b~carrier_id ) >= 3
```

| AGENCY_ID | NAME | CARRIER_COUNT | BOOKING_COUNT |
|---|---|---|---|
| 070021 | Special Agency Peru | 3 | 16 |
| 070019 | Around the World | 3 | 8 |
| 070007 | Hot Socks Travel | 3 | 30 |
| 070048 | Rocky Horror Tours | 4 | 16 |
| 070009 | Honauer Reisen GmbH | 4 | 44 |
| 070033 | Fly & Smile | 4 | 14 |
| 070034 | Supercheap | 3 | 8 |
| 070045 |  | 3 | 12 |
| 070016 | Ali's Bazar | 4 | 16 |
| 070002 | Fly High | 4 | 26 |

…19 more rows

---

## q0054 · hard · AGREED

**For each customer with a trip starting in April 2027, show their latest-starting trip that month, choosing the highest trip number if tied. Return customer number, first and last names, trip number, and start date.**

Reference SQL:

```sql
SELECT c~customer_id, c~first_name, c~last_name, t~travel_id, t~begin_date FROM /dmo/customer AS c INNER JOIN /dmo/travel AS t ON t~customer_id = c~customer_id WHERE t~begin_date BETWEEN '20270401' AND '20270430' AND NOT EXISTS ( SELECT * FROM /dmo/travel AS u WHERE u~customer_id = t~customer_id AND u~begin_date BETWEEN '20270401' AND '20270430' AND ( u~begin_date > t~begin_date OR ( u~begin_date = t~begin_date AND u~travel_id > t~travel_id ) ) )
```

| CUSTOMER_ID | FIRST_NAME | LAST_NAME | TRAVEL_ID | BEGIN_DATE |
|---|---|---|---|---|
| 000201 | Christoph | Waldmann | 00000043 | 20270416 |
| 000514 | Holm | Moyano | 00000044 | 20270416 |
| 000518 | Johann | Moyano | 00000046 | 20270416 |
| 000639 | Johannes | Kirk | 00000051 | 20270416 |
| 000163 | Thomas | Hoffen | 00000053 | 20270416 |
| 000369 | Florian | Babilon | 00000056 | 20270416 |
| 000509 | Jean | Moyano | 00000057 | 20270418 |
| 000101 | Christa | Detemple | 00000059 | 20270418 |
| 000555 | Laura | Gueldenpfennig | 00000060 | 20270418 |
| 000168 | Marta | Dumbach | 00000061 | 20270418 |

…678 more rows

---

## q0055 · hard · AGREED

**For each currency used by trips starting in October or November 2026, show the total trip prices for each month and the change from October to November. Keep currencies separate.**

Reference SQL:

```sql
SELECT t~currency_code, SUM( CASE WHEN t~begin_date BETWEEN '20261001' AND '20261031' THEN t~total_price ELSE 0 END ) AS october_total, SUM( CASE WHEN t~begin_date BETWEEN '20261101' AND '20261130' THEN t~total_price ELSE 0 END ) AS november_total, SUM( CASE WHEN t~begin_date BETWEEN '20261101' AND '20261130' THEN t~total_price ELSE 0 END ) - SUM( CASE WHEN t~begin_date BETWEEN '20261001' AND '20261031' THEN t~total_price ELSE 0 END ) AS price_change FROM /dmo/travel AS t WHERE t~begin_date BETWEEN '20261001' AND '20261130' GROUP BY t~currency_code
```

| CURRENCY_CODE | OCTOBER_TOTAL | NOVEMBER_TOTAL | PRICE_CHANGE |
|---|---|---|---|
| EUR | 556345.60 | 87912.80 | 468432.80- |
| JPY | 66665.50 | 175080.60 | 108415.10 |
| SGD | 300593.50 | 406548.00 | 105954.50 |
| USD | 1151768.60 | 1188236.70 | 36468.10 |

---

## q0056 · unanswerable · AGREED

**For flights in October 2026, list each carrier's name and the number of distinct pilots assigned to its flights.**

Reference SQL:

```sql
UNANSWERABLE
```

---

## q0057 · unanswerable · AGREED

**How many passengers had window seats on flights in November 2026?**

Reference SQL:

```sql
UNANSWERABLE
```

---

## q0058 · unanswerable · AGREED

**For flights in December 2026, list each carrier's name and its average passenger meal rating, rounded to 2 decimals.**

Reference SQL:

```sql
UNANSWERABLE
```

---

## q0059 · unanswerable · AGREED

**How many flights in September 2026 took off during thunderstorms at their departure airport?**

Reference SQL:

```sql
UNANSWERABLE
```

---

## q0060 · unanswerable · AGREED

**For flights in January 2027, list each carrier's name and the number of passengers who used onboard Wi-Fi.**

Reference SQL:

```sql
UNANSWERABLE
```

---

## q0061 · unanswerable · AGREED

**How many customers on trips starting in October 2026 had passports that expired before their trip ended?**

Reference SQL:

```sql
UNANSWERABLE
```

---

## q0062 · unanswerable · AGREED

**For flights in February 2027, list each carrier's name and the number of flights that used a jet bridge for boarding.**

Reference SQL:

```sql
UNANSWERABLE
```

---

## q0063 · unanswerable · AGREED

**How many passengers checked in online for flights in December 2026?**

Reference SQL:

```sql
UNANSWERABLE
```

---

## q0064 · unanswerable · AGREED

**For November 2026, list each departure airport's name and its average security screening wait in minutes, rounded to 2 decimals.**

Reference SQL:

```sql
UNANSWERABLE
```

---

## q0065 · unanswerable · AGREED

**For flights scheduled in January 2027, list each carrier's name and the number of flights canceled because of mechanical problems.**

Reference SQL:

```sql
UNANSWERABLE
```

---

## q0066 · easy · AGREED

**How many scheduled flights does each airline have, including airlines with none (show 0)? Show airline codes and flight counts.**

Reference SQL:

```sql
SELECT c~carrier_id, COUNT( f~carrier_id ) AS flight_count
FROM /dmo/carrier AS c
LEFT OUTER JOIN /dmo/flight AS f ON f~carrier_id = c~carrier_id
GROUP BY c~carrier_id
```

| CARRIER_ID | FLIGHT_COUNT |
|---|---|
| AA | 4870 |
| AC | 0 |
| AF | 0 |
| AS | 1440 |
| AZ | 4 |
| B6 | 2160 |
| BA | 0 |
| CO | 0 |
| DE | 720 |
| DL | 2700 |

…11 more rows

---

## q0067 · easy · AGREED · ordered

**Show the 5 scheduled flights with the largest seating capacities, including airline codes, route numbers, dates and capacities. Sort by capacity, largest first, then by date, airline code and route number.**

Reference SQL:

```sql
SELECT f~carrier_id, f~connection_id, f~flight_date, f~seats_max FROM /dmo/flight AS f ORDER BY f~seats_max DESCENDING, f~flight_date ASCENDING, f~carrier_id ASCENDING, f~connection_id ASCENDING UP TO 5 ROWS
```

| CARRIER_ID | CONNECTION_ID | FLIGHT_DATE | SEATS_MAX |
|---|---|---|---|
| AZ | 0789 | 20260620 | 475 |
| LH | 0401 | 20260620 | 475 |
| AZ | 0788 | 20260621 | 475 |
| AA | 0018 | 20270415 | 475 |
| AZ | 0789 | 20270416 | 475 |

---

## q0068 · easy · AGREED · ordered

**Show the 10 most expensive trips priced in euros, with trip numbers and total prices, highest price first, then by trip number.**

Reference SQL:

```sql
SELECT t~travel_id, t~total_price FROM /dmo/travel AS t WHERE t~currency_code = 'EUR' ORDER BY t~total_price DESCENDING, t~travel_id ASCENDING UP TO 10 ROWS
```

| TRAVEL_ID | TOTAL_PRICE |
|---|---|
| 00004795 | 51713.00 |
| 00000160 | 48264.00 |
| 00000156 | 47464.00 |
| 00004864 | 46498.00 |
| 00000129 | 44181.00 |
| 00004688 | 43098.00 |
| 00004420 | 40496.50 |
| 00004158 | 39308.50 |
| 00004169 | 38715.80 |
| 00004814 | 38211.00 |

---

## q0069 · easy · AGREED · ordered

**Which 10 agencies have the most trips? Show agency numbers and trip counts, most trips first, then by agency number.**

Reference SQL:

```sql
SELECT t~agency_id, COUNT(*) AS trip_count FROM /dmo/travel AS t GROUP BY t~agency_id ORDER BY trip_count DESCENDING, t~agency_id ASCENDING UP TO 10 ROWS
```

| AGENCY_ID | TRIP_COUNT |
|---|---|
| 070007 | 123 |
| 070037 | 121 |
| 070017 | 120 |
| 070020 | 118 |
| 070041 | 118 |
| 070046 | 117 |
| 070030 | 114 |
| 070038 | 114 |
| 070042 | 114 |
| 070022 | 112 |

---

## q0070 · easy · AGREED · ordered

**Which cities do our customers live in? Show each city and country code combination once, sorted by country code and then city.**

Reference SQL:

```sql
SELECT DISTINCT c~city, c~country_code FROM /dmo/customer AS c ORDER BY c~country_code ASCENDING, c~city ASCENDING
```

| CITY | COUNTRY_CODE |
|---|---|
| Linz | AT |
| Bruxelles | BE |
| Genève | CH |
| Amelie | DE |
| Berlin | DE |
| Buxtehude | DE |
| Darmstadt | DE |
| Dielheim | DE |
| Elsenz | DE |
| Emmendingen | DE |

…48 more rows

---

## q0071 · easy · AGREED

**Which cities have more than one airport listed? Show cities, country codes and airport counts.**

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

## q0072 · easy · AGREED

**How many airlines use each currency? Show currency codes and airline counts.**

Reference SQL:

```sql
SELECT c~currency_code, COUNT(*) AS airline_count FROM /dmo/carrier AS c GROUP BY c~currency_code
```

| CURRENCY_CODE | AIRLINE_COUNT |
|---|---|
| AUD | 1 |
| CAD | 1 |
| CHF | 1 |
| EUR | 5 |
| GBP | 1 |
| JPY | 2 |
| SGD | 2 |
| USD | 7 |
| ZAR | 1 |

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

## q0074 · easy · AGREED · ordered

**List up to 20 available extras, showing their codes, category codes, prices and currencies, sorted by extra code.**

Reference SQL:

```sql
SELECT s~supplement_id, s~supplement_category, s~price, s~currency_code FROM /dmo/supplement AS s ORDER BY s~supplement_id ASCENDING UP TO 20 ROWS
```

| SUPPLEMENT_ID | SUPPLEMENT_CATEGORY | PRICE | CURRENCY_CODE |
|---|---|---|---|
| BV-0001 | BV | 4.50 | EUR |
| BV-0002 | BV | 3.50 | EUR |
| BV-0003 | BV | 3.50 | EUR |
| BV-0004 | BV | 3.50 | EUR |
| BV-0005 | BV | 3.50 | EUR |
| BV-0006 | BV | 3.50 | EUR |
| BV-0007 | BV | 3.50 | EUR |
| BV-0008 | BV | 7.50 | EUR |
| BV-0009 | BV | 2.30 | EUR |
| LU-0001 | LU | 80.00 | EUR |

…10 more rows

---

## q0075 · easy · AGREED · ordered

**Show the 10 trips with the latest end dates, including trip numbers, start dates and end dates. Sort by end date, latest first, then by trip number.**

Reference SQL:

```sql
SELECT t~travel_id, t~begin_date, t~end_date FROM /dmo/travel AS t ORDER BY t~end_date DESCENDING, t~travel_id ASCENDING UP TO 10 ROWS
```

| TRAVEL_ID | BEGIN_DATE | END_DATE |
|---|---|---|
| 00000001 | 20260620 | 20270418 |
| 00000003 | 20260620 | 20270418 |
| 00000004 | 20260620 | 20270418 |
| 00000006 | 20260620 | 20270418 |
| 00000007 | 20260620 | 20270418 |
| 00000009 | 20260620 | 20270418 |
| 00000016 | 20260620 | 20270418 |
| 00000017 | 20260620 | 20270418 |
| 00000018 | 20260620 | 20270418 |
| 00000019 | 20260620 | 20270418 |

---

## q0076 · medium · AGREED

**For each aircraft type used in October 2026, show the type, number of flights, and total seat capacity.**

Reference SQL:

```sql
SELECT f~plane_type_id, COUNT(*) AS flight_count, SUM( f~seats_max ) AS total_seat_capacity FROM /dmo/flight AS f WHERE f~flight_date BETWEEN '20261001' AND '20261031' GROUP BY f~plane_type_id
```

| PLANE_TYPE_ID | FLIGHT_COUNT | TOTAL_SEAT_CAPACITY |
|---|---|---|
| A340-600 | 62 | 18414 |
| 787-10 | 62 | 20894 |
| 787-9 | 434 | 108500 |
| 737-800 | 372 | 59520 |
| 737 MAX 9 | 310 | 55180 |
| 757-200 | 155 | 30845 |
| 737-900 | 93 | 16554 |
| 777-200 | 62 | 18600 |
| A330-900 | 124 | 38440 |
| A319-100 | 186 | 23808 |

…9 more rows

---

## q0077 · medium · AGREED

**What are each airline's lowest and highest listed flight prices in September 2026, separately by currency, for airlines with flights in that month? Return airline codes, names, currencies, and both prices.**

Reference SQL:

```sql
SELECT c~carrier_id, c~name, f~currency_code, MIN( f~price ) AS lowest_price, MAX( f~price ) AS highest_price FROM /dmo/carrier AS c INNER JOIN /dmo/flight AS f ON f~carrier_id = c~carrier_id WHERE f~flight_date BETWEEN '20260901' AND '20260930' GROUP BY c~carrier_id, c~name, f~currency_code
```

| CARRIER_ID | NAME | CURRENCY_CODE | LOWEST_PRICE | HIGHEST_PRICE |
|---|---|---|---|---|
| AA | American Airlines Inc. | USD | 192.00 | 4031.00 |
| B6 | JetBlue | USD | 1537.00 | 4031.00 |
| DL | Delta Air Lines, Inc. | USD | 192.00 | 5669.00 |
| UA | United Airlines, Inc. | USD | 648.00 | 13117.00 |
| AS | Alaska Airlines | USD | 1537.00 | 4031.00 |
| JL | Japan Airlines Co., Ltd. | JPY | 1984.00 | 9097.00 |
| SQ | Singapore Airlines Limited | SGD | 1984.00 | 13117.00 |
| LH | Deutsche Lufthansa AG | EUR | 2279.00 | 9127.00 |
| NQ | Air Japan | JPY | 1984.00 | 5094.00 |
| DE | Condor | EUR | 2279.00 | 9319.00 |

…1 more rows

---

## q0078 · medium · AGREED

**For each airline that has listed connections, how many different destination airports does it serve through those connections? Return airline codes, names, and destination airport counts.**

Reference SQL:

```sql
SELECT c~carrier_id, c~name, COUNT( DISTINCT r~airport_to_id ) AS destination_airport_count FROM /dmo/carrier AS c INNER JOIN /dmo/connection AS r ON r~carrier_id = c~carrier_id GROUP BY c~carrier_id, c~name
```

| CARRIER_ID | NAME | DESTINATION_AIRPORT_COUNT |
|---|---|---|
| SQ | Singapore Airlines Limited | 5 |
| UA | United Airlines, Inc. | 5 |
| AA | American Airlines Inc. | 5 |
| AZ | Alitalia Societa Aerea Italiana S.p.A. | 2 |
| LH | Deutsche Lufthansa AG | 4 |
| DL | Delta Air Lines, Inc. | 5 |
| DE | Condor | 3 |
| JL | Japan Airlines Co., Ltd. | 3 |
| TR | Scoot | 2 |
| NQ | Air Japan | 2 |

…2 more rows

---

## q0079 · medium · AGREED · ordered

**Which 10 agencies have booked the widest variety of airlines? Return agency IDs, names, and distinct airline counts, most airlines first, then by agency ID.**

Reference SQL:

```sql
SELECT a~agency_id, a~name, COUNT( DISTINCT b~carrier_id ) AS airline_count FROM /dmo/agency AS a INNER JOIN /dmo/travel AS t ON t~agency_id = a~agency_id INNER JOIN /dmo/booking AS b ON b~travel_id = t~travel_id GROUP BY a~agency_id, a~name ORDER BY airline_count DESCENDING, a~agency_id ASCENDING UP TO 10 ROWS
```

| AGENCY_ID | NAME | AIRLINE_COUNT |
|---|---|---|
| 070002 | Fly High | 12 |
| 070027 | Fly Low | 12 |
| 070034 | Supercheap | 12 |
| 070044 | Ultimate Goal | 12 |
| 070004 | Pink Panther | 11 |
| 070006 | Bella Italia | 11 |
| 070012 | Ben McCloskey Ltd. | 11 |
| 070014 | Kangeroos | 11 |
| 070015 | Bavarian Castle | 11 |
| 070018 | Wang Chong | 11 |

---

## q0080 · medium · AGREED

**For each airline and passenger home country combination with flight bookings, show the airline code and name, country code, number of flight bookings, and number of distinct passengers.**

Reference SQL:

```sql
SELECT c~carrier_id, c~name, p~country_code, COUNT(*) AS booking_count, COUNT( DISTINCT b~customer_id ) AS passenger_count FROM /dmo/booking AS b INNER JOIN /dmo/carrier AS c ON c~carrier_id = b~carrier_id INNER JOIN /dmo/customer AS p ON p~customer_id = b~customer_id GROUP BY c~carrier_id, c~name, p~country_code
```

| CARRIER_ID | NAME | COUNTRY_CODE | BOOKING_COUNT | PASSENGER_COUNT |
|---|---|---|---|---|
| AS | Alaska Airlines | AT | 8 | 4 |
| AZ | Alitalia Societa Aerea Italiana S.p.A. | AT | 28 | 15 |
| AA | American Airlines Inc. | AT | 54 | 18 |
| DE | Condor | AT | 6 | 3 |
| DL | Delta Air Lines, Inc. | AT | 16 | 8 |
| LH | Deutsche Lufthansa AG | AT | 49 | 17 |
| JL | Japan Airlines Co., Ltd. | AT | 36 | 17 |
| B6 | JetBlue | AT | 8 | 4 |
| TR | Scoot | AT | 2 | 1 |
| SQ | Singapore Airlines Limited | AT | 52 | 17 |

…87 more rows

---

## q0081 · medium · AGREED

**For each airline with bookings, show its code, name, earliest and latest booking dates, and the number of distinct trips containing its bookings.**

Reference SQL:

```sql
SELECT c~carrier_id, c~name, MIN( b~booking_date ) AS earliest_booking_date, MAX( b~booking_date ) AS latest_booking_date, COUNT( DISTINCT b~travel_id ) AS trip_count FROM /dmo/carrier AS c INNER JOIN /dmo/booking AS b ON b~carrier_id = c~carrier_id GROUP BY c~carrier_id, c~name
```

| CARRIER_ID | NAME | EARLIEST_BOOKING_DATE | LATEST_BOOKING_DATE | TRIP_COUNT |
|---|---|---|---|---|
| NQ | Air Japan | 20260815 | 20260903 | 40 |
| AS | Alaska Airlines | 20260814 | 20260902 | 73 |
| AZ | Alitalia Societa Aerea Italiana S.p.A. | 20260531 | 20270417 | 601 |
| AA | American Airlines Inc. | 20260529 | 20270418 | 1087 |
| DE | Condor | 20260814 | 20260903 | 44 |
| DL | Delta Air Lines, Inc. | 20260814 | 20260903 | 156 |
| LH | Deutsche Lufthansa AG | 20260527 | 20270417 | 1038 |
| JL | Japan Airlines Co., Ltd. | 20260531 | 20270417 | 637 |
| B6 | JetBlue | 20260814 | 20260903 | 104 |
| TR | Scoot | 20260814 | 20260903 | 24 |

…2 more rows

---

## q0082 · medium · AGREED · ordered

**For each day in November 2026, show the date, number of scheduled flights, and number of different airlines, earliest date first.**

Reference SQL:

```sql
SELECT f~flight_date, COUNT(*) AS flight_count, COUNT( DISTINCT f~carrier_id ) AS airline_count FROM /dmo/flight AS f WHERE f~flight_date BETWEEN '20261101' AND '20261130' GROUP BY f~flight_date ORDER BY f~flight_date ASCENDING
```

| FLIGHT_DATE | FLIGHT_COUNT | AIRLINE_COUNT |
|---|---|---|
| 20261101 | 114 | 11 |
| 20261102 | 114 | 11 |
| 20261103 | 114 | 11 |
| 20261104 | 114 | 11 |
| 20261105 | 114 | 11 |
| 20261106 | 114 | 11 |
| 20261107 | 114 | 11 |
| 20261108 | 114 | 11 |
| 20261109 | 114 | 11 |
| 20261110 | 114 | 11 |

…20 more rows

---

## q0083 · medium · AGREED

**For each trip status represented among flight bookings, show the status code, number of flight bookings, and number of distinct trips they belong to.**

Reference SQL:

```sql
SELECT t~status, COUNT(*) AS booking_count, COUNT( DISTINCT t~travel_id ) AS trip_count FROM /dmo/travel AS t INNER JOIN /dmo/booking AS b ON b~travel_id = t~travel_id GROUP BY t~status
```

| STATUS | BOOKING_COUNT | TRIP_COUNT |
|---|---|---|
| B | 3413 | 1313 |
| N | 6275 | 2544 |
| P | 3456 | 1280 |

---

## q0084 · medium · AGREED · ordered

**Which 10 flight bookings include the most add-on entries? Return trip IDs, booking numbers, airline names, and add-on counts, most add-ons first, then by trip ID and booking number.**

Reference SQL:

```sql
SELECT b~travel_id, b~booking_id, c~name, COUNT(*) AS addon_count FROM /dmo/booking AS b INNER JOIN /dmo/carrier AS c ON c~carrier_id = b~carrier_id INNER JOIN /dmo/book_suppl AS s ON s~travel_id = b~travel_id AND s~booking_id = b~booking_id GROUP BY b~travel_id, b~booking_id, c~name ORDER BY addon_count DESCENDING, b~travel_id ASCENDING, b~booking_id ASCENDING UP TO 10 ROWS
```

| TRAVEL_ID | BOOKING_ID | NAME | ADDON_COUNT |
|---|---|---|---|
| 00000003 | 0001 | United Airlines, Inc. | 5 |
| 00000003 | 0008 | American Airlines Inc. | 5 |
| 00000042 | 0006 | American Airlines Inc. | 5 |
| 00000054 | 0001 | United Airlines, Inc. | 5 |
| 00000110 | 0005 | Singapore Airlines Limited | 5 |
| 00000129 | 0005 | United Airlines, Inc. | 5 |
| 00000138 | 0004 | United Airlines, Inc. | 5 |
| 00000145 | 0008 | Singapore Airlines Limited | 5 |
| 00000156 | 0015 | Singapore Airlines Limited | 5 |
| 00000159 | 0003 | United Airlines, Inc. | 5 |

---

## q0085 · medium · AGREED · ordered

**Which 10 agencies have arranged trips for customers from the most different countries? Return agency IDs, names, and customer country counts, most countries first, then by agency ID.**

Reference SQL:

```sql
SELECT a~agency_id, a~name, COUNT( DISTINCT c~country_code ) AS customer_country_count FROM /dmo/agency AS a INNER JOIN /dmo/travel AS t ON t~agency_id = a~agency_id INNER JOIN /dmo/customer AS c ON c~customer_id = t~customer_id GROUP BY a~agency_id, a~name ORDER BY customer_country_count DESCENDING, a~agency_id ASCENDING UP TO 10 ROWS
```

| AGENCY_ID | NAME | CUSTOMER_COUNTRY_COUNT |
|---|---|---|
| 070005 | Your Choice | 9 |
| 070033 | Fly & Smile | 9 |
| 070038 | Cap Travels Ltd. | 9 |
| 070043 | Intertravel | 9 |
| 070001 | Sunshine Travel | 8 |
| 070006 | Bella Italia | 8 |
| 070008 | Burns Nuclear | 8 |
| 070009 | Honauer Reisen GmbH | 8 |
| 070014 | Kangeroos | 8 |
| 070018 | Wang Chong | 8 |

---

## q0086 · hard · AGREED

**Which agencies handled more trips starting in June 2026 than in April 2027? Return agency numbers, names, and the trip count for each month.**

Reference SQL:

```sql
SELECT a~agency_id, a~name, SUM( CASE WHEN t~begin_date BETWEEN '20260601' AND '20260630' THEN 1 ELSE 0 END ) AS june_trips, SUM( CASE WHEN t~begin_date BETWEEN '20270401' AND '20270430' THEN 1 ELSE 0 END ) AS april_trips FROM /dmo/agency AS a INNER JOIN /dmo/travel AS t ON t~agency_id = a~agency_id GROUP BY a~agency_id, a~name HAVING SUM( CASE WHEN t~begin_date BETWEEN '20260601' AND '20260630' THEN 1 ELSE 0 END ) > SUM( CASE WHEN t~begin_date BETWEEN '20270401' AND '20270430' THEN 1 ELSE 0 END )
```

| AGENCY_ID | NAME | JUNE_TRIPS | APRIL_TRIPS |
|---|---|---|---|
| 070016 | Ali's Bazar | 41 | 36 |
| 070019 | Around the World | 39 | 38 |
| 070023 | Asia By Plane | 49 | 42 |
| 070028 | Aussie Travel | 49 | 42 |
| 070006 | Bella Italia | 48 | 41 |
| 070008 | Burns Nuclear | 40 | 34 |
| 070022 | Caribian Dreams | 49 | 48 |
| 070002 | Fly High | 39 | 34 |
| 070027 | Fly Low | 48 | 40 |
| 070003 | Happy Hopping | 42 | 33 |

…11 more rows

---

## q0087 · hard · AGREED

**Which customers have both booked and planned trips? Return customer numbers, first and last names, total trip counts, and separate counts of booked and planned trips.**

Reference SQL:

```sql
SELECT c~customer_id, c~first_name, c~last_name, COUNT(*) AS total_trips, SUM( CASE WHEN t~status = 'B' THEN 1 ELSE 0 END ) AS booked_trips, SUM( CASE WHEN t~status = 'P' THEN 1 ELSE 0 END ) AS planned_trips FROM /dmo/customer AS c INNER JOIN /dmo/travel AS t ON t~customer_id = c~customer_id GROUP BY c~customer_id, c~first_name, c~last_name HAVING SUM( CASE WHEN t~status = 'B' THEN 1 ELSE 0 END ) > 0 AND SUM( CASE WHEN t~status = 'P' THEN 1 ELSE 0 END ) > 0
```

| CUSTOMER_ID | FIRST_NAME | LAST_NAME | TOTAL_TRIPS | BOOKED_TRIPS | PLANNED_TRIPS |
|---|---|---|---|---|---|
| 000594 | Illya | Ryan | 7 | 1 | 4 |
| 000608 | Benjamin | Prinz | 8 | 1 | 1 |
| 000093 | Sophie | Detemple | 7 | 2 | 2 |
| 000665 | Harish | Madeira | 10 | 2 | 2 |
| 000225 | August | Mechler | 6 | 1 | 1 |
| 000072 | Theresia | Neubasler | 11 | 2 | 4 |
| 000138 | August | Wohl | 8 | 3 | 2 |
| 000697 | Amelie | Leisert | 12 | 1 | 3 |
| 000582 | Illya | Lautenbach | 10 | 4 | 3 |
| 000583 | Illya | Lautenbach | 9 | 2 | 3 |

…488 more rows

---

## q0088 · hard · AGREED · ordered

**For each currency, which trip starting in the fourth quarter of 2026 had the highest booking fee? Choose the lowest trip number if tied. Return the currency, trip number, agency name, and booking fee, sorted by currency, then trip number.**

Reference SQL:

```sql
SELECT t~currency_code, t~travel_id, a~name AS agency_name, t~booking_fee FROM /dmo/travel AS t INNER JOIN /dmo/agency AS a ON a~agency_id = t~agency_id WHERE t~begin_date BETWEEN '20261001' AND '20261231' AND NOT EXISTS ( SELECT * FROM /dmo/travel AS t2 WHERE t2~currency_code = t~currency_code AND t2~begin_date BETWEEN '20261001' AND '20261231' AND ( t2~booking_fee > t~booking_fee OR ( t2~booking_fee = t~booking_fee AND t2~travel_id < t~travel_id ) ) ) ORDER BY t~currency_code ASCENDING, t~travel_id ASCENDING
```

| CURRENCY_CODE | TRAVEL_ID | AGENCY_NAME | BOOKING_FEE |
|---|---|---|---|
| EUR | 00004154 | Your Choice | 60.00 |
| JPY | 00004187 | Around the World | 60.00 |
| SGD | 00004173 | Rocky Horror Tours | 60.00 |
| USD | 00004156 | Wang Chong | 60.00 |

---

## q0089 · hard · AGREED

**Which agencies have trips starting in October 2026 but none with booked status that month? Return agency numbers, names, and October trip counts.**

Reference SQL:

```sql
SELECT a~agency_id, a~name, COUNT(*) AS october_trips FROM /dmo/agency AS a INNER JOIN /dmo/travel AS t ON t~agency_id = a~agency_id WHERE t~begin_date BETWEEN '20261001' AND '20261031' AND NOT EXISTS ( SELECT * FROM /dmo/travel AS t2 WHERE t2~agency_id = a~agency_id AND t2~begin_date BETWEEN '20261001' AND '20261031' AND t2~status = 'B' ) GROUP BY a~agency_id, a~name
```

| AGENCY_ID | NAME | OCTOBER_TRIPS |
|---|---|---|
| 070032 | Sunny, Sunny, Sunny | 2 |
| 070033 | Fly & Smile | 4 |
| 070034 | Supercheap | 3 |
| 070045 |  | 3 |
| 070002 | Fly High | 6 |
| 070024 | Everywhere | 1 |
| 070035 | Hitchhiker | 4 |
| 070012 | Ben McCloskey Ltd. | 1 |
| 070026 | No Name | 1 |
| 070029 | Up 'n' Away | 3 |

…9 more rows

---

## q0090 · hard · AGREED

**Which trips starting in the fourth quarter of 2026 have at least two flight bookings, all with the same carrier? Return trip numbers, carrier codes and names, and flight booking counts.**

Reference SQL:

```sql
SELECT t~travel_id, c~carrier_id, c~name, COUNT(*) AS flight_bookings FROM /dmo/travel AS t INNER JOIN /dmo/booking AS b ON b~travel_id = t~travel_id INNER JOIN /dmo/carrier AS c ON c~carrier_id = b~carrier_id WHERE t~begin_date BETWEEN '20261001' AND '20261231' AND NOT EXISTS ( SELECT * FROM /dmo/booking AS b2 WHERE b2~travel_id = t~travel_id AND b2~carrier_id <> b~carrier_id ) GROUP BY t~travel_id, c~carrier_id, c~name HAVING COUNT(*) >= 2
```

| TRAVEL_ID | CARRIER_ID | NAME | FLIGHT_BOOKINGS |
|---|---|---|---|
| 00004139 | AA | American Airlines Inc. | 2 |
| 00004140 | DL | Delta Air Lines, Inc. | 2 |
| 00004143 | UA | United Airlines, Inc. | 2 |
| 00004146 | UA | United Airlines, Inc. | 2 |
| 00004149 | DE | Condor | 2 |
| 00004150 | UA | United Airlines, Inc. | 2 |
| 00004154 | LH | Deutsche Lufthansa AG | 6 |
| 00004156 | AA | American Airlines Inc. | 6 |
| 00004157 | UA | United Airlines, Inc. | 6 |
| 00004160 | AS | Alaska Airlines | 2 |

…524 more rows

---

## q0091 · hard · AGREED

**Which airports had both domestic and international departures in October 2026? Treat flights between airports in the same country as domestic. Return departure airport codes, names, and separate domestic and international flight counts.**

Reference SQL:

```sql
SELECT origin~airport_id, origin~name, SUM( CASE WHEN origin~country = destination~country THEN 1 ELSE 0 END ) AS domestic_flights, SUM( CASE WHEN origin~country <> destination~country THEN 1 ELSE 0 END ) AS international_flights FROM /dmo/flight AS f INNER JOIN /dmo/connection AS cn ON cn~carrier_id = f~carrier_id AND cn~connection_id = f~connection_id INNER JOIN /dmo/airport AS origin ON origin~airport_id = cn~airport_from_id INNER JOIN /dmo/airport AS destination ON destination~airport_id = cn~airport_to_id WHERE f~flight_date BETWEEN '20261001' AND '20261031' GROUP BY origin~airport_id, origin~name HAVING SUM( CASE WHEN origin~country = destination~country THEN 1 ELSE 0 END ) > 0 AND SUM( CASE WHEN origin~country <> destination~country THEN 1 ELSE 0 END ) > 0
```

| AIRPORT_ID | NAME | DOMESTIC_FLIGHTS | INTERNATIONAL_FLIGHTS |
|---|---|---|---|
| JFK | John F. Kennedy International Airport | 682 | 155 |
| EWR | Newark Liberty International Airport | 248 | 62 |
| SFO | San Francisco International Airport | 589 | 248 |
| MIA | Miami International Airport | 279 | 186 |

---

## q0092 · hard · AGREED

**Which aircraft types were scheduled by at least two carriers in the fourth quarter of 2026? Return aircraft types, carrier counts, and scheduled flight counts.**

Reference SQL:

```sql
SELECT f~plane_type_id, COUNT( DISTINCT f~carrier_id ) AS carrier_count, COUNT(*) AS flight_count FROM /dmo/flight AS f WHERE f~flight_date BETWEEN '20261001' AND '20261231' GROUP BY f~plane_type_id HAVING COUNT( DISTINCT f~carrier_id ) >= 2
```

| PLANE_TYPE_ID | CARRIER_COUNT | FLIGHT_COUNT |
|---|---|---|
| 737 MAX 8 | 2 | 368 |
| 737 MAX 9 | 2 | 920 |
| 737-800 | 3 | 1104 |
| 737-900 | 2 | 276 |
| 767-300 | 2 | 644 |
| 777-300ER | 2 | 552 |
| 787-9 | 4 | 1288 |
| A321-200 | 2 | 2208 |

---

## q0093 · hard · AGREED

**Which agencies handled more trips for customers from other countries than for customers from their own country? Return agency numbers, names, country codes, and separate trip counts for those two customer groups.**

Reference SQL:

```sql
SELECT a~agency_id, a~name, a~country_code, SUM( CASE WHEN c~country_code <> a~country_code THEN 1 ELSE 0 END ) AS other_country_trips, SUM( CASE WHEN c~country_code = a~country_code THEN 1 ELSE 0 END ) AS same_country_trips FROM /dmo/agency AS a INNER JOIN /dmo/travel AS t ON t~agency_id = a~agency_id INNER JOIN /dmo/customer AS c ON c~customer_id = t~customer_id GROUP BY a~agency_id, a~name, a~country_code HAVING SUM( CASE WHEN c~country_code <> a~country_code THEN 1 ELSE 0 END ) > SUM( CASE WHEN c~country_code = a~country_code THEN 1 ELSE 0 END )
```

| AGENCY_ID | NAME | COUNTRY_CODE | OTHER_COUNTRY_TRIPS | SAME_COUNTRY_TRIPS |
|---|---|---|---|---|
| 070009 | Honauer Reisen GmbH | AT | 95 | 7 |
| 070007 | Hot Socks Travel | AU | 123 | 0 |
| 070037 | Real Weird Vacation | CA | 121 | 0 |
| 070013 | Pillepalle Trips | CH | 88 | 1 |
| 070035 | Hitchhiker | FR | 102 | 6 |
| 070028 | Aussie Travel | GB | 112 | 0 |
| 070012 | Ben McCloskey Ltd. | GB | 98 | 0 |
| 070014 | Kangeroos | GB | 101 | 0 |
| 070017 | Super Agency | GB | 120 | 0 |
| 070042 | The Ultimate Answer | GB | 114 | 0 |

…20 more rows

---

## q0094 · hard · AGREED

**Which trips starting in October 2026 have flight bookings with at least one purchased extra on every booking? Return trip numbers and flight booking counts.**

Reference SQL:

```sql
SELECT t~travel_id, COUNT(*) AS flight_bookings FROM /dmo/travel AS t INNER JOIN /dmo/booking AS b ON b~travel_id = t~travel_id WHERE t~begin_date BETWEEN '20261001' AND '20261031' AND NOT EXISTS ( SELECT * FROM /dmo/booking AS b2 WHERE b2~travel_id = t~travel_id AND NOT EXISTS ( SELECT * FROM /dmo/book_suppl AS s WHERE s~travel_id = b2~travel_id AND s~booking_id = b2~booking_id ) ) GROUP BY t~travel_id
```

| TRAVEL_ID | FLIGHT_BOOKINGS |
|---|---|
| 00004150 | 2 |
| 00004294 | 2 |
| 00004313 | 2 |
| 00004339 | 2 |
| 00004352 | 2 |
| 00004412 | 2 |
| 00004413 | 2 |
| 00004419 | 4 |
| 00004431 | 2 |
| 00004461 | 2 |

…24 more rows

---

## q0095 · hard · AGREED

**For each distance unit, how many airline connections are shorter than 500, from 500 to under 2,000, or at least 2,000 in that unit? Return the unit and the three connection counts.**

Reference SQL:

```sql
SELECT cn~distance_unit, SUM( CASE WHEN cn~distance < 500 THEN 1 ELSE 0 END ) AS short_connections, SUM( CASE WHEN cn~distance >= 500 AND cn~distance < 2000 THEN 1 ELSE 0 END ) AS medium_connections, SUM( CASE WHEN cn~distance >= 2000 THEN 1 ELSE 0 END ) AS long_connections FROM /dmo/connection AS cn GROUP BY cn~distance_unit
```

| DISTANCE_UNIT | SHORT_CONNECTIONS | MEDIUM_CONNECTIONS | LONG_CONNECTIONS |
|---|---|---|---|
| KM | 0 | 30 | 90 |

---

## q0096 · unanswerable · AGREED

**For flights in October 2026, list each carrier's name and the number of passengers denied boarding because of overbooking.**

Reference SQL:

```sql
UNANSWERABLE
```

---

## q0097 · unanswerable · AGREED

**How many customers on trips starting in November 2026 were under 18 when their trip began?**

Reference SQL:

```sql
UNANSWERABLE
```

---

## q0098 · unanswerable · AGREED

**For flights in December 2026, list each carrier's name and the number of passengers who requested wheelchair assistance.**

Reference SQL:

```sql
UNANSWERABLE
```

---

## q0099 · unanswerable · AGREED

**How many travel insurance claims were filed for trips starting in September 2026?**

Reference SQL:

```sql
UNANSWERABLE
```

---

## q0100 · unanswerable · AGREED

**List the names of airports in Germany and the length of each airport's longest runway in meters.**

Reference SQL:

```sql
UNANSWERABLE
```

---

## q0101 · unanswerable · AGREED

**For flights in January 2027, list each carrier's name and the number of pets transported in the cabin.**

Reference SQL:

```sql
UNANSWERABLE
```

---

## q0102 · unanswerable · AGREED

**How many passengers used an airline lounge at Frankfurt Airport before flights in October 2026?**

Reference SQL:

```sql
UNANSWERABLE
```

---

## q0103 · unanswerable · AGREED

**For flights in February 2027, list each carrier's name and the number of customer complaints about cabin cleanliness.**

Reference SQL:

```sql
UNANSWERABLE
```

---

## q0104 · unanswerable · AGREED

**How many flight bookings made in December 2026 used a promotional discount code?**

Reference SQL:

```sql
UNANSWERABLE
```

---

## q0105 · unanswerable · AGREED

**For flights in November 2026, list each carrier's name and the number of passengers who watched an onboard movie.**

Reference SQL:

```sql
UNANSWERABLE
```

---

## q0106 · easy · AGREED

**What name and currency code are recorded for airline LH?**

Reference SQL:

```sql
SELECT c~name, c~currency_code FROM /dmo/carrier AS c WHERE c~carrier_id = 'LH'
```

| NAME | CURRENCY_CODE |
|---|---|
| Deutsche Lufthansa AG | EUR |

---

## q0107 · easy · AGREED

**How many different countries have airports listed?**

Reference SQL:

```sql
SELECT COUNT( DISTINCT a~country ) AS country_count FROM /dmo/airport AS a
```

| COUNTRY_COUNT |
|---|
| 22 |

---

## q0108 · easy · AGREED · ordered

**Show the first 10 agencies alphabetically, with their names, agency numbers, phone numbers and email addresses. Break ties by agency number.**

Reference SQL:

```sql
SELECT a~name, a~agency_id, a~phone_number, a~email_address FROM /dmo/agency AS a ORDER BY a~name ASCENDING, a~agency_id ASCENDING UP TO 10 ROWS
```

| NAME | AGENCY_ID | PHONE_NUMBER | EMAIL_ADDRESS |
|---|---|---|---|
|  | 070045 | +1 652 645-5236 | info@sar.sap |
| Ali's Bazar | 070016 | +1 508-692-5200 | info@ali.sap |
| All British Air Planes | 070047 | +44 609-896-Moore | info@abap.sap |
| Around the World | 070019 | +49 511-347589-0 | info@atw.sap |
| Asia By Plane | 070023 | +81 3-3239-3501 | info@asia-by-plane.co.jp |
| Aussie Travel | 070028 | +44 161 2052000 | info@down-under.sap |
| Bavarian Castle | 070015 | +49 98-32832732 | info@neu.schwanstein.sap |
| Bella Italia | 070006 | +39 6 893546721 | info@tours.it/Adventure/ |
| Ben McCloskey Ltd. | 070012 | +44 121 365-2251 | info@ben-mcCloskey.co.uk |
| Bright Side of Life | 070031 | +1 415-454-9877 | info@ruebennase.sap |

---

## q0109 · easy · AGREED

**How many routes depart from each airport that has departing routes? Show departure airport codes and route counts.**

Reference SQL:

```sql
SELECT c~airport_from_id, COUNT(*) AS route_count FROM /dmo/connection AS c GROUP BY c~airport_from_id
```

| AIRPORT_FROM_ID | ROUTE_COUNT |
|---|---|
| EWR | 11 |
| FRA | 12 |
| HAV | 6 |
| JFK | 27 |
| MIA | 15 |
| NRT | 8 |
| SFO | 29 |
| SIN | 11 |
| VCE | 1 |

---

## q0110 · easy · AGREED

**How many different customers have flight bookings?**

Reference SQL:

```sql
SELECT COUNT( DISTINCT b~customer_id ) AS customer_count FROM /dmo/booking AS b
```

| CUSTOMER_COUNT |
|---|
| 728 |

---

## q0111 · easy · AGREED

**How many times has each extra been added to a booking? Show extra codes and counts.**

Reference SQL:

```sql
SELECT s~supplement_id, COUNT(*) AS extra_count FROM /dmo/book_suppl AS s GROUP BY s~supplement_id
```

| SUPPLEMENT_ID | EXTRA_COUNT |
|---|---|
| ML-0019 | 411 |
| ML-0002 | 433 |
| ML-0030 | 439 |
| ML-0010 | 409 |
| BV-0008 | 424 |
| BV-0003 | 452 |
| ML-0024 | 407 |
| ML-0020 | 457 |
| LU-0003 | 414 |
| BV-0002 | 401 |

…38 more rows

---

## q0112 · easy · AGREED · ordered

**How many flights are scheduled on each date in November 2026? Show dates and flight counts, earliest date first.**

Reference SQL:

```sql
SELECT f~flight_date, COUNT(*) AS flight_count FROM /dmo/flight AS f WHERE f~flight_date BETWEEN '20261101' AND '20261130' GROUP BY f~flight_date ORDER BY f~flight_date ASCENDING
```

| FLIGHT_DATE | FLIGHT_COUNT |
|---|---|
| 20261101 | 114 |
| 20261102 | 114 |
| 20261103 | 114 |
| 20261104 | 114 |
| 20261105 | 114 |
| 20261106 | 114 |
| 20261107 | 114 |
| 20261108 | 114 |
| 20261109 | 114 |
| 20261110 | 114 |

…20 more rows

---

## q0113 · easy · AGREED · ordered

**Show the first 10 customers by customer number, with their customer numbers, first and last names, phone numbers and email addresses.**

Reference SQL:

```sql
SELECT c~customer_id, c~first_name, c~last_name, c~phone_number, c~email_address FROM /dmo/customer AS c ORDER BY c~customer_id ASCENDING UP TO 10 ROWS
```

| CUSTOMER_ID | FIRST_NAME | LAST_NAME | PHONE_NUMBER | EMAIL_ADDRESS |
|---|---|---|---|---|
| 000001 | Theresia | Buchholm | +49-341-184709 | theresia.buchholm@flight.example.de |
| 000002 | Johannes | Buchholm | +49-291-299232 | johannes.buchholm@flight.example.de |
| 000003 | James | Buchholm | +49-601-130850 | james.buchholm@flight.example.de |
| 000004 | Thomas | Buchholm | +49-394-339928 | thomas.buchholm@flight.example.de |
| 000005 | Anna | Buchholm | +43-957-258037 | anna.buchholm@flight.example.at |
| 000006 | Uli | Buchholm | +49-367-156738 | uli.buchholm@flight.example.de |
| 000007 | Jean-Luc | Buchholm | +1-848-371606 | jean-luc.buchholm@flight.example.us |
| 000008 | August | Buchholm | +49-184-089871 | august.buchholm@flight.example.de |
| 000009 | Achim | Buchholm | +49-797-976779 | achim.buchholm@flight.example.de |
| 000010 | Irmtraut | Buchholm | +49-417-532827 | irmtraut.buchholm@flight.example.de |

---

## q0114 · easy · AGREED · ordered

**Which 10 trips priced in euros have the lowest booking fees? Show trip numbers and booking fees, lowest fee first, then by trip number.**

Reference SQL:

```sql
SELECT t~travel_id, t~booking_fee FROM /dmo/travel AS t WHERE t~currency_code = 'EUR' ORDER BY t~booking_fee ASCENDING, t~travel_id ASCENDING UP TO 10 ROWS
```

| TRAVEL_ID | BOOKING_FEE |
|---|---|
| 00000104 | 10.00 |
| 00000109 | 10.00 |
| 00000148 | 10.00 |
| 00000162 | 10.00 |
| 00000288 | 10.00 |
| 00000291 | 10.00 |
| 00000294 | 10.00 |
| 00000297 | 10.00 |
| 00000303 | 10.00 |
| 00000318 | 10.00 |

---

## q0115 · easy · AGREED

**Which routes connect Frankfurt (FRA) and New York (JFK), in either direction? Show airline codes, route numbers, and departure and arrival airport codes.**

Reference SQL:

```sql
SELECT c~carrier_id, c~connection_id, c~airport_from_id, c~airport_to_id FROM /dmo/connection AS c WHERE ( c~airport_from_id = 'FRA' AND c~airport_to_id = 'JFK' ) OR ( c~airport_from_id = 'JFK' AND c~airport_to_id = 'FRA' )
```

| CARRIER_ID | CONNECTION_ID | AIRPORT_FROM_ID | AIRPORT_TO_ID |
|---|---|---|---|
| LH | 0400 | FRA | JFK |
| LH | 0404 | FRA | JFK |
| SQ | 0026 | FRA | JFK |
| DL | 0107 | FRA | JFK |
| DE | 2016 | FRA | JFK |
| LH | 0401 | JFK | FRA |
| LH | 0405 | JFK | FRA |
| SQ | 0025 | JFK | FRA |
| DL | 0106 | JFK | FRA |
| DE | 2017 | JFK | FRA |

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

## q0118 · medium · AGREED · ordered

**Which 10 agencies have the highest total euro-denominated add-on charges across their trips? Return agency IDs, names, and total charges in euros, highest total first, then by agency ID.**

Reference SQL:

```sql
SELECT a~agency_id, a~name, SUM( s~price ) AS total_add_on_charges FROM /DMO/AGENCY AS a INNER JOIN /DMO/TRAVEL AS t ON t~agency_id = a~agency_id INNER JOIN /DMO/BOOK_SUPPL AS s ON s~travel_id = t~travel_id WHERE s~currency_code = 'EUR' GROUP BY a~agency_id, a~name ORDER BY total_add_on_charges DESCENDING, a~agency_id ASCENDING UP TO 10 ROWS
```

| AGENCY_ID | NAME | TOTAL_ADD_ON_CHARGES |
|---|---|---|
| 070046 | Hendrik's | 6746.70 |
| 070035 | Hitchhiker | 6340.90 |
| 070030 | Trans World Travel | 6285.20 |
| 070017 | Super Agency | 6195.70 |
| 070028 | Aussie Travel | 6142.70 |
| 070049 | Flights and More | 6130.90 |
| 070041 | Maxitrip | 6053.80 |
| 070007 | Hot Socks Travel | 6043.00 |
| 070037 | Real Weird Vacation | 5912.00 |
| 070048 | Rocky Horror Tours | 5862.10 |

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

---

## q0120 · medium · AGREED

**For each aircraft type with flight bookings, show the type, number of bookings, and number of distinct passengers.**

Reference SQL:

```sql
SELECT f~plane_type_id, COUNT(*) AS booking_count, COUNT( DISTINCT b~customer_id ) AS passenger_count FROM /DMO/FLIGHT AS f INNER JOIN /DMO/BOOKING AS b ON b~carrier_id = f~carrier_id AND b~connection_id = f~connection_id AND b~flight_date = f~flight_date GROUP BY f~plane_type_id
```

| PLANE_TYPE_ID | BOOKING_COUNT | PASSENGER_COUNT |
|---|---|---|
| A321-200 | 1224 | 503 |
| A330-200 | 114 | 55 |
| 777-300ER | 233 | 117 |
| 787-9 | 467 | 213 |
| 737-800 | 565 | 369 |
| A319-100 | 226 | 134 |
| 737-900 | 91 | 82 |
| 737 MAX 9 | 306 | 213 |
| 737 MAX 8 | 148 | 126 |
| 767-400 | 48 | 47 |

…13 more rows

---

## q0121 · medium · AGREED · ordered

**Show the 10 earliest-starting trips in December 2026, with trip IDs, start and end dates, agency names, and the trip customers' first and last names. Sort by start date, then by trip ID.**

Reference SQL:

```sql
SELECT t~travel_id, t~begin_date, t~end_date, a~name AS agency_name, c~first_name, c~last_name FROM /DMO/TRAVEL AS t INNER JOIN /DMO/AGENCY AS a ON a~agency_id = t~agency_id INNER JOIN /DMO/CUSTOMER AS c ON c~customer_id = t~customer_id WHERE t~begin_date BETWEEN '20261201' AND '20261231' ORDER BY t~begin_date ASCENDING, t~travel_id ASCENDING UP TO 10 ROWS
```

| TRAVEL_ID | BEGIN_DATE | END_DATE | AGENCY_NAME | FIRST_NAME | LAST_NAME |
|---|---|---|---|---|---|
| 00004233 | 20261201 | 20261208 | Bavarian Castle | Friedrich | Hoffen |
| 00004265 | 20261201 | 20261208 | Rainy, Stormy, Cloudy | Allen | Delon |
| 00004325 | 20261201 | 20261203 | Burns Nuclear | Felix | Hoffen |
| 00004573 | 20261201 | 20261207 | Super Agency | Irene | Sisko |
| 00004662 | 20261201 | 20261204 | Kangeroos | Achim | Buchholm |
| 00004308 | 20261202 | 20261209 | Hot Socks Travel | Kurt | Benjamin |
| 00004425 | 20261202 | 20261207 | Sunny, Sunny, Sunny | Illya | Müller |
| 00004553 | 20261202 | 20261205 | No Name | Irmtraut | Lautenbach |
| 00004722 | 20261202 | 20261204 | Sunny, Sunny, Sunny | Salvador | Fischmann |
| 00004810 | 20261202 | 20261205 | Bella Italia | Anna | Neubasler |

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

## q0123 · medium · AGREED · ordered

**Which 10 connections have the latest scheduled arrival times of day? Return airline codes and names, connection numbers, departure and arrival airport codes, and arrival times, latest time first, then by airline code and connection number.**

Reference SQL:

```sql
SELECT c~carrier_id, c~name, n~connection_id, n~airport_from_id, n~airport_to_id, n~arrival_time FROM /DMO/CONNECTION AS n INNER JOIN /DMO/CARRIER AS c ON c~carrier_id = n~carrier_id ORDER BY n~arrival_time DESCENDING, c~carrier_id ASCENDING, n~connection_id ASCENDING UP TO 10 ROWS
```

| CARRIER_ID | NAME | CONNECTION_ID | AIRPORT_FROM_ID | AIRPORT_TO_ID | ARRIVAL_TIME |
|---|---|---|---|---|---|
| AA | American Airlines Inc. | 0148 | SFO | JFK | 235900 |
| UA | United Airlines, Inc. | 0791 | EWR | MIA | 234400 |
| B6 | JetBlue | 0416 | SFO | JFK | 232000 |
| NQ | Air Japan | 0803 | NRT | SIN | 232000 |
| UA | United Airlines, Inc. | 2029 | MIA | EWR | 230700 |
| AA | American Airlines Inc. | 0322 | MIA | EWR | 225800 |
| DL | Delta Air Lines, Inc. | 0667 | JFK | SFO | 223300 |
| AS | Alaska Airlines | 0042 | SFO | JFK | 222900 |
| AS | Alaska Airlines | 0039 | JFK | SFO | 221900 |
| B6 | JetBlue | 0615 | JFK | SFO | 221100 |

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

## q0125 · medium · AGREED

**For each trip currency, show the currency, number of trips, total recorded trip prices, and total booking fees.**

Reference SQL:

```sql
SELECT t~currency_code, COUNT(*) AS trip_count, SUM( t~total_price ) AS total_trip_prices, SUM( t~booking_fee ) AS total_booking_fees FROM /DMO/TRAVEL AS t GROUP BY t~currency_code
```

| CURRENCY_CODE | TRIP_COUNT | TOTAL_TRIP_PRICES | TOTAL_BOOKING_FEES |
|---|---|---|---|
| SGD | 856 | 9685717.90 | 22530.00 |
| USD | 1922 | 11717714.30 | 54390.00 |
| JPY | 677 | 5227612.80 | 14150.00 |
| EUR | 1682 | 13102842.30 | 40350.00 |

---

## q0126 · hard · AGREED

**For each airline, how many flights in October 2026 have no bookings? Return airline codes, names, and flight counts, including only airlines with such flights.**

Reference SQL:

```sql
SELECT c~carrier_id, c~name, COUNT(*) AS flight_count FROM /dmo/carrier AS c INNER JOIN /dmo/flight AS f ON f~carrier_id = c~carrier_id WHERE f~flight_date BETWEEN '20261001' AND '20261031' AND NOT EXISTS ( SELECT * FROM /dmo/booking AS b WHERE b~carrier_id = f~carrier_id AND b~connection_id = f~connection_id AND b~flight_date = f~flight_date ) GROUP BY c~carrier_id, c~name
```

| CARRIER_ID | NAME | FLIGHT_COUNT |
|---|---|---|
| AA | American Airlines Inc. | 774 |
| B6 | JetBlue | 337 |
| DL | Delta Air Lines, Inc. | 421 |
| UA | United Airlines, Inc. | 565 |
| AS | Alaska Airlines | 221 |
| JL | Japan Airlines Co., Ltd. | 114 |
| SQ | Singapore Airlines Limited | 288 |
| LH | Deutsche Lufthansa AG | 220 |
| NQ | Air Japan | 117 |
| DE | Condor | 102 |

…1 more rows

---

## q0127 · hard · AGREED · ordered

**For each agency that has euro-priced trips starting in June 2026, show its two most expensive euro-priced trips starting in June 2026, or its only one if it has just one. Break price ties by lowest trip number. Return agency numbers, names, trip numbers, and total prices in euros. Sort by agency number, then price highest first, then trip number.**

Reference SQL:

```sql
SELECT a~agency_id, a~name, t~travel_id, t~total_price FROM /dmo/agency AS a INNER JOIN /dmo/travel AS t ON t~agency_id = a~agency_id WHERE t~begin_date BETWEEN '20260601' AND '20260630' AND t~currency_code = 'EUR' AND 2 > ( SELECT COUNT(*) FROM /dmo/travel AS x WHERE x~agency_id = t~agency_id AND x~begin_date BETWEEN '20260601' AND '20260630' AND x~currency_code = 'EUR' AND ( x~total_price > t~total_price OR ( x~total_price = t~total_price AND x~travel_id < t~travel_id ) ) ) ORDER BY a~agency_id ASCENDING, t~total_price DESCENDING, t~travel_id ASCENDING
```

| AGENCY_ID | NAME | TRAVEL_ID | TOTAL_PRICE |
|---|---|---|---|
| 070001 | Sunshine Travel | 00003209 | 15598.00 |
| 070001 | Sunshine Travel | 00003148 | 15024.00 |
| 070002 | Fly High | 00003200 | 14652.00 |
| 070002 | Fly High | 00003074 | 7344.00 |
| 070003 | Happy Hopping | 00003396 | 11753.00 |
| 070003 | Happy Hopping | 00003137 | 9328.00 |
| 070004 | Pink Panther | 00003206 | 15481.00 |
| 070004 | Pink Panther | 00003116 | 15062.00 |
| 070005 | Your Choice | 00003195 | 14461.00 |
| 070005 | Your Choice | 00003144 | 9866.00 |

…90 more rows

---

## q0128 · hard · AGREED

**For trips starting in April 2027, show each currency's total trip prices separately for booked trips and trips with other statuses.**

Reference SQL:

```sql
SELECT t~currency_code, SUM( CASE WHEN t~status = 'B' THEN t~total_price ELSE 0 END ) AS booked_total, SUM( CASE WHEN t~status <> 'B' THEN t~total_price ELSE 0 END ) AS other_status_total FROM /dmo/travel AS t WHERE t~begin_date BETWEEN '20270401' AND '20270430' GROUP BY t~currency_code
```

| CURRENCY_CODE | BOOKED_TOTAL | OTHER_STATUS_TOTAL |
|---|---|---|
| SGD | 1070675.00 | 2713430.00 |
| USD | 560544.00 | 1712266.00 |
| JPY | 719645.00 | 1949361.00 |
| EUR | 1245531.00 | 3979577.00 |

---

## q0129 · hard · AGREED

**Which trips starting in February 2027 continue into March or beyond? Return trip numbers, start dates, end dates, and the number of days between the start and end.**

Reference SQL:

```sql
SELECT t~travel_id, t~begin_date, t~end_date, DATS_DAYS_BETWEEN( t~begin_date, t~end_date ) AS duration_days FROM /dmo/travel AS t WHERE t~begin_date BETWEEN '20270201' AND '20270228' AND t~end_date >= '20270301'
```

| TRAVEL_ID | BEGIN_DATE | END_DATE | DURATION_DAYS |
|---|---|---|---|
| 00004151 | 20270227 | 20270418 | 50 |
| 00004165 | 20270225 | 20270417 | 51 |
| 00004201 | 20270228 | 20270417 | 48 |
| 00004316 | 20270227 | 20270417 | 49 |
| 00004317 | 20270228 | 20270301 | 1 |
| 00004324 | 20270228 | 20270416 | 47 |
| 00004551 | 20270227 | 20270416 | 48 |
| 00004567 | 20270226 | 20270416 | 49 |
| 00004682 | 20270228 | 20270414 | 45 |
| 00004731 | 20270222 | 20270301 | 7 |

…4 more rows

---

## q0130 · hard · AGREED

**For each agency handling trips starting in June 2026, show its number and name and separate trip counts for customers from Germany, the United States, and all other countries.**

Reference SQL:

```sql
SELECT a~agency_id, a~name, SUM( CASE WHEN c~country_code = 'DE' THEN 1 ELSE 0 END ) AS germany_trips, SUM( CASE WHEN c~country_code = 'US' THEN 1 ELSE 0 END ) AS united_states_trips, SUM( CASE WHEN c~country_code <> 'DE' AND c~country_code <> 'US' THEN 1 ELSE 0 END ) AS other_country_trips FROM /dmo/agency AS a INNER JOIN /dmo/travel AS t ON t~agency_id = a~agency_id INNER JOIN /dmo/customer AS c ON c~customer_id = t~customer_id WHERE t~begin_date BETWEEN '20260601' AND '20260630' GROUP BY a~agency_id, a~name
```

| AGENCY_ID | NAME | GERMANY_TRIPS | UNITED_STATES_TRIPS | OTHER_COUNTRY_TRIPS |
|---|---|---|---|---|
| 070041 | Maxitrip | 24 | 12 | 4 |
| 070007 | Hot Socks Travel | 32 | 8 | 6 |
| 070046 | Hendrik's | 29 | 8 | 6 |
| 070042 | The Ultimate Answer | 30 | 8 | 5 |
| 070049 | Flights and More | 30 | 3 | 2 |
| 070012 | Ben McCloskey Ltd. | 23 | 7 | 7 |
| 070032 | Sunny, Sunny, Sunny | 24 | 4 | 4 |
| 070016 | Ali's Bazar | 30 | 8 | 3 |
| 070005 | Your Choice | 26 | 10 | 10 |
| 070028 | Aussie Travel | 30 | 14 | 5 |

…40 more rows

---

## q0132 · hard · AGREED

**For each customer country with customers who have trips, which customers have the most trips? Include everyone tied for first place. Return country codes, customer numbers, first and last names, and trip counts.**

Reference SQL:

```sql
SELECT c~country_code, c~customer_id, c~first_name, c~last_name, COUNT(*) AS trip_count FROM /dmo/customer AS c INNER JOIN /dmo/travel AS t ON t~customer_id = c~customer_id GROUP BY c~country_code, c~customer_id, c~first_name, c~last_name HAVING COUNT(*) >= ALL ( SELECT COUNT(*) FROM /dmo/customer AS x INNER JOIN /dmo/travel AS y ON y~customer_id = x~customer_id WHERE x~country_code = c~country_code GROUP BY x~customer_id )
```

| COUNTRY_CODE | CUSTOMER_ID | FIRST_NAME | LAST_NAME | TRIP_COUNT |
|---|---|---|---|---|
| FR | 000389 | Sophie | Zimmermann | 11 |
| CH | 000232 | Claire | Buehler | 11 |
| FR | 000489 | Benjamin | Montero | 11 |
| AT | 000455 | Andrej | Benjamin | 13 |
| US | 000610 | Guillermo | Prinz | 14 |
| ES | 000052 | Salvador | Fischmann | 13 |
| BE | 000425 | Chantal | Pratt | 13 |
| IT | 000693 | Adam | Leisert | 12 |
| SI | 000487 | Volker | Montero | 8 |
| DE | 000438 | Ruth | Gahl | 16 |

---

## q0135 · hard · AGREED

**For each airline with connections flown on both dates, compare occupied seats on October 1 and October 31, 2026, for connections flown on both dates. Return airline codes, names, the number of connections with an increase, and the number without an increase.**

Reference SQL:

```sql
SELECT c~carrier_id, c~name, SUM( CASE WHEN last_f~seats_occupied > first_f~seats_occupied THEN 1 ELSE 0 END ) AS increased_connections, SUM( CASE WHEN last_f~seats_occupied <= first_f~seats_occupied THEN 1 ELSE 0 END ) AS other_connections FROM /dmo/carrier AS c INNER JOIN /dmo/flight AS first_f ON first_f~carrier_id = c~carrier_id INNER JOIN /dmo/flight AS last_f ON last_f~carrier_id = first_f~carrier_id AND last_f~connection_id = first_f~connection_id WHERE first_f~flight_date = '20261001' AND last_f~flight_date = '20261031' GROUP BY c~carrier_id, c~name
```

| CARRIER_ID | NAME | INCREASED_CONNECTIONS | OTHER_CONNECTIONS |
|---|---|---|---|
| AA | American Airlines Inc. | 13 | 14 |
| B6 | JetBlue | 8 | 4 |
| UA | United Airlines, Inc. | 9 | 11 |
| DL | Delta Air Lines, Inc. | 9 | 6 |
| AS | Alaska Airlines | 5 | 3 |
| JL | Japan Airlines Co., Ltd. | 1 | 3 |
| SQ | Singapore Airlines Limited | 4 | 6 |
| LH | Deutsche Lufthansa AG | 1 | 7 |
| NQ | Air Japan | 3 | 1 |
| DE | Condor | 3 | 1 |

…1 more rows

---

## q0136 · unanswerable · AGREED

**For flights in October 2026, list each carrier's name and the number of flights diverted to another airport.**

Reference SQL:

```sql
UNANSWERABLE
```

---

## q0137 · unanswerable · AGREED

**For flights in November 2026, list each carrier's name and the total cargo weight carried in kilograms, rounded to 2 decimals.**

Reference SQL:

```sql
UNANSWERABLE
```

---

## q0138 · unanswerable · AGREED

**For trips starting in December 2026, list each agency's name and the number of customer support calls it received about those trips.**

Reference SQL:

```sql
UNANSWERABLE
```

---

## q0139 · unanswerable · AGREED

**For flights in January 2027, list each carrier's name and the number of passengers upgraded from economy to business class.**

Reference SQL:

```sql
UNANSWERABLE
```

---

## q0140 · unanswerable · AGREED

**For flights in February 2027 that required deicing, list each departure airport's name and the average deicing time in minutes, rounded to 2 decimals.**

Reference SQL:

```sql
UNANSWERABLE
```

---

## q0141 · unanswerable · AGREED

**How many customers hold citizenship in each country, counting customers with multiple citizenships in each applicable country?**

Reference SQL:

```sql
UNANSWERABLE
```

---

## q0142 · unanswerable · AGREED

**For flights in September 2026, list each carrier's name and the number of onboard medical emergencies.**

Reference SQL:

```sql
UNANSWERABLE
```

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

## q0144 · easy · AGREED · ordered

**What are the 5 most common customer last names? Show each last name and customer count, largest count first, then alphabetically by last name.**

Reference SQL:

```sql
SELECT last_name, COUNT(*) AS customer_count FROM /dmo/customer GROUP BY last_name ORDER BY customer_count DESCENDING, last_name ASCENDING UP TO 5 ROWS
```

| LAST_NAME | CUSTOMER_COUNT |
|---|---|
| Babilon | 15 |
| Columbo | 15 |
| Dumbach | 15 |
| Goelke | 15 |
| Henry | 15 |

---

## q0145 · easy · AGREED · ordered

**List up to 20 routes departing from noon to before 6 p.m., showing airline codes, route numbers, departure airport codes and departure times. Sort by departure time, earliest first, then airline code and route number.**

Reference SQL:

```sql
SELECT carrier_id, connection_id, airport_from_id, departure_time FROM /dmo/connection WHERE departure_time >= '120000' AND departure_time < '180000' ORDER BY departure_time ASCENDING, carrier_id ASCENDING, connection_id ASCENDING UP TO 20 ROWS
```

| CARRIER_ID | CONNECTION_ID | AIRPORT_FROM_ID | DEPARTURE_TIME |
|---|---|---|---|
| AA | 0166 | SFO | 121600 |
| AA | 0837 | MIA | 122700 |
| B6 | 0216 | SFO | 124500 |
| UA | 0059 | FRA | 125500 |
| AA | 2706 | HAV | 130000 |
| DL | 0691 | SFO | 131000 |
| UA | 1511 | EWR | 131500 |
| LH | 0402 | FRA | 132000 |
| AZ | 0788 | VCE | 132500 |
| AA | 3001 | MIA | 134000 |

…10 more rows

---

## q0146 · easy · AGREED

**How many travel agencies are listed?**

Reference SQL:

```sql
SELECT COUNT(*) AS agency_count FROM /dmo/agency
```

| AGENCY_COUNT |
|---|
| 51 |

---

## q0147 · easy · AGREED · ordered

**Which 10 trips have the most flight bookings? Show trip numbers and booking counts, largest count first, then by trip number.**

Reference SQL:

```sql
SELECT travel_id, COUNT(*) AS booking_count FROM /dmo/booking GROUP BY travel_id ORDER BY booking_count DESCENDING, travel_id ASCENDING UP TO 10 ROWS
```

| TRAVEL_ID | BOOKING_COUNT |
|---|---|
| 00000129 | 15 |
| 00000156 | 15 |
| 00000160 | 15 |
| 00000006 | 12 |
| 00000007 | 12 |
| 00000009 | 12 |
| 00000016 | 12 |
| 00000017 | 12 |
| 00000020 | 12 |
| 00000024 | 12 |

---

## q0148 · easy · AGREED · ordered

**Show the 10 earliest flight bookings by booking date, including trip numbers, booking numbers, customer numbers and booking dates. Break ties by trip number, then booking number.**

Reference SQL:

```sql
SELECT travel_id, booking_id, customer_id, booking_date FROM /dmo/booking ORDER BY booking_date ASCENDING, travel_id ASCENDING, booking_id ASCENDING UP TO 10 ROWS
```

| TRAVEL_ID | BOOKING_ID | CUSTOMER_ID | BOOKING_DATE |
|---|---|---|---|
| 00000097 | 0001 | 000665 | 20260527 |
| 00000097 | 0002 | 000407 | 20260527 |
| 00000112 | 0001 | 000292 | 20260527 |
| 00000112 | 0002 | 000624 | 20260527 |
| 00000114 | 0001 | 000033 | 20260527 |
| 00000114 | 0002 | 000583 | 20260527 |
| 00000114 | 0003 | 000481 | 20260527 |
| 00001727 | 0001 | 000606 | 20260527 |
| 00001769 | 0001 | 000476 | 20260527 |
| 00001769 | 0002 | 000164 | 20260527 |

---

## q0149 · easy · AGREED

**How many scheduled flights use each combination of aircraft type and seating capacity? Show aircraft types, seating capacities and flight counts.**

Reference SQL:

```sql
SELECT plane_type_id, seats_max, COUNT(*) AS flight_count FROM /dmo/flight GROUP BY plane_type_id, seats_max
```

| PLANE_TYPE_ID | SEATS_MAX | FLIGHT_COUNT |
|---|---|---|
| A319-100 | 128 | 1080 |
| A320-200 | 130 | 3 |
| 737-800 | 140 | 2 |
| A321-200 | 150 | 3 |
| 737-800 | 160 | 2160 |
| 737 MAX 8 | 166 | 720 |
| 737 MAX 9 | 178 | 1800 |
| 737-900 | 178 | 540 |
| A321-200 | 190 | 4320 |
| 757-200 | 199 | 900 |

…16 more rows

---

## q0150 · easy · AGREED

**How many customers have each recorded title? Show titles and customer counts, including a group for blank titles.**

Reference SQL:

```sql
SELECT title, COUNT(*) AS customer_count FROM /dmo/customer GROUP BY title
```

| TITLE | CUSTOMER_COUNT |
|---|---|
| Mr. | 469 |
| Mrs. | 259 |

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

## q0152 · easy · AGREED

**How many trips are priced in each currency? Show currency codes and trip counts.**

Reference SQL:

```sql
SELECT currency_code, COUNT(*) AS trip_count FROM /dmo/travel GROUP BY currency_code
```

| CURRENCY_CODE | TRIP_COUNT |
|---|---|
| SGD | 856 |
| USD | 1922 |
| JPY | 677 |
| EUR | 1682 |

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

## q0154 · medium · AGREED · ordered

**Which 10 airport pairs have the most occupied seats across flights in the fourth quarter of 2026, keeping each direction separate? Return departure and arrival airport codes, flight counts, and total occupied seats, most occupied seats first, then by departure and arrival code.**

Reference SQL:

```sql
SELECT c~airport_from_id, c~airport_to_id, COUNT(*) AS flight_count, SUM( f~seats_occupied ) AS occupied_seats FROM /dmo/connection AS c INNER JOIN /dmo/flight AS f ON f~carrier_id = c~carrier_id AND f~connection_id = c~connection_id WHERE f~flight_date BETWEEN '20261001' AND '20261231' GROUP BY c~airport_from_id, c~airport_to_id ORDER BY occupied_seats DESCENDING, c~airport_from_id ASCENDING, c~airport_to_id ASCENDING UP TO 10 ROWS
```

| AIRPORT_FROM_ID | AIRPORT_TO_ID | FLIGHT_COUNT | OCCUPIED_SEATS |
|---|---|---|---|
| JFK | SFO | 2024 | 268159 |
| SFO | JFK | 1748 | 227989 |
| SIN | NRT | 552 | 99705 |
| NRT | SIN | 552 | 99253 |
| MIA | EWR | 828 | 97194 |
| JFK | FRA | 460 | 87843 |
| EWR | MIA | 736 | 87385 |
| FRA | JFK | 460 | 87079 |
| SFO | FRA | 368 | 78081 |
| FRA | SFO | 368 | 76961 |

---

## q0155 · medium · AGREED · ordered

**Show the 10 agencies handling the most trips, with their IDs, names, total trip counts, and separate counts of new, planned, and booked trips. Sort by total trips, highest first, then by agency ID.**

Reference SQL:

```sql
SELECT a~agency_id, a~name, COUNT(*) AS trip_count, SUM( CASE WHEN t~status = 'N' THEN 1 ELSE 0 END ) AS new_trip_count, SUM( CASE WHEN t~status = 'P' THEN 1 ELSE 0 END ) AS planned_trip_count, SUM( CASE WHEN t~status = 'B' THEN 1 ELSE 0 END ) AS booked_trip_count FROM /dmo/agency AS a INNER JOIN /dmo/travel AS t ON t~agency_id = a~agency_id GROUP BY a~agency_id, a~name ORDER BY trip_count DESCENDING, a~agency_id ASCENDING UP TO 10 ROWS
```

| AGENCY_ID | NAME | TRIP_COUNT | NEW_TRIP_COUNT | PLANNED_TRIP_COUNT | BOOKED_TRIP_COUNT |
|---|---|---|---|---|---|
| 070007 | Hot Socks Travel | 123 | 109 | 7 | 7 |
| 070037 | Real Weird Vacation | 121 | 10 | 7 | 104 |
| 070017 | Super Agency | 120 | 113 | 6 | 1 |
| 070020 | No Return | 118 | 106 | 6 | 6 |
| 070041 | Maxitrip | 118 | 13 | 98 | 7 |
| 070046 | Hendrik's | 117 | 11 | 99 | 7 |
| 070030 | Trans World Travel | 114 | 8 | 7 | 99 |
| 070038 | Cap Travels Ltd. | 114 | 9 | 43 | 62 |
| 070042 | The Ultimate Answer | 114 | 7 | 100 | 7 |
| 070022 | Caribian Dreams | 112 | 102 | 6 | 4 |

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

## q0157 · medium · AGREED · ordered

**Which 10 departure airports have the most connections to another country, considering only airports with at least one such connection? Count each airline's numbered connection separately. Return airport codes, names, and connection counts, most connections first, then by airport code.**

Reference SQL:

```sql
SELECT origin~airport_id, origin~name, COUNT(*) AS connection_count FROM /dmo/connection AS c INNER JOIN /dmo/airport AS origin ON origin~airport_id = c~airport_from_id INNER JOIN /dmo/airport AS destination ON destination~airport_id = c~airport_to_id WHERE origin~country <> destination~country GROUP BY origin~airport_id, origin~name ORDER BY connection_count DESCENDING, origin~airport_id ASCENDING UP TO 10 ROWS
```

| AIRPORT_ID | NAME | CONNECTION_COUNT |
|---|---|---|
| FRA | Frankfurt Airport | 12 |
| SIN | Singapore Changi Airport | 11 |
| SFO | San Francisco International Airport | 9 |
| NRT | Narita International Airport | 8 |
| HAV | José Martí International Airport | 6 |
| MIA | Miami International Airport | 6 |
| JFK | John F. Kennedy International Airport | 5 |
| EWR | Newark Liberty International Airport | 2 |
| VCE | Venice Marco Polo Airport | 1 |

---

## q0158 · medium · AGREED · ordered

**Which 10 destination airports have flight bookings through the most different travel agencies? Return airport codes, agency counts, and distinct trip counts, most agencies first, then by airport code.**

Reference SQL:

```sql
SELECT c~airport_to_id, COUNT( DISTINCT t~agency_id ) AS agency_count, COUNT( DISTINCT t~travel_id ) AS trip_count FROM /dmo/travel AS t INNER JOIN /dmo/booking AS b ON b~travel_id = t~travel_id INNER JOIN /dmo/connection AS c ON c~carrier_id = b~carrier_id AND c~connection_id = b~connection_id GROUP BY c~airport_to_id ORDER BY agency_count DESCENDING, c~airport_to_id ASCENDING UP TO 10 ROWS
```

| AIRPORT_TO_ID | AGENCY_COUNT | TRIP_COUNT |
|---|---|---|
| EWR | 50 | 501 |
| FRA | 50 | 1155 |
| JFK | 50 | 1051 |
| MIA | 50 | 447 |
| NRT | 50 | 1084 |
| SFO | 50 | 1210 |
| SIN | 50 | 587 |
| VCE | 50 | 410 |
| HAV | 49 | 243 |

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

## q0160 · medium · AGREED · ordered

**Which 10 flights in November 2026 have the most recorded flight bookings? Return airline codes and names, connection numbers, flight dates, booking counts, and recorded occupied seats, most bookings first, then by date, airline code, and connection number.**

Reference SQL:

```sql
SELECT f~carrier_id, c~name, f~connection_id, f~flight_date, COUNT(*) AS booking_count, f~seats_occupied FROM /dmo/flight AS f INNER JOIN /dmo/carrier AS c ON c~carrier_id = f~carrier_id INNER JOIN /dmo/booking AS b ON b~carrier_id = f~carrier_id AND b~connection_id = f~connection_id AND b~flight_date = f~flight_date WHERE f~flight_date BETWEEN '20261101' AND '20261130' GROUP BY f~carrier_id, c~name, f~connection_id, f~flight_date, f~seats_occupied ORDER BY booking_count DESCENDING, f~flight_date ASCENDING, f~carrier_id ASCENDING, f~connection_id ASCENDING UP TO 10 ROWS
```

| CARRIER_ID | NAME | CONNECTION_ID | FLIGHT_DATE | BOOKING_COUNT | SEATS_OCCUPIED |
|---|---|---|---|---|---|
| UA | United Airlines, Inc. | 0408 | 20261103 | 8 | 121 |
| UA | United Airlines, Inc. | 0058 | 20261106 | 6 | 258 |
| AA | American Airlines Inc. | 2483 | 20261130 | 6 | 56 |
| TR | Scoot | 0884 | 20261107 | 5 | 172 |
| B6 | JetBlue | 0116 | 20261115 | 5 | 161 |
| AA | American Airlines Inc. | 0149 | 20261118 | 5 | 96 |
| AA | American Airlines Inc. | 1196 | 20261116 | 4 | 178 |
| DL | Delta Air Lines, Inc. | 0691 | 20261118 | 4 | 97 |
| NQ | Air Japan | 0802 | 20261124 | 4 | 232 |
| B6 | JetBlue | 0116 | 20261126 | 4 | 119 |

---

## q0161 · medium · AGREED · ordered

**Which 10 passengers have the highest single flight booking charges in euros? Return customer IDs, first and last names, and each passenger's highest euro flight charge, highest charge first, then by customer ID.**

Reference SQL:

```sql
SELECT c~customer_id, c~first_name, c~last_name, MAX( b~flight_price ) AS highest_euro_charge FROM /dmo/customer AS c INNER JOIN /dmo/booking AS b ON b~customer_id = c~customer_id WHERE b~currency_code = 'EUR' GROUP BY c~customer_id, c~first_name, c~last_name ORDER BY highest_euro_charge DESCENDING, c~customer_id ASCENDING UP TO 10 ROWS
```

| CUSTOMER_ID | FIRST_NAME | LAST_NAME | HIGHEST_EURO_CHARGE |
|---|---|---|---|
| 000300 | Theresia | Jacqmain | 9319.00 |
| 000309 | Jean | D´Oultrement | 9319.00 |
| 000025 | Uli | Jeremias | 9031.00 |
| 000225 | August | Mechler | 9031.00 |
| 000262 | Salvador | Henry | 9031.00 |
| 000321 | Dominik | Hunter | 9031.00 |
| 000408 | Hendrik | Illner | 9031.00 |
| 000409 | Kurt | Illner | 9031.00 |
| 000543 | Lee | Schneider | 9031.00 |
| 000369 | Florian | Babilon | 8551.00 |

---

## q0162 · medium · AGREED · ordered

**Show the first 10 scheduled departures from Frankfurt airport (FRA) in October 2026. Return airline codes and names, connection numbers, flight dates, departure times, and destination airport codes, earliest date and time first, then by airline code and connection number.**

Reference SQL:

```sql
SELECT f~carrier_id, a~name, f~connection_id, f~flight_date, c~departure_time, c~airport_to_id FROM /dmo/flight AS f INNER JOIN /dmo/connection AS c ON c~carrier_id = f~carrier_id AND c~connection_id = f~connection_id INNER JOIN /dmo/carrier AS a ON a~carrier_id = f~carrier_id WHERE c~airport_from_id = 'FRA' AND f~flight_date BETWEEN '20261001' AND '20261031' ORDER BY f~flight_date ASCENDING, c~departure_time ASCENDING, f~carrier_id ASCENDING, f~connection_id ASCENDING UP TO 10 ROWS
```

| CARRIER_ID | NAME | CONNECTION_ID | FLIGHT_DATE | DEPARTURE_TIME | AIRPORT_TO_ID |
|---|---|---|---|---|---|
| SQ | Singapore Airlines Limited | 0026 | 20261001 | 083500 | JFK |
| LH | Deutsche Lufthansa AG | 0454 | 20261001 | 102500 | SFO |
| LH | Deutsche Lufthansa AG | 0400 | 20261001 | 105500 | JFK |
| UA | United Airlines, Inc. | 0043 | 20261001 | 111000 | EWR |
| DE | Condor | 2016 | 20261001 | 114000 | JFK |
| DE | Condor | 2096 | 20261001 | 114000 | SFO |
| DL | Delta Air Lines, Inc. | 0107 | 20261001 | 115000 | JFK |
| UA | United Airlines, Inc. | 0059 | 20261001 | 125500 | SFO |
| LH | Deutsche Lufthansa AG | 0402 | 20261001 | 132000 | EWR |
| LH | Deutsche Lufthansa AG | 0404 | 20261001 | 171500 | JFK |

---

## q0163 · hard · AGREED

**For each trip starting in October 2026, show its first flight booking, choosing the lowest booking number if several were made on the same day. Return the trip number, booking number, booking date, flight date, airline name, price, and currency.**

Reference SQL:

```sql
SELECT t~travel_id, b~booking_id, b~booking_date, b~flight_date, c~name, b~flight_price, b~currency_code FROM /DMO/TRAVEL AS t INNER JOIN /DMO/BOOKING AS b ON b~travel_id = t~travel_id INNER JOIN /DMO/CARRIER AS c ON c~carrier_id = b~carrier_id WHERE t~begin_date BETWEEN '20261001' AND '20261031' AND NOT EXISTS ( SELECT * FROM /DMO/BOOKING AS earlier WHERE earlier~travel_id = b~travel_id AND ( earlier~booking_date < b~booking_date OR ( earlier~booking_date = b~booking_date AND earlier~booking_id < b~booking_id ) ) )
```

| TRAVEL_ID | BOOKING_ID | BOOKING_DATE | FLIGHT_DATE | NAME | FLIGHT_PRICE | CURRENCY_CODE |
|---|---|---|---|---|---|---|
| 00004150 | 0001 | 20260822 | 20261015 | United Airlines, Inc. | 963.00 | USD |
| 00004156 | 0001 | 20260819 | 20261012 | American Airlines Inc. | 1611.00 | USD |
| 00004161 | 0001 | 20260815 | 20261011 | Delta Air Lines, Inc. | 1828.00 | USD |
| 00004171 | 0001 | 20260823 | 20261025 | Delta Air Lines, Inc. | 3158.00 | USD |
| 00004173 | 0001 | 20260814 | 20261031 | Scoot | 4504.00 | SGD |
| 00004177 | 0001 | 20260831 | 20261016 | JetBlue | 1537.00 | USD |
| 00004179 | 0001 | 20260819 | 20261010 | Deutsche Lufthansa AG | 4929.00 | EUR |
| 00004192 | 0001 | 20260816 | 20261015 | Alaska Airlines | 2285.00 | USD |
| 00004198 | 0001 | 20260817 | 20261013 | American Airlines Inc. | 239.00 | USD |
| 00004205 | 0001 | 20260825 | 20261028 | JetBlue | 3033.00 | USD |

…164 more rows

---

## q0164 · hard · AGREED

**For trips starting in June 2026, how many lasted under 7 days, 7 to 13 days, or at least 14 days? Return each status code and the three counts, measuring duration as the days between start and end.**

Reference SQL:

```sql
SELECT t~status, SUM( CASE WHEN dats_days_between( t~begin_date, t~end_date ) < 7 THEN 1 ELSE 0 END ) AS under_7_days, SUM( CASE WHEN dats_days_between( t~begin_date, t~end_date ) BETWEEN 7 AND 13 THEN 1 ELSE 0 END ) AS days_7_to_13, SUM( CASE WHEN dats_days_between( t~begin_date, t~end_date ) >= 14 THEN 1 ELSE 0 END ) AS at_least_14_days FROM /DMO/TRAVEL AS t WHERE t~begin_date BETWEEN '20260601' AND '20260630' GROUP BY t~status
```

| STATUS | UNDER_7_DAYS | DAYS_7_TO_13 | AT_LEAST_14_DAYS |
|---|---|---|---|
| N | 963 | 0 | 61 |
| B | 467 | 0 | 48 |
| P | 404 | 0 | 75 |

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

## q0166 · hard · AGREED

**For each type of purchased extra, how many purchases belong to booked, planned, and new trips? Return the extra type code and the three purchase counts.**

Reference SQL:

```sql
SELECT s~supplement_category, SUM( CASE WHEN t~status = 'B' THEN 1 ELSE 0 END ) AS booked_trip_purchases, SUM( CASE WHEN t~status = 'P' THEN 1 ELSE 0 END ) AS planned_trip_purchases, SUM( CASE WHEN t~status = 'N' THEN 1 ELSE 0 END ) AS new_trip_purchases FROM /DMO/BOOK_SUPPL AS bs INNER JOIN /DMO/SUPPLEMENT AS s ON s~supplement_id = bs~supplement_id INNER JOIN /DMO/TRAVEL AS t ON t~travel_id = bs~travel_id GROUP BY s~supplement_category
```

| SUPPLEMENT_CATEGORY | BOOKED_TRIP_PURCHASES | PLANNED_TRIP_PURCHASES | NEW_TRIP_PURCHASES |
|---|---|---|---|
| BV | 1026 | 1022 | 1814 |
| LU | 329 | 325 | 599 |
| ML | 3923 | 3971 | 7257 |

---

## q0167 · hard · AGREED

**For each destination country served in October 2026, how many scheduled flights departed from Germany and how many departed from other countries? Return destination country codes and both flight counts.**

Reference SQL:

```sql
SELECT destination~country, SUM( CASE WHEN origin~country = 'DE' THEN 1 ELSE 0 END ) AS flights_from_germany, SUM( CASE WHEN origin~country <> 'DE' THEN 1 ELSE 0 END ) AS flights_from_elsewhere FROM /DMO/FLIGHT AS f INNER JOIN /DMO/CONNECTION AS r ON r~carrier_id = f~carrier_id AND r~connection_id = f~connection_id INNER JOIN /DMO/AIRPORT AS origin ON origin~airport_id = r~airport_from_id INNER JOIN /DMO/AIRPORT AS destination ON destination~airport_id = r~airport_to_id WHERE f~flight_date BETWEEN '20261001' AND '20261031' GROUP BY destination~country
```

| COUNTRY | FLIGHTS_FROM_GERMANY | FLIGHTS_FROM_ELSEWHERE |
|---|---|---|
| US | 341 | 2108 |
| DE | 0 | 372 |
| JP | 31 | 186 |
| SG | 0 | 310 |
| CU | 0 | 186 |

---

## q0168 · hard · AGREED · ordered

**Which 20 flight bookings for departures in December 2026 were made furthest in advance? Return trip and booking numbers, airline names, booking and flight dates, and days in advance. Sort by days in advance, highest first, then by trip and booking number.**

Reference SQL:

```sql
SELECT b~travel_id, b~booking_id, c~name, b~booking_date, b~flight_date, dats_days_between( b~booking_date, b~flight_date ) AS days_in_advance FROM /DMO/BOOKING AS b INNER JOIN /DMO/CARRIER AS c ON c~carrier_id = b~carrier_id WHERE b~flight_date BETWEEN '20261201' AND '20261231' ORDER BY days_in_advance DESCENDING, b~travel_id ASCENDING, b~booking_id ASCENDING UP TO 20 ROWS
```

| TRAVEL_ID | BOOKING_ID | NAME | BOOKING_DATE | FLIGHT_DATE | DAYS_IN_ADVANCE |
|---|---|---|---|---|---|
| 00004926 | 0001 | Deutsche Lufthansa AG | 20260815 | 20261231 | 138 |
| 00004926 | 0002 | Deutsche Lufthansa AG | 20260815 | 20261231 | 138 |
| 00004222 | 0001 | Singapore Airlines Limited | 20260815 | 20261230 | 137 |
| 00004582 | 0001 | American Airlines Inc. | 20260815 | 20261230 | 137 |
| 00004679 | 0002 | Condor | 20260816 | 20261231 | 137 |
| 00004554 | 0004 | Scoot | 20260816 | 20261230 | 136 |
| 00004554 | 0005 | Scoot | 20260816 | 20261230 | 136 |
| 00004554 | 0006 | Scoot | 20260816 | 20261230 | 136 |
| 00004234 | 0004 | United Airlines, Inc. | 20260818 | 20261231 | 135 |
| 00004234 | 0005 | United Airlines, Inc. | 20260818 | 20261231 | 135 |

…10 more rows

---

## q0169 · hard · AGREED

**Which customers have used both an agency in their own country and an agency abroad? Return customer numbers, first and last names, and country codes.**

Reference SQL:

```sql
SELECT c~customer_id, c~first_name, c~last_name, c~country_code FROM /DMO/CUSTOMER AS c WHERE EXISTS ( SELECT * FROM /DMO/TRAVEL AS domestic_trip INNER JOIN /DMO/AGENCY AS domestic_agency ON domestic_agency~agency_id = domestic_trip~agency_id WHERE domestic_trip~customer_id = c~customer_id AND domestic_agency~country_code = c~country_code ) AND EXISTS ( SELECT * FROM /DMO/TRAVEL AS foreign_trip INNER JOIN /DMO/AGENCY AS foreign_agency ON foreign_agency~agency_id = foreign_trip~agency_id WHERE foreign_trip~customer_id = c~customer_id AND foreign_agency~country_code <> c~country_code )
```

| CUSTOMER_ID | FIRST_NAME | LAST_NAME | COUNTRY_CODE |
|---|---|---|---|
| 000001 | Theresia | Buchholm | DE |
| 000002 | Johannes | Buchholm | DE |
| 000003 | James | Buchholm | DE |
| 000004 | Thomas | Buchholm | DE |
| 000005 | Anna | Buchholm | AT |
| 000006 | Uli | Buchholm | DE |
| 000007 | Jean-Luc | Buchholm | US |
| 000008 | August | Buchholm | DE |
| 000009 | Achim | Buchholm | DE |
| 000010 | Irmtraut | Buchholm | DE |

…550 more rows

---

## q0170 · hard · AGREED · ordered

**For trips starting in October 2026 with at least two euro-priced flight bookings, show the trip number, number of those bookings, cheapest and most expensive booking prices, and their price difference in euros. Sort by price difference, largest first, then by trip number.**

Reference SQL:

```sql
SELECT t~travel_id, COUNT(*) AS euro_booking_count, MIN( b~flight_price ) AS cheapest_booking_eur, MAX( b~flight_price ) AS most_expensive_booking_eur, MAX( b~flight_price ) - MIN( b~flight_price ) AS price_difference_eur FROM /DMO/TRAVEL AS t INNER JOIN /DMO/BOOKING AS b ON b~travel_id = t~travel_id WHERE t~begin_date BETWEEN '20261001' AND '20261031' AND b~currency_code = 'EUR' GROUP BY t~travel_id HAVING COUNT(*) >= 2 ORDER BY price_difference_eur DESCENDING, t~travel_id ASCENDING
```

| TRAVEL_ID | EURO_BOOKING_COUNT | CHEAPEST_BOOKING_EUR | MOST_EXPENSIVE_BOOKING_EUR | PRICE_DIFFERENCE_EUR |
|---|---|---|---|---|
| 00004594 | 4 | 4131.00 | 8455.00 | 4324.00 |
| 00004255 | 2 | 5764.00 | 9031.00 | 3267.00 |
| 00004555 | 4 | 2673.00 | 5906.00 | 3233.00 |
| 00005090 | 4 | 4227.00 | 7013.00 | 2786.00 |
| 00004694 | 2 | 4323.00 | 7013.00 | 2690.00 |
| 00004884 | 2 | 2797.00 | 5470.00 | 2673.00 |
| 00005105 | 6 | 3204.00 | 5853.00 | 2649.00 |
| 00004260 | 6 | 4515.00 | 6629.00 | 2114.00 |
| 00004420 | 6 | 5860.00 | 7590.00 | 1730.00 |
| 00004742 | 2 | 4351.00 | 6030.00 | 1679.00 |

…18 more rows

---

## q0171 · hard · AGREED · ordered

**Which 20 trips with the lowest trip numbers contain flights in both directions between the same two airports? Return trip numbers and the trip customers' numbers, first names, and last names, sorted by trip number.**

Reference SQL:

```sql
SELECT t~travel_id, c~customer_id, c~first_name, c~last_name FROM /DMO/TRAVEL AS t INNER JOIN /DMO/CUSTOMER AS c ON c~customer_id = t~customer_id WHERE EXISTS ( SELECT * FROM /DMO/BOOKING AS b1 INNER JOIN /DMO/CONNECTION AS r1 ON r1~carrier_id = b1~carrier_id AND r1~connection_id = b1~connection_id INNER JOIN /DMO/BOOKING AS b2 ON b2~travel_id = b1~travel_id INNER JOIN /DMO/CONNECTION AS r2 ON r2~carrier_id = b2~carrier_id AND r2~connection_id = b2~connection_id WHERE b1~travel_id = t~travel_id AND r2~airport_from_id = r1~airport_to_id AND r2~airport_to_id = r1~airport_from_id ) ORDER BY t~travel_id ASCENDING UP TO 20 ROWS
```

| TRAVEL_ID | CUSTOMER_ID | FIRST_NAME | LAST_NAME |
|---|---|---|---|
| 00000001 | 000594 | Illya | Ryan |
| 00000003 | 000093 | Sophie | Detemple |
| 00000004 | 000665 | Harish | Madeira |
| 00000006 | 000072 | Theresia | Neubasler |
| 00000007 | 000138 | August | Wohl |
| 00000008 | 000705 | Lee | Müller |
| 00000009 | 000115 | Laura | Benz |
| 00000010 | 000697 | Amelie | Leisert |
| 00000012 | 000583 | Illya | Lautenbach |
| 00000013 | 000004 | Thomas | Buchholm |

…10 more rows

---

## q0172 · hard · AGREED

**For October 2026 flights, how many cost under 500, from 500 to under 1,000, or at least 1,000 in their listed currency? Return each currency and the three flight counts, keeping currencies separate.**

Reference SQL:

```sql
SELECT f~currency_code, SUM( CASE WHEN f~price < 500 THEN 1 ELSE 0 END ) AS under_500, SUM( CASE WHEN f~price >= 500 AND f~price < 1000 THEN 1 ELSE 0 END ) AS from_500_to_under_1000, SUM( CASE WHEN f~price >= 1000 THEN 1 ELSE 0 END ) AS at_least_1000 FROM /DMO/FLIGHT AS f WHERE f~flight_date BETWEEN '20261001' AND '20261031' GROUP BY f~currency_code
```

| CURRENCY_CODE | UNDER_500 | FROM_500_TO_UNDER_1000 | AT_LEAST_1000 |
|---|---|---|---|
| SGD | 0 | 0 | 372 |
| USD | 368 | 250 | 1924 |
| JPY | 0 | 0 | 248 |
| EUR | 0 | 0 | 372 |

---

## q0173 · easy · AGREED · ordered

**Show the 10 flights with the fewest unoccupied seats, including airline codes, route numbers, dates and unoccupied seat counts. Sort by unoccupied seats, fewest first, then date, airline code and route number.**

Reference SQL:

```sql
SELECT carrier_id, connection_id, flight_date, seats_max - seats_occupied AS unoccupied_seats FROM /dmo/flight ORDER BY unoccupied_seats ASCENDING, flight_date ASCENDING, carrier_id ASCENDING, connection_id ASCENDING UP TO 10 ROWS
```

| CARRIER_ID | CONNECTION_ID | FLIGHT_DATE | UNOCCUPIED_SEATS |
|---|---|---|---|
| AA | 0838 | 20260916 | 3 |
| AA | 2706 | 20260916 | 3 |
| AA | 2481 | 20260922 | 3 |
| AA | 0838 | 20261020 | 3 |
| AA | 2705 | 20261022 | 3 |
| AA | 0837 | 20261025 | 3 |
| AA | 2481 | 20261029 | 3 |
| AA | 2705 | 20261104 | 3 |
| AA | 0837 | 20261105 | 3 |
| AA | 2705 | 20261112 | 3 |

---

## q0174 · easy · AGREED · ordered

**On which 5 dates were the most flight bookings made? Show booking dates and booking counts, largest count first, then earliest date.**

Reference SQL:

```sql
SELECT booking_date, COUNT(*) AS booking_count FROM /dmo/booking GROUP BY booking_date ORDER BY booking_count DESCENDING, booking_date ASCENDING UP TO 5 ROWS
```

| BOOKING_DATE | BOOKING_COUNT |
|---|---|
| 20270328 | 279 |
| 20260614 | 264 |
| 20270410 | 255 |
| 20260611 | 251 |
| 20270405 | 250 |

---

## q0175 · easy · AGREED · ordered

**Which 10 airline routes have the most flight bookings? Show airline codes, route numbers and booking counts, largest count first, then airline code and route number.**

Reference SQL:

```sql
SELECT carrier_id, connection_id, COUNT(*) AS booking_count FROM /dmo/booking GROUP BY carrier_id, connection_id ORDER BY booking_count DESCENDING, carrier_id ASCENDING, connection_id ASCENDING UP TO 10 ROWS
```

| CARRIER_ID | CONNECTION_ID | BOOKING_COUNT |
|---|---|---|
| AZ | 0789 | 773 |
| JL | 0408 | 744 |
| LH | 0401 | 704 |
| AA | 0018 | 693 |
| SQ | 0002 | 684 |
| AZ | 0788 | 643 |
| SQ | 0012 | 517 |
| SQ | 0011 | 505 |
| UA | 0058 | 487 |
| LH | 0402 | 486 |

---

## q0176 · easy · AGREED

**How many available extras are in each category? Show category codes and extra counts.**

Reference SQL:

```sql
SELECT supplement_category, COUNT(*) AS extra_count FROM /dmo/supplement GROUP BY supplement_category
```

| SUPPLEMENT_CATEGORY | EXTRA_COUNT |
|---|---|
| BV | 9 |
| LU | 3 |
| ML | 36 |

---

## q0177 · easy · AGREED · ordered

**Which 5 countries have the most airports listed? Show country codes and airport counts, largest count first, then country code.**

Reference SQL:

```sql
SELECT country, COUNT(*) AS airport_count FROM /dmo/airport GROUP BY country ORDER BY airport_count DESCENDING, country ASCENDING UP TO 5 ROWS
```

| COUNTRY | AIRPORT_COUNT |
|---|---|
| US | 12 |
| DE | 6 |
| JP | 4 |
| UK | 3 |
| ES | 2 |

---

## q0178 · easy · AGREED

**How many airline routes are listed in total?**

Reference SQL:

```sql
SELECT COUNT(*) AS route_count FROM /dmo/connection
```

| ROUTE_COUNT |
|---|
| 120 |

---

## q0179 · easy · AGREED · ordered

**Which 10 customers have the most trips? Show customer numbers and trip counts, largest count first, then customer number.**

Reference SQL:

```sql
SELECT customer_id, COUNT(*) AS trip_count FROM /dmo/travel GROUP BY customer_id ORDER BY trip_count DESCENDING, customer_id ASCENDING UP TO 10 ROWS
```

| CUSTOMER_ID | TRIP_COUNT |
|---|---|
| 000438 | 16 |
| 000531 | 15 |
| 000185 | 14 |
| 000274 | 14 |
| 000293 | 14 |
| 000465 | 14 |
| 000610 | 14 |
| 000050 | 13 |
| 000052 | 13 |
| 000238 | 13 |

---

## q0181 · easy · AGREED · ordered

**How many trips start on each date in October 2026? Show start dates and trip counts, earliest date first.**

Reference SQL:

```sql
SELECT begin_date, COUNT(*) AS trip_count FROM /dmo/travel WHERE begin_date >= '20261001' AND begin_date < '20261101' GROUP BY begin_date ORDER BY begin_date ASCENDING
```

| BEGIN_DATE | TRIP_COUNT |
|---|---|
| 20261001 | 7 |
| 20261002 | 4 |
| 20261003 | 3 |
| 20261004 | 3 |
| 20261005 | 8 |
| 20261006 | 8 |
| 20261007 | 4 |
| 20261008 | 12 |
| 20261009 | 5 |
| 20261010 | 4 |

…21 more rows

---

## q0183 · medium · AGREED · ordered

**Which 10 airlines have flight bookings through the most different travel agencies? Return airline codes, names, and agency counts, most agencies first, then by airline code.**

Reference SQL:

```sql
SELECT c~carrier_id, c~name, COUNT( DISTINCT t~agency_id ) AS agency_count FROM /DMO/CARRIER AS c INNER JOIN /DMO/BOOKING AS b ON b~carrier_id = c~carrier_id INNER JOIN /DMO/TRAVEL AS t ON t~travel_id = b~travel_id GROUP BY c~carrier_id, c~name ORDER BY agency_count DESCENDING, c~carrier_id ASCENDING UP TO 10 ROWS
```

| CARRIER_ID | NAME | AGENCY_COUNT |
|---|---|---|
| AA | American Airlines Inc. | 50 |
| AZ | Alitalia Societa Aerea Italiana S.p.A. | 50 |
| JL | Japan Airlines Co., Ltd. | 50 |
| LH | Deutsche Lufthansa AG | 50 |
| SQ | Singapore Airlines Limited | 50 |
| UA | United Airlines, Inc. | 50 |
| DL | Delta Air Lines, Inc. | 47 |
| B6 | JetBlue | 43 |
| AS | Alaska Airlines | 37 |
| DE | Condor | 30 |

---

## q0184 · medium · AGREED · ordered

**Which 10 passenger home cities account for the most flight bookings? Return city names, country codes, booking counts, and distinct passenger counts, most bookings first, then by country code and city name.**

Reference SQL:

```sql
SELECT c~city, c~country_code, COUNT(*) AS booking_count, COUNT( DISTINCT c~customer_id ) AS passenger_count FROM /DMO/CUSTOMER AS c INNER JOIN /DMO/BOOKING AS b ON b~customer_id = c~customer_id GROUP BY c~city, c~country_code ORDER BY booking_count DESCENDING, c~country_code ASCENDING, c~city ASCENDING UP TO 10 ROWS
```

| CITY | COUNTRY_CODE | BOOKING_COUNT | PASSENGER_COUNT |
|---|---|---|---|
| Gaertringen | DE | 510 | 27 |
| Arlington | US | 419 | 22 |
| Heusenstamm | DE | 400 | 22 |
| Schifferstadt | DE | 397 | 23 |
| Chicago | US | 378 | 20 |
| Teaneck | US | 355 | 17 |
| Walldorf | DE | 348 | 18 |
| Vélizy | FR | 336 | 18 |
| Emmendingen | DE | 335 | 21 |
| Mannheim-Lindenhof | DE | 327 | 18 |

---

## q0185 · medium · AGREED

**What are the lowest and highest catalog prices in each add-on category and currency with at least one catalog entry? Return category codes, currencies, and both prices.**

Reference SQL:

```sql
SELECT s~supplement_category, s~currency_code, MIN( s~price ) AS lowest_price, MAX( s~price ) AS highest_price FROM /DMO/SUPPLEMENT AS s GROUP BY s~supplement_category, s~currency_code
```

| SUPPLEMENT_CATEGORY | CURRENCY_CODE | LOWEST_PRICE | HIGHEST_PRICE |
|---|---|---|---|
| BV | EUR | 2.30 | 7.50 |
| LU | EUR | 15.00 | 80.00 |
| ML | EUR | 1.50 | 40.00 |

---

## q0186 · medium · AGREED

**For each agency handling trips starting in October 2026, show its ID, name, earliest trip start date, and latest trip end date.**

Reference SQL:

```sql
SELECT a~agency_id, a~name, MIN( t~begin_date ) AS earliest_start, MAX( t~end_date ) AS latest_end FROM /DMO/AGENCY AS a INNER JOIN /DMO/TRAVEL AS t ON t~agency_id = a~agency_id WHERE t~begin_date BETWEEN '20261001' AND '20261031' GROUP BY a~agency_id, a~name
```

| AGENCY_ID | NAME | EARLIEST_START | LATEST_END |
|---|---|---|---|
| 070021 | Special Agency Peru | 20261006 | 20261029 |
| 070018 | Wang Chong | 20261006 | 20261014 |
| 070019 | Around the World | 20261008 | 20261030 |
| 070007 | Hot Socks Travel | 20261001 | 20261101 |
| 070048 | Rocky Horror Tours | 20261003 | 20261105 |
| 070032 | Sunny, Sunny, Sunny | 20261001 | 20261014 |
| 070009 | Honauer Reisen GmbH | 20261008 | 20261102 |
| 070033 | Fly & Smile | 20261001 | 20261018 |
| 070034 | Supercheap | 20261008 | 20261030 |
| 070045 |  | 20261002 | 20261107 |

…40 more rows

---

## q0187 · medium · AGREED

**For each airline and aircraft type scheduled in January 2027, show the airline code and name, aircraft type, and number of different connections served.**

Reference SQL:

```sql
SELECT c~carrier_id, c~name, f~plane_type_id, COUNT( DISTINCT f~connection_id ) AS connection_count FROM /DMO/CARRIER AS c INNER JOIN /DMO/FLIGHT AS f ON f~carrier_id = c~carrier_id WHERE f~flight_date BETWEEN '20270101' AND '20270131' GROUP BY c~carrier_id, c~name, f~plane_type_id
```

| CARRIER_ID | NAME | PLANE_TYPE_ID | CONNECTION_COUNT |
|---|---|---|---|
| AA | American Airlines Inc. | A321-200 | 12 |
| B6 | JetBlue | A321-200 | 12 |
| DL | Delta Air Lines, Inc. | A330-200 | 2 |
| UA | United Airlines, Inc. | 777-300ER | 2 |
| UA | United Airlines, Inc. | 787-9 | 6 |
| AA | American Airlines Inc. | 737-800 | 7 |
| AA | American Airlines Inc. | A319-100 | 6 |
| DL | Delta Air Lines, Inc. | 737-800 | 2 |
| UA | United Airlines, Inc. | 737-900 | 1 |
| AA | American Airlines Inc. | 737 MAX 8 | 2 |

…20 more rows

---

## q0188 · medium · AGREED

**How are purchased add-ons distributed across trip statuses? For each add-on category and trip status with purchased add-ons, return both codes, the number of add-on entries, and the number of distinct trips.**

Reference SQL:

```sql
SELECT s~supplement_category, t~status, COUNT(*) AS addon_count, COUNT( DISTINCT t~travel_id ) AS trip_count FROM /DMO/BOOK_SUPPL AS bs INNER JOIN /DMO/SUPPLEMENT AS s ON s~supplement_id = bs~supplement_id INNER JOIN /DMO/TRAVEL AS t ON t~travel_id = bs~travel_id GROUP BY s~supplement_category, t~status
```

| SUPPLEMENT_CATEGORY | STATUS | ADDON_COUNT | TRIP_COUNT |
|---|---|---|---|
| BV | B | 1026 | 664 |
| LU | B | 329 | 282 |
| ML | B | 3923 | 1178 |
| BV | N | 1814 | 1246 |
| LU | N | 599 | 520 |
| ML | N | 7257 | 2305 |
| BV | P | 1022 | 660 |
| LU | P | 325 | 269 |
| ML | P | 3971 | 1164 |

---

## q0189 · medium · AGREED

**What are the shortest and longest listed connection distances in each distance unit? Return the unit, both distances, and the number of connections.**

Reference SQL:

```sql
SELECT c~distance_unit, MIN( c~distance ) AS shortest_distance, MAX( c~distance ) AS longest_distance, COUNT(*) AS connection_count FROM /DMO/CONNECTION AS c GROUP BY c~distance_unit
```

| DISTANCE_UNIT | SHORTEST_DISTANCE | LONGEST_DISTANCE | CONNECTION_COUNT |
|---|---|---|---|
| KM | 520 | 13523 | 120 |

---

## q0190 · medium · AGREED

**For each trip status and currency, show the status code, currency, number of trips, and lowest and highest booking fees.**

Reference SQL:

```sql
SELECT t~status, t~currency_code, COUNT(*) AS trip_count, MIN( t~booking_fee ) AS lowest_fee, MAX( t~booking_fee ) AS highest_fee FROM /DMO/TRAVEL AS t GROUP BY t~status, t~currency_code
```

| STATUS | CURRENCY_CODE | TRIP_COUNT | LOWEST_FEE | HIGHEST_FEE |
|---|---|---|---|---|
| P | EUR | 404 | 10.00 | 150.00 |
| P | USD | 477 | 10.00 | 120.00 |
| P | JPY | 188 | 10.00 | 60.00 |
| N | USD | 935 | 0.00 | 90.00 |
| N | EUR | 867 | 10.00 | 60.00 |
| N | JPY | 308 | 10.00 | 60.00 |
| P | SGD | 211 | 10.00 | 80.00 |
| B | SGD | 211 | 10.00 | 120.00 |
| B | EUR | 411 | 10.00 | 120.00 |
| B | JPY | 181 | 10.00 | 60.00 |

…2 more rows

---

## q0191 · medium · AGREED · ordered

**Which 10 booking dates had the most flight bookings? Return the dates, booking counts, and distinct passenger counts, most bookings first, then by date.**

Reference SQL:

```sql
SELECT b~booking_date, COUNT(*) AS booking_count, COUNT( DISTINCT b~customer_id ) AS passenger_count FROM /DMO/BOOKING AS b GROUP BY b~booking_date ORDER BY booking_count DESCENDING, b~booking_date ASCENDING UP TO 10 ROWS
```

| BOOKING_DATE | BOOKING_COUNT | PASSENGER_COUNT |
|---|---|---|
| 20270328 | 279 | 238 |
| 20260614 | 264 | 218 |
| 20270410 | 255 | 205 |
| 20260611 | 251 | 208 |
| 20270405 | 250 | 215 |
| 20270404 | 249 | 211 |
| 20270330 | 239 | 206 |
| 20260616 | 232 | 196 |
| 20270329 | 231 | 195 |
| 20260903 | 230 | 108 |

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

## q0194 · hard · AGREED

**Which customers have at least two trips, all with the same status? Return customer numbers, first and last names, the status code, and trip count.**

Reference SQL:

```sql
SELECT c~customer_id, c~first_name, c~last_name, MIN( t~status ) AS status_code, COUNT(*) AS trip_count FROM /dmo/customer AS c INNER JOIN /dmo/travel AS t ON t~customer_id = c~customer_id GROUP BY c~customer_id, c~first_name, c~last_name HAVING COUNT(*) >= 2 AND COUNT( DISTINCT t~status ) = 1
```

| CUSTOMER_ID | FIRST_NAME | LAST_NAME | STATUS_CODE | TRIP_COUNT |
|---|---|---|---|---|
| 000705 | Lee | Müller | N | 3 |
| 000533 | Laura | Schneider | N | 3 |
| 000510 | Amelie | Moyano | N | 5 |
| 000237 | Kristina | Heller | N | 4 |
| 000498 | Uli | Domenech | N | 5 |
| 000588 | Ida | Lautenbach | N | 4 |
| 000634 | Illya | Lindwurm | N | 3 |
| 000140 | Ruth | Wohl | N | 6 |
| 000670 | Christoph | Madeira | N | 3 |
| 000643 | Horst | Kirk | N | 3 |

…14 more rows

---

## q0195 · hard · AGREED

**Which airport-to-airport routes had flights from at least two airlines in October 2026? Treat each direction separately. Return departure and arrival airport codes, airline counts, and scheduled flight counts.**

Reference SQL:

```sql
SELECT c~airport_from_id, c~airport_to_id, COUNT( DISTINCT f~carrier_id ) AS airline_count, COUNT(*) AS flight_count FROM /dmo/connection AS c INNER JOIN /dmo/flight AS f ON f~carrier_id = c~carrier_id AND f~connection_id = c~connection_id WHERE f~flight_date BETWEEN '20261001' AND '20261031' GROUP BY c~airport_from_id, c~airport_to_id HAVING COUNT( DISTINCT f~carrier_id ) >= 2
```

| AIRPORT_FROM_ID | AIRPORT_TO_ID | AIRLINE_COUNT | FLIGHT_COUNT |
|---|---|---|---|
| JFK | SFO | 4 | 682 |
| SFO | JFK | 4 | 589 |
| MIA | EWR | 2 | 279 |
| EWR | MIA | 2 | 248 |
| FRA | JFK | 4 | 155 |
| FRA | EWR | 2 | 62 |
| EWR | FRA | 2 | 62 |
| SFO | FRA | 3 | 124 |
| FRA | SFO | 3 | 124 |
| SFO | SIN | 2 | 124 |

…6 more rows

---

## q0196 · hard · AGREED

**For each airline that had flights in September or October 2026, what percentage of its scheduled seats were occupied in September 2026 and in October 2026? Calculate each percentage from the month's total occupied seats and total capacity, rounded to 2 decimals. Return airline codes, names, and both percentages.**

Reference SQL:

```sql
SELECT c~carrier_id, c~name, DIVISION( SUM( CASE WHEN f~flight_date BETWEEN '20260901' AND '20260930' THEN f~seats_occupied ELSE 0 END ) * 100, SUM( CASE WHEN f~flight_date BETWEEN '20260901' AND '20260930' THEN f~seats_max ELSE 0 END ), 2 ) AS september_occupied_pct, DIVISION( SUM( CASE WHEN f~flight_date BETWEEN '20261001' AND '20261031' THEN f~seats_occupied ELSE 0 END ) * 100, SUM( CASE WHEN f~flight_date BETWEEN '20261001' AND '20261031' THEN f~seats_max ELSE 0 END ), 2 ) AS october_occupied_pct FROM /dmo/carrier AS c INNER JOIN /dmo/flight AS f ON f~carrier_id = c~carrier_id WHERE f~flight_date BETWEEN '20260901' AND '20261031' GROUP BY c~carrier_id, c~name
```

| CARRIER_ID | NAME | SEPTEMBER_OCCUPIED_PCT | OCTOBER_OCCUPIED_PCT |
|---|---|---|---|
| NQ | Air Japan | 69.75 | 68.85 |
| AS | Alaska Airlines | 67.12 | 68.08 |
| AA | American Airlines Inc. | 68.60 | 68.52 |
| DE | Condor | 68.89 | 68.94 |
| DL | Delta Air Lines, Inc. | 68.59 | 69.64 |
| LH | Deutsche Lufthansa AG | 70.32 | 70.36 |
| JL | Japan Airlines Co., Ltd. | 67.91 | 66.43 |
| B6 | JetBlue | 68.09 | 69.22 |
| TR | Scoot | 67.72 | 71.35 |
| SQ | Singapore Airlines Limited | 69.15 | 69.25 |

…1 more rows

---

## q0197 · hard · AGREED

**Which trips starting in October 2026 have booked flights on at least two different dates? Return trip numbers, first and last flight dates, and the number of days between those dates.**

Reference SQL:

```sql
SELECT t~travel_id, MIN( b~flight_date ) AS first_flight_date, MAX( b~flight_date ) AS last_flight_date, DATS_DAYS_BETWEEN( MIN( b~flight_date ), MAX( b~flight_date ) ) AS flight_span_days FROM /dmo/travel AS t INNER JOIN /dmo/booking AS b ON b~travel_id = t~travel_id WHERE t~begin_date BETWEEN '20261001' AND '20261031' GROUP BY t~travel_id HAVING COUNT( DISTINCT b~flight_date ) >= 2
```

| TRAVEL_ID | FIRST_FLIGHT_DATE | LAST_FLIGHT_DATE | FLIGHT_SPAN_DAYS |
|---|---|---|---|
| 00004150 | 20261015 | 20261022 | 7 |
| 00004156 | 20261012 | 20261013 | 1 |
| 00004161 | 20261011 | 20261018 | 7 |
| 00004171 | 20261025 | 20261101 | 7 |
| 00004173 | 20261031 | 20261105 | 5 |
| 00004177 | 20261016 | 20261020 | 4 |
| 00004179 | 20261010 | 20261014 | 4 |
| 00004192 | 20261015 | 20261021 | 6 |
| 00004198 | 20261013 | 20261018 | 5 |
| 00004205 | 20261028 | 20261030 | 2 |

…164 more rows

---

## q0198 · hard · AGREED · ordered

**Which 20 euro-priced trips starting in June 2026 have the highest total price per calendar day, counting both the start and end dates? Return trip numbers, start and end dates, total prices, and prices per day rounded to 2 decimals. Sort by the rounded daily price, highest first, then by trip number.**

Reference SQL:

```sql
SELECT t~travel_id, t~begin_date, t~end_date, t~total_price, DIVISION( t~total_price, DATS_DAYS_BETWEEN( t~begin_date, t~end_date ) + 1, 2 ) AS price_per_day_eur FROM /dmo/travel AS t WHERE t~begin_date BETWEEN '20260601' AND '20260630' AND t~currency_code = 'EUR' ORDER BY price_per_day_eur DESCENDING, t~travel_id ASCENDING UP TO 20 ROWS
```

| TRAVEL_ID | BEGIN_DATE | END_DATE | TOTAL_PRICE | PRICE_PER_DAY_EUR |
|---|---|---|---|---|
| 00003202 | 20260621 | 20260621 | 22259.00 | 22259.00 |
| 00003193 | 20260621 | 20260621 | 21449.00 | 21449.00 |
| 00003187 | 20260621 | 20260621 | 20243.00 | 20243.00 |
| 00003185 | 20260621 | 20260621 | 20058.00 | 20058.00 |
| 00003182 | 20260621 | 20260621 | 19682.00 | 19682.00 |
| 00003181 | 20260621 | 20260621 | 19649.00 | 19649.00 |
| 00003180 | 20260621 | 20260621 | 19391.00 | 19391.00 |
| 00003179 | 20260621 | 20260621 | 19054.00 | 19054.00 |
| 00003174 | 20260621 | 20260621 | 18209.00 | 18209.00 |
| 00003171 | 20260621 | 20260621 | 17956.00 | 17956.00 |

…10 more rows

---

## q0199 · hard · AGREED

**Which trips starting in October 2026 include purchased extras from at least two categories? Return trip numbers, the number of extra categories, and the number of purchased extras.**

Reference SQL:

```sql
SELECT t~travel_id, COUNT( DISTINCT s~supplement_category ) AS category_count, COUNT(*) AS extra_count FROM /dmo/travel AS t INNER JOIN /dmo/book_suppl AS bs ON bs~travel_id = t~travel_id INNER JOIN /dmo/supplement AS s ON s~supplement_id = bs~supplement_id WHERE t~begin_date BETWEEN '20261001' AND '20261031' GROUP BY t~travel_id HAVING COUNT( DISTINCT s~supplement_category ) >= 2
```

| TRAVEL_ID | CATEGORY_COUNT | EXTRA_COUNT |
|---|---|---|
| 00004156 | 2 | 8 |
| 00004171 | 2 | 5 |
| 00004173 | 2 | 5 |
| 00004192 | 2 | 4 |
| 00004225 | 2 | 2 |
| 00004250 | 2 | 2 |
| 00004257 | 2 | 5 |
| 00004283 | 2 | 2 |
| 00004286 | 2 | 3 |
| 00004293 | 2 | 2 |

…95 more rows

---

## q0200 · hard · AGREED

**For flights departing in December 2026, what are the total flight-booking charges attached to booked, planned, and new trips? Return airline codes, names, currencies, and the three charge totals, keeping currencies separate.**

Reference SQL:

```sql
SELECT c~carrier_id, c~name, b~currency_code, SUM( CASE WHEN t~status = 'B' THEN b~flight_price ELSE 0 END ) AS booked_trip_charges, SUM( CASE WHEN t~status = 'P' THEN b~flight_price ELSE 0 END ) AS planned_trip_charges, SUM( CASE WHEN t~status = 'N' THEN b~flight_price ELSE 0 END ) AS new_trip_charges FROM /dmo/booking AS b INNER JOIN /dmo/travel AS t ON t~travel_id = b~travel_id INNER JOIN /dmo/carrier AS c ON c~carrier_id = b~carrier_id WHERE b~flight_date BETWEEN '20261201' AND '20261231' GROUP BY c~carrier_id, c~name, b~currency_code
```

| CARRIER_ID | NAME | CURRENCY_CODE | BOOKED_TRIP_CHARGES | PLANNED_TRIP_CHARGES | NEW_TRIP_CHARGES |
|---|---|---|---|---|---|
| AA | American Airlines Inc. | USD | 48953.00 | 34719.00 | 146979.00 |
| LH | Deutsche Lufthansa AG | EUR | 68296.00 | 81451.00 | 195978.00 |
| UA | United Airlines, Inc. | USD | 104677.00 | 153675.00 | 351759.00 |
| AS | Alaska Airlines | USD | 14918.00 | 16163.00 | 94404.00 |
| B6 | JetBlue | USD | 84933.00 | 52769.00 | 38141.00 |
| DL | Delta Air Lines, Inc. | USD | 134868.00 | 36247.00 | 103421.00 |
| DE | Condor | EUR | 3265.00 | 53655.00 | 42560.00 |
| NQ | Air Japan | JPY | 6220.00 | 60970.00 | 59680.00 |
| SQ | Singapore Airlines Limited | SGD | 63237.00 | 168470.00 | 173260.00 |
| JL | Japan Airlines Co., Ltd. | JPY | 56372.00 | 5684.00 | 21386.00 |

…1 more rows

---

## q0201 · hard · AGREED

**For each trip status, what percentage of trips starting in the fourth quarter of 2026 start in December? Return status codes, quarter trip counts, December trip counts, and percentages rounded to 2 decimals.**

Reference SQL:

```sql
SELECT t~status, COUNT(*) AS quarter_trip_count, SUM( CASE WHEN t~begin_date BETWEEN '20261201' AND '20261231' THEN 1 ELSE 0 END ) AS december_trip_count, DIVISION( SUM( CASE WHEN t~begin_date BETWEEN '20261201' AND '20261231' THEN 1 ELSE 0 END ) * 100, COUNT(*), 2 ) AS december_percentage FROM /dmo/travel AS t WHERE t~begin_date BETWEEN '20261001' AND '20261231' GROUP BY t~status
```

| STATUS | QUARTER_TRIP_COUNT | DECEMBER_TRIP_COUNT | DECEMBER_PERCENTAGE |
|---|---|---|---|
| N | 260 | 101 | 38.85 |
| B | 138 | 52 | 37.68 |
| P | 136 | 49 | 36.03 |

---

## q0202 · hard · AGREED

**For trips starting in April 2027, how much of the total trip price comes from booking fees? Return each currency, total booking fees, total trip prices, and booking fees as a percentage of total trip prices, rounded to 2 decimals. Keep currencies separate.**

Reference SQL:

```sql
SELECT t~currency_code, SUM( t~booking_fee ) AS total_booking_fees, SUM( t~total_price ) AS total_trip_prices, DIVISION( SUM( t~booking_fee ) * 100, SUM( t~total_price ), 2 ) AS booking_fee_percentage FROM /dmo/travel AS t WHERE t~begin_date BETWEEN '20270401' AND '20270430' GROUP BY t~currency_code
```

| CURRENCY_CODE | TOTAL_BOOKING_FEES | TOTAL_TRIP_PRICES | BOOKING_FEE_PERCENTAGE |
|---|---|---|---|
| SGD | 8250.00 | 3784105.00 | 0.22 |
| USD | 11050.00 | 2272810.00 | 0.49 |
| JPY | 6860.00 | 2669006.00 | 0.26 |
| EUR | 16250.00 | 5225108.00 | 0.31 |

---

## q0203 · easy · AGREED

**What are the earliest and latest recorded booking dates?**

Reference SQL:

```sql
SELECT MIN( booking_date ) AS earliest_booking_date, MAX( booking_date ) AS latest_booking_date FROM /DMO/BOOKING
```

| EARLIEST_BOOKING_DATE | LATEST_BOOKING_DATE |
|---|---|
| 20260527 | 20270418 |

---

## q0204 · easy · AGREED · ordered

**Which 10 agencies have served the most distinct customers? Show agency numbers and customer counts, highest count first, then by agency number.**

Reference SQL:

```sql
SELECT agency_id, COUNT( DISTINCT customer_id ) AS customer_count FROM /DMO/TRAVEL GROUP BY agency_id ORDER BY customer_count DESCENDING, agency_id ASCENDING UP TO 10 ROWS
```

| AGENCY_ID | CUSTOMER_COUNT |
|---|---|
| 070007 | 111 |
| 070020 | 111 |
| 070017 | 110 |
| 070037 | 110 |
| 070041 | 108 |
| 070042 | 108 |
| 070046 | 108 |
| 070038 | 107 |
| 070022 | 106 |
| 070030 | 106 |

---

## q0205 · easy · AGREED

**How many different destination airports can be reached directly from each departure airport that has listed connections? Show departure airport codes and destination counts.**

Reference SQL:

```sql
SELECT airport_from_id, COUNT( DISTINCT airport_to_id ) AS destination_count FROM /DMO/CONNECTION GROUP BY airport_from_id
```

| AIRPORT_FROM_ID | DESTINATION_COUNT |
|---|---|
| SFO | 3 |
| SIN | 2 |
| EWR | 2 |
| VCE | 1 |
| NRT | 3 |
| FRA | 4 |
| JFK | 2 |
| MIA | 2 |
| HAV | 1 |

---

## q0206 · easy · AGREED

**How many distinct US cities have an airport listed?**

Reference SQL:

```sql
SELECT COUNT( DISTINCT city ) AS city_count FROM /DMO/AIRPORT WHERE country = 'US'
```

| CITY_COUNT |
|---|
| 12 |

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

## q0209 · easy · AGREED

**Which units are used to record route distances? Show each unit code once.**

Reference SQL:

```sql
SELECT DISTINCT distance_unit FROM /DMO/CONNECTION
```

| DISTANCE_UNIT |
|---|
| KM |

---

## q0210 · easy · AGREED · ordered

**Break down trips by agency and status. Show agency numbers, status codes and trip counts for the 20 largest groups, highest count first, then by agency number and status code.**

Reference SQL:

```sql
SELECT agency_id, status, COUNT(*) AS trip_count FROM /DMO/TRAVEL GROUP BY agency_id, status ORDER BY trip_count DESCENDING, agency_id ASCENDING, status ASCENDING UP TO 20 ROWS
```

| AGENCY_ID | STATUS | TRIP_COUNT |
|---|---|---|
| 070017 | N | 113 |
| 070007 | N | 109 |
| 070020 | N | 106 |
| 070037 | B | 104 |
| 070022 | N | 102 |
| 070042 | P | 100 |
| 070005 | N | 99 |
| 070023 | N | 99 |
| 070030 | B | 99 |
| 070046 | P | 99 |

…10 more rows

---

## q0211 · easy · AGREED

**How many extras added to bookings are priced in each currency? Show currency codes and extra counts.**

Reference SQL:

```sql
SELECT currency_code, COUNT(*) AS extra_count FROM /DMO/BOOK_SUPPL GROUP BY currency_code
```

| CURRENCY_CODE | EXTRA_COUNT |
|---|---|
| EUR | 20266 |

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

## q0217 · medium · AGREED · ordered

**Which 10 agency and airline combinations account for the most flight bookings? Return agency IDs and names, airline codes, and booking counts, most bookings first, then by agency ID and airline code.**

Reference SQL:

```sql
SELECT a~agency_id, a~name, b~carrier_id, COUNT(*) AS booking_count FROM /dmo/agency AS a INNER JOIN /dmo/travel AS t ON t~agency_id = a~agency_id INNER JOIN /dmo/booking AS b ON b~travel_id = t~travel_id GROUP BY a~agency_id, a~name, b~carrier_id ORDER BY booking_count DESCENDING, a~agency_id ASCENDING, b~carrier_id ASCENDING UP TO 10 ROWS
```

| AGENCY_ID | NAME | CARRIER_ID | BOOKING_COUNT |
|---|---|---|---|
| 070050 | Not Only By Bike | AA | 94 |
| 070012 | Ben McCloskey Ltd. | AA | 89 |
| 070007 | Hot Socks Travel | AA | 84 |
| 070042 | The Ultimate Answer | AA | 84 |
| 070046 | Hendrik's | SQ | 77 |
| 070049 | Flights and More | AA | 76 |
| 070022 | Caribian Dreams | AA | 75 |
| 070020 | No Return | AA | 74 |
| 070037 | Real Weird Vacation | AA | 74 |
| 070020 | No Return | SQ | 73 |

---

## q0222 · medium · AGREED · ordered

**Show the 10 most expensive trips priced in euros, with trip IDs, total prices, agency names, and the trip customers' first and last names. Sort by total price, highest first, then by trip ID.**

Reference SQL:

```sql
SELECT t~travel_id, t~total_price, a~name, c~first_name, c~last_name FROM /dmo/travel AS t INNER JOIN /dmo/agency AS a ON a~agency_id = t~agency_id INNER JOIN /dmo/customer AS c ON c~customer_id = t~customer_id WHERE t~currency_code = 'EUR' ORDER BY t~total_price DESCENDING, t~travel_id ASCENDING UP TO 10 ROWS
```

| TRAVEL_ID | TOTAL_PRICE | NAME | FIRST_NAME | LAST_NAME |
|---|---|---|---|---|
| 00004795 | 51713.00 | Your Choice | Salvador | Henry |
| 00000160 | 48264.00 | Not Only By Bike | Ludwig | Weiss |
| 00000156 | 47464.00 | Rocky Horror Tours | Anna | Legrand |
| 00004864 | 46498.00 | Up 'n' Away | Hendrik | Illner |
| 00000129 | 44181.00 |  | Illya | Legrand |
| 00004688 | 43098.00 | All British Air Planes | Max | Moyano |
| 00004420 | 40496.50 | The Ultimate Answer | Thilo | Gahl |
| 00004158 | 39308.50 | Honauer Reisen GmbH | Chantal | Goelke |
| 00004169 | 38715.80 | Hot Socks Travel | Horst | Illner |
| 00004814 | 38211.00 | Caribian Dreams | Mathilde | Gutenberg |

---

## q0223 · hard · AGREED

**Which agencies handled trips starting in all three months of the fourth quarter of 2026? Return agency numbers, names, and separate trip counts for October, November, and December.**

Reference SQL:

```sql
SELECT a~agency_id, a~name, SUM( CASE WHEN t~begin_date BETWEEN '20261001' AND '20261031' THEN 1 ELSE 0 END ) AS october_trips, SUM( CASE WHEN t~begin_date BETWEEN '20261101' AND '20261130' THEN 1 ELSE 0 END ) AS november_trips, SUM( CASE WHEN t~begin_date BETWEEN '20261201' AND '20261231' THEN 1 ELSE 0 END ) AS december_trips FROM /dmo/agency AS a INNER JOIN /dmo/travel AS t ON t~agency_id = a~agency_id GROUP BY a~agency_id, a~name HAVING SUM( CASE WHEN t~begin_date BETWEEN '20261001' AND '20261031' THEN 1 ELSE 0 END ) > 0 AND SUM( CASE WHEN t~begin_date BETWEEN '20261101' AND '20261130' THEN 1 ELSE 0 END ) > 0 AND SUM( CASE WHEN t~begin_date BETWEEN '20261201' AND '20261231' THEN 1 ELSE 0 END ) > 0
```

| AGENCY_ID | NAME | OCTOBER_TRIPS | NOVEMBER_TRIPS | DECEMBER_TRIPS |
|---|---|---|---|---|
| 070045 |  | 3 | 3 | 3 |
| 070016 | Ali's Bazar | 4 | 2 | 3 |
| 070047 | All British Air Planes | 5 | 4 | 5 |
| 070019 | Around the World | 3 | 3 | 3 |
| 070023 | Asia By Plane | 2 | 6 | 3 |
| 070028 | Aussie Travel | 5 | 4 | 4 |
| 070015 | Bavarian Castle | 2 | 3 | 4 |
| 070006 | Bella Italia | 4 | 5 | 4 |
| 070012 | Ben McCloskey Ltd. | 1 | 2 | 2 |
| 070031 | Bright Side of Life | 3 | 3 | 2 |

…40 more rows

---

## q0224 · hard · AGREED

**Which customers have more trips marked booked than new? Return customer numbers, first and last names, and their booked and new trip counts.**

Reference SQL:

```sql
SELECT c~customer_id, c~first_name, c~last_name, SUM( CASE WHEN t~status = 'B' THEN 1 ELSE 0 END ) AS booked_trips, SUM( CASE WHEN t~status = 'N' THEN 1 ELSE 0 END ) AS new_trips FROM /dmo/customer AS c INNER JOIN /dmo/travel AS t ON t~customer_id = c~customer_id GROUP BY c~customer_id, c~first_name, c~last_name HAVING SUM( CASE WHEN t~status = 'B' THEN 1 ELSE 0 END ) > SUM( CASE WHEN t~status = 'N' THEN 1 ELSE 0 END )
```

| CUSTOMER_ID | FIRST_NAME | LAST_NAME | BOOKED_TRIPS | NEW_TRIPS |
|---|---|---|---|---|
| 000324 | Mathilde | Hunter | 3 | 2 |
| 000256 | Anneliese | Simonen | 2 | 1 |
| 000087 | Astrid | Martin | 3 | 2 |
| 000193 | Lothar | Goelke | 2 | 1 |
| 000033 | Walter | Jeremias | 2 | 1 |
| 000215 | Lee | Mechler | 4 | 3 |
| 000028 | Ruth | Jeremias | 1 | 0 |
| 000094 | Jean | Detemple | 3 | 2 |
| 000009 | Achim | Buchholm | 3 | 2 |
| 000376 | Theresia | Babilon | 3 | 1 |

…103 more rows

---

## q0225 · hard · AGREED · ordered

**Which 20 customers have the highest combined prices for euro-priced trips, counting only customers who used at least two agencies for those trips? Return customer numbers, first and last names, trip counts, agency counts, and total prices in euros. Sort by total price, highest first, then customer number.**

Reference SQL:

```sql
SELECT c~customer_id, c~first_name, c~last_name, COUNT( * ) AS trip_count, COUNT( DISTINCT t~agency_id ) AS agency_count, SUM( t~total_price ) AS total_eur FROM /dmo/customer AS c INNER JOIN /dmo/travel AS t ON t~customer_id = c~customer_id WHERE t~currency_code = 'EUR' GROUP BY c~customer_id, c~first_name, c~last_name HAVING COUNT( DISTINCT t~agency_id ) >= 2 ORDER BY total_eur DESCENDING, c~customer_id ASCENDING UP TO 20 ROWS
```

| CUSTOMER_ID | FIRST_NAME | LAST_NAME | TRIP_COUNT | AGENCY_COUNT | TOTAL_EUR |
|---|---|---|---|---|---|
| 000234 | Adam | Heller | 8 | 8 | 102382.50 |
| 000262 | Salvador | Henry | 4 | 4 | 96842.00 |
| 000043 | Volker | Gutenberg | 8 | 8 | 74426.00 |
| 000626 | Johannes | Pan | 5 | 5 | 73498.00 |
| 000295 | Anna | Legrand | 4 | 4 | 68593.00 |
| 000416 | Horst | Illner | 5 | 5 | 65723.80 |
| 000016 | Max | Vrsic | 7 | 7 | 65177.00 |
| 000408 | Hendrik | Illner | 4 | 4 | 64568.00 |
| 000519 | Max | Moyano | 5 | 5 | 64221.00 |
| 000293 | Illya | Legrand | 3 | 3 | 62575.00 |

…10 more rows

---

## q0226 · hard · AGREED · ordered

**For each airline and distance unit with listed connections, show its longest connection, choosing the lowest connection number if tied. Return airline codes and names, connection numbers, departure and arrival airport codes, distances, and units. Sort by airline code, unit, then connection number.**

Reference SQL:

```sql
SELECT c~carrier_id, a~name, c~connection_id, c~airport_from_id, c~airport_to_id, c~distance, c~distance_unit FROM /dmo/connection AS c INNER JOIN /dmo/carrier AS a ON a~carrier_id = c~carrier_id WHERE NOT EXISTS ( SELECT x~connection_id FROM /dmo/connection AS x WHERE x~carrier_id = c~carrier_id AND x~distance_unit = c~distance_unit AND ( x~distance > c~distance OR ( x~distance = c~distance AND x~connection_id < c~connection_id ) ) ) ORDER BY c~carrier_id ASCENDING, c~distance_unit ASCENDING, c~connection_id ASCENDING
```

| CARRIER_ID | NAME | CONNECTION_ID | AIRPORT_FROM_ID | AIRPORT_TO_ID | DISTANCE | DISTANCE_UNIT |
|---|---|---|---|---|---|---|
| AA | American Airlines Inc. | 0015 | JFK | SFO | 4156 | KM |
| AS | Alaska Airlines | 0020 | SFO | JFK | 4156 | KM |
| AZ | Alitalia Societa Aerea Italiana S.p.A. | 0788 | VCE | NRT | 9595 | KM |
| B6 | JetBlue | 0015 | JFK | SFO | 4156 | KM |
| DE | Condor | 2096 | FRA | SFO | 9608 | KM |
| DL | Delta Air Lines, Inc. | 0106 | JFK | FRA | 6162 | KM |
| JL | Japan Airlines Co., Ltd. | 0407 | NRT | FRA | 9379 | KM |
| LH | Deutsche Lufthansa AG | 0454 | FRA | SFO | 9608 | KM |
| NQ | Air Japan | 0801 | NRT | SIN | 5363 | KM |
| SQ | Singapore Airlines Limited | 0001 | SFO | SIN | 13523 | KM |

…2 more rows

---

## q0227 · hard · AGREED

**At each departure airport that has flights scheduled in October 2026, which airline scheduled the most flights in October 2026? Include all airlines tied for first. Return airport codes and names, airline codes and names, and flight counts.**

Reference SQL:

```sql
SELECT p~airport_id, p~name AS airport_name, a~carrier_id, a~name AS airline_name, COUNT( * ) AS flight_count FROM /dmo/flight AS f INNER JOIN /dmo/connection AS c ON c~carrier_id = f~carrier_id AND c~connection_id = f~connection_id INNER JOIN /dmo/airport AS p ON p~airport_id = c~airport_from_id INNER JOIN /dmo/carrier AS a ON a~carrier_id = f~carrier_id WHERE f~flight_date BETWEEN '20261001' AND '20261031' GROUP BY p~airport_id, p~name, a~carrier_id, a~name HAVING COUNT( * ) >= ALL ( SELECT COUNT( * ) AS competing_count FROM /dmo/flight AS x INNER JOIN /dmo/connection AS y ON y~carrier_id = x~carrier_id AND y~connection_id = x~connection_id WHERE y~airport_from_id = p~airport_id AND x~flight_date BETWEEN '20261001' AND '20261031' GROUP BY x~carrier_id )
```

| AIRPORT_ID | AIRPORT_NAME | CARRIER_ID | AIRLINE_NAME | FLIGHT_COUNT |
|---|---|---|---|---|
| FRA | Frankfurt Airport | LH | Deutsche Lufthansa AG | 124 |
| JFK | John F. Kennedy International Airport | DL | Delta Air Lines, Inc. | 248 |
| EWR | Newark Liberty International Airport | UA | United Airlines, Inc. | 186 |
| NRT | Narita International Airport | JL | Japan Airlines Co., Ltd. | 62 |
| SIN | Singapore Changi Airport | SQ | Singapore Airlines Limited | 124 |
| NRT | Narita International Airport | SQ | Singapore Airlines Limited | 62 |
| NRT | Narita International Airport | NQ | Air Japan | 62 |
| MIA | Miami International Airport | AA | American Airlines Inc. | 279 |
| HAV | José Martí International Airport | AA | American Airlines Inc. | 155 |
| SFO | San Francisco International Airport | B6 | JetBlue | 186 |

---

## q0228 · hard · AGREED

**For each currency, which traveler country spent the most on purchased extras? Include all countries tied for first. Return country codes, currencies, extra counts, and total charges.**

Reference SQL:

```sql
SELECT c~country_code, s~currency_code, COUNT( * ) AS extra_count, SUM( s~price ) AS total_charges FROM /dmo/book_suppl AS s INNER JOIN /dmo/booking AS b ON b~travel_id = s~travel_id AND b~booking_id = s~booking_id INNER JOIN /dmo/customer AS c ON c~customer_id = b~customer_id GROUP BY c~country_code, s~currency_code HAVING SUM( s~price ) >= ALL ( SELECT SUM( x~price ) AS competing_total FROM /dmo/book_suppl AS x INNER JOIN /dmo/booking AS y ON y~travel_id = x~travel_id AND y~booking_id = x~booking_id INNER JOIN /dmo/customer AS z ON z~customer_id = y~customer_id WHERE x~currency_code = s~currency_code GROUP BY z~country_code )
```

| COUNTRY_CODE | CURRENCY_CODE | EXTRA_COUNT | TOTAL_CHARGES |
|---|---|---|---|
| DE | EUR | 13336 | 171109.80 |

---

## q0229 · hard · AGREED · ordered

**Which 20 agencies had the widest range of booking lead times for flights departing in December 2026? Measure lead time as days from booking to departure. Return agency numbers, names, booking counts, shortest and longest lead times, and their difference. Sort by the difference, largest first, then agency number.**

Reference SQL:

```sql
SELECT a~agency_id, a~name, COUNT( * ) AS booking_count, MIN( dats_days_between( b~booking_date, b~flight_date ) ) AS shortest_lead_days, MAX( dats_days_between( b~booking_date, b~flight_date ) ) AS longest_lead_days, MAX( dats_days_between( b~booking_date, b~flight_date ) ) - MIN( dats_days_between( b~booking_date, b~flight_date ) ) AS lead_range_days FROM /dmo/agency AS a INNER JOIN /dmo/travel AS t ON t~agency_id = a~agency_id INNER JOIN /dmo/booking AS b ON b~travel_id = t~travel_id WHERE b~flight_date BETWEEN '20261201' AND '20261231' GROUP BY a~agency_id, a~name ORDER BY lead_range_days DESCENDING, a~agency_id ASCENDING UP TO 20 ROWS
```

| AGENCY_ID | NAME | BOOKING_COUNT | SHORTEST_LEAD_DAYS | LONGEST_LEAD_DAYS | LEAD_RANGE_DAYS |
|---|---|---|---|---|---|
| 070041 | Maxitrip | 50 | 95 | 138 | 43 |
| 070046 | Hendrik's | 31 | 94 | 135 | 41 |
| 070006 | Bella Italia | 15 | 96 | 136 | 40 |
| 070024 | Everywhere | 13 | 97 | 137 | 40 |
| 070049 | Flights and More | 20 | 95 | 135 | 40 |
| 070013 | Pillepalle Trips | 14 | 98 | 137 | 39 |
| 070029 | Up 'n' Away | 31 | 92 | 130 | 38 |
| 070030 | Trans World Travel | 15 | 90 | 128 | 38 |
| 070047 | All British Air Planes | 16 | 97 | 135 | 38 |
| 070027 | Fly Low | 29 | 92 | 129 | 37 |

…10 more rows

---

## q0230 · hard · AGREED · ordered

**Among trips with multiple flight bookings to the same destination airport, which 20 have the most distinct destination airports? Return trip numbers, flight booking counts, and distinct destination counts. Sort by destination count, highest first, then trip number.**

Reference SQL:

```sql
SELECT b~travel_id, COUNT( * ) AS booking_count, COUNT( DISTINCT c~airport_to_id ) AS destination_count FROM /dmo/booking AS b INNER JOIN /dmo/connection AS c ON c~carrier_id = b~carrier_id AND c~connection_id = b~connection_id GROUP BY b~travel_id HAVING COUNT( * ) > COUNT( DISTINCT c~airport_to_id ) ORDER BY destination_count DESCENDING, b~travel_id ASCENDING UP TO 20 ROWS
```

| TRAVEL_ID | BOOKING_COUNT | DESTINATION_COUNT |
|---|---|---|
| 00000097 | 8 | 3 |
| 00000099 | 4 | 3 |
| 00000100 | 5 | 3 |
| 00000102 | 12 | 3 |
| 00000103 | 8 | 3 |
| 00000105 | 4 | 3 |
| 00000106 | 8 | 3 |
| 00000108 | 4 | 3 |
| 00000110 | 6 | 3 |
| 00000112 | 8 | 3 |

…10 more rows

---

## q0231 · hard · AGREED · ordered

**Among customers with no trips marked planned, which 20 have trips with flight bookings across the most airlines? Return customer numbers, first and last names, airline counts, and flight booking counts. Sort by airline count, highest first, then customer number.**

Reference SQL:

```sql
SELECT c~customer_id, c~first_name, c~last_name, COUNT( DISTINCT b~carrier_id ) AS airline_count, COUNT( * ) AS booking_count FROM /dmo/customer AS c INNER JOIN /dmo/travel AS t ON t~customer_id = c~customer_id INNER JOIN /dmo/booking AS b ON b~travel_id = t~travel_id WHERE NOT EXISTS ( SELECT x~travel_id FROM /dmo/travel AS x WHERE x~customer_id = c~customer_id AND x~status = 'P' ) GROUP BY c~customer_id, c~first_name, c~last_name ORDER BY airline_count DESCENDING, c~customer_id ASCENDING UP TO 20 ROWS
```

| CUSTOMER_ID | FIRST_NAME | LAST_NAME | AIRLINE_COUNT | BOOKING_COUNT |
|---|---|---|---|---|
| 000191 | Anna | Goelke | 8 | 36 |
| 000165 | Annemarie | Hoffen | 7 | 33 |
| 000262 | Salvador | Henry | 7 | 33 |
| 000323 | Horst | Hunter | 7 | 20 |
| 000034 | Andrej | Gutenberg | 6 | 11 |
| 000495 | Lothar | Montero | 6 | 23 |
| 000551 | James | Eichbaum | 6 | 23 |
| 000556 | Juan | Gueldenpfennig | 6 | 14 |
| 000699 | Siegfried | Müller | 6 | 18 |
| 000701 | Holm | Müller | 6 | 18 |

…10 more rows

---

## q0232 · hard · AGREED · ordered

**Which 20 customers have the most combined trip days for trips starting in April 2027? Add each trip's full duration, including its start and end dates, counting overlapping trips separately. Return customer numbers, first and last names, trip counts, and combined trip days. Sort by combined days, highest first, then customer number.**

Reference SQL:

```sql
SELECT c~customer_id, c~first_name, c~last_name, COUNT( * ) AS trip_count, SUM( dats_days_between( t~begin_date, t~end_date ) + 1 ) AS combined_trip_days FROM /dmo/customer AS c INNER JOIN /dmo/travel AS t ON t~customer_id = c~customer_id WHERE t~begin_date BETWEEN '20270401' AND '20270430' GROUP BY c~customer_id, c~first_name, c~last_name ORDER BY combined_trip_days DESCENDING, c~customer_id ASCENDING UP TO 20 ROWS
```

| CUSTOMER_ID | FIRST_NAME | LAST_NAME | TRIP_COUNT | COMBINED_TRIP_DAYS |
|---|---|---|---|---|
| 000050 | Matthias | Fischmann | 9 | 10 |
| 000003 | James | Buchholm | 7 | 9 |
| 000196 | Horst | Goelke | 9 | 9 |
| 000531 | Gisela | Sommer | 9 | 9 |
| 000699 | Siegfried | Müller | 9 | 9 |
| 000010 | Irmtraut | Buchholm | 6 | 8 |
| 000013 | Christa | Buchholm | 4 | 8 |
| 000016 | Max | Vrsic | 8 | 8 |
| 000038 | Peter | Gutenberg | 8 | 8 |
| 000101 | Christa | Detemple | 8 | 8 |

…10 more rows

---

## q0233 · easy · AGREED

**How many extras have been added to bookings in total?**

Reference SQL:

```sql
SELECT COUNT(*) AS extra_count FROM /DMO/BOOK_SUPPL
```

| EXTRA_COUNT |
|---|
| 20266 |

---

## q0234 · easy · AGREED

**How many different extra options have been added to bookings?**

Reference SQL:

```sql
SELECT COUNT( DISTINCT supplement_id ) AS distinct_extra_count FROM /DMO/BOOK_SUPPL
```

| DISTINCT_EXTRA_COUNT |
|---|
| 48 |

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

## q0236 · easy · AGREED

**How many trips include at least one flight booking?**

Reference SQL:

```sql
SELECT COUNT( DISTINCT travel_id ) AS trip_count FROM /DMO/BOOKING
```

| TRIP_COUNT |
|---|
| 5137 |

---

## q0237 · easy · AGREED

**On how many different dates are flights scheduled in the first quarter of 2027?**

Reference SQL:

```sql
SELECT COUNT( DISTINCT flight_date ) AS flight_date_count FROM /DMO/FLIGHT WHERE flight_date BETWEEN '20270101' AND '20270331'
```

| FLIGHT_DATE_COUNT |
|---|
| 60 |

---

## q0238 · easy · AGREED · ordered

**Which 10 cities have the most customers? Show cities, country codes and customer counts, largest count first, then by country code and city.**

Reference SQL:

```sql
SELECT city, country_code, COUNT(*) AS customer_count FROM /DMO/CUSTOMER GROUP BY city, country_code ORDER BY customer_count DESCENDING, country_code ASCENDING, city ASCENDING UP TO 10 ROWS
```

| CITY | COUNTRY_CODE | CUSTOMER_COUNT |
|---|---|---|
| Gaertringen | DE | 27 |
| Schifferstadt | DE | 23 |
| Heusenstamm | DE | 22 |
| Arlington | US | 22 |
| Emmendingen | DE | 21 |
| Chicago | US | 20 |
| Linz | AT | 19 |
| Kurt | DE | 19 |
| N. Massapequa | US | 19 |
| Koenigsbrunn | DE | 18 |

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

## q0240 · easy · AGREED

**How many cities have airports listed in each country? Show country codes and distinct city counts.**

Reference SQL:

```sql
SELECT country, COUNT( DISTINCT city ) AS city_count FROM /DMO/AIRPORT GROUP BY country
```

| COUNTRY | CITY_COUNT |
|---|---|
| ES | 2 |
| DE | 4 |
| BR | 1 |
| JP | 3 |
| SG | 1 |
| RU | 1 |
| ZW | 1 |
| SA | 1 |
| TH | 1 |
| UK | 1 |

…12 more rows

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

## q0242 · easy · AGREED

**How many trips are booked or planned?**

Reference SQL:

```sql
SELECT COUNT(*) AS trip_count FROM /DMO/TRAVEL WHERE status IN ( 'B', 'P' )
```

| TRIP_COUNT |
|---|
| 2593 |

---

## q0243 · medium · AGREED · ordered

**Which 10 agency–customer pairs account for the most trips? Return agency IDs and names, customer IDs, first names and last names, and trip counts, most trips first, then by agency ID and customer ID.**

Reference SQL:

```sql
SELECT a~agency_id, a~name, c~customer_id, c~first_name, c~last_name, COUNT(*) AS trip_count FROM /dmo/travel AS t INNER JOIN /dmo/agency AS a ON a~agency_id = t~agency_id INNER JOIN /dmo/customer AS c ON c~customer_id = t~customer_id GROUP BY a~agency_id, a~name, c~customer_id, c~first_name, c~last_name ORDER BY trip_count DESCENDING, a~agency_id ASCENDING, c~customer_id ASCENDING UP TO 10 ROWS
```

| AGENCY_ID | NAME | CUSTOMER_ID | FIRST_NAME | LAST_NAME | TRIP_COUNT |
|---|---|---|---|---|---|
| 070005 | Your Choice | 000262 | Salvador | Henry | 3 |
| 070006 | Bella Italia | 000186 | Annemarie | Goelke | 3 |
| 070006 | Bella Italia | 000307 | Hendrik | D´Oultrement | 3 |
| 070027 | Fly Low | 000663 | Walter | Sisko | 3 |
| 070046 | Hendrik's | 000228 | Fabio | Buehler | 3 |
| 070048 | Rocky Horror Tours | 000707 | Adam | Müller | 3 |
| 070001 | Sunshine Travel | 000001 | Theresia | Buchholm | 2 |
| 070001 | Sunshine Travel | 000039 | Uli | Gutenberg | 2 |
| 070001 | Sunshine Travel | 000093 | Sophie | Detemple | 2 |
| 070001 | Sunshine Travel | 000166 | Ida | Hoffen | 2 |

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

## q0254 · hard · AGREED · ordered

**Which 20 agencies served the most customers who have also used another agency? Return agency numbers, names, distinct customer counts, and trip counts for those customers. Sort by customer count, highest first, then agency number.**

Reference SQL:

```sql
SELECT a~agency_id, a~name, COUNT( DISTINCT t~customer_id ) AS customer_count, COUNT(*) AS trip_count FROM /dmo/agency AS a INNER JOIN /dmo/travel AS t ON t~agency_id = a~agency_id WHERE EXISTS ( SELECT * FROM /dmo/travel AS other WHERE other~customer_id = t~customer_id AND other~agency_id <> t~agency_id ) GROUP BY a~agency_id, a~name ORDER BY customer_count DESCENDING, a~agency_id ASCENDING UP TO 20 ROWS
```

| AGENCY_ID | NAME | CUSTOMER_COUNT | TRIP_COUNT |
|---|---|---|---|
| 070007 | Hot Socks Travel | 111 | 123 |
| 070020 | No Return | 111 | 118 |
| 070017 | Super Agency | 110 | 120 |
| 070037 | Real Weird Vacation | 110 | 121 |
| 070042 | The Ultimate Answer | 108 | 114 |
| 070046 | Hendrik's | 108 | 117 |
| 070038 | Cap Travels Ltd. | 107 | 114 |
| 070041 | Maxitrip | 107 | 117 |
| 070022 | Caribian Dreams | 106 | 112 |
| 070030 | Trans World Travel | 106 | 114 |

…10 more rows

---

## q0255 · hard · AGREED · ordered

**Which 20 trips with the lowest trip numbers have at least one flight booking and all their flight bookings priced in the trip's currency? Return trip numbers, currencies, and flight booking counts, sorted by trip number.**

Reference SQL:

```sql
SELECT t~travel_id, t~currency_code, COUNT(*) AS booking_count FROM /dmo/travel AS t INNER JOIN /dmo/booking AS b ON b~travel_id = t~travel_id GROUP BY t~travel_id, t~currency_code HAVING SUM( CASE WHEN b~currency_code <> t~currency_code THEN 1 ELSE 0 END ) = 0 ORDER BY t~travel_id ASCENDING UP TO 20 ROWS
```

| TRAVEL_ID | CURRENCY_CODE | BOOKING_COUNT |
|---|---|---|
| 00000001 | USD | 4 |
| 00000002 | USD | 2 |
| 00000003 | USD | 8 |
| 00000004 | USD | 4 |
| 00000005 | USD | 2 |
| 00000006 | USD | 12 |
| 00000007 | USD | 12 |
| 00000008 | USD | 6 |
| 00000009 | USD | 12 |
| 00000010 | USD | 2 |

…10 more rows

---

## q0256 · hard · AGREED

**For each aircraft type used in October 2026, how many flights depart before noon and how many depart at noon or later? Return aircraft types and both flight counts.**

Reference SQL:

```sql
SELECT f~plane_type_id, SUM( CASE WHEN n~departure_time < '120000' THEN 1 ELSE 0 END ) AS before_noon_count, SUM( CASE WHEN n~departure_time >= '120000' THEN 1 ELSE 0 END ) AS noon_or_later_count FROM /dmo/flight AS f INNER JOIN /dmo/connection AS n ON n~carrier_id = f~carrier_id AND n~connection_id = f~connection_id WHERE f~flight_date BETWEEN '20261001' AND '20261031' GROUP BY f~plane_type_id
```

| PLANE_TYPE_ID | BEFORE_NOON_COUNT | NOON_OR_LATER_COUNT |
|---|---|---|
| A321-200 | 341 | 403 |
| A330-200 | 31 | 31 |
| 777-300ER | 93 | 93 |
| 787-9 | 186 | 248 |
| 737-800 | 217 | 155 |
| A319-100 | 31 | 155 |
| 737-900 | 62 | 31 |
| 737 MAX 8 | 31 | 93 |
| 737 MAX 9 | 155 | 155 |
| 767-300 | 93 | 124 |

…9 more rows

---

## q0257 · hard · AGREED · ordered

**Among trips starting in June 2026 with flight bookings, which 20 have the most days from the trip start to their first flight? Return trip numbers, start dates, first flight dates, and days until the first flight. Sort by days, highest first, then trip number.**

Reference SQL:

```sql
SELECT t~travel_id, t~begin_date, MIN( b~flight_date ) AS first_flight_date, MIN( dats_days_between( t~begin_date, b~flight_date ) ) AS days_until_first_flight FROM /dmo/travel AS t INNER JOIN /dmo/booking AS b ON b~travel_id = t~travel_id WHERE t~begin_date BETWEEN '20260601' AND '20260630' GROUP BY t~travel_id, t~begin_date ORDER BY days_until_first_flight DESCENDING, t~travel_id ASCENDING UP TO 20 ROWS
```

| TRAVEL_ID | BEGIN_DATE | FIRST_FLIGHT_DATE | DAYS_UNTIL_FIRST_FLIGHT |
|---|---|---|---|
| 00000001 | 20260620 | 20260620 | 0 |
| 00000002 | 20260620 | 20260620 | 0 |
| 00000003 | 20260620 | 20260620 | 0 |
| 00000004 | 20260620 | 20260620 | 0 |
| 00000005 | 20260620 | 20260620 | 0 |
| 00000006 | 20260620 | 20260620 | 0 |
| 00000007 | 20260620 | 20260620 | 0 |
| 00000008 | 20260620 | 20260620 | 0 |
| 00000009 | 20260620 | 20260620 | 0 |
| 00000010 | 20260620 | 20260620 | 0 |

…10 more rows

---

## q0258 · hard · AGREED · ordered

**Which 20 customers had the longest gap between consecutive distinct trip start dates? Treat trips starting on the same date as one start date. Return customer numbers, first and last names, and their longest gap in days, largest first, then customer number.**

Reference SQL:

```sql
SELECT c~customer_id, c~first_name, c~last_name, MAX( dats_days_between( earlier~begin_date, later~begin_date ) ) AS longest_gap_days FROM /dmo/customer AS c INNER JOIN /dmo/travel AS earlier ON earlier~customer_id = c~customer_id INNER JOIN /dmo/travel AS later ON later~customer_id = c~customer_id AND later~begin_date > earlier~begin_date WHERE NOT EXISTS ( SELECT * FROM /dmo/travel AS middle_trip WHERE middle_trip~customer_id = c~customer_id AND middle_trip~begin_date > earlier~begin_date AND middle_trip~begin_date < later~begin_date ) GROUP BY c~customer_id, c~first_name, c~last_name ORDER BY longest_gap_days DESCENDING, c~customer_id ASCENDING UP TO 20 ROWS
```

| CUSTOMER_ID | FIRST_NAME | LAST_NAME | LONGEST_GAP_DAYS |
|---|---|---|---|
| 000036 | Allen | Gutenberg | 303 |
| 000038 | Peter | Gutenberg | 302 |
| 000065 | Christa | Columbo | 302 |
| 000177 | Horst | Dumbach | 302 |
| 000634 | Illya | Lindwurm | 302 |
| 000643 | Horst | Kirk | 302 |
| 000298 | Cindy | Jacqmain | 301 |
| 000299 | Illya | Jacqmain | 301 |
| 000402 | Adam | Kramer | 301 |
| 000537 | Johannes | Schneider | 301 |

…10 more rows

---

## q0259 · hard · AGREED

**Within each extra category and purchase currency, which extra generated the highest total charges? Include all ties. Return category codes, currencies, extra codes, purchase counts, and total charges.**

Reference SQL:

```sql
SELECT p~supplement_category, s~currency_code, s~supplement_id, COUNT(*) AS purchase_count, SUM( s~price ) AS total_charges FROM /dmo/book_suppl AS s INNER JOIN /dmo/supplement AS p ON p~supplement_id = s~supplement_id GROUP BY p~supplement_category, s~currency_code, s~supplement_id HAVING SUM( s~price ) >= ALL ( SELECT SUM( other~price ) FROM /dmo/book_suppl AS other INNER JOIN /dmo/supplement AS other_product ON other_product~supplement_id = other~supplement_id WHERE other_product~supplement_category = p~supplement_category AND other~currency_code = s~currency_code GROUP BY other~supplement_id )
```

| SUPPLEMENT_CATEGORY | CURRENCY_CODE | SUPPLEMENT_ID | PURCHASE_COUNT | TOTAL_CHARGES |
|---|---|---|---|---|
| BV | EUR | BV-0008 | 424 | 3180.00 |
| LU | EUR | LU-0001 | 417 | 33360.00 |
| ML | EUR | ML-0001 | 433 | 17320.00 |

---

## q0260 · hard · AGREED · ordered

**Which 20 customers have the greatest difference between their longest and shortest trips? Measure each trip as the days between its start and end. Return customer numbers, first and last names, shortest and longest durations, and their difference. Sort by the difference, largest first, then customer number.**

Reference SQL:

```sql
SELECT c~customer_id, c~first_name, c~last_name, MIN( dats_days_between( t~begin_date, t~end_date ) ) AS shortest_days, MAX( dats_days_between( t~begin_date, t~end_date ) ) AS longest_days, MAX( dats_days_between( t~begin_date, t~end_date ) ) - MIN( dats_days_between( t~begin_date, t~end_date ) ) AS duration_difference FROM /dmo/customer AS c INNER JOIN /dmo/travel AS t ON t~customer_id = c~customer_id GROUP BY c~customer_id, c~first_name, c~last_name ORDER BY duration_difference DESCENDING, c~customer_id ASCENDING UP TO 20 ROWS
```

| CUSTOMER_ID | FIRST_NAME | LAST_NAME | SHORTEST_DAYS | LONGEST_DAYS | DURATION_DIFFERENCE |
|---|---|---|---|---|---|
| 000009 | Achim | Buchholm | 0 | 303 | 303 |
| 000015 | Adam | Vrsic | 0 | 303 | 303 |
| 000069 | Thilo | Neubasler | 0 | 303 | 303 |
| 000078 | Jean | Neubasler | 0 | 303 | 303 |
| 000080 | Lee | Neubasler | 0 | 303 | 303 |
| 000081 | Sophie | Neubasler | 0 | 303 | 303 |
| 000087 | Astrid | Martin | 0 | 303 | 303 |
| 000091 | Jean | Detemple | 0 | 303 | 303 |
| 000102 | Ulla | Barth | 0 | 303 | 303 |
| 000110 | Claire | Benz | 0 | 303 | 303 |

…10 more rows

---

## q0261 · hard · AGREED · ordered

**Which 20 agencies have the highest percentage of trips marked booked? Return agency numbers, names, total trip counts, booked trip counts, and percentages rounded to 2 decimals. Sort by the rounded percentage, highest first, then agency number.**

Reference SQL:

```sql
SELECT a~agency_id, a~name, COUNT(*) AS trip_count, SUM( CASE WHEN t~status = 'B' THEN 1 ELSE 0 END ) AS booked_trip_count, division( 100 * SUM( CASE WHEN t~status = 'B' THEN 1 ELSE 0 END ), COUNT(*), 2 ) AS booked_percentage FROM /dmo/agency AS a INNER JOIN /dmo/travel AS t ON t~agency_id = a~agency_id GROUP BY a~agency_id, a~name ORDER BY booked_percentage DESCENDING, a~agency_id ASCENDING UP TO 20 ROWS
```

| AGENCY_ID | NAME | TRIP_COUNT | BOOKED_TRIP_COUNT | BOOKED_PERCENTAGE |
|---|---|---|---|---|
| 070033 | Fly & Smile | 103 | 93 | 90.29 |
| 070032 | Sunny, Sunny, Sunny | 87 | 77 | 88.51 |
| 070031 | Bright Side of Life | 101 | 89 | 88.12 |
| 070030 | Trans World Travel | 114 | 99 | 86.84 |
| 070037 | Real Weird Vacation | 121 | 104 | 85.95 |
| 070028 | Aussie Travel | 112 | 96 | 85.71 |
| 070026 | No Name | 86 | 73 | 84.88 |
| 070027 | Fly Low | 110 | 93 | 84.55 |
| 070035 | Hitchhiker | 108 | 91 | 84.26 |
| 070036 | Fly Now, Pay Later | 98 | 81 | 82.65 |

…10 more rows

---

## q0262 · hard · AGREED · ordered

**Which 20 trips have the largest booking fee as a percentage of their total price? Return trip numbers, currencies, booking fees, total prices, and percentages rounded to 2 decimals. Sort by the rounded percentage, highest first, then trip number.**

Reference SQL:

```sql
SELECT t~travel_id, t~currency_code, t~booking_fee, t~total_price, division( 100 * t~booking_fee, t~total_price, 2 ) AS booking_fee_percentage FROM /dmo/travel AS t ORDER BY booking_fee_percentage DESCENDING, t~travel_id ASCENDING UP TO 20 ROWS
```

| TRAVEL_ID | CURRENCY_CODE | BOOKING_FEE | TOTAL_PRICE | BOOKING_FEE_PERCENTAGE |
|---|---|---|---|---|
| 00000727 | USD | 10.00 | 140.00 | 7.14 |
| 00000726 | USD | 20.00 | 284.00 | 7.04 |
| 00000732 | USD | 10.00 | 142.00 | 7.04 |
| 00000434 | USD | 20.00 | 298.00 | 6.71 |
| 00000444 | USD | 20.00 | 298.00 | 6.71 |
| 00000446 | USD | 40.00 | 596.00 | 6.71 |
| 00000216 | USD | 30.00 | 448.00 | 6.70 |
| 00000217 | USD | 20.00 | 302.00 | 6.62 |
| 00000436 | USD | 60.00 | 906.00 | 6.62 |
| 00000731 | USD | 30.00 | 456.00 | 6.58 |

…10 more rows

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

## q0264 · easy · AGREED

**How many distinct postal codes are recorded for customers in each country? Show country codes and postal code counts.**

Reference SQL:

```sql
SELECT country_code, COUNT( DISTINCT postal_code ) AS postal_code_count FROM /DMO/CUSTOMER GROUP BY country_code
```

| COUNTRY_CODE | POSTAL_CODE_COUNT |
|---|---|
| DE | 38 |
| AT | 1 |
| US | 8 |
| IT | 1 |
| FR | 3 |
| ES | 3 |
| BE | 1 |
| CH | 1 |
| SI | 1 |

---

## q0265 · easy · AGREED

**How many different customers have flight bookings with each airline that has flight bookings? Show airline codes and customer counts.**

Reference SQL:

```sql
SELECT carrier_id, COUNT( DISTINCT customer_id ) AS customer_count FROM /DMO/BOOKING GROUP BY carrier_id
```

| CARRIER_ID | CUSTOMER_COUNT |
|---|---|
| AA | 684 |
| AS | 127 |
| AZ | 565 |
| B6 | 167 |
| DE | 84 |
| DL | 267 |
| JL | 598 |
| LH | 688 |
| NQ | 78 |
| SQ | 648 |

…2 more rows

---

## q0266 · easy · AGREED

**For each airline that has listed routes, how many different departure airports does it use for those routes? Show airline codes and airport counts.**

Reference SQL:

```sql
SELECT carrier_id, COUNT( DISTINCT airport_from_id ) AS airport_count FROM /DMO/CONNECTION GROUP BY carrier_id
```

| CARRIER_ID | AIRPORT_COUNT |
|---|---|
| SQ | 5 |
| UA | 5 |
| AA | 5 |
| AZ | 2 |
| LH | 4 |
| DL | 5 |
| DE | 3 |
| JL | 3 |
| TR | 2 |
| NQ | 2 |

…2 more rows

---

## q0267 · easy · AGREED

**What are the earliest and latest scheduled flight dates for each airline with scheduled flights? Show airline codes and both dates.**

Reference SQL:

```sql
SELECT carrier_id, MIN( flight_date ) AS earliest_flight_date, MAX( flight_date ) AS latest_flight_date FROM /DMO/FLIGHT GROUP BY carrier_id
```

| CARRIER_ID | EARLIEST_FLIGHT_DATE | LATEST_FLIGHT_DATE |
|---|---|---|
| AZ | 20260620 | 20270417 |
| NQ | 20260903 | 20270301 |
| LH | 20260616 | 20270417 |
| AS | 20260903 | 20270301 |
| SQ | 20260618 | 20270417 |
| JL | 20260620 | 20270417 |
| DL | 20260903 | 20270301 |
| UA | 20260616 | 20270416 |
| B6 | 20260903 | 20270301 |
| TR | 20260903 | 20270301 |

…2 more rows

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

## q0269 · easy · AGREED

**What are the lowest and highest prices for available extras within each currency? Show currency codes and both prices.**

Reference SQL:

```sql
SELECT currency_code, MIN( price ) AS lowest_price, MAX( price ) AS highest_price FROM /DMO/SUPPLEMENT GROUP BY currency_code
```

| CURRENCY_CODE | LOWEST_PRICE | HIGHEST_PRICE |
|---|---|---|
| EUR | 1.50 | 80.00 |

---

## q0270 · easy · AGREED · ordered

**Which 10 customers have trips through the most different agencies? Show customer numbers and agency counts, highest count first, then by customer number.**

Reference SQL:

```sql
SELECT customer_id, COUNT( DISTINCT agency_id ) AS agency_count FROM /DMO/TRAVEL GROUP BY customer_id ORDER BY agency_count DESCENDING, customer_id ASCENDING UP TO 10 ROWS
```

| CUSTOMER_ID | AGENCY_COUNT |
|---|---|
| 000438 | 15 |
| 000238 | 13 |
| 000274 | 13 |
| 000377 | 13 |
| 000531 | 13 |
| 000610 | 13 |
| 000003 | 12 |
| 000050 | 12 |
| 000165 | 12 |
| 000185 | 12 |

---

## q0271 · easy · AGREED · ordered

**Which 10 trips have the most extras added to their bookings? Show trip numbers and extra counts, highest count first, then by trip number.**

Reference SQL:

```sql
SELECT travel_id, COUNT(*) AS extra_count FROM /DMO/BOOK_SUPPL GROUP BY travel_id ORDER BY extra_count DESCENDING, travel_id ASCENDING UP TO 10 ROWS
```

| TRAVEL_ID | EXTRA_COUNT |
|---|---|
| 00000129 | 33 |
| 00000007 | 28 |
| 00000168 | 28 |
| 00000009 | 26 |
| 00000160 | 26 |
| 00000038 | 23 |
| 00000156 | 22 |
| 00000024 | 21 |
| 00000158 | 21 |
| 00000165 | 21 |

---

## q0272 · easy · AGREED · ordered

**Which 10 customers have bookings for the most distinct flight dates? Show customer numbers and date counts, highest count first, then by customer number.**

Reference SQL:

```sql
SELECT customer_id, COUNT( DISTINCT flight_date ) AS flight_date_count FROM /DMO/BOOKING GROUP BY customer_id ORDER BY flight_date_count DESCENDING, customer_id ASCENDING UP TO 10 ROWS
```

| CUSTOMER_ID | FLIGHT_DATE_COUNT |
|---|---|
| 000052 | 26 |
| 000257 | 26 |
| 000594 | 25 |
| 000238 | 24 |
| 000344 | 23 |
| 000449 | 23 |
| 000465 | 23 |
| 000499 | 23 |
| 000039 | 22 |
| 000315 | 22 |

---

## q0273 · medium · AGREED

**For each country with domestic connections, show its country code, connection count, and number of different departure airports. Count each airline's numbered connection separately.**

Reference SQL:

```sql
SELECT d~country, COUNT(*) AS connection_count, COUNT( DISTINCT c~airport_from_id ) AS departure_airport_count FROM /dmo/connection AS c INNER JOIN /dmo/airport AS d ON d~airport_id = c~airport_from_id INNER JOIN /dmo/airport AS a ON a~airport_id = c~airport_to_id WHERE d~country = a~country GROUP BY d~country
```

| COUNTRY | CONNECTION_COUNT | DEPARTURE_AIRPORT_COUNT |
|---|---|---|
| US | 60 | 4 |

---

## q0274 · medium · AGREED · ordered

**Which 10 agency locations account for the most trips? Return city names, country codes, trip counts, and the number of agencies handling those trips, most trips first, then by country code and city name.**

Reference SQL:

```sql
SELECT a~city, a~country_code, COUNT(*) AS trip_count, COUNT( DISTINCT a~agency_id ) AS agency_count FROM /dmo/agency AS a INNER JOIN /dmo/travel AS t ON t~agency_id = a~agency_id GROUP BY a~city, a~country_code ORDER BY trip_count DESCENDING, a~country_code ASCENDING, a~city ASCENDING UP TO 10 ROWS
```

| CITY | COUNTRY_CODE | TRIP_COUNT | AGENCY_COUNT |
|---|---|---|---|
| Chicago | US | 325 | 3 |
| Frankfurt | DE | 304 | 3 |
| Dresden | DE | 215 | 2 |
| Berlin | DE | 208 | 2 |
| Stuttgart | DE | 195 | 2 |
| Hannover | DE | 179 | 2 |
| Sydney | AU | 123 | 1 |
| Vancouver | CA | 121 | 1 |
| Glasgow | GB | 120 | 1 |
| Koeln | DE | 118 | 1 |

---

## q0275 · medium · AGREED

**For each passenger home country represented in add-on purchases, show the country code, number of purchased add-on entries, number of different add-ons, and number of passengers who purchased them.**

Reference SQL:

```sql
SELECT c~country_code, COUNT(*) AS entry_count, COUNT( DISTINCT s~supplement_id ) AS addon_count, COUNT( DISTINCT c~customer_id ) AS passenger_count FROM /dmo/customer AS c INNER JOIN /dmo/booking AS b ON b~customer_id = c~customer_id INNER JOIN /dmo/book_suppl AS s ON s~travel_id = b~travel_id AND s~booking_id = b~booking_id GROUP BY c~country_code
```

| COUNTRY_CODE | ENTRY_COUNT | ADDON_COUNT | PASSENGER_COUNT |
|---|---|---|---|
| US | 3583 | 48 | 126 |
| DE | 13336 | 48 | 476 |
| BE | 269 | 48 | 11 |
| FR | 1256 | 48 | 47 |
| IT | 292 | 48 | 12 |
| AT | 500 | 48 | 19 |
| ES | 820 | 48 | 30 |
| CH | 154 | 47 | 5 |
| SI | 56 | 33 | 2 |

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

## q0277 · medium · AGREED · ordered

**Which 10 agencies have arranged bookings on the widest variety of aircraft types? Return agency IDs and aircraft type counts, most types first, then by agency ID.**

Reference SQL:

```sql
SELECT t~agency_id, COUNT( DISTINCT f~plane_type_id ) AS aircraft_type_count FROM /dmo/travel AS t INNER JOIN /dmo/booking AS b ON b~travel_id = t~travel_id INNER JOIN /dmo/flight AS f ON f~carrier_id = b~carrier_id AND f~connection_id = b~connection_id AND f~flight_date = b~flight_date GROUP BY t~agency_id ORDER BY aircraft_type_count DESCENDING, t~agency_id ASCENDING UP TO 10 ROWS
```

| AGENCY_ID | AIRCRAFT_TYPE_COUNT |
|---|---|
| 070006 | 20 |
| 070040 | 20 |
| 070002 | 19 |
| 070011 | 19 |
| 070047 | 19 |
| 070003 | 18 |
| 070009 | 18 |
| 070018 | 18 |
| 070028 | 18 |
| 070036 | 18 |

---

## q0278 · medium · AGREED · ordered

**How many flights are scheduled at each departure time of day in October 2026? Return departure times, flight counts, and airline counts, earliest time first.**

Reference SQL:

```sql
SELECT c~departure_time, COUNT(*) AS flight_count, COUNT( DISTINCT f~carrier_id ) AS airline_count FROM /dmo/connection AS c INNER JOIN /dmo/flight AS f ON f~carrier_id = c~carrier_id AND f~connection_id = c~connection_id WHERE f~flight_date BETWEEN '20261001' AND '20261031' GROUP BY c~departure_time ORDER BY c~departure_time ASCENDING
```

| DEPARTURE_TIME | FLIGHT_COUNT | AIRLINE_COUNT |
|---|---|---|
| 005000 | 31 | 1 |
| 055000 | 31 | 1 |
| 060000 | 93 | 2 |
| 061500 | 31 | 1 |
| 061800 | 31 | 1 |
| 062000 | 31 | 1 |
| 070000 | 124 | 2 |
| 070200 | 31 | 1 |
| 074300 | 31 | 1 |
| 075500 | 31 | 1 |

…84 more rows

---

## q0279 · medium · AGREED

**For every airport, show its code and name, how many different airports its listed connections depart to, and how many different airports have listed connections arriving there. Include airports with no connections.**

Reference SQL:

```sql
SELECT a~airport_id, a~name, COUNT( DISTINCT outgoing~airport_to_id ) AS destination_count, COUNT( DISTINCT incoming~airport_from_id ) AS origin_count FROM /dmo/airport AS a LEFT OUTER JOIN /dmo/connection AS outgoing ON outgoing~airport_from_id = a~airport_id LEFT OUTER JOIN /dmo/connection AS incoming ON incoming~airport_to_id = a~airport_id GROUP BY a~airport_id, a~name
```

| AIRPORT_ID | NAME | DESTINATION_COUNT | ORIGIN_COUNT |
|---|---|---|---|
| FRA | Frankfurt Airport | 4 | 4 |
| HAM | Hamburg Airport | 0 | 0 |
| MUC | Munich Airport | 0 | 0 |
| SXF | Berlin Schönefeld Airport | 0 | 0 |
| THF | Berlin Tempelhof Airport | 0 | 0 |
| TXL | Berlin Tegel Airport | 0 | 0 |
| CDG | Charles de Gaulle Airport | 0 | 0 |
| ORY | Orly Airport | 0 | 0 |
| VIE | Vienna International Airport | 0 | 0 |
| ZRH | Zürich Airport | 0 | 0 |

…37 more rows

---

## q0280 · medium · AGREED

**For each passenger home country with flight bookings, show the country code, earliest and latest booking dates, and number of different dates on which bookings were made.**

Reference SQL:

```sql
SELECT c~country_code, MIN( b~booking_date ) AS earliest_booking_date, MAX( b~booking_date ) AS latest_booking_date, COUNT( DISTINCT b~booking_date ) AS booking_date_count FROM /dmo/customer AS c INNER JOIN /dmo/booking AS b ON b~customer_id = c~customer_id GROUP BY c~country_code
```

| COUNTRY_CODE | EARLIEST_BOOKING_DATE | LATEST_BOOKING_DATE | BOOKING_DATE_COUNT |
|---|---|---|---|
| AT | 20260527 | 20270416 | 67 |
| BE | 20260529 | 20270417 | 60 |
| CH | 20260531 | 20270416 | 49 |
| DE | 20260527 | 20270418 | 76 |
| ES | 20260527 | 20270417 | 73 |
| FR | 20260527 | 20270417 | 74 |
| IT | 20260530 | 20270416 | 58 |
| SI | 20260531 | 20270415 | 24 |
| US | 20260527 | 20270418 | 74 |

---

## q0281 · medium · AGREED · ordered

**Which 10 trips include flights on the most different dates? Return trip IDs, agency names, flight-date counts, and first and last flight dates, most dates first, then by trip ID.**

Reference SQL:

```sql
SELECT t~travel_id, a~name, COUNT( DISTINCT b~flight_date ) AS flight_date_count, MIN( b~flight_date ) AS first_flight_date, MAX( b~flight_date ) AS last_flight_date FROM /dmo/travel AS t INNER JOIN /dmo/agency AS a ON a~agency_id = t~agency_id INNER JOIN /dmo/booking AS b ON b~travel_id = t~travel_id GROUP BY t~travel_id, a~name ORDER BY flight_date_count DESCENDING, t~travel_id ASCENDING UP TO 10 ROWS
```

| TRAVEL_ID | NAME | FLIGHT_DATE_COUNT | FIRST_FLIGHT_DATE | LAST_FLIGHT_DATE |
|---|---|---|---|---|
| 00000100 | Maxitrip | 5 | 20260616 | 20270414 |
| 00000113 | Rocky Horror Tours | 5 | 20260616 | 20270414 |
| 00000116 | Ultimate Goal | 5 | 20260616 | 20270414 |
| 00000118 | Maxitrip | 5 | 20260616 | 20270414 |
| 00000122 | The Ultimate Answer | 5 | 20260616 | 20270414 |
| 00000124 | The Ultimate Answer | 5 | 20260616 | 20270414 |
| 00000126 | Rocky Horror Tours | 5 | 20260616 | 20270414 |
| 00000129 |  | 5 | 20260616 | 20270414 |
| 00000131 | Rocky Horror Tours | 5 | 20260616 | 20270414 |
| 00000140 | Maxitrip | 5 | 20260616 | 20270414 |

---

## q0282 · medium · AGREED · ordered

**Which 10 pairs of different agencies share the most trip customers? Return each pair once, with the lower agency ID first, and the shared-customer count. Sort by most shared customers, then by the first and second agency IDs.**

Reference SQL:

```sql
SELECT a~agency_id AS first_agency_id, b~agency_id AS second_agency_id, COUNT( DISTINCT a~customer_id ) AS shared_customer_count FROM /dmo/travel AS a INNER JOIN /dmo/travel AS b ON b~customer_id = a~customer_id AND a~agency_id < b~agency_id GROUP BY a~agency_id, b~agency_id ORDER BY shared_customer_count DESCENDING, a~agency_id ASCENDING, b~agency_id ASCENDING UP TO 10 ROWS
```

| FIRST_AGENCY_ID | SECOND_AGENCY_ID | SHARED_CUSTOMER_COUNT |
|---|---|---|
| 070015 | 070025 | 25 |
| 070023 | 070028 | 24 |
| 070027 | 070038 | 24 |
| 070016 | 070031 | 23 |
| 070020 | 070042 | 23 |
| 070007 | 070020 | 22 |
| 070011 | 070036 | 22 |
| 070017 | 070037 | 22 |
| 070022 | 070047 | 22 |
| 070033 | 070042 | 22 |

---

## q0283 · hard · AGREED

**For trips starting in the fourth quarter of 2026, show each traveler country and its numbers of booked, planned, and new trips.**

Reference SQL:

```sql
SELECT c~country_code, SUM( CASE WHEN t~status = 'B' THEN 1 ELSE 0 END ) AS booked_trips, SUM( CASE WHEN t~status = 'P' THEN 1 ELSE 0 END ) AS planned_trips, SUM( CASE WHEN t~status = 'N' THEN 1 ELSE 0 END ) AS new_trips FROM /dmo/travel AS t INNER JOIN /dmo/customer AS c ON c~customer_id = t~customer_id WHERE t~begin_date BETWEEN '20261001' AND '20261231' GROUP BY c~country_code
```

| COUNTRY_CODE | BOOKED_TRIPS | PLANNED_TRIPS | NEW_TRIPS |
|---|---|---|---|
| DE | 84 | 96 | 170 |
| AT | 7 | 3 | 11 |
| US | 27 | 21 | 40 |
| FR | 10 | 7 | 12 |
| ES | 7 | 4 | 16 |
| BE | 0 | 3 | 5 |
| IT | 0 | 1 | 4 |
| CH | 3 | 1 | 1 |
| SI | 0 | 0 | 1 |

---

## q0285 · hard · AGREED · ordered

**Show the first 20 October 2026 flights with bookings through at least two agencies, ordered by departure date, airline code, then connection number. Return those flight details, airline names, agency counts, and booking counts.**

Reference SQL:

```sql
SELECT b~flight_date, b~carrier_id, b~connection_id, c~name, COUNT( DISTINCT t~agency_id ) AS agency_count, COUNT(*) AS booking_count FROM /dmo/booking AS b INNER JOIN /dmo/travel AS t ON t~travel_id = b~travel_id INNER JOIN /dmo/carrier AS c ON c~carrier_id = b~carrier_id WHERE b~flight_date BETWEEN '20261001' AND '20261031' GROUP BY b~flight_date, b~carrier_id, b~connection_id, c~name HAVING COUNT( DISTINCT t~agency_id ) >= 2 ORDER BY b~flight_date ASCENDING, b~carrier_id ASCENDING, b~connection_id ASCENDING UP TO 20 ROWS
```

| FLIGHT_DATE | CARRIER_ID | CONNECTION_ID | NAME | AGENCY_COUNT | BOOKING_COUNT |
|---|---|---|---|---|---|
| 20261001 | DL | 0383 | Delta Air Lines, Inc. | 2 | 5 |
| 20261004 | AA | 2483 | American Airlines Inc. | 2 | 4 |
| 20261006 | SQ | 0011 | Singapore Airlines Limited | 2 | 2 |
| 20261007 | B6 | 0116 | JetBlue | 2 | 4 |
| 20261008 | DE | 2017 | Condor | 2 | 4 |
| 20261009 | AS | 0227 | Alaska Airlines | 2 | 6 |
| 20261011 | UA | 0059 | United Airlines, Inc. | 2 | 2 |
| 20261014 | AA | 0016 | American Airlines Inc. | 2 | 5 |
| 20261014 | AA | 0837 | American Airlines Inc. | 2 | 5 |
| 20261014 | AA | 2483 | American Airlines Inc. | 2 | 4 |

…10 more rows

---

## q0286 · hard · AGREED

**Which customers have flight bookings priced in at least three currencies? Return customer numbers, first and last names, currency counts, and booking counts.**

Reference SQL:

```sql
SELECT c~customer_id, c~first_name, c~last_name, COUNT( DISTINCT b~currency_code ) AS currency_count, COUNT(*) AS booking_count FROM /dmo/customer AS c INNER JOIN /dmo/booking AS b ON b~customer_id = c~customer_id GROUP BY c~customer_id, c~first_name, c~last_name HAVING COUNT( DISTINCT b~currency_code ) >= 3
```

| CUSTOMER_ID | FIRST_NAME | LAST_NAME | CURRENCY_COUNT | BOOKING_COUNT |
|---|---|---|---|---|
| 000387 | Sophie | Zimmermann | 4 | 21 |
| 000326 | Gisela | Hunter | 4 | 14 |
| 000472 | Ludwig | Weiss | 4 | 26 |
| 000090 | Amelie | Martin | 3 | 17 |
| 000207 | Irene | Waldmann | 4 | 17 |
| 000182 | Matthias | Dumbach | 4 | 16 |
| 000056 | Walter | Columbo | 4 | 18 |
| 000560 | Pierre | Gueldenpfennig | 4 | 14 |
| 000256 | Anneliese | Simonen | 4 | 20 |
| 000681 | Hendrik | Meier | 4 | 29 |

…702 more rows

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

## q0288 · hard · AGREED

**Which agencies arranged flights to at least three destination countries for trips starting in October 2026? Return agency numbers, names, destination-country counts, destination-airport counts, and flight-booking counts.**

Reference SQL:

```sql
SELECT a~agency_id, a~name, COUNT( DISTINCT p~country ) AS destination_country_count, COUNT( DISTINCT p~airport_id ) AS destination_airport_count, COUNT(*) AS booking_count FROM /dmo/agency AS a INNER JOIN /dmo/travel AS t ON t~agency_id = a~agency_id INNER JOIN /dmo/booking AS b ON b~travel_id = t~travel_id INNER JOIN /dmo/connection AS n ON n~carrier_id = b~carrier_id AND n~connection_id = b~connection_id INNER JOIN /dmo/airport AS p ON p~airport_id = n~airport_to_id WHERE t~begin_date BETWEEN '20261001' AND '20261031' GROUP BY a~agency_id, a~name HAVING COUNT( DISTINCT p~country ) >= 3
```

| AGENCY_ID | NAME | DESTINATION_COUNTRY_COUNT | DESTINATION_AIRPORT_COUNT | BOOKING_COUNT |
|---|---|---|---|---|
| 070018 | Wang Chong | 3 | 5 | 14 |
| 070007 | Hot Socks Travel | 4 | 7 | 30 |
| 070048 | Rocky Horror Tours | 4 | 5 | 16 |
| 070009 | Honauer Reisen GmbH | 3 | 6 | 44 |
| 070033 | Fly & Smile | 3 | 6 | 14 |
| 070034 | Supercheap | 3 | 4 | 8 |
| 070002 | Fly High | 4 | 6 | 26 |
| 070003 | Happy Hopping | 4 | 5 | 10 |
| 070040 | Women only | 4 | 6 | 10 |
| 070030 | Trans World Travel | 4 | 6 | 10 |

…11 more rows

---

## q0289 · hard · AGREED

**For each status, how many trips overlap October 2026, including their start and end dates? Return status codes, total overlapping trips, and separate counts for those starting in October and those starting earlier.**

Reference SQL:

```sql
SELECT t~status, COUNT(*) AS overlapping_trips, SUM( CASE WHEN t~begin_date >= '20261001' THEN 1 ELSE 0 END ) AS starting_in_october, SUM( CASE WHEN t~begin_date < '20261001' THEN 1 ELSE 0 END ) AS starting_earlier FROM /dmo/travel AS t WHERE t~begin_date <= '20261031' AND t~end_date >= '20261001' GROUP BY t~status
```

| STATUS | OVERLAPPING_TRIPS | STARTING_IN_OCTOBER | STARTING_EARLIER |
|---|---|---|---|
| N | 147 | 80 | 67 |
| B | 103 | 51 | 52 |
| P | 121 | 43 | 78 |

---

## q0290 · hard · AGREED

**For trips starting in the fourth quarter of 2026, show total trip prices separately for trips ending before 2027 and those continuing into 2027 or beyond. Return each currency and both totals, keeping currencies separate.**

Reference SQL:

```sql
SELECT t~currency_code, SUM( CASE WHEN t~end_date < '20270101' THEN t~total_price ELSE 0 END ) AS ending_before_2027_total, SUM( CASE WHEN t~end_date >= '20270101' THEN t~total_price ELSE 0 END ) AS continuing_into_2027_total FROM /dmo/travel AS t WHERE t~begin_date BETWEEN '20261001' AND '20261231' GROUP BY t~currency_code
```

| CURRENCY_CODE | ENDING_BEFORE_2027_TOTAL | CONTINUING_INTO_2027_TOTAL |
|---|---|---|
| SGD | 1146922.30 | 14296.50 |
| USD | 3635341.60 | 166392.50 |
| JPY | 437450.90 | 5341.50 |
| EUR | 1008679.70 | 133153.00 |

---

## q0291 · hard · AGREED · ordered

**Which customers have trips containing flights to the same destination airport on at least three separate trips? Show the first 20 customer–airport pairs by customer number, then airport code. Return customer numbers, first and last names, airport codes and names, distinct trip counts, and flight-booking counts.**

Reference SQL:

```sql
SELECT c~customer_id, c~first_name, c~last_name, p~airport_id, p~name, COUNT( DISTINCT t~travel_id ) AS trip_count, COUNT(*) AS booking_count FROM /dmo/customer AS c INNER JOIN /dmo/travel AS t ON t~customer_id = c~customer_id INNER JOIN /dmo/booking AS b ON b~travel_id = t~travel_id INNER JOIN /dmo/connection AS n ON n~carrier_id = b~carrier_id AND n~connection_id = b~connection_id INNER JOIN /dmo/airport AS p ON p~airport_id = n~airport_to_id GROUP BY c~customer_id, c~first_name, c~last_name, p~airport_id, p~name HAVING COUNT( DISTINCT t~travel_id ) >= 3 ORDER BY c~customer_id ASCENDING, p~airport_id ASCENDING UP TO 20 ROWS
```

| CUSTOMER_ID | FIRST_NAME | LAST_NAME | AIRPORT_ID | NAME | TRIP_COUNT | BOOKING_COUNT |
|---|---|---|---|---|---|---|
| 000001 | Theresia | Buchholm | NRT | Narita International Airport | 3 | 9 |
| 000002 | Johannes | Buchholm | NRT | Narita International Airport | 3 | 6 |
| 000003 | James | Buchholm | NRT | Narita International Airport | 3 | 5 |
| 000003 | James | Buchholm | SFO | San Francisco International Airport | 3 | 3 |
| 000003 | James | Buchholm | SIN | Singapore Changi Airport | 3 | 6 |
| 000003 | James | Buchholm | VCE | Venice Marco Polo Airport | 3 | 4 |
| 000005 | Anna | Buchholm | SFO | San Francisco International Airport | 4 | 8 |
| 000006 | Uli | Buchholm | SFO | San Francisco International Airport | 3 | 8 |
| 000008 | August | Buchholm | SFO | San Francisco International Airport | 5 | 12 |
| 000009 | Achim | Buchholm | MIA | Miami International Airport | 3 | 4 |

…10 more rows

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

## q0295 · easy · AGREED · ordered

**Which 5 airports have the most routes arriving at them? Show airport codes and route counts, largest count first, then by airport code.**

Reference SQL:

```sql
SELECT c~airport_to_id, COUNT(*) AS route_count FROM /DMO/CONNECTION AS c GROUP BY c~airport_to_id ORDER BY route_count DESCENDING, c~airport_to_id ASCENDING UP TO 5 ROWS
```

| AIRPORT_TO_ID | ROUTE_COUNT |
|---|---|
| SFO | 31 |
| JFK | 25 |
| MIA | 15 |
| FRA | 12 |
| EWR | 11 |

---

## q0296 · easy · AGREED

**How many flight bookings are priced in each currency? Show currency codes and booking counts.**

Reference SQL:

```sql
SELECT b~currency_code, COUNT(*) AS booking_count FROM /DMO/BOOKING AS b GROUP BY b~currency_code
```

| CURRENCY_CODE | BOOKING_COUNT |
|---|---|
| SGD | 2416 |
| USD | 5645 |
| JPY | 1415 |
| EUR | 3668 |

---

## q0297 · easy · AGREED · ordered

**What are the 10 most common booking fee and currency combinations for trips? Show fees, currency codes and trip counts, largest count first, then by currency code and lowest fee.**

Reference SQL:

```sql
SELECT t~booking_fee, t~currency_code, COUNT(*) AS trip_count FROM /DMO/TRAVEL AS t GROUP BY t~booking_fee, t~currency_code ORDER BY trip_count DESCENDING, t~currency_code ASCENDING, t~booking_fee ASCENDING UP TO 10 ROWS
```

| BOOKING_FEE | CURRENCY_CODE | TRIP_COUNT |
|---|---|---|
| 20.00 | USD | 780 |
| 20.00 | EUR | 710 |
| 10.00 | EUR | 430 |
| 10.00 | USD | 348 |
| 20.00 | SGD | 319 |
| 20.00 | JPY | 299 |
| 30.00 | EUR | 298 |
| 40.00 | USD | 272 |
| 60.00 | USD | 257 |
| 30.00 | USD | 249 |

---

## q0298 · easy · AGREED · ordered

**What are the 10 most common ticket price and currency combinations in the flight schedule? Show prices, currency codes and flight counts, largest count first, then by currency code and lowest price.**

Reference SQL:

```sql
SELECT f~price, f~currency_code, COUNT(*) AS flight_count FROM /DMO/FLIGHT AS f GROUP BY f~price, f~currency_code ORDER BY flight_count DESCENDING, f~currency_code ASCENDING, f~price ASCENDING UP TO 10 ROWS
```

| PRICE | CURRENCY_CODE | FLIGHT_COUNT |
|---|---|---|
| 1537.00 | USD | 278 |
| 1662.00 | USD | 251 |
| 1787.00 | USD | 248 |
| 1911.00 | USD | 245 |
| 1579.00 | USD | 234 |
| 2161.00 | USD | 228 |
| 2493.00 | USD | 146 |
| 2535.00 | USD | 144 |
| 1953.00 | USD | 143 |
| 2285.00 | USD | 143 |

---

## q0299 · easy · AGREED

**How many different airlines use each aircraft type in the flight schedule? Show aircraft types and airline counts.**

Reference SQL:

```sql
SELECT f~plane_type_id, COUNT( DISTINCT f~carrier_id ) AS airline_count FROM /DMO/FLIGHT AS f GROUP BY f~plane_type_id
```

| PLANE_TYPE_ID | AIRLINE_COUNT |
|---|---|
| 737 MAX 8 | 2 |
| 737 MAX 9 | 2 |
| 737-800 | 4 |
| 737-900 | 2 |
| 747-400 | 4 |
| 747-8 | 1 |
| 757-200 | 1 |
| 767-200 | 5 |
| 767-300 | 2 |
| 767-400 | 1 |

…13 more rows

---

## q0300 · easy · AGREED

**For each category of available extras, how many different prices are offered in each currency? Show category codes, currency codes and distinct price counts.**

Reference SQL:

```sql
SELECT s~supplement_category, s~currency_code, COUNT( DISTINCT s~price ) AS price_count FROM /DMO/SUPPLEMENT AS s GROUP BY s~supplement_category, s~currency_code
```

| SUPPLEMENT_CATEGORY | CURRENCY_CODE | PRICE_COUNT |
|---|---|---|
| ML | EUR | 23 |
| BV | EUR | 4 |
| LU | EUR | 3 |

---

## q0301 · easy · AGREED · ordered

**How many different extras does each airline booking with at least one extra include? Show trip numbers, booking numbers and distinct extra counts for the 10 bookings with the widest variety, largest count first, then by trip number and booking number.**

Reference SQL:

```sql
SELECT s~travel_id, s~booking_id, COUNT( DISTINCT s~supplement_id ) AS extra_count FROM /DMO/BOOK_SUPPL AS s GROUP BY s~travel_id, s~booking_id ORDER BY extra_count DESCENDING, s~travel_id ASCENDING, s~booking_id ASCENDING UP TO 10 ROWS
```

| TRAVEL_ID | BOOKING_ID | EXTRA_COUNT |
|---|---|---|
| 00000003 | 0001 | 5 |
| 00000003 | 0008 | 5 |
| 00000042 | 0006 | 5 |
| 00000054 | 0001 | 5 |
| 00000129 | 0005 | 5 |
| 00000138 | 0004 | 5 |
| 00000145 | 0008 | 5 |
| 00000156 | 0015 | 5 |
| 00000159 | 0003 | 5 |
| 00000190 | 0004 | 5 |

---

## q0302 · medium · AGREED

**For each airline connection scheduled in October 2026, show the airline code and name, connection number, number of scheduled flights, and number of those flights with at least one recorded booking.**

Reference SQL:

```sql
SELECT f~carrier_id, c~name, f~connection_id, COUNT( DISTINCT f~flight_date ) AS scheduled_flights, COUNT( DISTINCT b~flight_date ) AS flights_with_bookings FROM /dmo/flight AS f INNER JOIN /dmo/carrier AS c ON c~carrier_id = f~carrier_id LEFT OUTER JOIN /dmo/booking AS b ON b~carrier_id = f~carrier_id AND b~connection_id = f~connection_id AND b~flight_date = f~flight_date WHERE f~flight_date BETWEEN '20261001' AND '20261031' GROUP BY f~carrier_id, c~name, f~connection_id
```

| CARRIER_ID | NAME | CONNECTION_ID | SCHEDULED_FLIGHTS | FLIGHTS_WITH_BOOKINGS |
|---|---|---|---|---|
| AA | American Airlines Inc. | 0076 | 31 | 2 |
| AA | American Airlines Inc. | 0149 | 31 | 5 |
| AA | American Airlines Inc. | 0015 | 31 | 3 |
| AA | American Airlines Inc. | 0016 | 31 | 4 |
| AA | American Airlines Inc. | 0166 | 31 | 3 |
| AA | American Airlines Inc. | 0148 | 31 | 0 |
| AA | American Airlines Inc. | 0322 | 31 | 4 |
| AA | American Airlines Inc. | 1196 | 31 | 9 |
| AA | American Airlines Inc. | 0179 | 31 | 1 |
| AA | American Airlines Inc. | 0177 | 31 | 2 |

…104 more rows

---

## q0303 · medium · AGREED

**Which combinations of trip currency and flight booking currency occur? Return both currency codes, the number of flight bookings, and the number of distinct trips for each combination.**

Reference SQL:

```sql
SELECT t~currency_code AS trip_currency, b~currency_code AS booking_currency, COUNT(*) AS booking_count, COUNT( DISTINCT t~travel_id ) AS trip_count FROM /dmo/travel AS t INNER JOIN /dmo/booking AS b ON b~travel_id = t~travel_id GROUP BY t~currency_code, b~currency_code
```

| TRIP_CURRENCY | BOOKING_CURRENCY | BOOKING_COUNT | TRIP_COUNT |
|---|---|---|---|
| EUR | EUR | 3666 | 1682 |
| SGD | EUR | 2 | 1 |
| JPY | JPY | 1415 | 677 |
| EUR | SGD | 165 | 42 |
| SGD | SGD | 2251 | 856 |
| EUR | USD | 204 | 110 |
| USD | USD | 5441 | 1922 |

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

## q0305 · medium · AGREED · ordered

**Which 10 agencies have sold the widest variety of add-ons across their trips? Return agency IDs, names, distinct add-on counts, and purchased entry counts, most distinct add-ons first, then by agency ID.**

Reference SQL:

```sql
SELECT a~agency_id, a~name, COUNT( DISTINCT s~supplement_id ) AS addon_count, COUNT(*) AS entry_count FROM /dmo/agency AS a INNER JOIN /dmo/travel AS t ON t~agency_id = a~agency_id INNER JOIN /dmo/book_suppl AS s ON s~travel_id = t~travel_id GROUP BY a~agency_id, a~name ORDER BY addon_count DESCENDING, a~agency_id ASCENDING UP TO 10 ROWS
```

| AGENCY_ID | NAME | ADDON_COUNT | ENTRY_COUNT |
|---|---|---|---|
| 070001 | Sunshine Travel | 48 | 376 |
| 070002 | Fly High | 48 | 379 |
| 070003 | Happy Hopping | 48 | 332 |
| 070004 | Pink Panther | 48 | 314 |
| 070005 | Your Choice | 48 | 345 |
| 070006 | Bella Italia | 48 | 385 |
| 070007 | Hot Socks Travel | 48 | 458 |
| 070008 | Burns Nuclear | 48 | 299 |
| 070009 | Honauer Reisen GmbH | 48 | 333 |
| 070010 | Travel from Walldorf | 48 | 429 |

---

## q0306 · medium · AGREED

**What total distance has been booked with each airline with bookings for listed connections, counting the connection distance once per flight booking? Return airline codes and names, distance units, booking counts, and total distances, separately by distance unit.**

Reference SQL:

```sql
SELECT c~carrier_id, c~name, n~distance_unit, COUNT(*) AS booking_count, SUM( n~distance ) AS total_distance FROM /dmo/booking AS b INNER JOIN /dmo/connection AS n ON n~carrier_id = b~carrier_id AND n~connection_id = b~connection_id INNER JOIN /dmo/carrier AS c ON c~carrier_id = b~carrier_id GROUP BY c~carrier_id, c~name, n~distance_unit
```

| CARRIER_ID | NAME | DISTANCE_UNIT | BOOKING_COUNT | TOTAL_DISTANCE |
|---|---|---|---|---|
| NQ | Air Japan | KM | 168 | 900984 |
| AS | Alaska Airlines | KM | 286 | 1188616 |
| AZ | Alitalia Societa Aerea Italiana S.p.A. | KM | 1416 | 13586520 |
| AA | American Airlines Inc. | KM | 2693 | 6980072 |
| DE | Condor | KM | 176 | 1408436 |
| DL | Delta Air Lines, Inc. | KM | 642 | 2504148 |
| LH | Deutsche Lufthansa AG | KM | 2076 | 13043512 |
| JL | Japan Airlines Co., Ltd. | KM | 1247 | 11422525 |
| B6 | JetBlue | KM | 377 | 1566812 |
| TR | Scoot | KM | 91 | 488033 |

…2 more rows

---

## q0307 · medium · AGREED · ordered

**Which 10 trips have the largest difference between their highest and lowest US-dollar flight booking charges? Return trip IDs, agency names, both charges, and the difference, largest difference first, then by trip ID.**

Reference SQL:

```sql
SELECT t~travel_id, a~name, MIN( b~flight_price ) AS lowest_charge, MAX( b~flight_price ) AS highest_charge, MAX( b~flight_price ) - MIN( b~flight_price ) AS charge_difference FROM /dmo/travel AS t INNER JOIN /dmo/agency AS a ON a~agency_id = t~agency_id INNER JOIN /dmo/booking AS b ON b~travel_id = t~travel_id WHERE b~currency_code = 'USD' GROUP BY t~travel_id, a~name ORDER BY charge_difference DESCENDING, t~travel_id ASCENDING UP TO 10 ROWS
```

| TRAVEL_ID | NAME | LOWEST_CHARGE | HIGHEST_CHARGE | CHARGE_DIFFERENCE |
|---|---|---|---|---|
| 00004995 | Happy Holiday | 5003.00 | 12846.00 | 7843.00 |
| 00004513 | Asia By Plane | 5950.00 | 13117.00 | 7167.00 |
| 00004914 | Flights and More | 5544.00 | 11765.00 | 6221.00 |
| 00004752 | Ali's Bazar | 6085.00 | 11765.00 | 5680.00 |
| 00004901 | Flights and More | 6761.00 | 12305.00 | 5544.00 |
| 00004723 | Happy Hopping | 3651.00 | 9127.00 | 5476.00 |
| 00005119 | Women only | 3747.00 | 8839.00 | 5092.00 |
| 00004270 | Around the World | 8249.00 | 13117.00 | 4868.00 |
| 00004401 | Bavarian Castle | 7843.00 | 12441.00 | 4598.00 |
| 00004803 | Happy Holiday | 6896.00 | 11359.00 | 4463.00 |

---

## q0308 · medium · AGREED · ordered

**Which 10 surnames appear on the most customer records? Return surnames, customer counts, and the number of different home countries, most customers first, then alphabetically by surname.**

Reference SQL:

```sql
SELECT c~last_name, COUNT(*) AS customer_count, COUNT( DISTINCT c~country_code ) AS country_count FROM /dmo/customer AS c GROUP BY c~last_name ORDER BY customer_count DESCENDING, c~last_name ASCENDING UP TO 10 ROWS
```

| LAST_NAME | CUSTOMER_COUNT | COUNTRY_COUNT |
|---|---|---|
| Babilon | 15 | 3 |
| Columbo | 15 | 4 |
| Dumbach | 15 | 3 |
| Goelke | 15 | 4 |
| Henry | 15 | 3 |
| Hoffen | 15 | 4 |
| Marshall | 15 | 4 |
| Mechler | 15 | 4 |
| Moyano | 15 | 3 |
| Neubasler | 15 | 4 |

---

## q0309 · medium · AGREED · ordered

**Which 10 flight dates have the most unoccupied seats in total? Return dates, flight counts, and total unoccupied seats, most unoccupied seats first, then earliest date.**

Reference SQL:

```sql
SELECT f~flight_date, COUNT(*) AS flight_count, SUM( f~seats_max ) - SUM( f~seats_occupied ) AS unoccupied_seats FROM /dmo/flight AS f GROUP BY f~flight_date ORDER BY unoccupied_seats DESCENDING, f~flight_date ASCENDING UP TO 10 ROWS
```

| FLIGHT_DATE | FLIGHT_COUNT | UNOCCUPIED_SEATS |
|---|---|---|
| 20261122 | 114 | 8714 |
| 20270301 | 114 | 8709 |
| 20261013 | 114 | 8679 |
| 20261020 | 114 | 8603 |
| 20261226 | 114 | 8596 |
| 20261222 | 114 | 8588 |
| 20261123 | 114 | 8554 |
| 20261215 | 114 | 8484 |
| 20261204 | 114 | 8483 |
| 20260917 | 114 | 8461 |

---

## q0310 · medium · AGREED · ordered

**Which 10 airport pairs have the highest total US-dollar flight booking charges, keeping each direction separate? Return departure and arrival airport codes, booking counts, and total charges in dollars, highest total first, then by departure and arrival code.**

Reference SQL:

```sql
SELECT n~airport_from_id, n~airport_to_id, COUNT(*) AS booking_count, SUM( b~flight_price ) AS total_charges FROM /dmo/booking AS b INNER JOIN /dmo/connection AS n ON n~carrier_id = b~carrier_id AND n~connection_id = b~connection_id WHERE b~currency_code = 'USD' GROUP BY n~airport_from_id, n~airport_to_id ORDER BY total_charges DESCENDING, n~airport_from_id ASCENDING, n~airport_to_id ASCENDING UP TO 10 ROWS
```

| AIRPORT_FROM_ID | AIRPORT_TO_ID | BOOKING_COUNT | TOTAL_CHARGES |
|---|---|---|---|
| SFO | JFK | 1395 | 3119816.00 |
| JFK | SFO | 1064 | 2323917.00 |
| SFO | FRA | 505 | 1920752.00 |
| FRA | SFO | 470 | 1731388.00 |
| SFO | SIN | 63 | 584711.00 |
| SIN | SFO | 65 | 525741.00 |
| MIA | EWR | 507 | 468585.00 |
| EWR | MIA | 451 | 396605.00 |
| FRA | JFK | 57 | 212745.00 |
| JFK | FRA | 57 | 207510.00 |

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

## q0313 · medium · AGREED · ordered

**For each trip start date in October 2026, show the number of trips and their total number of flight bookings, including trips without bookings. List dates earliest first.**

Reference SQL:

```sql
SELECT t~begin_date, COUNT( DISTINCT t~travel_id ) AS trip_count, COUNT( b~booking_id ) AS booking_count FROM /dmo/travel AS t LEFT OUTER JOIN /dmo/booking AS b ON b~travel_id = t~travel_id WHERE t~begin_date BETWEEN '20261001' AND '20261031' GROUP BY t~begin_date ORDER BY t~begin_date ASCENDING
```

| BEGIN_DATE | TRIP_COUNT | BOOKING_COUNT |
|---|---|---|
| 20261001 | 7 | 34 |
| 20261002 | 4 | 18 |
| 20261003 | 3 | 12 |
| 20261004 | 3 | 6 |
| 20261005 | 8 | 30 |
| 20261006 | 8 | 26 |
| 20261007 | 4 | 18 |
| 20261008 | 12 | 34 |
| 20261009 | 5 | 24 |
| 20261010 | 4 | 18 |

…21 more rows

---

## q0314 · medium · AGREED · ordered

**Which 10 flights have bookings from the most different travel agencies? Return airline codes and names, connection numbers, flight dates, and agency counts, most agencies first, then by date, airline code, and connection number.**

Reference SQL:

```sql
SELECT b~carrier_id, c~name, b~connection_id, b~flight_date, COUNT( DISTINCT t~agency_id ) AS agency_count FROM /dmo/booking AS b INNER JOIN /dmo/travel AS t ON t~travel_id = b~travel_id INNER JOIN /dmo/carrier AS c ON c~carrier_id = b~carrier_id GROUP BY b~carrier_id, c~name, b~connection_id, b~flight_date ORDER BY agency_count DESCENDING, b~flight_date ASCENDING, b~carrier_id ASCENDING, b~connection_id ASCENDING UP TO 10 ROWS
```

| CARRIER_ID | NAME | CONNECTION_ID | FLIGHT_DATE | AGENCY_COUNT |
|---|---|---|---|---|
| LH | Deutsche Lufthansa AG | 0401 | 20260620 | 50 |
| AZ | Alitalia Societa Aerea Italiana S.p.A. | 0788 | 20260621 | 50 |
| SQ | Singapore Airlines Limited | 0011 | 20260619 | 49 |
| AZ | Alitalia Societa Aerea Italiana S.p.A. | 0789 | 20260620 | 49 |
| JL | Japan Airlines Co., Ltd. | 0408 | 20260621 | 49 |
| AA | American Airlines Inc. | 0018 | 20270415 | 49 |
| JL | Japan Airlines Co., Ltd. | 0408 | 20270417 | 49 |
| AZ | Alitalia Societa Aerea Italiana S.p.A. | 0789 | 20270416 | 48 |
| JL | Japan Airlines Co., Ltd. | 0407 | 20270416 | 48 |
| LH | Deutsche Lufthansa AG | 0402 | 20260616 | 47 |

---

## q0315 · medium · AGREED · ordered

**Which 10 airline and add-on category combinations have the most purchased add-on entries? Return airline codes, category codes, entry counts, and distinct passenger counts, most entries first, then by airline code and category code.**

Reference SQL:

```sql
SELECT b~carrier_id, s~supplement_category, COUNT(*) AS entry_count, COUNT( DISTINCT b~customer_id ) AS passenger_count FROM /dmo/booking AS b INNER JOIN /dmo/book_suppl AS p ON p~travel_id = b~travel_id AND p~booking_id = b~booking_id INNER JOIN /dmo/supplement AS s ON s~supplement_id = p~supplement_id GROUP BY b~carrier_id, s~supplement_category ORDER BY entry_count DESCENDING, b~carrier_id ASCENDING, s~supplement_category ASCENDING UP TO 10 ROWS
```

| CARRIER_ID | SUPPLEMENT_CATEGORY | ENTRY_COUNT | PASSENGER_COUNT |
|---|---|---|---|
| AA | ML | 3092 | 644 |
| SQ | ML | 2893 | 603 |
| LH | ML | 2613 | 640 |
| AZ | ML | 1930 | 524 |
| UA | ML | 1760 | 528 |
| JL | ML | 1539 | 518 |
| AA | BV | 777 | 446 |
| SQ | BV | 746 | 403 |
| LH | BV | 639 | 393 |
| AZ | BV | 486 | 315 |

---

## q0316 · medium · AGREED · ordered

**Which 10 combinations of departure airport and passenger home country have the most flight bookings? Return airport codes, country codes, booking counts, and distinct passenger counts, most bookings first, then by airport code and country code.**

Reference SQL:

```sql
SELECT r~airport_from_id, c~country_code, COUNT(*) AS booking_count, COUNT( DISTINCT b~customer_id ) AS passenger_count FROM /dmo/booking AS b INNER JOIN /dmo/connection AS r ON r~carrier_id = b~carrier_id AND r~connection_id = b~connection_id INNER JOIN /dmo/customer AS c ON c~customer_id = b~customer_id GROUP BY r~airport_from_id, c~country_code ORDER BY booking_count DESCENDING, r~airport_from_id ASCENDING, c~country_code ASCENDING UP TO 10 ROWS
```

| AIRPORT_FROM_ID | COUNTRY_CODE | BOOKING_COUNT | PASSENGER_COUNT |
|---|---|---|---|
| SFO | DE | 1643 | 462 |
| FRA | DE | 1570 | 460 |
| JFK | DE | 1253 | 442 |
| NRT | DE | 1218 | 439 |
| SIN | DE | 998 | 406 |
| MIA | DE | 655 | 337 |
| EWR | DE | 519 | 298 |
| SFO | US | 446 | 121 |
| FRA | US | 422 | 124 |
| VCE | DE | 416 | 282 |

---

## q0317 · medium · AGREED

**For each aircraft type with scheduled flights, show the type and the numbers of different departure airports and arrival airports it serves.**

Reference SQL:

```sql
SELECT f~plane_type_id, COUNT( DISTINCT c~airport_from_id ) AS departure_airport_count, COUNT( DISTINCT c~airport_to_id ) AS arrival_airport_count FROM /dmo/flight AS f INNER JOIN /dmo/connection AS c ON c~carrier_id = f~carrier_id AND c~connection_id = f~connection_id GROUP BY f~plane_type_id
```

| PLANE_TYPE_ID | DEPARTURE_AIRPORT_COUNT | ARRIVAL_AIRPORT_COUNT |
|---|---|---|
| 737 MAX 8 | 2 | 2 |
| 737 MAX 9 | 3 | 3 |
| 737-800 | 4 | 4 |
| 737-900 | 3 | 3 |
| 747-400 | 5 | 4 |
| 747-8 | 3 | 3 |
| 757-200 | 2 | 2 |
| 767-200 | 7 | 6 |
| 767-300 | 4 | 4 |
| 767-400 | 1 | 1 |

…13 more rows

---

## q0318 · medium · AGREED · ordered

**Which 10 combinations of flight booking date and add-on charge currency have the most purchased add-on entries? Return dates, currencies, entry counts, and total add-on charges in each currency, most entries first, then by date and currency code.**

Reference SQL:

```sql
SELECT b~booking_date, p~currency_code, COUNT(*) AS entry_count, SUM( p~price ) AS total_add_on_charges FROM /dmo/booking AS b INNER JOIN /dmo/book_suppl AS p ON p~travel_id = b~travel_id AND p~booking_id = b~booking_id GROUP BY b~booking_date, p~currency_code ORDER BY entry_count DESCENDING, b~booking_date ASCENDING, p~currency_code ASCENDING UP TO 10 ROWS
```

| BOOKING_DATE | CURRENCY_CODE | ENTRY_COUNT | TOTAL_ADD_ON_CHARGES |
|---|---|---|---|
| 20260611 | EUR | 508 | 7047.70 |
| 20270328 | EUR | 483 | 6228.40 |
| 20260614 | EUR | 473 | 5728.10 |
| 20270404 | EUR | 455 | 5700.40 |
| 20270410 | EUR | 445 | 4922.60 |
| 20270330 | EUR | 434 | 5385.50 |
| 20270329 | EUR | 424 | 5695.00 |
| 20270405 | EUR | 424 | 5609.20 |
| 20260604 | EUR | 414 | 4738.10 |
| 20260609 | EUR | 408 | 4964.80 |

---

## q0319 · medium · AGREED

**For each agency country and trip status combination with at least one trip, show the country code, status code, number of trips, and number of distinct trip customers.**

Reference SQL:

```sql
SELECT a~country_code, t~status, COUNT(*) AS trip_count, COUNT( DISTINCT t~customer_id ) AS customer_count FROM /dmo/agency AS a INNER JOIN /dmo/travel AS t ON t~agency_id = a~agency_id GROUP BY a~country_code, t~status
```

| COUNTRY_CODE | STATUS | TRIP_COUNT | CUSTOMER_COUNT |
|---|---|---|---|
| AT | B | 7 | 7 |
| AU | B | 7 | 7 |
| CA | B | 104 | 98 |
| CH | B | 5 | 5 |
| DE | B | 410 | 315 |
| FR | B | 91 | 88 |
| GB | B | 109 | 101 |
| IT | B | 4 | 4 |
| JP | B | 7 | 7 |
| RU | B | 8 | 8 |

…32 more rows

---

## q0320 · medium · AGREED · ordered

**Which 10 passengers made flight bookings on the most different days? Return customer IDs, first and last names, the number of booking days, and their first and last booking dates, most days first, then by customer ID.**

Reference SQL:

```sql
SELECT c~customer_id, c~first_name, c~last_name, COUNT( DISTINCT b~booking_date ) AS booking_day_count, MIN( b~booking_date ) AS first_booking_date, MAX( b~booking_date ) AS last_booking_date FROM /dmo/customer AS c INNER JOIN /dmo/booking AS b ON b~customer_id = c~customer_id GROUP BY c~customer_id, c~first_name, c~last_name ORDER BY booking_day_count DESCENDING, c~customer_id ASCENDING UP TO 10 ROWS
```

| CUSTOMER_ID | FIRST_NAME | LAST_NAME | BOOKING_DAY_COUNT | FIRST_BOOKING_DATE | LAST_BOOKING_DATE |
|---|---|---|---|---|---|
| 000057 | Lee | Columbo | 25 | 20260603 | 20270416 |
| 000238 | Friedrich | Heller | 25 | 20260528 | 20270409 |
| 000315 | James | D´Oultrement | 25 | 20260528 | 20270413 |
| 000138 | August | Wohl | 23 | 20260529 | 20270416 |
| 000218 | Juan | Mechler | 23 | 20260531 | 20270413 |
| 000320 | Christoph | Hunter | 23 | 20260531 | 20270416 |
| 000482 | Max | Sessler | 23 | 20260601 | 20270416 |
| 000024 | Siegfried | Jeremias | 22 | 20260530 | 20270416 |
| 000026 | Andrej | Jeremias | 22 | 20260528 | 20270413 |
| 000066 | Peter | Columbo | 22 | 20260531 | 20270413 |

---

## q0321 · medium · AGREED

**For each airline with flights booked on trips, what are the lowest and highest trip booking fees among trips containing its flights, separately by trip currency? Return airline codes and names, currencies, both fees, and distinct trip counts.**

Reference SQL:

```sql
SELECT c~carrier_id, c~name, t~currency_code, MIN( t~booking_fee ) AS lowest_booking_fee, MAX( t~booking_fee ) AS highest_booking_fee, COUNT( DISTINCT t~travel_id ) AS trip_count FROM /dmo/carrier AS c INNER JOIN /dmo/booking AS b ON b~carrier_id = c~carrier_id INNER JOIN /dmo/travel AS t ON t~travel_id = b~travel_id GROUP BY c~carrier_id, c~name, t~currency_code
```

| CARRIER_ID | NAME | CURRENCY_CODE | LOWEST_BOOKING_FEE | HIGHEST_BOOKING_FEE | TRIP_COUNT |
|---|---|---|---|---|---|
| AZ | Alitalia Societa Aerea Italiana S.p.A. | EUR | 10.00 | 60.00 | 601 |
| AA | American Airlines Inc. | EUR | 20.00 | 60.00 | 53 |
| DE | Condor | EUR | 20.00 | 60.00 | 44 |
| LH | Deutsche Lufthansa AG | EUR | 10.00 | 150.00 | 1037 |
| SQ | Singapore Airlines Limited | EUR | 30.00 | 150.00 | 42 |
| UA | United Airlines, Inc. | EUR | 20.00 | 150.00 | 57 |
| NQ | Air Japan | JPY | 20.00 | 60.00 | 40 |
| JL | Japan Airlines Co., Ltd. | JPY | 10.00 | 60.00 | 637 |
| LH | Deutsche Lufthansa AG | SGD | 40.00 | 40.00 | 1 |
| TR | Scoot | SGD | 20.00 | 60.00 | 24 |

…6 more rows

---

## q0322 · medium · AGREED · ordered

**Which 10 customers have the most different passengers booked across their trips? Return customer IDs, first and last names, and passenger counts, most passengers first, then by customer ID.**

Reference SQL:

```sql
SELECT c~customer_id, c~first_name, c~last_name, COUNT( DISTINCT b~customer_id ) AS passenger_count FROM /dmo/customer AS c INNER JOIN /dmo/travel AS t ON t~customer_id = c~customer_id INNER JOIN /dmo/booking AS b ON b~travel_id = t~travel_id GROUP BY c~customer_id, c~first_name, c~last_name ORDER BY passenger_count DESCENDING, c~customer_id ASCENDING UP TO 10 ROWS
```

| CUSTOMER_ID | FIRST_NAME | LAST_NAME | PASSENGER_COUNT |
|---|---|---|---|
| 000171 | Christa | Dumbach | 21 |
| 000465 | Ida | Miguel | 20 |
| 000394 | Matthias | Kramer | 19 |
| 000050 | Matthias | Fischmann | 18 |
| 000209 | Christoph | Waldmann | 18 |
| 000234 | Adam | Heller | 18 |
| 000262 | Salvador | Henry | 18 |
| 000293 | Illya | Legrand | 18 |
| 000438 | Ruth | Gahl | 18 |
| 000466 | Ruth | Miguel | 18 |

---

## q0323 · medium · AGREED · ordered

**Which 10 pairs of different add-ons appear together on the most trips? Return both add-on codes and shared trip counts, with the alphabetically earlier code first in each pair. Sort by most trips, then by the first and second codes.**

Reference SQL:

```sql
SELECT a~supplement_id AS first_add_on, b~supplement_id AS second_add_on, COUNT( DISTINCT a~travel_id ) AS trip_count FROM /dmo/book_suppl AS a INNER JOIN /dmo/book_suppl AS b ON b~travel_id = a~travel_id AND a~supplement_id < b~supplement_id GROUP BY a~supplement_id, b~supplement_id ORDER BY trip_count DESCENDING, a~supplement_id ASCENDING, b~supplement_id ASCENDING UP TO 10 ROWS
```

| FIRST_ADD_ON | SECOND_ADD_ON | TRIP_COUNT |
|---|---|---|
| ML-0017 | ML-0025 | 57 |
| BV-0003 | ML-0035 | 56 |
| LU-0001 | ML-0020 | 56 |
| ML-0014 | ML-0034 | 56 |
| BV-0007 | ML-0007 | 55 |
| BV-0007 | ML-0035 | 55 |
| LU-0003 | ML-0017 | 55 |
| ML-0014 | ML-0030 | 54 |
| BV-0004 | ML-0020 | 53 |
| BV-0005 | ML-0033 | 53 |

---

## q0324 · medium · AGREED · ordered

**Which 10 pairs of airlines share the most departure airports in their listed connections? Return both airline codes and shared airport counts, with the alphabetically earlier airline code first. Sort by most shared airports, then by the first and second airline codes.**

Reference SQL:

```sql
SELECT a~carrier_id AS first_airline, b~carrier_id AS second_airline, COUNT( DISTINCT a~airport_from_id ) AS shared_airport_count FROM /dmo/connection AS a INNER JOIN /dmo/connection AS b ON b~airport_from_id = a~airport_from_id AND a~carrier_id < b~carrier_id GROUP BY a~carrier_id, b~carrier_id ORDER BY shared_airport_count DESCENDING, a~carrier_id ASCENDING, b~carrier_id ASCENDING UP TO 10 ROWS
```

| FIRST_AIRLINE | SECOND_AIRLINE | SHARED_AIRPORT_COUNT |
|---|---|---|
| AA | DL | 4 |
| AA | LH | 3 |
| AA | UA | 3 |
| DE | DL | 3 |
| DE | LH | 3 |
| DE | SQ | 3 |
| DL | LH | 3 |
| DL | SQ | 3 |
| DL | UA | 3 |
| JL | SQ | 3 |

---

## q0325 · medium · AGREED · ordered

**Which 10 aircraft type and seating capacity combinations appear on the most scheduled flights? Return aircraft types, seating capacities, and flight counts, most flights first, then by aircraft type and seating capacity.**

Reference SQL:

```sql
SELECT f~plane_type_id, f~seats_max, COUNT(*) AS flight_count FROM /dmo/flight AS f GROUP BY f~plane_type_id, f~seats_max ORDER BY flight_count DESCENDING, f~plane_type_id ASCENDING, f~seats_max ASCENDING UP TO 10 ROWS
```

| PLANE_TYPE_ID | SEATS_MAX | FLIGHT_COUNT |
|---|---|---|
| A321-200 | 190 | 4320 |
| 787-9 | 250 | 2520 |
| 737-800 | 160 | 2160 |
| 737 MAX 9 | 178 | 1800 |
| 767-300 | 216 | 1260 |
| 777-300ER | 264 | 1080 |
| A319-100 | 128 | 1080 |
| 757-200 | 199 | 900 |
| 737 MAX 8 | 166 | 720 |
| 747-8 | 364 | 720 |

---

## q0326 · medium · AGREED

**For each country where customers live, show its country code and the numbers of customers and listed travel agencies. Include countries with no agencies.**

Reference SQL:

```sql
SELECT c~country_code, COUNT( DISTINCT c~customer_id ) AS customer_count, COUNT( DISTINCT a~agency_id ) AS agency_count FROM /dmo/customer AS c LEFT OUTER JOIN /dmo/agency AS a ON a~country_code = c~country_code GROUP BY c~country_code
```

| COUNTRY_CODE | CUSTOMER_COUNT | AGENCY_COUNT |
|---|---|---|
| AT | 19 | 1 |
| BE | 11 | 0 |
| CH | 5 | 1 |
| DE | 476 | 20 |
| ES | 30 | 0 |
| FR | 47 | 1 |
| IT | 12 | 1 |
| SI | 2 | 0 |
| US | 126 | 14 |

---

## q0327 · medium · AGREED

**Which countries have more than 10 customers? Return country codes and customer counts.**

Reference SQL:

```sql
SELECT c~country_code, COUNT(*) AS customer_count FROM /dmo/customer AS c GROUP BY c~country_code HAVING COUNT(*) > 10
```

| COUNTRY_CODE | CUSTOMER_COUNT |
|---|---|
| AT | 19 |
| BE | 11 |
| DE | 476 |
| ES | 30 |
| FR | 47 |
| IT | 12 |
| US | 126 |

---

## q0328 · medium · AGREED

**Which currencies are used by at least three airlines? Return currency codes and airline counts.**

Reference SQL:

```sql
SELECT c~currency_code, COUNT(*) AS airline_count FROM /dmo/carrier AS c GROUP BY c~currency_code HAVING COUNT(*) >= 3
```

| CURRENCY_CODE | AIRLINE_COUNT |
|---|---|
| EUR | 5 |
| USD | 7 |

---

## q0329 · medium · AGREED

**For every catalog add-on, show its code, category code, and the number of languages in which it has a description. Include add-ons without descriptions.**

Reference SQL:

```sql
SELECT s~supplement_id, s~supplement_category, COUNT( DISTINCT t~language_code ) AS language_count FROM /dmo/supplement AS s LEFT OUTER JOIN /dmo/suppl_text AS t ON t~supplement_id = s~supplement_id GROUP BY s~supplement_id, s~supplement_category
```

| SUPPLEMENT_ID | SUPPLEMENT_CATEGORY | LANGUAGE_COUNT |
|---|---|---|
| ML-0021 | ML | 1 |
| BV-0009 | BV | 1 |
| ML-0005 | ML | 1 |
| BV-0008 | BV | 1 |
| ML-0035 | ML | 1 |
| BV-0003 | BV | 1 |
| ML-0025 | ML | 1 |
| LU-0003 | LU | 1 |
| ML-0034 | ML | 1 |
| ML-0022 | ML | 1 |

…38 more rows

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

## q0331 · medium · AGREED · ordered

**Which 10 trip start and end date combinations are most common? Return both dates and trip counts, most trips first, then by start date and end date.**

Reference SQL:

```sql
SELECT t~begin_date, t~end_date, COUNT(*) AS trip_count FROM /dmo/travel AS t GROUP BY t~begin_date, t~end_date ORDER BY trip_count DESCENDING, t~begin_date ASCENDING, t~end_date ASCENDING UP TO 10 ROWS
```

| BEGIN_DATE | END_DATE | TRIP_COUNT |
|---|---|---|
| 20270417 | 20270417 | 658 |
| 20270416 | 20270416 | 526 |
| 20260620 | 20260620 | 450 |
| 20260621 | 20260621 | 424 |
| 20260619 | 20260619 | 402 |
| 20270415 | 20270415 | 362 |
| 20270412 | 20270412 | 312 |
| 20260616 | 20260616 | 242 |
| 20260620 | 20260621 | 141 |
| 20270413 | 20270413 | 88 |

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

## q0333 · medium · AGREED

**For each trip status and departure airport, show the status code, airport code, number of flight bookings, and number of distinct trips containing those bookings.**

Reference SQL:

```sql
SELECT t~status, c~airport_from_id, COUNT(*) AS booking_count, COUNT( DISTINCT t~travel_id ) AS trip_count FROM /dmo/travel AS t INNER JOIN /dmo/booking AS b ON b~travel_id = t~travel_id INNER JOIN /dmo/connection AS c ON c~carrier_id = b~carrier_id AND c~connection_id = b~connection_id GROUP BY t~status, c~airport_from_id
```

| STATUS | AIRPORT_FROM_ID | BOOKING_COUNT | TRIP_COUNT |
|---|---|---|---|
| B | EWR | 206 | 98 |
| B | FRA | 617 | 325 |
| B | HAV | 116 | 58 |
| B | JFK | 509 | 266 |
| B | MIA | 230 | 114 |
| B | NRT | 486 | 255 |
| B | SFO | 685 | 337 |
| B | SIN | 371 | 185 |
| B | VCE | 193 | 107 |
| N | EWR | 346 | 183 |

…17 more rows

---

## q0334 · medium · AGREED

**How many trips were handled by an agency in the same country as the trip customer? Return country codes, trip counts, and distinct customer counts.**

Reference SQL:

```sql
SELECT c~country_code, COUNT(*) AS trip_count, COUNT( DISTINCT c~customer_id ) AS customer_count FROM /dmo/travel AS t INNER JOIN /dmo/agency AS a ON a~agency_id = t~agency_id INNER JOIN /dmo/customer AS c ON c~customer_id = t~customer_id WHERE a~country_code = c~country_code GROUP BY c~country_code
```

| COUNTRY_CODE | TRIP_COUNT | CUSTOMER_COUNT |
|---|---|---|
| DE | 1310 | 443 |
| AT | 7 | 7 |
| US | 248 | 109 |
| FR | 6 | 5 |
| CH | 1 | 1 |
| IT | 1 | 1 |

---

## q0335 · medium · AGREED · ordered

**Which 10 pairs of airlines have the most booked passengers in common? Return both airline codes and shared-passenger counts, with the alphabetically earlier airline code first. Sort by most shared passengers, then by the first and second airline codes.**

Reference SQL:

```sql
SELECT b1~carrier_id AS first_airline, b2~carrier_id AS second_airline, COUNT( DISTINCT b1~customer_id ) AS shared_passenger_count FROM /dmo/booking AS b1 INNER JOIN /dmo/booking AS b2 ON b2~customer_id = b1~customer_id AND b1~carrier_id < b2~carrier_id GROUP BY b1~carrier_id, b2~carrier_id ORDER BY shared_passenger_count DESCENDING, first_airline ASCENDING, second_airline ASCENDING UP TO 10 ROWS
```

| FIRST_AIRLINE | SECOND_AIRLINE | SHARED_PASSENGER_COUNT |
|---|---|---|
| AA | LH | 646 |
| LH | SQ | 615 |
| AA | SQ | 610 |
| AA | JL | 567 |
| LH | UA | 563 |
| JL | LH | 562 |
| AA | UA | 561 |
| JL | SQ | 532 |
| AA | AZ | 531 |
| AZ | LH | 531 |

---

## q0336 · medium · AGREED · ordered

**Which 10 trips include the widest variety of purchased add-on categories? Return trip IDs, agency IDs, category counts, and purchased add-on entry counts, most categories first, then by trip ID.**

Reference SQL:

```sql
SELECT t~travel_id, t~agency_id, COUNT( DISTINCT s~supplement_category ) AS category_count, COUNT(*) AS entry_count FROM /dmo/travel AS t INNER JOIN /dmo/book_suppl AS bs ON bs~travel_id = t~travel_id INNER JOIN /dmo/supplement AS s ON s~supplement_id = bs~supplement_id GROUP BY t~travel_id, t~agency_id ORDER BY category_count DESCENDING, t~travel_id ASCENDING UP TO 10 ROWS
```

| TRAVEL_ID | AGENCY_ID | CATEGORY_COUNT | ENTRY_COUNT |
|---|---|---|---|
| 00000001 | 070041 | 3 | 6 |
| 00000003 | 070046 | 3 | 19 |
| 00000007 | 070046 | 3 | 28 |
| 00000009 | 070032 | 3 | 26 |
| 00000012 | 070028 | 3 | 12 |
| 00000017 | 070048 | 3 | 16 |
| 00000020 | 070049 | 3 | 20 |
| 00000022 | 070037 | 3 | 8 |
| 00000023 | 070049 | 3 | 8 |
| 00000024 | 070050 | 3 | 21 |

---

## q0337 · medium · AGREED

**For each aircraft type, show the number of scheduled flights and occupied seats as a percentage of total seat capacity, rounded to 2 decimals.**

Reference SQL:

```sql
SELECT f~plane_type_id, COUNT(*) AS flight_count, DIVISION( SUM( f~seats_occupied ) * 100, SUM( f~seats_max ), 2 ) AS occupancy_percentage FROM /dmo/flight AS f GROUP BY f~plane_type_id
```

| PLANE_TYPE_ID | FLIGHT_COUNT | OCCUPANCY_PERCENTAGE |
|---|---|---|
| A340-600 | 367 | 68.66 |
| 747-400 | 8 | 70.65 |
| 787-10 | 360 | 68.01 |
| 787-9 | 2520 | 69.12 |
| 737-800 | 2162 | 68.34 |
| 767-200 | 11 | 72.62 |
| 737 MAX 9 | 1800 | 68.08 |
| 757-200 | 900 | 69.53 |
| 737-900 | 540 | 67.41 |
| 777-200 | 360 | 67.63 |

…13 more rows

---

## q0338 · medium · AGREED

**For each destination country represented in flight bookings, show its country code, number of distinct passengers, number of flight bookings, and number of different airlines booked.**

Reference SQL:

```sql
SELECT a~country, COUNT( DISTINCT b~customer_id ) AS passenger_count, COUNT(*) AS booking_count, COUNT( DISTINCT b~carrier_id ) AS airline_count FROM /dmo/booking AS b INNER JOIN /dmo/connection AS c ON c~carrier_id = b~carrier_id AND c~connection_id = b~connection_id INNER JOIN /dmo/airport AS a ON a~airport_id = c~airport_to_id GROUP BY a~country
```

| COUNTRY | PASSENGER_COUNT | BOOKING_COUNT | AIRLINE_COUNT |
|---|---|---|---|
| CU | 346 | 483 | 2 |
| DE | 689 | 2211 | 6 |
| IT | 471 | 773 | 1 |
| JP | 680 | 2080 | 5 |
| SG | 576 | 1210 | 5 |
| US | 726 | 6387 | 8 |

---

## q0339 · medium · AGREED · ordered

**Which 10 trips have flight bookings for the most distinct passengers? Return trip IDs, agency names, passenger counts, and flight booking counts, most passengers first, then by trip ID.**

Reference SQL:

```sql
SELECT t~travel_id, a~name AS agency_name, COUNT( DISTINCT b~customer_id ) AS passenger_count, COUNT(*) AS booking_count FROM /dmo/travel AS t INNER JOIN /dmo/agency AS a ON a~agency_id = t~agency_id INNER JOIN /dmo/booking AS b ON b~travel_id = t~travel_id GROUP BY t~travel_id, a~name ORDER BY passenger_count DESCENDING, t~travel_id ASCENDING UP TO 10 ROWS
```

| TRAVEL_ID | AGENCY_NAME | PASSENGER_COUNT | BOOKING_COUNT |
|---|---|---|---|
| 00000006 | Flights and More | 3 | 12 |
| 00000007 | Hendrik's | 3 | 12 |
| 00000008 | Ben McCloskey Ltd. | 3 | 6 |
| 00000009 | Sunny, Sunny, Sunny | 3 | 12 |
| 00000012 | Aussie Travel | 3 | 9 |
| 00000016 | Not Only By Bike | 3 | 12 |
| 00000017 | Rocky Horror Tours | 3 | 12 |
| 00000020 | Flights and More | 3 | 12 |
| 00000024 | Not Only By Bike | 3 | 12 |
| 00000033 | Caribian Dreams | 3 | 9 |

---

## q0340 · medium · AGREED

**For each airline with listed connections, show its code and name and how many different departure times and arrival times appear in its timetable.**

Reference SQL:

```sql
SELECT a~carrier_id, a~name, COUNT( DISTINCT c~departure_time ) AS departure_time_count, COUNT( DISTINCT c~arrival_time ) AS arrival_time_count FROM /dmo/carrier AS a INNER JOIN /dmo/connection AS c ON c~carrier_id = a~carrier_id GROUP BY a~carrier_id, a~name
```

| CARRIER_ID | NAME | DEPARTURE_TIME_COUNT | ARRIVAL_TIME_COUNT |
|---|---|---|---|
| SQ | Singapore Airlines Limited | 12 | 12 |
| UA | United Airlines, Inc. | 19 | 20 |
| AA | American Airlines Inc. | 27 | 28 |
| AZ | Alitalia Societa Aerea Italiana S.p.A. | 2 | 2 |
| LH | Deutsche Lufthansa AG | 8 | 8 |
| DL | Delta Air Lines, Inc. | 14 | 15 |
| DE | Condor | 3 | 4 |
| JL | Japan Airlines Co., Ltd. | 4 | 4 |
| TR | Scoot | 2 | 2 |
| NQ | Air Japan | 4 | 4 |

…2 more rows

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

