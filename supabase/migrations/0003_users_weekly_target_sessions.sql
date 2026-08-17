-- Stats screen needs a per-player weekly session target to compute goal
-- progress. Lives on `users` alongside the existing `goal` category field
-- rather than a separate table, since it's a single scalar owned 1:1 by
-- the player. Run against the already-applied schema.
alter table public.users
  add column if not exists weekly_target_sessions smallint not null default 4
    check (weekly_target_sessions between 1 and 21);
