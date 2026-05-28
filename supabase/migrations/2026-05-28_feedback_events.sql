-- Seeklume feedback and observability baseline.
-- Stores minimal product feedback and non-sensitive runtime events.

create table if not exists public.feedback_reports (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete set null,
  category    text not null check (category in ('bug', 'data', 'ux', 'ai', 'feature')),
  severity    text not null default 'P2' check (severity in ('P0', 'P1', 'P2', 'P3')),
  status      text not null default 'new' check (status in ('new', 'triaged', 'in_progress', 'released', 'closed')),
  reproducible text not null default 'unknown' check (reproducible in ('yes', 'no', 'unknown')),
  affected_users_count integer not null default 1 check (affected_users_count >= 0),
  source      text not null default 'user' check (source in ('user', 'system', 'admin')),
  page_url    text,
  module      text,
  message     text not null check (char_length(message) <= 4000),
  context     jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists public.app_events (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete set null,
  event_type  text not null,
  severity    text not null default 'info' check (severity in ('info', 'warning', 'error')),
  page_url    text,
  module      text,
  message     text check (char_length(message) <= 2000),
  context     jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now()
);

create index if not exists feedback_reports_created_idx on public.feedback_reports(created_at desc);
create index if not exists feedback_reports_user_idx on public.feedback_reports(user_id);
create index if not exists feedback_reports_status_idx on public.feedback_reports(status);
create index if not exists feedback_reports_category_idx on public.feedback_reports(category);
create index if not exists feedback_reports_severity_idx on public.feedback_reports(severity);
create index if not exists app_events_created_idx on public.app_events(created_at desc);
create index if not exists app_events_user_idx on public.app_events(user_id);
create index if not exists app_events_type_idx on public.app_events(event_type);

alter table public.feedback_reports enable row level security;
alter table public.app_events enable row level security;

drop policy if exists feedback_reports_insert on public.feedback_reports;
create policy feedback_reports_insert on public.feedback_reports
  for insert with check (auth.uid() = user_id or user_id is null);

drop policy if exists feedback_reports_select_own_admin on public.feedback_reports;
create policy feedback_reports_select_own_admin on public.feedback_reports
  for select using (auth.uid() = user_id or public.is_admin());

drop policy if exists feedback_reports_admin_update on public.feedback_reports;
create policy feedback_reports_admin_update on public.feedback_reports
  for update using (public.is_admin()) with check (public.is_admin());

drop policy if exists app_events_insert on public.app_events;
create policy app_events_insert on public.app_events
  for insert with check (auth.uid() = user_id or user_id is null);

drop policy if exists app_events_select_admin on public.app_events;
create policy app_events_select_admin on public.app_events
  for select using (public.is_admin());

drop trigger if exists feedback_reports_touch on public.feedback_reports;
create trigger feedback_reports_touch
  before update on public.feedback_reports
  for each row execute function public.touch_updated_at();
