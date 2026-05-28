-- Rollback for 2026-05-28_feedback_events.sql.
--
-- Use only if the feedback/events migration breaks production and a backup
-- restore is not the better option. This deletes collected feedback/events.

drop trigger if exists feedback_reports_touch on public.feedback_reports;

drop policy if exists app_events_select_admin on public.app_events;
drop policy if exists app_events_insert on public.app_events;
drop policy if exists feedback_reports_admin_update on public.feedback_reports;
drop policy if exists feedback_reports_select_own_admin on public.feedback_reports;
drop policy if exists feedback_reports_insert on public.feedback_reports;

drop table if exists public.app_events;
drop table if exists public.feedback_reports;
