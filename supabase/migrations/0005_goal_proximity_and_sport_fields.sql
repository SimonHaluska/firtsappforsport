-- Reshapes `trainings` and `matches` around the real data model: a
-- per-sport training type, 1-10 intensity/energy scales, sport-specific
-- match fields (minutes played vs. ice time, cards vs. penalty minutes),
-- and the new `goal_proximity` metric that feeds the AI mentor. No
-- production data exists yet, so this is a clean drop-and-recreate rather
-- than a data-preserving migration, same as 0004.

drop table if exists public.trainings cascade;
drop table if exists public.matches cascade;

-- ── trainings ────────────────────────────────────────────────────────────
create table public.trainings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  date date not null,
  sport text not null check (sport in ('football', 'hockey')),
  training_type text not null check (
    training_type in (
      -- football
      'technika', 'strelba', 'kondicia', 'sila', 'taktika', 'regeneracia',
      'individualny_trening', 'timovy_trening',
      -- hockey-only
      'korculovanie'
    )
  ),
  duration_minutes integer not null check (duration_minutes > 0),
  intensity smallint not null check (intensity between 1 and 10),
  goal_proximity smallint not null check (goal_proximity in (0, 25, 50, 75, 100)),
  energy_before smallint check (energy_before between 1 and 10),
  energy_after smallint check (energy_after between 1 and 10),
  notes text,
  created_at timestamptz not null default now(),
  constraint trainings_type_matches_sport check (
    (sport = 'football' and training_type <> 'korculovanie')
    or sport = 'hockey'
  )
);

create index trainings_user_date_idx on public.trainings (user_id, date);

-- ── matches ──────────────────────────────────────────────────────────────
create table public.matches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  date date not null,
  sport text not null check (sport in ('football', 'hockey')),
  opponent text not null,
  result text not null,
  minutes_played integer check (minutes_played >= 0),
  ice_time integer check (ice_time >= 0),
  goal_proximity smallint not null check (goal_proximity in (0, 25, 50, 75, 100)),
  goals smallint check (goals >= 0),
  assists smallint check (assists >= 0),
  shots smallint check (shots >= 0),
  position text,
  yellow_cards smallint check (yellow_cards >= 0),
  red_cards smallint check (red_cards >= 0),
  penalty_minutes smallint check (penalty_minutes >= 0),
  plus_minus smallint,
  notes text,
  created_at timestamptz not null default now(),
  constraint matches_sport_fields check (
    (sport = 'football' and minutes_played is not null and ice_time is null
      and penalty_minutes is null and plus_minus is null)
    or
    (sport = 'hockey' and ice_time is not null and minutes_played is null
      and yellow_cards is null and red_cards is null)
  )
);

create index matches_user_date_idx on public.matches (user_id, date);

-- ── row level security ──────────────────────────────────────────────────
alter table public.trainings enable row level security;
alter table public.matches enable row level security;

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
