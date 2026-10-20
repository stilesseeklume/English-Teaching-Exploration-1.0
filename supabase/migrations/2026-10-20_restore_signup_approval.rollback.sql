-- Rollback for 2026-10-20_restore_signup_approval.sql.
--
-- 恢复 2026-05-17 的「注册即通过」行为：新账号注册即 approved=true，立即可用。
-- 只影响之后的注册，不改动存量行。

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
