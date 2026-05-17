-- =============================================================
-- 2026-05-17 · 开放注册（取消审批闸门）
-- =============================================================
-- 改动：
--   1. 新用户注册即 approved=true，不再需要管理员审批
--   2. 把现存所有 approved=false 的存量用户一并放行
-- 风险：极低
--   - 合法用户原本就是要审批通过的，现在变成"注册时即通过"，体感更顺
--   - 之前如果有"待审批中"的真实老师，本次会一并放行（这正是你想要的）
-- 回滚：
--   把 handle_new_user() 改回原版（approved=false 默认）即可
-- 使用：
--   Supabase 控制台 → SQL Editor → New Query → 全文粘贴 → Run
-- =============================================================

-- 1. 改 handle_new_user：新用户默认 approved=true
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
  -- 注册即可用，不再走审批流程
  insert into public.profiles (user_id, username, approved)
  values (new.id, uname, true);
  return new;
end;
$$;

-- 2. 把现存所有 approved=false 的用户放行
update public.profiles set approved = true where approved = false;

-- 3. 验证：应该返回 0
select count(*) as still_pending from public.profiles where approved = false;
