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
