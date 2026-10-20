-- =============================================================
-- 2026-10-20 · 恢复注册审批闸门（新注册账号需管理员审批）
-- =============================================================
-- 背景：
--   2026-05-17_open_signup.sql 把 handle_new_user() 改成「注册即 approved=true」，
--   于是新账号一注册就能直接用，前端门禁的「等待审批」屏形同虚设。
-- 改动：
--   1. handle_new_user() 恢复 approved=false —— 之后注册的新账号先进待审批
--   2. 不改动任何存量行：已存在的账号保持原状（老用户不受影响）
-- 为什么「不改存量」也安全：
--   check_approved() 对「没有 profiles 记录」的用户返回 true，
--   而存量用户要么 approved=true，要么本来就无记录——都不会被新闸门误锁。
-- 风险：极低。纯函数替换，不改表结构、不动数据行。
-- 回滚：见 2026-10-20_restore_signup_approval.rollback.sql
-- 使用：Supabase 控制台 → SQL Editor → New Query → 全文粘贴 → Run
-- =============================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  uname text;
  base  text;
  suffix int := 0;
begin
  uname := new.raw_user_meta_data ->> 'username';
  if uname is null or uname = '' then
    uname := split_part(new.email, '@', 1);
  end if;
  base := uname;
  while exists(select 1 from public.profiles where username = uname) loop
    suffix := suffix + 1;
    uname := base || suffix::text;
  end loop;
  -- 注册后先进「待审批」，管理员通过后才能使用功能
  insert into public.profiles (user_id, username, approved)
  values (new.id, uname, false);
  return new;
end;
$$;

-- 验证：运行后这里显示的是当前待审批账号数（下一个新注册会在这里 +1）
select count(*) as pending_users from public.profiles where approved = false;
