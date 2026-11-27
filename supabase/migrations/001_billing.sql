-- Construction Passport billing state. Run once in the Supabase SQL editor (Dashboard > SQL).
-- Nothing here is readable by the public app directly: RLS is on with no policies, and the only
-- way in is the security-definer functions below plus the service role (Stripe webhook).

create extension if not exists pgcrypto with schema extensions;

-- Individual plan. Keyed by a hash of the owner token, so the token itself is never stored here.
create table if not exists public.user_entitlements (
  token_hash       text primary key,
  trial_started_at timestamptz not null default now(),
  store_status     text not null default 'none' check (store_status in ('none','active','expired')),
  store_paid_until timestamptz,
  updated_at       timestamptz not null default now()
);

-- Company plan, billed on the web through Stripe.
create table if not exists public.company_billing (
  org_code               text primary key,
  tier                   text,
  status                 text not null default 'none'
                         check (status in ('none','active','past_due','canceled')),
  paid_until             timestamptz,
  stripe_customer_id     text,
  stripe_subscription_id text,
  updated_at             timestamptz not null default now()
);

alter table public.user_entitlements enable row level security;
alter table public.company_billing   enable row level security;

-- The trial starts on the SERVER the first time a token asks, so clearing app data cannot restart it.
-- Limit: a brand-new owner token (fresh install with no account backup) is a new person to the server.
create or replace function public.get_entitlement(p_owner_token text)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  h text;
  e public.user_entitlements;
  trial_end timestamptz;
begin
  if p_owner_token is null or length(p_owner_token) < 32 then
    raise exception 'invalid token';
  end if;
  h := encode(extensions.digest(convert_to(p_owner_token, 'utf8'), 'sha256'), 'hex');
  insert into public.user_entitlements (token_hash) values (h) on conflict do nothing;
  select * into e from public.user_entitlements where token_hash = h;
  trial_end := e.trial_started_at + interval '90 days';
  return jsonb_build_object(
    'trial_started_at', e.trial_started_at,
    'trial_ends_at',    trial_end,
    'trial_active',     now() < trial_end,
    'store_active',     (e.store_status = 'active' and (e.store_paid_until is null or e.store_paid_until > now())),
    'server_time',      now()
  );
end;
$$;

-- Plan status for one company (no customer or Stripe ids are returned).
create or replace function public.get_company_billing(p_org_code text)
returns jsonb
language sql
security definer
set search_path = public
as $$
  select coalesce(
    (select jsonb_build_object(
        'tier', tier,
        'status', status,
        'active', (status = 'active' and (paid_until is null or paid_until > now())),
        'paid_until', paid_until)
       from public.company_billing where org_code = upper(trim(p_org_code))),
    jsonb_build_object('tier', null, 'status', 'none', 'active', false, 'paid_until', null));
$$;

revoke all on function public.get_entitlement(text)      from public;
revoke all on function public.get_company_billing(text)  from public;
grant execute on function public.get_entitlement(text)     to anon, authenticated;
grant execute on function public.get_company_billing(text) to anon, authenticated;
