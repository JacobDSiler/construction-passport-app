# Construction Passport (CP) — project brief for Claude Code

Owner: Jacob Siler (SilerTech Ireland), developer and Secretary for Prime Management 18 / Prime Peak Limited (CRO 777439, director Sam Michael O'Sullivan). The app is released under Prime Management on Google Play and the Apple App Store.

The original Expo source was lost with a locked home PC. This repo is a **rebuild of the front end**, modelled on the live web build and phone screenshots. The Supabase backend is unchanged and live.

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
Welcome, role picker, login, setup-worker (step 1 of 6 only), setup-company, setup-trainer; worker tabs: Passport, Share, Timesheet, Inspections, Hazards, Profile; add-qualification, qualification/[id], day-off, job-sheet, expenses, support, checkin, claim; company (code, crew, sites) and trainer (course list) homes are basic.

## To build next (in this order)
1. **Company side:** crew approvals (`accept_crew`, `add_crew_member`, `remove_crew_member`, `set_crew_member_meta`), sites (`create_site`, `delete_site`), review crew passports and timesheets (`get_timesheet`, `get_passport`), expenses review (`list_expenses`, `set_expense_status`), hazards (`list_hazards`, `resolve_hazard`), provisioned workers (`provision_worker`, `list_provisioned`, `delete_provisioned`), employer cert upload (`employer_upload_cert`).
2. **Trainer side:** create/delete/list courses, enrolments (`list_enrollments`, `remove_enrollment`), student questionnaires, post certs, `suggest_course`.
3. **Certifier role** (`certifier_login`, `list_review_passports`, `certify_passport`, `revoke_certification`).
4. Worker setup steps 2 to 6 (ask Jacob for screenshots), weekly default schedule and "fill today from default", expense submission to employer, timesheet org-code sync, second language, training course search/enrol, site audits.
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
