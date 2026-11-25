# Rebuild progress

Last updated: 2026-11-25

Order follows CLAUDE.md "To build next", with the batch order you set: trainer, site diary and audit, certifier.

## Done
- Company side (merged from laptop work, `c038e45`): crew, sites, hazards, expenses, provisioning, setup flows.
- Trainer side (`c4128a3`): course list, delete course, enrolments per course, remove a student.
- Site diary and site audit (`83e1f5a`): local to the device. Audit is a generic 12-point starting checklist, scored as the share of applicable checks passed.
- Certifier role (this batch): sign in with a certifier code (`certifier_login`), review list (`list_review_passports`), certify (`certify_passport`) and revoke (`revoke_certification`). Code is kept in the keychain.

## Not built because the backend contract has no matching RPC
- **Create course.** No `create_course` in BACKEND_CONTRACT.md.
- **Post certs from a trainer.** No trainer-side RPC for this. `employer_upload_cert` is the company version.
- **Suggest a course** from the trainer side (`suggest_course` is worker-side; trainer inbox unknown).
- **Site diary and site audit sync.** No RPC for either. They stay on the device until a backend decision is made.

## Needs your input
1. **Create course and post certs.** Which RPC does the old app use for these? Check the live web app (https://construction-passport.netlify.app) or give me the function names and arguments.
2. **Site diary and audit.** Should they sync to the company, and if so which RPC? Or stay device-only?
3. **Certifier code.** Where do certifier codes come from (issued by you, or by the backend)? And what does `certifier_login` return on success? The app treats null, false or empty as refused and anything else as a sign-in. Confirm this matches.
4. **Row shapes.** Enrolment rows, `list_review_passports` rows and the course row fields are not documented. The screens read them defensively. A screenshot of the old app's trainer and certifier screens would let me match the fields exactly.
5. **Certifier entry point.** I added a link on the role picker, "I'm a certifier · I have a code". Say if you'd rather it sat somewhere else.
6. **Supabase anon key.** There is still no `.env` in the repo, so I verify builds, not live backend calls. Add it locally for live testing.

## Checks before every push
- `npx tsc --noEmit`: clean.
- `npx expo export --platform android`: clean.
