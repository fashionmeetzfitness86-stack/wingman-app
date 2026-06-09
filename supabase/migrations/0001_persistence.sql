-- 0001_persistence.sql
-- ─────────────────────────────────────────────────────────────
-- Server-side persistence for Wingman: confirmed Stripe bookings
-- and passcode-gate leads. Both tables are written ONLY by Netlify
-- functions using the service_role key (which bypasses RLS), so RLS
-- is enabled with NO public policies — the anon/browser key cannot
-- read or write these tables. Read them from the Supabase dashboard
-- or a server-side admin view.
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
  id          uuid primary key default gen_random_uuid(),
  email       text unique not null,
  full_name   text,
  captured_at timestamptz not null default now(),
  created_at  timestamptz not null default now()
);

create index if not exists passcode_leads_captured_idx
  on public.passcode_leads (captured_at desc);

alter table public.passcode_leads enable row level security;
-- No policies = locked to service_role only. (Intentional.)
