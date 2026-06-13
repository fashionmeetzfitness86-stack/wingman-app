-- 0002_add_lead_columns.sql
-- ─────────────────────────────────────────────────────────────
-- Migration to add profile_created, user_id, status columns to
-- passcode_leads, and create platform_settings and user_profiles.
--
-- Apply via: Supabase Dashboard > SQL Editor (paste & run).

-- ── 1. Update passcode_leads ───────────────────────────────────
alter table public.passcode_leads
  add column if not exists profile_created boolean not null default false,
  add column if not exists user_id text,
  add column if not exists status text not null default 'temporary_access';

create index if not exists passcode_leads_user_idx
  on public.passcode_leads (user_id);

-- ── 2. Create platform_settings ─────────────────────────────────
create table if not exists public.platform_settings (
  key        text primary key,
  value      jsonb,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

alter table public.platform_settings enable row level security;

-- Insert default passcode if not exists
insert into public.platform_settings (key, value, updated_at)
values ('access_passcode', '"WINGMAN2025"'::jsonb, now())
on conflict (key) do nothing;

-- ── 3. Create user_profiles ────────────────────────────────────
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
