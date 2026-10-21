# Calibration — label each pair duplicate / paraphrase / distinct

Same task with different constants = paraphrase. Write labels into review/calibration.jsonl.

1. cos 0.976 — t-b0002-00 vs q0021
   - train: How many flights are scheduled in October 2026?
   - test:  How many scheduled flights are there in October 2026?
2. cos 0.913 — t-b0017-00 vs q0033
   - train: How many trips are there for each travel status? Show the status text and the count.
   - test:  How many trips are there in each status? Show status codes and trip counts.
3. cos 0.890 — t-b0022-00 vs q0181
   - train: How many trips start in October 2026?
   - test:  How many trips start on each date in October 2026? Show start dates and trip counts, earliest date first.
4. cos 0.884 — t-b0008-09 vs q0223
   - train: Which agencies had trips in October 2026 or November 2026? Show the agency name and the number of trips across both months, highest number first, then by agency name.
   - test:  Which agencies handled trips starting in all three months of the fourth quarter of 2026? Return agency numbers, names, and separate trip counts for October, November, and December.
5. cos 0.882 — t-b0008-00 vs q0047
   - train: Which travel agencies had more than 3 trips starting in October 2026? Show the agency name and the number of trips, most trips first, then by agency name.
   - test:  Which agencies handled at least three trips starting in October 2026? Return agency numbers, names, trip counts, and distinct customer counts.
6. cos 0.853 — t-b0003-05 vs q0053
   - train: Which agencies have at least 3 travels in October 2026? Show agency name and travel count.
   - test:  Which agencies booked flights with at least three different carriers for trips starting in October 2026? Return agency numbers, names, the number of carriers, and the number of flight bookings for those trips.
7. cos 0.848 — t-b0017-01 vs q0289
   - train: For each travel status, how many trips started in October 2026? Show the status text and the count.
   - test:  For each status, how many trips overlap October 2026, including their start and end dates? Return status codes, total overlapping trips, and separate counts for those starting in October and those starting earlier.
8. cos 0.847 — t-b0003-06 vs q0047
   - train: Which agencies have more than 2 different customers with travels starting in November 2026? Show agency name and distinct customer count.
   - test:  Which agencies handled at least three trips starting in October 2026? Return agency numbers, names, trip counts, and distinct customer counts.
9. cos 0.824 — t-b0001-00 vs q0126
   - train: How many flights did each carrier operate in October 2026? Include carriers with no flights as 0.
   - test:  For each airline, how many flights in October 2026 have no bookings? Return airline codes, names, and flight counts, including only airlines with such flights.
10. cos 0.824 — t-b0024-00 vs q0126
   - train: For every carrier, show the carrier name and the number of flights in October 2026, including carriers with none shown as 0.
   - test:  For each airline, how many flights in October 2026 have no bookings? Return airline codes, names, and flight counts, including only airlines with such flights.
11. cos 0.816 — t-b0030-02 vs q0046
   - train: In October 2026, which three carriers had the most seats occupied across all their flights? List carrier names and occupied seats, most occupied first, then by carrier name.
   - test:  For each flight connection that has flights in October 2026, which flight had the most occupied seats? Break ties by earliest date. Return carrier code, connection number, flight date, occupied seats, and seat capacity, sorted by carrier code, connection number, then date.
12. cos 0.814 — t-b0022-04 vs q0121
   - train: List the travel IDs and start dates of trips that begin in December 2026, ordered by start date and then by travel ID.
   - test:  Show the 10 earliest-starting trips in December 2026, with trip IDs, start and end dates, agency names, and the trip customers' first and last names. Sort by start date, then by trip ID.
13. cos 0.811 — t-b0026-00 vs q0016
   - train: For flights departing in October 2026, what was the average delay in minutes between the scheduled and actual departure time by carrier?
   - test:  For flights departing in July 2026, list each carrier's name and average departure delay in minutes, rounded to 2 decimals.
14. cos 0.810 — t-b0012-00 vs q0001
   - train: List all carriers that use US dollars, showing carrier name and currency, ordered alphabetically by carrier name.
   - test:  List up to 10 airlines that use US dollars, showing their names and airline codes, ordered alphabetically by name and then by airline code.
15. cos 0.809 — t-b0008-01 vs q0088
   - train: For each agency that has trips in November 2026, show the agency name and the total booking fees collected, rounded to 2 decimals, highest total first, then by agency name.
   - test:  For each currency, which trip starting in the fourth quarter of 2026 had the highest booking fee? Choose the lowest trip number if tied. Return the currency, trip number, agency name, and booking fee, sorted by currency, then trip number.
16. cos 0.806 — t-b0024-08 vs q0065
   - train: For each carrier, show the carrier name and the number of flights in January 2027, including carriers with none shown as 0. Order by the number of flights descending, then by carrier name.
   - test:  For flights scheduled in January 2027, list each carrier's name and the number of flights canceled because of mechanical problems.
17. cos 0.804 — t-b0028-06 vs q0056
   - train: For each carrier that had bookings in October 2026, how many distinct travel groups were booked? Show carrier name and the count, ordered by carrier name.
   - test:  For flights in October 2026, list each carrier's name and the number of distinct pilots assigned to its flights.
18. cos 0.803 — t-b0025-02 vs q0101
   - train: How many bookings does each carrier have for flights in January 2027? Include carriers with no bookings, shown as 0.
   - test:  For flights in January 2027, list each carrier's name and the number of pets transported in the cabin.
19. cos 0.803 — t-b0017-07 vs q0033
   - train: How many trips are there for each status for customers in Germany? Show the status text and the count.
   - test:  How many trips are there in each status? Show status codes and trip counts.
20. cos 0.800 — t-b0012-06 vs q0027
   - train: List carrier names that contain the word 'Air', sorted by name.
   - test:  Which airlines have 'Air' in their name? Show their airline codes, names and currency codes, sorted by airline code.
21. cos 0.798 — t-b0012-07 vs q0026
   - train: How many distinct currencies are used by carriers in the carrier table?
   - test:  How many different currencies do the airlines use?
22. cos 0.793 — t-b0007-03 vs q0227
   - train: Which carriers had more than 500 flights in October 2026? Return carrier names and the number of flights, highest number first, then carrier name.
   - test:  At each departure airport that has flights scheduled in October 2026, which airline scheduled the most flights in October 2026? Include all airlines tied for first. Return airport codes and names, airline codes and names, and flight counts.
23. cos 0.792 — t-b0028-01 vs q0044
   - train: For each carrier that has bookings in November 2026, how many different travel groups are represented? Include the carrier name and the count, ordered by carrier name.
   - test:  For each airline with flight bookings for November 2026 departures, show its code and name, the number of bookings, and the number of distinct passengers.
24. cos 0.786 — t-b0022-01 vs q0242
   - train: How many trips have the status 'Booked'?
   - test:  How many trips are booked or planned?
25. cos 0.786 — t-b0024-03 vs q0050
   - train: List each carrier that has flights, and the number of flights it operated in November 2026.
   - test:  For each carrier with flights in November 2026, how many flights were at least 90% full and how many were below 90% full? Return carrier codes, names, and both flight counts.
26. cos 0.785 — t-b0020-01 vs q0160
   - train: Which carriers have more than 50 bookings for flights in November 2026? Show carrier names and the number of bookings.
   - test:  Which 10 flights in November 2026 have the most recorded flight bookings? Return airline codes and names, connection numbers, flight dates, booking counts, and recorded occupied seats, most bookings first, then by date, airline code, and connection number.
27. cos 0.784 — t-b0020-07 vs q0200
   - train: For each carrier, what is the total flight price of bookings in December 2026? Show carrier names and totals in the booking currency, including only carriers that have bookings.
   - test:  For flights departing in December 2026, what are the total flight-booking charges attached to booked, planned, and new trips? Return airline codes, names, currencies, and the three charge totals, keeping currencies separate.
28. cos 0.783 — t-b0024-05 vs q0227
   - train: Which carriers had more than 100 flights in October 2026? Return the carrier names and the number of flights.
   - test:  At each departure airport that has flights scheduled in October 2026, which airline scheduled the most flights in October 2026? Include all airlines tied for first. Return airport codes and names, airline codes and names, and flight counts.
29. cos 0.783 — t-b0003-09 vs q0101
   - train: What is the average number of flights per carrier in January 2027 for carriers with more than 10 flights that month? Show carrier name and flight count.
   - test:  For flights in January 2027, list each carrier's name and the number of pets transported in the cabin.
30. cos 0.783 — t-b0029-07 vs q0122
   - train: List the 3 most expensive flights in September 2026, in USD. Return carrier, connection, date and price; sort by price descending, then by date.
   - test:  Which 10 flights in October 2026 have the highest listed prices in US dollars? Return airline codes and names, connection numbers, flight dates, departure and arrival airport codes, and prices, highest price first, then by date, airline code, and connection number.
31. cos 0.782 — t-b0008-03 vs q0024
   - train: For all agencies, including those with no trips in January 2027, show the agency name and the number of trips starting that month, as 0 where there are none. Order by number of trips descending, then by agency name.
   - test:  Which 10 agencies handled the most trips overall? Return agency numbers and names, total trips, and separate counts for trips starting in the fourth quarter of 2026, the first quarter of 2027, and all other periods. Sort by total trips, highest first, then by agency number.
32. cos 0.781 — t-b0024-06 vs q0062
   - train: For every carrier, show the carrier name and the number of flights in February 2027, including carriers with none shown as 0.
   - test:  For flights in February 2027, list each carrier's name and the number of flights that used a jet bridge for boarding.
33. cos 0.781 — t-b0025-03 vs q0112
   - train: How many bookings were made on flights departing in November 2026?
   - test:  How many flights are scheduled on each date in November 2026? Show dates and flight counts, earliest date first.
34. cos 0.779 — t-b0019-00 vs q0146
   - train: How many travel agencies are in Germany?
   - test:  How many travel agencies are listed?
35. cos 0.776 — t-b0003-03 vs q0043
   - train: Which agencies have a total booking fee across all their travels exceeding 500? Show agency name and total booking fee.
   - test:  Which 10 agencies have the highest total booking fees on trips priced in euros? Return agency IDs, names, and total booking fees in euros, highest total first, then by agency ID.
36. cos 0.775 — t-b0025-00 vs q0021
   - train: How many bookings were made in October 2026?
   - test:  How many scheduled flights are there in October 2026?
37. cos 0.774 — t-b0001-07 vs q0196
   - train: For each carrier, what is the total number of seats occupied on all their flights in September 2026? Show carriers with no occupied seats as 0.
   - test:  For each airline that had flights in September or October 2026, what percentage of its scheduled seats were occupied in September 2026 and in October 2026? Calculate each percentage from the month's total occupied seats and total capacity, rounded to 2 decimals. Return airline codes, names, and both percentages.
38. cos 0.774 — t-b0006-03 vs q0112
   - train: For each flight in November 2026, show the flight date and the name of the captain.
   - test:  How many flights are scheduled on each date in November 2026? Show dates and flight counts, earliest date first.
39. cos 0.773 — t-b0024-09 vs q0034
   - train: Which carriers had at least one flight in March 2027? Return the carrier names only.
   - test:  List scheduled flights in March 2027, showing airline codes, route numbers, flight dates, aircraft types and seat capacities, sorted by date, then airline code and route number.
40. cos 0.768 — t-b0017-02 vs q0190
   - train: What is the total booking fee for trips in each status? Show the status text and the total fee, rounded to 2 decimals.
   - test:  For each trip status and currency, show the status code, currency, number of trips, and lowest and highest booking fees.
41. cos 0.767 — t-b0017-08 vs q0033
   - train: Which statuses have more than 100 trips? Show the status text and the count.
   - test:  How many trips are there in each status? Show status codes and trip counts.
42. cos 0.765 — t-b0024-04 vs q0098
   - train: For each carrier, show the carrier name and the number of flights in December 2026, including carriers with none shown as 0. Order by the number of flights descending, then by carrier name.
   - test:  For flights in December 2026, list each carrier's name and the number of passengers who requested wheelchair assistance.
43. cos 0.765 — t-b0008-02 vs q0130
   - train: Which agencies arranged trips for customers from Germany in December 2026? Show the agency name and the number of distinct customers, highest number first, then by agency name.
   - test:  For each agency handling trips starting in June 2026, show its number and name and separate trip counts for customers from Germany, the United States, and all other countries.
44. cos 0.764 — t-b0018-03 vs q0052
   - train: What is the longest trip duration in days for each travel status among trips beginning in January 2027? Show the status code and the maximum duration, ordered by status code.
   - test:  For each trip status, show the longest trip starting in October 2026, choosing the lowest trip number if tied. Return the status code, trip number, start and end dates, and the number of days between those dates.
45. cos 0.762 — t-b0001-09 vs q0034
   - train: How many flights did each carrier operate in March 2027? Include carriers with no flights as 0.
   - test:  List scheduled flights in March 2027, showing airline codes, route numbers, flight dates, aircraft types and seat capacities, sorted by date, then airline code and route number.
46. cos 0.762 — t-b0030-03 vs q0101
   - train: For flights in January 2027, what is the total number of empty seats per carrier? Include carriers with flights only.
   - test:  For flights in January 2027, list each carrier's name and the number of pets transported in the cabin.
47. cos 0.762 — t-b0025-07 vs q0056
   - train: List the distinct carriers that have bookings with a flight date in October 2026, ordered by carrier ID ascending.
   - test:  For flights in October 2026, list each carrier's name and the number of distinct pilots assigned to its flights.
48. cos 0.760 — t-b0018-05 vs q0164
   - train: For trips starting in September 2026, categorize each trip as 'Short' if it lasted 0 to 3 days, 'Medium' if 4 to 7 days, and 'Long' if more than 7 days. Count the number of trips in each category, ordered by category name.
   - test:  For trips starting in June 2026, how many lasted under 7 days, 7 to 13 days, or at least 14 days? Return each status code and the three counts, measuring duration as the days between start and end.
49. cos 0.759 — t-b0022-03 vs q0237
   - train: How many trips start in the first quarter of 2027?
   - test:  On how many different dates are flights scheduled in the first quarter of 2027?
50. cos 0.755 — t-b0008-08 vs q0024
   - train: Which agencies arranged trips with status 'Booked' in January 2027? Show the agency name and the number of booked trips, highest number first, then by agency name.
   - test:  Which 10 agencies handled the most trips overall? Return agency numbers and names, total trips, and separate counts for trips starting in the fourth quarter of 2026, the first quarter of 2027, and all other periods. Sort by total trips, highest first, then by agency number.
51. cos 0.749 — t-b0023-02 vs q0065
   - train: Show the carrier names and the number of flights for the two carriers with the most flights in January 2027. Sort by number of flights descending, then by carrier name.
   - test:  For flights scheduled in January 2027, list each carrier's name and the number of flights canceled because of mechanical problems.
52. cos 0.748 — t-b0030-01 vs q0098
   - train: For each carrier that has flights in December 2026, show the carrier name and the total number of occupied seats on their flights that month.
   - test:  For flights in December 2026, list each carrier's name and the number of passengers who requested wheelchair assistance.
53. cos 0.748 — t-b0001-01 vs q0227
   - train: For each airline that has flights in September 2026, show the airline name and the total number of flights, sorted by the most flights first.
   - test:  At each departure airport that has flights scheduled in October 2026, which airline scheduled the most flights in October 2026? Include all airlines tied for first. Return airport codes and names, airline codes and names, and flight counts.
54. cos 0.747 — t-b0008-07 vs q0204
   - train: For each agency, show the agency name and the number of distinct customers they served in September 2026, only for agencies that served at least 2 customers. Order by number of customers descending, then by agency name.
   - test:  Which 10 agencies have served the most distinct customers? Show agency numbers and customer counts, highest count first, then by agency number.
55. cos 0.746 — t-b0026-04 vs q0016
   - train: For each carrier in September 2026, show the average number of minutes between scheduled and actual arrival time, including carriers with no flights as 0.
   - test:  For flights departing in July 2026, list each carrier's name and average departure delay in minutes, rounded to 2 decimals.
56. cos 0.746 — t-b0026-09 vs q0064
   - train: For each airport in November 2026, what percentage of departing flights left within 15 minutes of their scheduled time?
   - test:  For November 2026, list each departure airport's name and its average security screening wait in minutes, rounded to 2 decimals.
57. cos 0.745 — t-b0003-02 vs q0142
   - train: Which carriers have more than 5 flights in September 2026? Show carrier name and the number of flights.
   - test:  For flights in September 2026, list each carrier's name and the number of onboard medical emergencies.
58. cos 0.742 — t-b0030-09 vs q0034
   - train: What is the average number of empty seats per flight for each carrier in March 2027? Show carriers with at least one flight only, ordered by carrier name.
   - test:  List scheduled flights in March 2027, showing airline codes, route numbers, flight dates, aircraft types and seat capacities, sorted by date, then airline code and route number.
59. cos 0.741 — t-b0015-06 vs q0050
   - train: In November 2026, for each carrier show the carrier name and the number of flights in three price bands: 'budget' (under 300), 'standard' (300 to under 1000), and 'premium' (1000 or more). Show only carriers that have at least one flight in every band.
   - test:  For each carrier with flights in November 2026, how many flights were at least 90% full and how many were below 90% full? Return carrier codes, names, and both flight counts.
60. cos 0.741 — t-b0028-03 vs q0103
   - train: In February 2027, for each carrier that had bookings, how many distinct customers flew with them? Show carrier name and distinct customer count, ordered by carrier name.
   - test:  For flights in February 2027, list each carrier's name and the number of customer complaints about cabin cleanliness.
61. cos 0.717 — t-b0022-07 vs q0129
   - train: How many trips begin in February 2027 and have the status 'Booked'?
   - test:  Which trips starting in February 2027 continue into March or beyond? Return trip numbers, start dates, end dates, and the number of days between the start and end.
62. cos 0.659 — t-b0030-00 vs q0018
   - train: What is the total number of available seats on all flights in September 2026?
   - test:  How many loyalty points did customers redeem for flight bookings made in September 2026?
63. cos 0.594 — t-b0014-00 vs q0045
   - train: Which seat numbers on Lufthansa flight LH 402 from Frankfurt to Newark on October 15, 2026 are still free?
   - test:  Which 10 flights in October 2026 have the most unoccupied seats? Return airline codes and names, connection numbers, dates, departure and arrival airport codes, and unoccupied seat counts, most unoccupied seats first, then by date, airline code, and connection number.
64. cos 0.604 — t-b0013-06 vs q0185
   - train: For each supplement category, what is the maximum price paid in EUR?
   - test:  What are the lowest and highest catalog prices in each add-on category and currency with at least one catalog entry? Return category codes, currencies, and both prices.
65. cos 0.713 — t-b0024-02 vs q0101
   - train: For each carrier, show the carrier name and the total number of flights in the first quarter of 2027, including carriers with none shown as 0.
   - test:  For flights in January 2027, list each carrier's name and the number of pets transported in the cabin.
66. cos 0.642 — t-b0003-00 vs q0069
   - train: Which agencies have more than 3 travels with total price over 1000 in their local currency? Show agency name and the number of such travels.
   - test:  Which 10 agencies have the most trips? Show agency numbers and trip counts, most trips first, then by agency number.
67. cos 0.674 — t-b0028-02 vs q0265
   - train: Which three carriers had the most distinct customers booking flights in the first quarter of 2027? Return carrier name and distinct customer count, sorted by the count descending, then by carrier name.
   - test:  How many different customers have flight bookings with each airline that has flight bookings? Show airline codes and customer counts.
68. cos 0.556 — t-b0006-05 vs q0129
   - train: How many flights in February 2027 had a co-pilot with more than 10 years of experience?
   - test:  Which trips starting in February 2027 continue into March or beyond? Return trip numbers, start dates, end dates, and the number of days between the start and end.
69. cos 0.722 — t-b0030-08 vs q0021
   - train: What is the total number of seats occupied on flights departing from Frankfurt in October 2026?
   - test:  How many scheduled flights are there in October 2026?
70. cos 0.686 — t-b0022-02 vs q0112
   - train: How many trips start in November 2026 and have the status 'New'?
   - test:  How many flights are scheduled on each date in November 2026? Show dates and flight counts, earliest date first.
71. cos 0.565 — t-b0013-01 vs q0300
   - train: For each supplement category, how many supplements were booked in EUR?
   - test:  For each category of available extras, how many different prices are offered in each currency? Show category codes, currency codes and distinct price counts.
72. cos 0.653 — t-b0029-05 vs q0062
   - train: What are the 4 cheapest flights in February 2027, in EUR? Show carrier, connection, date and price; order by price ascending, then by date.
   - test:  For flights in February 2027, list each carrier's name and the number of flights that used a jet bridge for boarding.
73. cos 0.727 — t-b0007-00 vs q0126
   - train: Which carriers had no flights in November 2026? Return carrier names.
   - test:  For each airline, how many flights in October 2026 have no bookings? Return airline codes, names, and flight counts, including only airlines with such flights.
74. cos 0.715 — t-b0002-02 vs q0077
   - train: What is the average price of flights in September 2026?
   - test:  What are each airline's lowest and highest listed flight prices in September 2026, separately by currency, for airlines with flights in that month? Return airline codes, names, currencies, and both prices.
75. cos 0.347 — t-b0013-05 vs q0010
   - train: What is the total supplement revenue in USD for the category 'ML'?
   - test:  Which 10 combinations of add-on category and currency have the most add-on entries attached to bookings? Return the category code, currency code, entry count, and total recorded add-on price in that currency. Sort by entry count from highest to lowest, then by category code ascending, then by currency code alphabetically.
76. cos 0.569 — t-b0006-04 vs q0237
   - train: Which pilot has the most total flight hours across all flights in the first quarter of 2027?
   - test:  On how many different dates are flights scheduled in the first quarter of 2027?
77. cos 0.685 — t-b0026-08 vs q0021
   - train: How many flights in October 2026 were delayed by more than one hour due to weather?
   - test:  How many scheduled flights are there in October 2026?
78. cos 0.740 — t-b0022-08 vs q0163
   - train: What is the total booking fee for trips that start in October 2026 in EUR?
   - test:  For each trip starting in October 2026, show its first flight booking, choosing the lowest booking number if several were made on the same day. Return the trip number, booking number, booking date, flight date, airline name, price, and currency.
79. cos 0.622 — t-b0003-01 vs q0146
   - train: Which agencies have at least 2 travels with booking fee less than 50? Show agency name and the count.
   - test:  How many travel agencies are listed?
80. cos 0.510 — t-b0016-06 vs q0124
   - train: How many connections does Lufthansa have arriving in Munich?
   - test:  Which 10 departure-country and arrival-country pairs have the most listed connections? Count each airline's numbered connection separately and keep each direction separate. Return both country codes and connection counts, most connections first, then by departure country and arrival country.
