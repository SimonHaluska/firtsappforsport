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
-- process record — effort, energy, and goal_proximity (see below).
create table if not exists public.trainings (
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

create index if not exists trainings_user_date_idx on public.trainings (user_id, date);

-- ── matches ──────────────────────────────────────────────────────────────
-- Performance log: completed matches. A rare, objective result record —
-- opponent, result, sport-specific stats, and goal_proximity.
create table if not exists public.matches (
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

create index if not exists matches_user_date_idx on public.matches (user_id, date);

-- ── user_momentum ────────────────────────────────────────────────────────
-- Weekly streak/momentum aggregate. Recomputed server-side (see the
-- recalculate_user_momentum trigger below) on every trainings/matches
-- write — never written from the client.
create table if not exists public.user_momentum (
  user_id uuid primary key references public.users (id) on delete cascade,
  current_streak_weeks smallint not null default 0 check (current_streak_weeks >= 0),
  longest_streak_weeks smallint not null default 0 check (longest_streak_weeks >= 0),
  momentum_status text check (momentum_status in ('rising', 'stable', 'declining')),
  current_week_session_count smallint not null default 0,
  current_week_is_active boolean not null default false,
  last_calculated_at timestamptz not null default now()
);

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
alter table public.user_momentum enable row level security;
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

-- Read-only from the client — no insert/update/delete policy. Only the
-- recalculate_user_momentum trigger (security definer, see below) writes
-- here.
create policy "users can view own momentum" on public.user_momentum
  for select using (auth.uid() = user_id);

-- Chat is append-only from the client: read your own messages, insert your
-- own messages (the mentor's replies are written by the Edge Function using
-- the service role key, which bypasses RLS). No update/delete — the
-- transcript is immutable.
create policy "users can view own chat messages" on public.chat_messages
  for select using (auth.uid() = user_id);
create policy "users can insert own chat messages" on public.chat_messages
  for insert with check (auth.uid() = user_id);

-- ── momentum recalculation ──────────────────────────────────────────────
-- Recomputes public.user_momentum for one user from their trainings +
-- matches history. Fired by a trigger on every write to either table —
-- fine at this volume (a player logs at most a handful of sessions a day),
-- no queue/debounce needed.
--
-- "Active week" = a calendar week (Mon-Sun, i.e. Postgres's default
-- date_trunc('week', ...) bucket) with >= users.weekly_target_sessions
-- combined training+match records.
create or replace function public.recalculate_user_momentum(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_target smallint;
  v_current_week_start date := date_trunc('week', current_date)::date;

  v_weeks date[];
  v_counts int[];
  v_active boolean[];
  v_n int;
  v_i int;

  v_running smallint;
  v_current_streak smallint := 0;
  v_longest_streak smallint := 0;
  v_current_week_count int := 0;
  v_current_week_active boolean := false;

  v_recent_start date;
  v_recent_end_exclusive date;
  v_prev_start date;
  v_prev_end_exclusive date;

  v_freq_recent int;
  v_freq_prev int;
  v_avg_gp_recent numeric;
  v_avg_gp_prev numeric;
  v_gp_diff numeric;
  v_freq_trend text;
  v_gp_trend text;
  v_active_week_count int;
  v_status text;
begin
  select weekly_target_sessions into v_target from public.users where id = p_user_id;
  if v_target is null then
    return; -- no user row (shouldn't happen given the FK) — nothing to compute
  end if;

  -- Zero-filled weekly session counts for the last 26 weeks (inclusive of
  -- the current, still-in-progress week) so gaps break streaks correctly.
  with weekly_counts as (
    select date_trunc('week', d.date)::date as week_start, count(*)::int as session_count
    from (
      select date from public.trainings where user_id = p_user_id
      union all
      select date from public.matches where user_id = p_user_id
    ) d
    group by 1
  ),
  week_series as (
    select generate_series(
      v_current_week_start - interval '25 weeks',
      v_current_week_start,
      interval '1 week'
    )::date as week_start
  )
  select
    array_agg(ws.week_start order by ws.week_start),
    array_agg(coalesce(wc.session_count, 0) order by ws.week_start)
  into v_weeks, v_counts
  from week_series ws
  left join weekly_counts wc using (week_start);

  v_n := array_length(v_weeks, 1);
  for v_i in 1..v_n loop
    v_active[v_i] := v_counts[v_i] >= v_target;
  end loop;

  v_current_week_count := v_counts[v_n];
  v_current_week_active := v_active[v_n];

  -- Longest streak: max consecutive-active run across the whole window.
  v_running := 0;
  for v_i in 1..v_n loop
    if v_active[v_i] then
      v_running := v_running + 1;
      v_longest_streak := greatest(v_longest_streak, v_running);
    else
      v_running := 0;
    end if;
  end loop;

  -- Current streak: walk backward from the last completed/active week. If
  -- the current (in-progress) week isn't active yet, that does NOT break
  -- the streak — we just start counting from last week instead.
  v_i := v_n;
  if not v_active[v_i] then
    v_i := v_i - 1;
  end if;
  while v_i >= 1 loop
    exit when not v_active[v_i];
    v_current_streak := v_current_streak + 1;
    v_i := v_i - 1;
  end loop;

  -- Momentum: last 2 calendar weeks vs. the 2 before that — frequency and
  -- average goal_proximity.
  v_recent_start := v_current_week_start - interval '1 week';
  v_recent_end_exclusive := v_current_week_start + interval '1 week';
  v_prev_start := v_recent_start - interval '2 weeks';
  v_prev_end_exclusive := v_recent_start;

  select count(*)::int into v_freq_recent
  from (
    select date from public.trainings
      where user_id = p_user_id and date >= v_recent_start and date < v_recent_end_exclusive
    union all
    select date from public.matches
      where user_id = p_user_id and date >= v_recent_start and date < v_recent_end_exclusive
  ) t;

  select count(*)::int into v_freq_prev
  from (
    select date from public.trainings
      where user_id = p_user_id and date >= v_prev_start and date < v_prev_end_exclusive
    union all
    select date from public.matches
      where user_id = p_user_id and date >= v_prev_start and date < v_prev_end_exclusive
  ) t;

  select avg(goal_proximity) into v_avg_gp_recent
  from (
    select goal_proximity from public.trainings
      where user_id = p_user_id and date >= v_recent_start and date < v_recent_end_exclusive
    union all
    select goal_proximity from public.matches
      where user_id = p_user_id and date >= v_recent_start and date < v_recent_end_exclusive
  ) t;

  select avg(goal_proximity) into v_avg_gp_prev
  from (
    select goal_proximity from public.trainings
      where user_id = p_user_id and date >= v_prev_start and date < v_prev_end_exclusive
    union all
    select goal_proximity from public.matches
      where user_id = p_user_id and date >= v_prev_start and date < v_prev_end_exclusive
  ) t;

  select count(*)::int into v_active_week_count from unnest(v_counts) c where c > 0;

  if v_active_week_count < 2 then
    -- Not enough history to compare against — no fabricated status.
    v_status := null;
  else
    if v_freq_recent > v_freq_prev then
      v_freq_trend := 'up';
    elsif v_freq_recent < v_freq_prev then
      v_freq_trend := 'down';
    else
      v_freq_trend := 'flat';
    end if;

    if v_avg_gp_recent is null or v_avg_gp_prev is null then
      v_gp_trend := 'flat';
      v_gp_diff := null;
    else
      v_gp_diff := v_avg_gp_recent - v_avg_gp_prev;
      if v_gp_diff > 10 then
        v_gp_trend := 'up';
      elsif v_gp_diff < -10 then
        v_gp_trend := 'down';
      else
        v_gp_trend := 'flat';
      end if;
    end if;

    if v_gp_diff is not null and v_gp_diff <= -25 then
      -- Significant single-metric drop overrides everything else.
      v_status := 'declining';
    elsif v_freq_trend = 'up' and v_gp_trend in ('up', 'flat') then
      v_status := 'rising';
    elsif v_gp_trend = 'up' and v_freq_trend = 'flat' then
      v_status := 'rising';
    elsif v_freq_trend = 'down' and v_gp_trend in ('down', 'flat') then
      v_status := 'declining';
    elsif v_gp_trend = 'down' and v_freq_trend = 'flat' then
      v_status := 'declining';
    else
      v_status := 'stable';
    end if;
  end if;

  insert into public.user_momentum (
    user_id, current_streak_weeks, longest_streak_weeks, momentum_status,
    current_week_session_count, current_week_is_active, last_calculated_at
  ) values (
    p_user_id, v_current_streak, v_longest_streak, v_status,
    v_current_week_count, v_current_week_active, now()
  )
  on conflict (user_id) do update set
    current_streak_weeks = excluded.current_streak_weeks,
    longest_streak_weeks = excluded.longest_streak_weeks,
    momentum_status = excluded.momentum_status,
    current_week_session_count = excluded.current_week_session_count,
    current_week_is_active = excluded.current_week_is_active,
    last_calculated_at = excluded.last_calculated_at;
end;
$$;

create or replace function public.trigger_recalculate_momentum()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.recalculate_user_momentum(coalesce(new.user_id, old.user_id));
  return coalesce(new, old);
end;
$$;

drop trigger if exists trainings_recalculate_momentum on public.trainings;
create trigger trainings_recalculate_momentum
  after insert or update or delete on public.trainings
  for each row execute function public.trigger_recalculate_momentum();

drop trigger if exists matches_recalculate_momentum on public.matches;
create trigger matches_recalculate_momentum
  after insert or update or delete on public.matches
  for each row execute function public.trigger_recalculate_momentum();
