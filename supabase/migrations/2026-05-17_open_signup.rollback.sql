-- Rollback for 2026-05-17_open_signup.sql.
--
-- This restores the old approval gate for future signups. It cannot reliably
-- identify which existing users were pending before the migration because the
-- forward migration intentionally changed those rows to approved=true.

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
  insert into public.profiles (user_id, username, approved)
  values (new.id, uname, false);
  return new;
end;
$$;
