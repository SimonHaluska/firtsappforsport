-- Monument Vision — initial schema.
-- Run this in the Supabase SQL editor (or `supabase db push` if you adopt
-- the Supabase CLI) against a fresh project.

-- ── users ────────────────────────────────────────────────────────────────
-- One row per player, keyed 1:1 to auth.users. Created by the app right
-- after sign-up, once onboarding collects name/age/sport/goal/mentor name.
create table if not exists public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null,
  age smallint not null check (age between 6 and 100),
  sport text not null check (sport in ('football', 'hockey')),
  goal text not null check (
    goal in (
      'improve_speed',
      'build_strength',
      'improve_technique',
      'increase_endurance',
      'prepare_for_season',
      'recover_from_injury'
    )
  ),
  mentor_name text not null,
  onboarding_complete boolean not null default false,
  weekly_target_sessions smallint not null default 4
    check (weekly_target_sessions between 1 and 21),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists users_set_updated_at on public.users;
create trigger users_set_updated_at
  before update on public.users
  for each row execute function public.set_updated_at();

-- ── schedule ─────────────────────────────────────────────────────────────
-- Calendar entries: training days, matches, and rest/recovery days.
create table if not exists public.schedule (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  date date not null,
  type text not null check (type in ('training', 'match', 'recovery', 'rest')),
  title text not null,
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists schedule_user_date_idx on public.schedule (user_id, date);

-- ── workouts ─────────────────────────────────────────────────────────────
-- Performance log: completed training sessions and matches.
create table if not exists public.workouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  date date not null,
  type text not null check (type in ('training', 'match')),
  duration_minutes integer not null check (duration_minutes > 0),
  intensity smallint not null check (intensity between 1 and 5),
  notes text,
  metrics jsonb,
  created_at timestamptz not null default now()
);

create index if not exists workouts_user_date_idx on public.workouts (user_id, date);

-- ── chat_messages ────────────────────────────────────────────────────────
-- Transcript with the player's AI mentor. Append-only from the client;
-- the Supabase Edge Function writes the mentor's replies.
create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  role text not null check (role in ('user', 'mentor')),
  content text not null,
  created_at timestamptz not null default now()
);

create index if not exists chat_messages_user_created_idx
  on public.chat_messages (user_id, created_at);

-- ── row level security ──────────────────────────────────────────────────
-- Every table is scoped to the authenticated owner. No table exposes other
-- players' data.
alter table public.users enable row level security;
alter table public.schedule enable row level security;
alter table public.workouts enable row level security;
alter table public.chat_messages enable row level security;

create policy "users can view own row" on public.users
  for select using (auth.uid() = id);
create policy "users can insert own row" on public.users
  for insert with check (auth.uid() = id);
create policy "users can update own row" on public.users
  for update using (auth.uid() = id);

create policy "users can view own schedule" on public.schedule
  for select using (auth.uid() = user_id);
create policy "users can insert own schedule" on public.schedule
  for insert with check (auth.uid() = user_id);
create policy "users can update own schedule" on public.schedule
  for update using (auth.uid() = user_id);
create policy "users can delete own schedule" on public.schedule
  for delete using (auth.uid() = user_id);

create policy "users can view own workouts" on public.workouts
  for select using (auth.uid() = user_id);
create policy "users can insert own workouts" on public.workouts
  for insert with check (auth.uid() = user_id);
create policy "users can update own workouts" on public.workouts
  for update using (auth.uid() = user_id);
create policy "users can delete own workouts" on public.workouts
  for delete using (auth.uid() = user_id);

-- Chat is append-only from the client: read your own messages, insert your
-- own messages (the mentor's replies are written by the Edge Function using
-- the service role key, which bypasses RLS). No update/delete — the
-- transcript is immutable.
create policy "users can view own chat messages" on public.chat_messages
  for select using (auth.uid() = user_id);
create policy "users can insert own chat messages" on public.chat_messages
  for insert with check (auth.uid() = user_id);
