# Release pipeline setup

Tag a major version and both stores get a build:

    git tag v2.0.0 && git push origin v2.0.0

The workflow (.github/workflows/release.yml) checks the tag matches expo.version in app.json, then runs `eas build --profile production --auto-submit-with-profile=ci` for Android and iOS. EAS builds in the cloud, so no Mac is needed.

## Secrets to add (GitHub repo > Settings > Secrets and variables > Actions)
- EXPO_TOKEN: expo.dev > Account settings > Access tokens.
- PLAY_SERVICE_ACCOUNT_JSON: Play Console service account key (Setup > API access) with release permissions. Needs the Prime Peak organisation Play account to be verified first.

## Apple (one-off, done once the organisation account exists)
1. In App Store Connect create the app with the iOS bundle ID from app.json.
2. Create an App Store Connect API key (Users and Access > Integrations) and give it to EAS: run `eas credentials` (iOS) and add it, or put `ascApiKeyPath`, `ascApiKeyIssuerId` and `ascApiKeyId` in the `ci` submit profile in eas.json.
3. Run `eas build -p ios --profile production` by hand once so EAS creates the distribution certificate and provisioning profile.

## First Android upload is manual
Google requires the very first AAB to be uploaded by hand in the Play Console. After that CI takes over.

## eas.json expectations
- `build.production` has `autoIncrement: true` (store build numbers).
- `submit.ci.android` uses `serviceAccountKeyPath: ./play-service-account.json` and `track: internal`.
- `submit.ci.ios` points at the App Store Connect API key above.

## Never commit
play-service-account.json, .env files, keystores, API keys. Add them to .gitignore.
