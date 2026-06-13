-- 0001_persistence.sql
-- ─────────────────────────────────────────────────────────────
-- Server-side persistence for Wingman: confirmed Stripe bookings,
-- passcode-gate leads, platform settings, and user profiles.
-- These tables are written ONLY by Netlify functions using the
-- service_role key (which bypasses RLS), so RLS is enabled with
-- no public policies — the anon/browser key cannot read or write them.
--
-- Apply via: Supabase Dashboard > SQL Editor (paste & run),
-- or `supabase db push` if you use the Supabase CLI.

-- ── Confirmed bookings (written by stripe-webhook) ───────────────
create table if not exists public.confirmed_bookings (
  id                 uuid primary key default gen_random_uuid(),
  stripe_session_id  text unique not null,
  user_id            text,
  customer_email     text,
  amount_total_cents integer not null default 0,
  currency           text not null default 'usd',
  cart_context       jsonb,
  confirmed_at       timestamptz not null default now(),
  created_at         timestamptz not null default now()
);

create index if not exists confirmed_bookings_email_idx
  on public.confirmed_bookings (customer_email);
create index if not exists confirmed_bookings_user_idx
  on public.confirmed_bookings (user_id);

alter table public.confirmed_bookings enable row level security;
-- No policies = locked to service_role only. (Intentional.)

-- ── Passcode leads (written by capture-lead) ─────────────────────
create table if not exists public.passcode_leads (
  id              uuid primary key default gen_random_uuid(),
  email           text unique not null,
  full_name       text,
  captured_at     timestamptz not null default now(),
  created_at      timestamptz not null default now(),
  profile_created boolean not null default false,
  user_id         text,
  status          text not null default 'temporary_access'
);

create index if not exists passcode_leads_captured_idx
  on public.passcode_leads (captured_at desc);
create index if not exists passcode_leads_user_idx
  on public.passcode_leads (user_id);

alter table public.passcode_leads enable row level security;
-- No policies = locked to service_role only. (Intentional.)

-- ── Platform Settings (passcode, configs) ────────────────────────
create table if not exists public.platform_settings (
  key        text primary key,
  value      jsonb,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

alter table public.platform_settings enable row level security;
-- No policies = locked to service_role only. (Intentional.)

-- Insert default passcode if not exists
insert into public.platform_settings (key, value, updated_at)
values ('access_passcode', '"WINGMAN2025"'::jsonb, now())
on conflict (key) do nothing;

-- ── User Profiles (written by register-profile) ──────────────────
create table if not exists public.user_profiles (
  id              text primary key,
  name            text not null,
  email           text unique not null,
  phone           text,
  city            text,
  gender          text,
  profile_photo   text,
  approval_status text not null default 'pending',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists user_profiles_email_idx
  on public.user_profiles (email);

alter table public.user_profiles enable row level security;
-- No policies = locked to service_role only. (Intentional.)
