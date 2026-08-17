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

-- ── trainings ────────────────────────────────────────────────────────────
-- Performance log: completed training sessions. A frequent, subjective
-- process record — effort, mood, optional per-sport metrics.
create table if not exists public.trainings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  date date not null,
  duration_minutes integer not null check (duration_minutes > 0),
  intensity smallint not null check (intensity between 1 and 5),
  mood smallint not null check (mood between 1 and 5),
  notes text,
  metrics jsonb,
  created_at timestamptz not null default now()
);

create index if not exists trainings_user_date_idx on public.trainings (user_id, date);

-- ── matches ──────────────────────────────────────────────────────────────
-- Performance log: completed matches. A rare, objective result record —
-- opponent, result, optional per-sport metrics.
create table if not exists public.matches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  date date not null,
  opponent text,
  competition text,
  result text check (result in ('win', 'loss', 'draw')),
  is_home boolean,
  minutes_played integer check (minutes_played >= 0),
  notes text,
  metrics jsonb,
  created_at timestamptz not null default now()
);

create index if not exists matches_user_date_idx on public.matches (user_id, date);

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
alter table public.trainings enable row level security;
alter table public.matches enable row level security;
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

create policy "users can view own trainings" on public.trainings
  for select using (auth.uid() = user_id);
create policy "users can insert own trainings" on public.trainings
  for insert with check (auth.uid() = user_id);
create policy "users can update own trainings" on public.trainings
  for update using (auth.uid() = user_id);
create policy "users can delete own trainings" on public.trainings
  for delete using (auth.uid() = user_id);

create policy "users can view own matches" on public.matches
  for select using (auth.uid() = user_id);
create policy "users can insert own matches" on public.matches
  for insert with check (auth.uid() = user_id);
create policy "users can update own matches" on public.matches
  for update using (auth.uid() = user_id);
create policy "users can delete own matches" on public.matches
  for delete using (auth.uid() = user_id);

-- Chat is append-only from the client: read your own messages, insert your
-- own messages (the mentor's replies are written by the Edge Function using
-- the service role key, which bypasses RLS). No update/delete — the
-- transcript is immutable.
create policy "users can view own chat messages" on public.chat_messages
  for select using (auth.uid() = user_id);
create policy "users can insert own chat messages" on public.chat_messages
  for insert with check (auth.uid() = user_id);
