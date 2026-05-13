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

打开 `src/grammar-fill/index.html`，找到顶部这两行（搜 `YOUR_SUPABASE_URL`）：

```html
window.SUPABASE_URL      = 'YOUR_SUPABASE_URL';
window.SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';
```

把引号里的值替换成第 3 步复制的两个值。

## 5. 部署（30 秒）

```bash
bash scripts/deploy.sh
git add docs/ src/ supabase/
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

### 关掉邮件验证（个人/小团队，省事）

注册默认要点验证邮件链接才能登录。如果觉得麻烦：

1. Supabase → **Authentication** → **Providers** → **Email**
2. 关掉 **Confirm email**
3. 保存

### 不想随便谁都能注册？

如果决定只让信任的人用：

1. Supabase → **Authentication** → **Providers** → **Email**
2. 关掉 **Enable Email Signups**
3. 你想加新人的时候，在 Supabase → **Authentication** → **Users** → **Add user** 手动创建

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
A: 没正确填 `SUPABASE_URL` 和 `SUPABASE_ANON_KEY`。检查 index.html 顶部，两个值都不能再是 `YOUR_...` 开头。

**Q: 注册时报 `Email rate limit exceeded`**
A: Supabase 免费版每小时邮件发送有上限（默认 3 封）。先关掉「Confirm email」用着，正式上线再考虑接 SendGrid/Resend。

**Q: 登录后云端数据没拉下来**
A: 打开浏览器 Console（F12），看红色报错。常见：忘了跑 setup.sql / 跑了但 SQL 里有报错。

**Q: 管理员页打不开**
A: 你登录的邮箱不在白名单里。改 setup.sql 的 `is_admin()` 函数，重新跑这一段就行。

**Q: 想清空云端测试数据**
A: SQL Editor → 跑 `delete from public.error_book; delete from public.lesson_prep;`（小心：这两条会删全部用户的数据）。
