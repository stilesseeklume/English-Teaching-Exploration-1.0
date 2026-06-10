-- Seeklume 学生追踪（云端）· exam_results
-- 每生一卷一行；云端只存学号（化名键），【无姓名】。
-- RLS：每个老师只看自己导入的数据（科组长/管理员跨人查看留待组织层）。

create table if not exists public.exam_results (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  client_id   text not null,
  class_id    text not null,
  class_name  text,
  exam_id     text not null,
  exam_label  text,
  exam_date   date,
  student_no  text not null,
  result      jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (user_id, client_id)
);

create index if not exists exam_results_class_student_idx
  on public.exam_results (user_id, class_id, student_no);
create index if not exists exam_results_class_exam_idx
  on public.exam_results (user_id, class_id, exam_id);

alter table public.exam_results enable row level security;

drop policy if exists exam_results_all_own on public.exam_results;
create policy exam_results_all_own on public.exam_results
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop trigger if exists exam_results_touch on public.exam_results;
create trigger exam_results_touch
  before update on public.exam_results
  for each row execute function public.touch_updated_at();
