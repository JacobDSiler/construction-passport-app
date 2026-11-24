# Construction Passport

Construction Passport (Prime Management 18). Expo SDK 58 / React Native app for Android and iOS (web build too).

## Run it
    npm install
    cp .env.example .env     # add the Supabase anon key
    npx expo start

## Release
Tag a major version that matches expo.version in app.json (for example v2.0.0) and GitHub Actions builds Android and iOS on EAS and submits them. See docs/SETUP_CI.md.

## Docs
- docs/MONETIZATION.md: pricing and paywall plan
- docs/BACKEND_CONTRACT.md: the live Supabase backend as recovered from the old web build
- docs/SETUP_CI.md: secrets and store setup

Provided by Construction Passport (Prime Management 18).
