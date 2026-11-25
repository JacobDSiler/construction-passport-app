# Rebuild progress

Last updated: 2026-11-25

Order follows CLAUDE.md "To build next", with the batch order you set: trainer, site diary and audit, companies. All three are done; the next items are on CLAUDE.md's list (worker setup, weekly schedule, etc.).

## Done
- Trainer, new and edit course (`1e04a02`): form matches docs/reference/web-trainer-02..04. create_course and update_course argument lists were read from the live web bundle and added to BACKEND_CONTRACT.md. Live bundle also calls four RPCs whose arguments are not read yet: new_owner_token, restore_passport, submit_expense, submit_hazard.
- Site diary and site audit (this batch): rebuilt to match web-employer-08 and -09. Both are on the employer Profile, as in the live app. Audit is built from user-added points (pass, fail or N/A, defect text for a fail). Device-only.
- Companies you have set up (this batch): list, set up a new company (name, trade), claim code shown with copy, delete. Matches web-employer-12. Claim code field name in list_companies rows is read defensively (claim_code or claimCode); not confirmed.
- Company side (merged from laptop work, `c038e45`): crew, sites, hazards, expenses, provisioning, setup flows.
- Trainer side (`c4128a3`): course list, delete course, enrolments per course, remove a student.
- Certifier role (this batch): sign in with a certifier code (`certifier_login`), review list (`list_review_passports`), certify (`certify_passport`) and revoke (`revoke_certification`). Code is kept in the keychain.

## Not built because the backend contract has no matching RPC
- **Post certs from a trainer.** No trainer-side RPC for this. `employer_upload_cert` is the company version.
- **Suggest a course** from the trainer side (`suggest_course` is worker-side; trainer inbox unknown).
- **Site diary and site audit sync.** No diary or audit RPC in the live bundle either. They stay on the device.
- **Older checklist audits** ("Older checklist audits" link on the live audit page). Not built; the content is unknown.
- **Time-stamped photos** on diary and audit points. Not built.
- **PDF export** of audits. Not built.

## Needs your input
1. **Post certs from a trainer.** The live bundle has no trainer-side cert RPC. Which one does the old app use, or is it done by the worker's own upload?
2. **Site diary and audit.** Should they sync to the company, and if so which RPC? Or stay device-only?
3. **Certifier code.** Where do certifier codes come from (issued by you, or by the backend)? And what does `certifier_login` return on success? The app treats null, false or empty as refused and anything else as a sign-in. Confirm this matches.
4. **Row shapes.** Enrolment rows, `list_review_passports` rows and the course row fields are not documented. The screens read them defensively. A screenshot of the old app's trainer and certifier screens would let me match the fields exactly.
5. **Certifier entry point.** I added a link on the role picker, "I'm a certifier · I have a code". Say if you'd rather it sat somewhere else.
6. **Supabase anon key.** There is still no `.env` in the repo, so I verify builds, not live backend calls. Add it locally for live testing.

## Checks before every push
- `npx tsc --noEmit`: clean.
- `npx expo export --platform android`: clean.
