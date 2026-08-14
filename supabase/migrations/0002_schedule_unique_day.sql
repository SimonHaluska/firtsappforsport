-- The Schedule screen marks a single day as training/rest via upsert on
-- (user_id, date). The original schema.sql had no uniqueness constraint on
-- that pair, so upserts would just insert duplicate rows instead of
-- replacing the existing day. Run this against the already-applied schema.
alter table public.schedule
  add constraint schedule_user_date_unique unique (user_id, date);
