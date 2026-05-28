-- Seeklume feedback/events RLS manual checklist.
--
-- Use in Supabase SQL Editor after applying:
--   supabase/migrations/2026-05-28_feedback_events.sql
--
-- Run the sections with the target account/session selected where possible.
-- Do not commit real teacher/student content in these rows.

-- 1. Table and RLS should exist.
select
  c.relname as table_name,
  c.relrowsecurity as rls_enabled
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relname in ('feedback_reports', 'app_events')
order by c.relname;

-- 2. Policies should exist.
select
  tablename,
  policyname,
  cmd
from pg_policies
where schemaname = 'public'
  and tablename in ('feedback_reports', 'app_events')
order by tablename, policyname;

-- 3. Anonymous/guest insert should be allowed because user_id is null.
insert into public.feedback_reports (
  user_id, category, severity, reproducible, affected_users_count, source, module, message, context
)
values (
  null, 'ux', 'P3', 'unknown', 1, 'user', 'rls-check', 'guest feedback insert check', '{"source":"manual_rls_check"}'
);

insert into public.app_events (user_id, event_type, severity, module, message, context)
values (null, 'rls_check', 'info', 'rls-check', 'guest event insert check', '{"source":"manual_rls_check"}');

-- 4. Ordinary authenticated user checks:
--    - insert with user_id = auth.uid() should succeed.
--    - select should show own feedback_reports but not app_events rows unless admin.
--    - update feedback_reports should fail unless admin.
--
-- Example:
-- insert into public.feedback_reports (
--   user_id, category, severity, reproducible, affected_users_count, source, module, message, context
-- )
-- values (
--   auth.uid(), 'bug', 'P2', 'yes', 1, 'user', 'rls-check', 'own feedback insert check', '{"source":"manual_rls_check"}'
-- );
-- select id, user_id, category, severity, reproducible, affected_users_count, status from public.feedback_reports where module = 'rls-check';
-- select id, user_id, event_type from public.app_events where module = 'rls-check';
-- update public.feedback_reports set status = 'triaged' where module = 'rls-check';

-- 5. Admin checks:
--    - select from both tables should succeed.
--    - update feedback_reports.status should succeed.
--
-- Example:
-- select id, user_id, category, severity, reproducible, affected_users_count, status from public.feedback_reports where module = 'rls-check';
-- select id, user_id, event_type from public.app_events where module = 'rls-check';
-- update public.feedback_reports set status = 'closed', affected_users_count = greatest(affected_users_count, 1) where module = 'rls-check';

-- 6. Cleanup rows created by this checklist.
-- Run as admin/service role only.
-- delete from public.app_events where module = 'rls-check';
-- delete from public.feedback_reports where module = 'rls-check';
