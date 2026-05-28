# Seeklume 安全与隐私基线

> 状态：v0.1。适用于公开 GitHub 仓库、GitHub Pages、Cloudflare 域名、Supabase 后端。

## 1. 公开仓库红线

禁止提交：

- Supabase service role key。
- DeepSeek / OpenAI / 其他 AI 私钥。
- 学生姓名、班级、成绩、画像等隐私数据。
- 本地 `.temp`、`.DS_Store`、编辑器 swap 文件。
- 私密测试数据和本地成绩分析工具。

发布前运行：

```bash
npm run check
```

## 2. Supabase 权限

- 所有用户数据表默认启用 RLS。
- 普通用户只能读写自己的数据。
- 管理员可读巡查数据，但前端 view-as 模式禁止误写他人数据。
- 所有结构变化进入 `supabase/migrations/`。
- 每个 migration 都要有对应的 `.rollback.sql`；改 RLS 时还要有 `supabase/rls_checklist_*.sql`。
- 新建 public 表时必须启用 RLS；rollback 必须覆盖该 migration 新建的表和 policy。
- RLS 自查脚本必须至少覆盖：未登录/匿名、普通用户、管理员、清理测试数据。
- `supabase/setup.sql` 仅用于新项目初始化，不作为日常改库入口。

## 3. 日志与反馈

- 日志不记录密码、token、service key。
- 默认不记录完整学生隐私内容。
- 反馈和错误事件只保存定位问题所需的最小信息：页面、模块、错误类型、浏览器、时间、用户 id。
- 反馈和事件上下文入库前会递归过滤 `password` / `token` / `key` / `secret` / `authorization` / `cookie` 类字段，并替换常见 AI key、JWT、`password=...` 这类敏感片段。

## 4. 用户数据权利

当前已提供：

- 用户可在账户设置中导出自己的错题本和备课资料。
- 用户可在账户设置中清空自己的错题本和备课资料云端数据。
- 用户可提交账号删除申请，进入 `feedback_reports` 问题池，由管理员处理。
- 简明隐私说明已说明收集什么、用于什么、谁能访问、如何删除。

当前公开说明已放在 `docs/privacy.html`。后续若要“自动删除账号”，需要新增受保护的 Edge Function，由服务端使用 service role 删除 Supabase Auth 用户；不能把 service role key 放到前端。

## 5. 安全检查节奏

- 每次发布前跑 `npm run check`。
- 每次改 RLS 后，分别测试未登录、普通用户、管理员。
- `scripts/check_supabase_migrations.py` 会自动检查 rollback/RLS 自查脚本是否存在，并检查 rollback 是否覆盖新建对象。
- 每次改 Edge Function 后，检查输入、输出、错误格式和鉴权。
- 每个 Edge Function 旁边维护 `CONTRACT.md`，写清权限、输入、输出、错误、密钥和 AI 调用边界。

本次反馈/报错表的 RLS 自查脚本在 `supabase/rls_checklist_feedback_events.sql`。
