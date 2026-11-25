# Rebuild progress

Last updated: 2026-11-25

## Baseline (before any rebuild work)
- `npx tsc --noEmit`: clean (exit 0).
- `npx expo export --platform web`: clean (exit 0), 14 web bundles.
- Branch: `claude/ecstatic-allen-6c6vpc` at `d1d06e6`, same commit as `main`.

## Done
- Environment check: dependencies install with `npm ci`, typecheck and web export pass.

## Needs your input
1. **CLAUDE.md is missing.** It is not in the repo, on `main`, or in any commit history. The instructions it was supposed to hold are not available to me.
2. **The "To build next" list is missing.** It is not in CLAUDE.md, `docs/BACKEND_CONTRACT.md`, `docs/MONETIZATION.md`, `docs/SETUP_CI.md` or the README. Please paste it here, or commit the file that holds it, so I can work through it in order, company side first.
3. **Which feature is "company side"?** I can see company-related code: `create_company`, `update_company`, `list_companies`, `delete_company`, `claim_company`, `peek_company`, crew and site RPCs. Confirm this is the scope.
4. **Supabase anon key.** The app needs `EXPO_PUBLIC_SUPABASE_ANON_KEY` in `.env` to talk to the backend. There is no `.env` here, so I can only verify the build, not live calls. Add it locally or tell me if I should not use the backend at all.

## Notes
- The release flow (`docs/SETUP_CI.md`) builds on tags only. These commits do not tag anything.
