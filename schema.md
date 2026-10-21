# Schema: SAP flight reference model (/DMO/)

Airline travel data: carriers, flight connections, scheduled flights, travel agencies, customers, travels (trips), bookings and booking supplements (meals, luggage…). Key columns are marked 🔑.

## /DMO/AGENCY

Managing Agencies

| column | type | meaning |
|---|---|---|
| 🔑 AGENCY_ID | NUMC(6) | Agency ID |
| NAME | CHAR(80) | Agency Name |
| STREET | CHAR(60) | Street |
| POSTAL_CODE | CHAR(10) | Postal Code |
| CITY | CHAR(40) | City |
| COUNTRY_CODE | CHAR(3) | Country/Region Key |
| PHONE_NUMBER | CHAR(30) | Phone Number |
| EMAIL_ADDRESS | STRG(256) | Email Address |
| WEB_ADDRESS | STRG(256) | Web Address |
| ATTACHMENT | RSTR(0) | Attachment |
| MIME_TYPE | CHAR(128) | MimeType |
| FILENAME | CHAR(128) | Filename |
| LOCAL_CREATED_BY | CHAR(12) | Created By User |
| LOCAL_CREATED_AT | DEC(21,7) | Creation Date Time |
| LOCAL_LAST_CHANGED_BY | CHAR(12) | Local Instance Last Changed By User |
| LOCAL_LAST_CHANGED_AT | DEC(21,7) | Local Instance Last Change Date Time |
| LAST_CHANGED_AT | DEC(21,7) | Last Change Date Time |
| DUMMY_FIELD | CHAR(1) |  |
| /DMO/ZZSLOGANZAG | CHAR(255) | Agency Slogan: Slogan |

## /DMO/CUSTOMER

Managing Customers

| column | type | meaning |
|---|---|---|
| 🔑 CUSTOMER_ID | NUMC(6) | Customer ID |
| FIRST_NAME | CHAR(40) | First Name |
| LAST_NAME | CHAR(40) | Last Name |
| TITLE | CHAR(10) | Title |
| STREET | CHAR(60) | Street |
| POSTAL_CODE | CHAR(10) | Postal Code |
| CITY | CHAR(40) | City |
| COUNTRY_CODE | CHAR(3) | Country/Region Key |
| PHONE_NUMBER | CHAR(30) | Phone Number |
| EMAIL_ADDRESS | STRG(256) | Email Address |
| LOCAL_CREATED_BY | CHAR(12) | Created By User |
| LOCAL_CREATED_AT | DEC(21,7) | Creation Date Time |
| LOCAL_LAST_CHANGED_BY | CHAR(12) | Local Instance Last Changed By User |
| LOCAL_LAST_CHANGED_AT | DEC(21,7) | Local Instance Last Change Date Time |
| LAST_CHANGED_AT | DEC(21,7) | Last Change Date Time |

## /DMO/CARRIER

Carrier

| column | type | meaning |
|---|---|---|
| 🔑 CARRIER_ID | CHAR(3) | Carrier ID |
| NAME | CHAR(40) | Carrier Name |
| CURRENCY_CODE | CUKY(5) | Currency Code |
| LOCAL_CREATED_BY | CHAR(12) | Created By User |
| LOCAL_CREATED_AT | DEC(21,7) | Creation Date Time |
| LOCAL_LAST_CHANGED_BY | CHAR(12) | Local Instance Last Changed By User |
| LOCAL_LAST_CHANGED_AT | DEC(21,7) | Local Instance Last Change Date Time |
| LAST_CHANGED_AT | DEC(21,7) | Last Change Date Time |

## /DMO/CONNECTION

Connection

| column | type | meaning |
|---|---|---|
| 🔑 CARRIER_ID | CHAR(3) | Carrier ID |
| 🔑 CONNECTION_ID | NUMC(4) | Connection ID |
| AIRPORT_FROM_ID | CHAR(3) | From Airport |
| AIRPORT_TO_ID | CHAR(3) | To Airport |
| DEPARTURE_TIME | TIMS(6) | Departure Time |
| ARRIVAL_TIME | TIMS(6) | Arrival Time |
| DISTANCE | INT4(10) | Flight Distance |
| DISTANCE_UNIT | UNIT(3) | Unit of Measurement |

## /DMO/FLIGHT

Flight

| column | type | meaning |
|---|---|---|
| 🔑 CARRIER_ID | CHAR(3) | Carrier ID |
| 🔑 CONNECTION_ID | NUMC(4) | Connection ID |
| 🔑 FLIGHT_DATE | DATS(8) | Flight Date |
| PRICE | CURR(16,2) | Flight Price |
| CURRENCY_CODE | CUKY(5) | Currency Code |
| PLANE_TYPE_ID | CHAR(10) | Plane Type ID |
| SEATS_MAX | INT4(10) | Plane Seats Max |
| SEATS_OCCUPIED | INT4(10) | Plane Seats Occupied |

## /DMO/AIRPORT

Airport

| column | type | meaning |
|---|---|---|
| 🔑 AIRPORT_ID | CHAR(3) | Airport ID |
| NAME | CHAR(40) | Airport Name |
| CITY | CHAR(40) | City |
| COUNTRY | CHAR(3) | Country/Region Key |

## /DMO/TRAVEL

Managing Travels

| column | type | meaning |
|---|---|---|
| 🔑 TRAVEL_ID | NUMC(8) | Travel ID |
| AGENCY_ID | NUMC(6) | Agency ID |
| CUSTOMER_ID | NUMC(6) | Customer ID |
| BEGIN_DATE | DATS(8) | Start Date |
| END_DATE | DATS(8) | End Date |
| BOOKING_FEE | CURR(16,2) | Booking Fee |
| TOTAL_PRICE | CURR(16,2) | Total Price |
| CURRENCY_CODE | CUKY(5) | Currency Code |
| DESCRIPTION | SSTR(1024) | Description |
| STATUS | CHAR(1) | Travel Status |
| CREATEDBY | CHAR(12) | User Name |
| CREATEDAT | DEC(21,7) | UTC Time Stamp in Long Form (YYYYMMDDhhmmssmmmuuun) |
| LASTCHANGEDBY | CHAR(12) | User Name |
| LASTCHANGEDAT | DEC(21,7) | UTC Time Stamp in Long Form (YYYYMMDDhhmmssmmmuuun) |

## /DMO/BOOKING

Booking

| column | type | meaning |
|---|---|---|
| 🔑 TRAVEL_ID | NUMC(8) | Travel ID |
| 🔑 BOOKING_ID | NUMC(4) | Booking ID |
| BOOKING_DATE | DATS(8) | Booking Date |
| CUSTOMER_ID | NUMC(6) | Customer ID |
| CARRIER_ID | CHAR(3) | Carrier ID |
| CONNECTION_ID | NUMC(4) | Connection ID |
| FLIGHT_DATE | DATS(8) | Flight Date |
| FLIGHT_PRICE | CURR(16,2) | Flight Price |
| CURRENCY_CODE | CUKY(5) | Currency Code |

## /DMO/BOOK_SUPPL

Booking Supplement

| column | type | meaning |
|---|---|---|
| 🔑 TRAVEL_ID | NUMC(8) | Travel ID |
| 🔑 BOOKING_ID | NUMC(4) | Booking ID |
| 🔑 BOOKING_SUPPLEMENT_ID | NUMC(2) | Booking Supplement ID |
| SUPPLEMENT_ID | CHAR(10) | Supplement ID |
| PRICE | CURR(16,2) | Supplement Price |
| CURRENCY_CODE | CUKY(5) | Currency Code |

## /DMO/SUPPLEMENT

Supplement

| column | type | meaning |
|---|---|---|
| 🔑 SUPPLEMENT_ID | CHAR(10) | Supplement ID |
| SUPPLEMENT_CATEGORY | CHAR(2) | Supplement Type |
| PRICE | CURR(16,2) | Supplement Price |
| CURRENCY_CODE | CUKY(5) | Currency Code |
| LOCAL_CREATED_BY | CHAR(12) | Created By User |
| LOCAL_CREATED_AT | DEC(21,7) | Creation Date Time |
| LOCAL_LAST_CHANGED_BY | CHAR(12) | Local Instance Last Changed By User |
| LOCAL_LAST_CHANGED_AT | DEC(21,7) | Local Instance Last Change Date Time |
| LAST_CHANGED_AT | DEC(21,7) | Last Change Date Time |

## /DMO/SUPPL_TEXT

Supplement Text

| column | type | meaning |
|---|---|---|
| 🔑 SUPPLEMENT_ID | CHAR(10) | Supplement ID |
| 🔑 LANGUAGE_CODE | LANG(1) | Language Key |
| DESCRIPTION | SSTR(1024) | Supplement Description |
| LOCAL_LAST_CHANGED_AT | DEC(21,7) | Local Instance Last Change Date Time |

## /DMO/TRVL_STAT_T

TravelStatus Text

| column | type | meaning |
|---|---|---|
| 🔑 TRAVEL_STATUS | CHAR(1) | Travel Status |
| 🔑 LANGUAGE | LANG(1) | Language Key |
| TEXT | SSTR(1024) | Travel Status Text |

## /DMO/BOOK_STAT_T

BookingStatus Text

| column | type | meaning |
|---|---|---|
| 🔑 BOOKING_STATUS | CHAR(1) | Travel Status |
| 🔑 LANGUAGE | LANG(1) | Language Key |
| TEXT | SSTR(1024) | Overall Status Text |

## Dialect notes

- This is **ABAP SQL**, not ANSI SQL.
- Address a column of a table alias as `alias~column` (not `alias.column`).
- Sort with `ORDER BY col ASCENDING` / `DESCENDING`.
- Top-N: end the query with `UP TO n ROWS` (optionally `OFFSET m`). No `LIMIT`, no `TOP`.
- Not supported: `WITH` (CTEs), `UNION`, `INTO`. Exactly one `SELECT` statement.
- Every expression in the SELECT list (aggregates, CASE, arithmetic) needs an alias: `COUNT(*) AS n`.
- Supported: joins, subqueries, `CASE`, aggregates, `GROUP BY`, `HAVING`.
- Date literals are `'YYYYMMDD'` strings (e.g. `'20260620'`).
- Missing values from an outer join come back as blank / zero / `00000000`, never as NULL.
