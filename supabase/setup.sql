-- ============================================================
-- 英语教学系统 1.0 · Supabase 一键建库脚本
-- ------------------------------------------------------------
-- 使用方法：
-- 1. 在 supabase.com 创建项目（免费）
-- 2. 左侧菜单 → SQL Editor → New query
-- 3. 把本文件全文粘进去 → Run
-- 4. 改最下方 ADMIN_EMAILS 里的邮箱为你的常用邮箱
-- ============================================================

create extension if not exists pgcrypto;

-- ============== 1. 表 ==============

-- 错题本：每条错题一行
create table if not exists public.error_book (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  client_id   text not null,            -- 前端生成的去重键
  question    jsonb not null,            -- 完整题目对象
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (user_id, client_id)
);
create index if not exists error_book_user_idx on public.error_book(user_id);

-- 备课资料：每篇文章一行
create table if not exists public.lesson_prep (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  client_id   text not null,
  passage     jsonb not null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (user_id, client_id)
);
create index if not exists lesson_prep_user_idx on public.lesson_prep(user_id);

-- ============== 2. 管理员判定 ==============
-- 改下面的邮箱列表来增减管理员
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (auth.jwt() ->> 'email') in (
      'liuzhenlzstiles@icloud.com'   -- ← 管理员邮箱白名单（可加多个，逗号分隔）
    ),
    false
  );
$$;

-- ============== 3. 行级权限（RLS）==============

alter table public.error_book  enable row level security;
alter table public.lesson_prep enable row level security;

-- error_book：本人 + 管理员可读，本人可增删改
drop policy if exists error_book_select on public.error_book;
create policy error_book_select on public.error_book
  for select using (auth.uid() = user_id or public.is_admin());

drop policy if exists error_book_insert on public.error_book;
create policy error_book_insert on public.error_book
  for insert with check (auth.uid() = user_id);

drop policy if exists error_book_update on public.error_book;
create policy error_book_update on public.error_book
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists error_book_delete on public.error_book;
create policy error_book_delete on public.error_book
  for delete using (auth.uid() = user_id);

-- lesson_prep：同上
drop policy if exists lesson_prep_select on public.lesson_prep;
create policy lesson_prep_select on public.lesson_prep
  for select using (auth.uid() = user_id or public.is_admin());

drop policy if exists lesson_prep_insert on public.lesson_prep;
create policy lesson_prep_insert on public.lesson_prep
  for insert with check (auth.uid() = user_id);

drop policy if exists lesson_prep_update on public.lesson_prep;
create policy lesson_prep_update on public.lesson_prep
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists lesson_prep_delete on public.lesson_prep;
create policy lesson_prep_delete on public.lesson_prep
  for delete using (auth.uid() = user_id);

-- ============== 4. updated_at 自动更新 ==============
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists error_book_touch on public.error_book;
create trigger error_book_touch
  before update on public.error_book
  for each row execute function public.touch_updated_at();

drop trigger if exists lesson_prep_touch on public.lesson_prep;
create trigger lesson_prep_touch
  before update on public.lesson_prep
  for each row execute function public.touch_updated_at();

-- ============== 5. 管理员专用 RPC ==============

-- 列出所有用户（带错题/备课条数）
create or replace function public.admin_list_users()
returns table (
  id              uuid,
  email           text,
  created_at      timestamptz,
  last_sign_in_at timestamptz,
  error_count     bigint,
  prep_count      bigint
)
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  if not public.is_admin() then
    raise exception 'forbidden: admin only';
  end if;
  return query
    select
      u.id,
      u.email::text,
      u.created_at,
      u.last_sign_in_at,
      (select count(*) from public.error_book  where user_id = u.id),
      (select count(*) from public.lesson_prep where user_id = u.id)
    from auth.users u
    order by u.created_at desc;
end;
$$;

grant execute on function public.admin_list_users() to authenticated;

-- 把用户 id 转邮箱（admin 在看别人数据时显示用）
create or replace function public.admin_get_email(target_user uuid)
returns text
language plpgsql
security definer
set search_path = public, auth
as $$
declare result text;
begin
  if not public.is_admin() then
    raise exception 'forbidden: admin only';
  end if;
  select email::text into result from auth.users where id = target_user;
  return result;
end;
$$;

grant execute on function public.admin_get_email(uuid) to authenticated;

-- ============== 6. 完成 ==============
-- 一切就绪。在 Supabase 控制台：
--   Settings → API 中复制 Project URL 和 anon public key，
--   填进前端 index.html 顶部的 SUPABASE_URL / SUPABASE_ANON_KEY 即可。
