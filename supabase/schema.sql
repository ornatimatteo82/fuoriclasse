-- ============================================================================
-- FUORICLASSE (GAEL LEAGUE & QUIZZOCAMPO) — SCHEMA DATABASE SUPABASE
-- Incolla questo script nell'SQL Editor di Supabase (https://supabase.com/dashboard)
-- e clicca "RUN" per creare la tabella profili, la classifica e i permessi RLS.
-- ============================================================================

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null default 'Mister Fuoriclasse',
  avatar_letter text not null default 'M',
  xp integer not null default 120,
  streak integer not null default 1,
  gems integer not null default 250,
  hearts integer not null default 5,
  completed_lessons jsonb not null default '["u1-l1", "u7-l1"]'::jsonb,
  claimed_chests jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

-- Indice per rendere istantanea la Classifica Generale (ordinata per XP decrescente)
create index if not exists idx_profiles_xp_desc on public.profiles (xp desc);

-- Abilita Row Level Security (RLS)
alter table public.profiles enable row level security;

-- Policy 1: Chiunque può leggere la classifica pubblica (top giocatori)
drop policy if exists "Classifica pubblica visibile a tutti" on public.profiles;
create policy "Classifica pubblica visibile a tutti"
  on public.profiles
  for select
  using (true);

-- Policy 2: Ogni utente autenticato può inserire/aggiornare solo il proprio profilo
drop policy if exists "Utente gestisce il proprio profilo" on public.profiles;
create policy "Utente gestisce il proprio profilo"
  on public.profiles
  for all
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Vincoli di sicurezza lato Database (protezione anti-tampering API REST)
alter table public.profiles drop constraint if exists profiles_security_bounds_check;
alter table public.profiles add constraint profiles_security_bounds_check check (
  char_length(username) between 1 and 24
  and char_length(avatar_letter) between 1 and 2
  and xp between 0 and 1000000
  and streak between 0 and 3650
  and gems between 0 and 1000000
  and hearts between 0 and 5
);

-- ============================================================================
-- ANALYTICS EVENTI ANONIMI & PRIVACY-FIRST (ZERO COOKIE, GDPR COMPLIANT)
-- Traccia le giocate, il cambio sport e le metriche di retention senza cookie
-- ============================================================================
create table if not exists public.analytics_events (
  id bigint generated always as identity primary key,
  event_name text not null,
  sport text default 'calcio',
  metadata jsonb default '{}'::jsonb,
  is_pwa boolean default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_analytics_created_at on public.analytics_events (created_at desc);
create index if not exists idx_analytics_event_name on public.analytics_events (event_name);

alter table public.analytics_events enable row level security;

drop policy if exists "Inserimento anonimo eventi analytics" on public.analytics_events;
create policy "Inserimento anonimo eventi analytics"
  on public.analytics_events
  for insert
  with check (true);

