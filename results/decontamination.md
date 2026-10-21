# Decontamination (threshold 0.788, voyage-3.5)

Latest run: checked 157 cross-checked pairs against 308 test items, dropped 25, kept 132. Totals below are cumulative over all runs (per-run log: results/decontamination-runs.jsonl).

| rule | dropped (cumulative) |
|---|---:|
| jaccard | 1 |
| cosine | 22 |
| result | 0 |
| train-dup | 2 |

## Best-match cosine histogram (0.05 bins)

| bin | pairs |
|---|---:|
| 0.30–0.35 | 1 |
| 0.35–0.40 | 1 |
| 0.40–0.45 | 2 |
| 0.45–0.50 | 5 |
| 0.50–0.55 | 11 |
| 0.55–0.60 | 18 |
| 0.60–0.65 | 20 |
| 0.65–0.70 | 22 |
| 0.70–0.75 | 27 |
| 0.75–0.80 | 30 |
| 0.80–0.85 | 14 |
| 0.85–0.90 | 4 |
| 0.90–0.95 | 1 |
| 0.95–1.00 | 1 |

## 10 closest kept pairs

- 0.786 — train: How many trips have the status 'Booked'? / test: How many trips are booked or planned?
- 0.786 — train: List each carrier that has flights, and the number of flights it operated in November 2026. / test: For each carrier with flights in November 2026, how many flights were at least 90% full and how many were below 90% full? Return carrier codes, names, and both flight counts.
- 0.785 — train: Which carriers have more than 50 bookings for flights in November 2026? Show carrier names and the number of bookings. / test: Which 10 flights in November 2026 have the most recorded flight bookings? Return airline codes and names, connection numbers, flight dates, booking counts, and recorded occupied seats, most bookings first, then by date, airline code, and connection number.
- 0.784 — train: For each carrier, what is the total flight price of bookings in December 2026? Show carrier names and totals in the booking currency, including only carriers that have bookings. / test: For flights departing in December 2026, what are the total flight-booking charges attached to booked, planned, and new trips? Return airline codes, names, currencies, and the three charge totals, keeping currencies separate.
- 0.783 — train: Which carriers had more than 100 flights in October 2026? Return the carrier names and the number of flights. / test: At each departure airport that has flights scheduled in October 2026, which airline scheduled the most flights in October 2026? Include all airlines tied for first. Return airport codes and names, airline codes and names, and flight counts.
- 0.783 — train: What is the average number of flights per carrier in January 2027 for carriers with more than 10 flights that month? Show carrier name and flight count. / test: For flights in January 2027, list each carrier's name and the number of pets transported in the cabin.
- 0.783 — train: List the 3 most expensive flights in September 2026, in USD. Return carrier, connection, date and price; sort by price descending, then by date. / test: Which 10 flights in October 2026 have the highest listed prices in US dollars? Return airline codes and names, connection numbers, flight dates, departure and arrival airport codes, and prices, highest price first, then by date, airline code, and connection number.
- 0.782 — train: For all agencies, including those with no trips in January 2027, show the agency name and the number of trips starting that month, as 0 where there are none. Order by number of trips descending, then by agency name. / test: Which 10 agencies handled the most trips overall? Return agency numbers and names, total trips, and separate counts for trips starting in the fourth quarter of 2026, the first quarter of 2027, and all other periods. Sort by total trips, highest first, then by agency number.
- 0.781 — train: For every carrier, show the carrier name and the number of flights in February 2027, including carriers with none shown as 0. / test: For flights in February 2027, list each carrier's name and the number of flights that used a jet bridge for boarding.
- 0.781 — train: How many bookings were made on flights departing in November 2026? / test: How many flights are scheduled on each date in November 2026? Show dates and flight counts, earliest date first.
