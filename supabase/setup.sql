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
-- 改下面的用户名或邮箱来增减管理员
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (auth.jwt() ->> 'email') in (
      'liuzhenlzstiles@icloud.com'
    ) or (auth.jwt() -> 'user_metadata' ->> 'username') in (
      'liuzhen'
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

-- ============== 7. 管理员审批注册系统 ==============

-- 用户审批状态表
create table if not exists public.profiles (
  user_id     uuid primary key references auth.users(id) on delete cascade,
  username    text not null default '',
  approved    boolean not null default false,
  created_at  timestamptz not null default now()
);
alter table public.profiles enable row level security;

-- RLS：本人可读自己的审批状态
drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles
  for select using (auth.uid() = user_id or public.is_admin());

-- 新用户注册时自动创建 profile（管理员用户名自动通过，其余待审批）
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  uname text;
begin
  uname := new.raw_user_meta_data ->> 'username';
  if uname is null or uname = '' then
    uname := split_part(new.email, '@', 1);
  end if;
  insert into public.profiles (user_id, username, approved)
  values (new.id, uname, coalesce(
    new.email in ('liuzhenlzstiles@icloud.com')
    or uname in ('liuzhen'),
    false
  ));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 前端查自己的审批状态（没有记录 = 老用户，默认放行）
create or replace function public.check_approved()
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  result boolean;
begin
  select p.approved into result
  from public.profiles p
  where p.user_id = auth.uid();
  -- 无记录 = 审批系统上线前的老用户，放行
  if not found then return true; end if;
  return result;
end;
$$;
grant execute on function public.check_approved() to authenticated;

-- 管理员审批通过
create or replace function public.admin_approve_user(target_user uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'forbidden: admin only';
  end if;
  update public.profiles set approved = true where user_id = target_user;
end;
$$;
grant execute on function public.admin_approve_user(uuid) to authenticated;

-- 管理员拒绝（删除用户）
create or replace function public.admin_reject_user(target_user uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'forbidden: admin only';
  end if;
  delete from auth.users where id = target_user;
end;
$$;
grant execute on function public.admin_reject_user(uuid) to authenticated;

-- 更新 admin_list_users：加上 approved + username 字段
drop function if exists public.admin_list_users();
create or replace function public.admin_list_users()
returns table (
  id              uuid,
  email           text,
  username        text,
  created_at      timestamptz,
  last_sign_in_at timestamptz,
  approved        boolean,
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
      coalesce(p.username, u.raw_user_meta_data->>'username', split_part(u.email::text, '@', 1)),
      u.created_at,
      u.last_sign_in_at,
      coalesce(p.approved, false),
      (select count(*) from public.error_book  where user_id = u.id),
      (select count(*) from public.lesson_prep where user_id = u.id)
    from auth.users u
    left join public.profiles p on p.user_id = u.id
    order by u.created_at desc;
end;
$$;
grant execute on function public.admin_list_users() to authenticated;

-- ============== 完成 ==============
-- 一切就绪。在 Supabase 控制台：
--   Settings → API 中复制 Project URL 和 anon public key，
--   填进前端 index.html 顶部的 SUPABASE_URL / SUPABASE_ANON_KEY 即可。

-- 如果你已经有老用户（用邮箱注册的），跑这条把他们的 approved 设为 true：
--   insert into public.profiles (user_id, username, approved)
--     select id, split_part(email, '@', 1), true from auth.users
--     on conflict (user_id) do update set approved = true;

-- 追加了管理员审批注册系统后：已有用户的审批状态要手动补
-- 如果你已经有了用户，跑下面这句把他们的 approved 设为 true：
--   insert into public.profiles (user_id, approved)
--     select id, true from auth.users
--     on conflict (user_id) do update set approved = true;
