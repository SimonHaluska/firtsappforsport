-- Weekly streak/momentum aggregate. Recomputed server-side (see 0007) on
-- every trainings/matches write — never written from the client, so the
-- only policy here is select.

create table public.user_momentum (
  user_id uuid primary key references public.users (id) on delete cascade,
  current_streak_weeks smallint not null default 0 check (current_streak_weeks >= 0),
  longest_streak_weeks smallint not null default 0 check (longest_streak_weeks >= 0),
  momentum_status text check (momentum_status in ('rising', 'stable', 'declining')),
  current_week_session_count smallint not null default 0,
  current_week_is_active boolean not null default false,
  last_calculated_at timestamptz not null default now()
);

alter table public.user_momentum enable row level security;

create policy "users can view own momentum" on public.user_momentum
  for select using (auth.uid() = user_id);

-- Only server-side (trigger, running as security definer) writes here — no
-- insert/update/delete policy for regular users.
