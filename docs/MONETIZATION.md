# Construction Passport: monetization plan (draft for Sam)

Provided by Construction Passport (Prime Management 18).

## The rule in one line
90 days free with everything on. After that, the Passport stays free forever; timesheets and working features need a subscription.

## What is free forever
- Worker Passport: certificates, expiry reminders, QR / share link.
- Public job search for job seekers (see below).
- Read-only access to your own past data. Nobody ever loses records.

## What is behind the paywall after day 90
- Timesheets (clocking, edits, approvals, payroll CSV export).
- Crew / company management: roles, job sites, assigning workers, compliance dashboards.
- Bulk cert checks and company-wide expiry alerts.

## The trial
- 90 days from the day a company (or a solo worker) first signs up. No card needed.
- Day 75 and day 85 reminders. On day 91 the paywalled features become read-only and export still works. Nothing is deleted.
- Because no card is taken up front there is no auto-charge, which keeps us clear of EU/Irish consumer-law traps around trials that roll into paid plans.

## Who pays (mixed model)
1. Company plan (main revenue): the employer pays per company, tiered by active workers. Sold and billed on the web (Stripe), not through the app stores. Apple's rules (guideline 3.1.3(c), enterprise services sold directly to organisations) allow this; confirm wording at submission.
2. Individual plan: 3.80 EUR/month for any user who is not backed by a company (self-employed, sub-contractors, workers whose employer has not subscribed). It unlocks the same timesheet and working features for that one person. This one must go through Apple/Google in-app purchase. Under their small-business programs the fee is expected to be 15%, so roughly 3.23 EUR lands with us per subscriber (to be confirmed when enrolling). If a worker later joins a subscribed company, their individual plan stops renewing.

Company plan: tiers by number of employees. Prices still to agree with Sam. Starting bands to price (placeholders, not market-tested):
- Crew: 1 to 10 employees
- Site: 11 to 40 employees
- Company: 41 to 150 employees
- Large: 150+, quoted individually
Sanity check for pricing: the company price per worker should sit clearly below 3.80 EUR, otherwise a company's workers are better off buying individually. For example, 10 workers at 3.80 is 38 EUR/month, so the Crew tier needs to come in under that to make the company plan the obvious choice.

## Attribution and call to action (always on, every plan)
Every shared or exported Passport and every timesheet (PDF, link, CSV header, printed page) must carry:
- the line "Provided by Construction Passport (Prime Management 18)"
- a clear call to action: "Get the app" with the store links and the web address
This is what turns every worker who shows a passport to a site manager into a lead. It is not removable on any plan.

## Job search for job seekers
Goal: workers and job seekers can browse jobs in a legal, safe layout. Build rules:
- Free for seekers. Never charge a seeker to see or apply for a job.
- Employers post vacancies; seekers apply to the employer directly. Prime Management does not place or recommend workers for a fee, which is what keeps it a job board, not a recruitment agency. Ireland licenses employment agencies under the Employment Agency Act 1971, so check this line with a solicitor or the Department of Enterprise before launch (we are not lawyers).
- No discriminatory wording in listings (Employment Equality Acts: age, gender, nationality, disability, etc.). Add a posting checklist and a report button.
- Show pay range, location, employment type, and the employer's legal name on every listing.
- GDPR: seekers choose what a listing-owner sees (passport share is opt-in per application), a privacy notice, delete-my-data, retention limits.
- Listings expire after 30 days unless renewed.

## Open decisions for Sam
1. Company tier prices and employee bands (individual plan is set at 3.80 EUR/month).
2. Whether the individual plan launches on day one or later.
3. Whether job posting is free for employers or part of the company plan.
