# Billing setup (server side)

Individual plan: 3.80 EUR/month through the stores. Company plans: tiers by worker count, paid on the web with Stripe.
Nothing here is live until the steps below are done. Do all of it in Stripe TEST mode first.

## What is in the repo
- `supabase/migrations/001_billing.sql`: trial and subscription tables, `get_entitlement` (starts the 90-day trial on the server), `get_company_billing`.
- `supabase/functions/create-checkout`: makes a Stripe Checkout Session for a company.
- `supabase/functions/stripe-webhook`: Stripe tells us who has paid; the app never decides that.
- `web/employer-pay/index.html`: the employer package page. It is not linked from the iOS or Android app.

## Steps (Sam and Jacob)
1. Stripe: create the account for Prime Peak Limited (Sam as account owner), stay in test mode, create one recurring monthly Product per tier. Copy each Price id.
2. Supabase SQL editor: paste and run `001_billing.sql`.
3. Supabase CLI: set secrets, then deploy both functions (webhook with `--no-verify-jwt`).
   `supabase secrets set STRIPE_SECRET_KEY=... STRIPE_WEBHOOK_SECRET=... SITE_URL=https://primemanagement18.com PRICE_TIER_1=price_... PRICE_TIER_2=... PRICE_TIER_3=... PRICE_TIER_4=...`
4. Stripe webhook endpoint: `https://untoyialszpcvpsqujsy.supabase.co/functions/v1/stripe-webhook`, events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`.
5. Put the page on the website at /employer-pay/ and paste the public anon key into it.
6. Test with Stripe's test card 4242 4242 4242 4242, then check the row appears in `company_billing`.
7. Only after that: Stripe live keys.

## Known limits, on purpose
- The trial belongs to the owner token. A fresh install with no account backup counts as a new person.
- Worker coverage by an employer's plan is not wired yet: it needs a crew-membership check on the server, and the crew table's shape is not in the backend contract. Do not trust a client-supplied org code for this.
- Individual store purchases must be verified server-side before `store_status` is set. Plan: RevenueCat (or Apple and Google server notifications) writing to `user_entitlements` with the service role.
- Tier names, worker bands and prices are drafts for Sam and Jacob to agree.
- Do not link to this page from either store app.
