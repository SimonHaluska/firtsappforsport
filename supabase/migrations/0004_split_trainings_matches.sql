-- Splits the combined `workouts` table (training + match rows with a `type`
-- discriminator) into `trainings` and `matches`. Training is a frequent,
-- subjective process record (duration, intensity, mood); a match is a rare,
-- objective result record (opponent, result, minutes played). No production
-- data exists yet, so this is a clean drop-and-recreate rather than a
-- data-preserving migration. Run against the already-applied schema.

drop table if exists public.workouts cascade;

create table public.trainings (
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

create index trainings_user_date_idx on public.trainings (user_id, date);

create table public.matches (
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

create index matches_user_date_idx on public.matches (user_id, date);

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
