# Supabase 后端 · 5 分钟上手

把现有 localStorage 数据搬到云端，换设备数据互通。**全程免费**（Supabase 免费额度足够个人/小团队使用）。

---

## 1. 注册并创建项目（2 分钟）

1. 打开 https://supabase.com → **Start your project** → 用 GitHub 或 Google 一键登录
2. 点 **New project**：
   - **Name**：随便填，例如 `english-teaching`
   - **Database Password**：让浏览器自动生成，**复制保存到密码管理器**（虽然平时用不到，但找回管理员要用）
   - **Region**：选 **Northeast Asia (Tokyo)** —— 国内访问最快
   - **Pricing Plan**：Free
3. 点 **Create new project**，等 1 分钟项目就绪

## 2. 建表（30 秒）

1. 左侧菜单 → **SQL Editor** → **New query**
2. 把仓库里 `supabase/setup.sql` 全文复制粘贴进去
3. 点右下角 **Run**（或 Ctrl/⌘ + Enter）
4. 看到 **Success. No rows returned** 就 OK 了

## 3. 拿到密钥（30 秒）

1. 左侧菜单 → **Project Settings**（齿轮图标） → **API**
2. 复制两个东西：
   - **Project URL**：形如 `https://xxxxxxxx.supabase.co`
   - **anon public** key：很长一串，以 `eyJ...` 开头

> ⚠️ 复制的是 **anon public** 那一行，不是下面的 **service_role**！service_role 是后端用的超级密钥，前端不能用，泄露了就完蛋。

## 4. 填进前端（30 秒）

打开 `docs/config.js`，找到 `SEEKLUME_CONFIG`：

```js
window.SEEKLUME_CONFIG = {
  SUPABASE_URL: '...',
  SUPABASE_ANON_KEY: '...',
};
```

把两个值替换成第 3 步复制的内容。这一个文件覆盖所有页面，无需再改各模块。

## 5. 部署（30 秒）

```bash
git add docs/ supabase/
git commit -m "接入 Supabase 后端"
git push
```

刷新 GitHub Pages 网站，右上角应该多了「登录 / 注册」按钮。

## 6. 第一次登录

1. 点「登录 / 注册」→ 切换到「注册」标签
2. 用你的常用邮箱注册（**首次会要邮件验证** —— 详见下一段）
3. 验证后登录，会自动弹「检测到本地有 X 道错题…是否上传到云端？」点确定，本地数据就搬上去了
4. 用 **`liuzhenlzstiles@icloud.com`** 注册并登录的话，导航栏会出现「👥 管理员」标签，能看到所有用户

---

## ⚙ 可选配置

### 关掉邮箱验证 + 开启审批注册

国内邮箱收不到 Supabase 的验证邮件，需要关掉邮箱验证并开启管理员审批：

1. Supabase → **Authentication** → **Providers** → **Email**
2. 关掉 **Confirm email**
3. 保存
4. 然后跑下面的 SQL（在 SQL Editor 里粘贴执行）来安装审批系统：

```sql
-- 如果你还没有跑过 setup.sql，直接跑完整的 setup.sql 即可。
-- 如果你已经跑过 setup.sql，跑下面这一段来追加审批系统：

create table if not exists public.profiles (
  user_id     uuid primary key references auth.users(id) on delete cascade,
  approved    boolean not null default false,
  created_at  timestamptz not null default now()
);
alter table public.profiles enable row level security;

drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles
  for select using (auth.uid() = user_id or public.is_admin());

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (user_id, approved)
  values (new.id, coalesce(
    new.email in ('liuzhenlzstiles@icloud.com'),
    false
  ));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.check_approved()
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare result boolean;
begin
  select p.approved into result from public.profiles p where p.user_id = auth.uid();
  return coalesce(result, false);
end;
$$;
grant execute on function public.check_approved() to authenticated;

create or replace function public.admin_approve_user(target_user uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then raise exception 'forbidden: admin only'; end if;
  update public.profiles set approved = true where user_id = target_user;
end;
$$;
grant execute on function public.admin_approve_user(uuid) to authenticated;

create or replace function public.admin_reject_user(target_user uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then raise exception 'forbidden: admin only'; end if;
  delete from auth.users where id = target_user;
end;
$$;
grant execute on function public.admin_reject_user(uuid) to authenticated;

create or replace function public.admin_list_users()
returns table (
  id uuid, email text, created_at timestamptz, last_sign_in_at timestamptz,
  approved boolean, error_count bigint, prep_count bigint
)
language plpgsql security definer
set search_path = public, auth
as $$
begin
  if not public.is_admin() then raise exception 'forbidden: admin only'; end if;
  return query
    select u.id, u.email::text, u.created_at, u.last_sign_in_at,
      coalesce(p.approved, false),
      (select count(*) from public.error_book where user_id = u.id),
      (select count(*) from public.lesson_prep where user_id = u.id)
    from auth.users u
    left join public.profiles p on p.user_id = u.id
    order by u.created_at desc;
end;
$$;
grant execute on function public.admin_list_users() to authenticated;

-- 如果你已经有用户了，把他们的 approved 设为 true：
insert into public.profiles (user_id, approved)
  select id, true from auth.users
  on conflict (user_id) do update set approved = true;
```

### 审批流程

1. **注册**：用户填写邮箱+密码注册，自动进入「待审批」状态
2. **管理员审批**：管理员登录后点「👥 管理员」，看到待审批用户，点「通过」或「拒绝」
3. **用户使用**：审批通过后，用户刷新页面或点「重新检查」即可进入系统

### 增加管理员

打开 `supabase/setup.sql`，找到这一段：

```sql
select coalesce(
  (auth.jwt() ->> 'email') in (
    'liuzhenlzstiles@icloud.com'
  ),
  false
);
```

加一行（注意逗号）：

```sql
select coalesce(
  (auth.jwt() ->> 'email') in (
    'liuzhenlzstiles@icloud.com',
    '同事的邮箱@xxx.com'
  ),
  false
);
```

然后 Supabase SQL Editor → 重新跑这一段，立即生效。

---

## 🆘 常见问题

**Q: 网站显示「本地模式」/ 登录按钮没出现**
A: 没正确填 `SUPABASE_URL` 和 `SUPABASE_ANON_KEY`。检查 `docs/config.js` 里的两个值，都不能再是 `YOUR_...` 开头。

**Q: 注册时报 `Email rate limit exceeded`**
A: Supabase 免费版每小时邮件发送有上限（默认 3 封）。先关掉「Confirm email」用着，正式上线再考虑接 SendGrid/Resend。

**Q: 登录后云端数据没拉下来**
A: 打开浏览器 Console（F12），看红色报错。常见：忘了跑 setup.sql / 跑了但 SQL 里有报错。

**Q: 管理员页打不开**
A: 你登录的邮箱不在白名单里。改 setup.sql 的 `is_admin()` 函数，重新跑这一段就行。

**Q: 想清空云端测试数据**
A: SQL Editor → 跑 `delete from public.error_book; delete from public.lesson_prep;`（小心：这两条会删全部用户的数据）。
