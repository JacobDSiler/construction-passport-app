# Construction Passport (CP) — project brief for Claude Code

Owner: Jacob Siler (SilerTech Ireland), developer and Secretary for Prime Management 18 / Prime Peak Limited (CRO 777439, director Sam Michael O'Sullivan). The app is released under Prime Management on Google Play and the Apple App Store.

The original Expo source was lost with a locked home PC. This repo is a **rebuild of the front end**, modelled on the live web build and phone screenshots. The Supabase backend is unchanged and live.

## Visual reference (look at these before building any screen)
`docs/reference/` holds screenshots of the live app: `phone-*` (Jacob's own phone) and `web-*` (live web build at phone size; `web-employer-*` and `web-trainer-*` are the screens still to build). View the matching image before writing or changing a screen and match its layout, spacing, copy and colours (navy header #1E4D7B, light blue-grey background, white rounded cards). Text descriptions are in "Live app map" below. Screens with no image: Hazards form, Timesheet, Inspections, Expenses (worker side; already built from Jacob's earlier screenshots).

## Working rules
- GitHub is the source of truth. Work in small commits on `main` and push after each working batch.
- Before every push: `npx tsc --noEmit` must be clean and `npx expo export --platform android --output-dir /tmp/exp` must succeed.
- Never commit `.env`. Never use or ask for a Supabase `service_role` key. The anon key is a public client key and goes in `EXPO_PUBLIC_SUPABASE_ANON_KEY` (with `EXPO_PUBLIC_SUPABASE_URL=https://untoyialszpcvpsqujsy.supabase.co`) from env, not from the repo.
- Jacob does not want to run git or the command line. Handle git, builds and CI yourself.
- Do not invent backend behaviour. The RPC list in `docs/BACKEND_CONTRACT.md` is the only known contract. Where a return shape is unknown, read defensively (see `extractOrgCode` in `src/lib/api.ts`) and say so in the commit message.
- Any user-facing text drafted for Jacob must read as his own writing: no em-dashes, no AI tone.

## Stack
Expo SDK 58, React Native 0.88, expo-router, TypeScript strict, Supabase JS, EAS Build/Submit. `.github/workflows/release.yml` builds Android and iOS on tags `v[0-9]+.0.0` (tag must equal `app.json` version) and auto-submits. Needs secrets: `EXPO_TOKEN`, `PLAY_SERVICE_ACCOUNT_JSON`, Apple key, and Supabase env set in EAS.

## Architecture
- No user accounts in the backend. A device has an **owner token** (64-hex, key `cp.ownerToken.v1`, SecureStore) used as `p_owner_token`. Workers have a **short code** from `publish_passport`. Companies use a **setup token** (`cp.setupToken.v1`) plus an org code.
- Photos go to the public bucket `certs`; the `x-cp-folder` header (first 24 alnum chars of the token) is added in `src/lib/supabase.ts`.
- Local-first: passport, timesheet and records live in AsyncStorage (`src/lib/store.tsx`, `src/lib/records.ts`). Shared passports republish after edits (2.5s debounce).
- Session/role: `src/lib/session.tsx` (worker | company | trainer). Email accounts: `src/lib/account.ts`, which stores the owner token in Supabase auth user metadata `cp_owner_token`. **This scheme is my own design; the old app's scheme is unknown.** If Jacob's old email login does not restore his passport, ask for what the old app does (the live web app at https://construction-passport.netlify.app can be inspected in a browser) and adapt `account.ts`.
- Public share URL: `https://construction-passport.netlify.app/?p=<CODE>`.

## Screens built (app/)
Welcome, role picker, login, worker setup steps 1 to 6 (setup-worker, setup-photo, setup-ticket x2, setup-tickets, setup-done), setup-company, setup-trainer; worker tabs: Passport, Share, Timesheet, Inspections, Hazards, Profile; add-qualification, qualification/[id], day-off, job-sheet, expenses, support, checkin, claim; company (code, crew, sites) and trainer (course list) homes are basic.

## To build next (in this order)
1. **Company side:** crew approvals (`accept_crew`, `add_crew_member`, `remove_crew_member`, `set_crew_member_meta`), sites (`create_site`, `delete_site`), review crew passports and timesheets (`get_timesheet`, `get_passport`), expenses review (`list_expenses`, `set_expense_status`), hazards (`list_hazards`, `resolve_hazard`), provisioned workers (`provision_worker`, `list_provisioned`, `delete_provisioned`), employer cert upload (`employer_upload_cert`).
2. **Trainer side:** create/delete/list courses, enrolments (`list_enrollments`, `remove_enrollment`), student questionnaires, post certs, `suggest_course`.
3. **Certifier role** (`certifier_login`, `list_review_passports`, `certify_passport`, `revoke_certification`).
4. Weekly default schedule and "fill today from default", expense submission to employer, timesheet org-code sync, second language, training course search/enrol, site audits.
5. Real Smart Scan (auto-crop) needs a dev/native build; today it is camera plus crop via expo-image-picker.
6. Monetization (below).
7. Remove old tab files if present: `app/(tabs)/crew.tsx`, `settings.tsx`, `timesheets.tsx`.

## Monetization plan (agreed direction, prices not final)
- 90 days free with everything. Passport and sharing are free forever. Timesheets and other working features are paid after the trial. Job search for job seekers is free and later (check Irish employment-agency rules and GDPR with a solicitor first).
- Individual users: 3.80 EUR/month via store in-app purchase (Apple requires IAP; Google Play Billing).
- Companies: tiers by employee count, billed on the web (Apple 3.1.3(c)); prices to be agreed with Sam. Do not invent prices.
- Every shared or exported passport/timesheet carries "Provided by Construction Passport (Prime Management 18)" plus a get-the-app link (`src/lib/attribution.ts`; store URLs still blank).
- Current state: `src/lib/entitlements.ts` has a client-side 90-day trial and a Timesheet paywall. Needs server-side trial start and subscription state, IAP, company billing.

## Outstanding items only Jacob/Sam can do
Play Console identity verification, Apple organisation enrolment (Sam's Apple Account), Paul the accountant's registration document, company tier prices, store listing, privacy policy and data safety forms, EAS `eas init`, and the secrets listed above.

## Live app map (recorded from https://construction-passport-web.netlify.app in guest mode, Nov 2026)
The real web app is at construction-passport-web.netlify.app (expo-router, real paths). construction-passport.netlify.app is only the public passport viewer (`?p=<CODE>`; guests with no short code use `?d=<base64 json>` with v, id, name, trade, employer, photo, level, status, quals).
- Browser storage keys: `cp.profile.v1` ({role: worker|employer|trainer, orgName}), `cp.worker.v1`, `cp.ownerToken.v1`, `cp.orgCode.v1`, `cp.crew.v1`. Role value for companies is "employer".
- Welcome: language button (Romanian, Russian, Ukrainian, Polish, Lithuanian, Portuguese, French, Italian, Spanish, Irish, Filipino; English always shown alongside the chosen language, "show a second language next to English so the crew can help each other"), Create account, Log in, "Just try it on this device" (guest: no email/password anywhere).
- Worker tabs: Passport, Share, Timesheet, Inspections, Hazards, Profile. Passport has Show My Passport (QR) and Report a Hazard. Worker Profile: Using as (Switch), Check-in, Support, Language, profile form with Change photo, crews, Have a claim code, Join a training course (course code, address for cert, questionnaire answers), Training suggestions, Save my passport (backup), Certifier access (Unlock certifier), Send feedback, Privacy policy.
- Employer tabs: Crew (code EA9643-style 6-char crew/org code; Add a worker by scanning QR or entering the worker passport code; Employee or Subcontractor; On the crew or Not on a crew; greenlight tickets), My Passport, Share, Hazards (To action / Resolved counts, reports to resolve), Profile.
- Employer Profile rows: Manage sites (/sites: crew code, share code, add site name and optional location; weather later), Companies you've set up (/companies: create a company for a client or tester, hand them a claim code), Have a company claim code, Set up worker passports (/provision, /provision-worker: name, trade, type, crew status, tickets Safe Pass, Manual Handling, CSCS Card, First Aid, MEWP (IPAF), Abrasive Wheels, Working at Heights, Confined Space, Add another; "Create passport & get code"), Crew expenses (/crew-expenses: company expenses submitted on the crew code, total in EUR), Job sheet (/job-sheet), Site diary (/site-diary: site, weather, crew on site, work carried out, deliveries, delays, visitors, notes, time-stamped photos, recent entries), Site audit (/site-audit: name, site, location with use my location, weather, then a list of points with photo, reorder, add next point, Save and export PDF), Support, Certifier access, Send feedback, Privacy policy.
- Trainer tabs: Courses (New course: course, pre-training questionnaire, join code for students; students enrol with postal address and answers), My Passport, Profile.
- Worker onboarding (done in this repo): 1 name, trade, claim code (email and password on the create-account path); 2 photo; 3 Safe Pass; 4 Manual Handling; 5 any other tickets (CSCS Card, First Aid, MEWP / Cherry Picker, Forklift, Teleporter, Abrasive Wheels, Other); 6 "You're all set".
- The role/Switch button on Profile did nothing for me in a browser; do not assume how it works.
- A labelled test company "ZZ TEST COMPANY (Claude demo, delete me)" was created on the live backend, crew code EA9643. Do not rely on it.

- Trainer new course form (/course/new, reached from Courses > New course): Course name; Training provider / instructor (prefilled with business name); "Renews which ticket?" chips (Safe Pass, Manual Handling, CSCS, First Aid, MEWP (IPAF), Abrasive Wheels, Working at Heights, Confined Space, Other) so expiring tickets can be suggested; Where is it held?; Sign-up details (booking link, phone, instructions); Price (optional); Session dates (YYYY-MM-DD plus optional start time, Add date); Pre-training questionnaire (question text; Text answer, Yes / No or Multiple choice; Add question); List in course search toggle (on by default); "Create course & get join code". See web-trainer-02..04.
- Certifier unlock lives at the bottom of Profile: a "Certifier passcode" field and "Unlock certifier" button (web-employer-05).
- Web app routes seen: /, /mypassport, /share, /hazards, /profile, /crew/add, /sites, /provision, /provision-worker, /crew-expenses, /site-diary, /site-audit, /job-sheet, /companies, /course/new.
