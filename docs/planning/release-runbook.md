# Seeklume 发布与回滚手册

> 状态：v0.1。每次重要发布前后按此检查。

## 1. 发布前

```bash
git status --short --branch
npm run check
```

确认：

- 工作分支清楚，`main` 是稳定基线。
- 大改动的回滚基线已记录；如本地已经形成一个检查通过的中间态，可以先做 checkpoint commit 再继续后续拆分。
- 题库检查通过。
- 公开仓库密钥检查通过。
- Supabase migration 检查通过：每个 migration 有 rollback；改 RLS 有手动自查脚本。
- Edge Function 检查通过：每个函数有接口合同、POST/CORS/鉴权/错误 JSON 和密钥配置检查。
- 静态站关键文件检查通过。
- Playwright smoke 检查通过：首页、隐私页、语法填空核心路径无致命错误。
- 需要的 Supabase migration 已列出。
- PR 或发布记录已填写 `docs/planning/release-checklist-template.md` 中的目标、影响范围、验证记录、回滚方式和发布后观察。

## 2. Supabase 变更

- 生产库变更前先备份。
- migration 只向前执行，不在 SQL Editor 手工散改。
- 改 RLS 后测试三种身份：未登录、普通用户、管理员。
- 反馈/事件表可用 `supabase/rls_checklist_feedback_events.sql` 做手动 RLS 自查。

本次新增反馈/事件表时需要执行：

```text
supabase/migrations/2026-05-28_feedback_events.sql
```

如果这次 migration 造成生产问题，先判断是否需要保留已收集反馈；可以优先修复 RLS 或恢复备份。确认要删除本次新增表时，执行：

```text
supabase/migrations/2026-05-28_feedback_events.rollback.sql
```

## 3. 发布

- 合并到 `main` 后由 GitHub Pages 发布 `docs/`。
- Cloudflare 只负责域名和 HTTPS。
- 发布后打开 `https://seeklume.work/` 和语法填空模块。

## 4. 回滚

- 本地大改失败：优先回到最近一次 checkpoint commit；如果没有 checkpoint，只能回到上一个正式 commit，未提交改动会更难精确保留。
- 前端页面坏：回退 Git commit 或重新部署上一个 tag。
- 题库数据坏：回退 `docs/data/grammar_bank.js` 和源数据提交。
- Supabase migration 坏：优先恢复备份或执行已准备的 rollback SQL。
- AI 解析坏：回退 Edge Function / prompt。
- 域名坏：检查 Cloudflare DNS、GitHub Pages 设置、`docs/CNAME`。

## 5. 发布后

- 观察反馈和错误事件。
- 记录本次发布到 `PROJECT_LOG.md`。
- 若出现 P0/P1 问题，优先修复或回滚，不继续加新功能。
