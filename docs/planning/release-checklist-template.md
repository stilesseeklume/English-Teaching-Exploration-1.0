# Seeklume 发布检查模板

> 每次准备发布到 `main` 前复制本模板内容到 PR 描述或发布记录。不要把它当形式，目的是保证上线失败时能定位和回滚。

## 1. 基本信息

- 发布日期：
- 分支：
- 目标版本 / tag：
- 负责人：
- 关联 issue / 反馈：

## 2. 发布目标

- 这次解决什么老师场景或工程风险：
- 明确不做什么：

## 3. 影响范围

- 前端页面：
- 数据源 / 发布数据：
- Supabase migration / RLS：
- Edge Function / AI prompt：
- 用户反馈 / 报错 / 使用数据：
- Cloudflare / GitHub Pages：

## 4. 验证记录

```bash
npm run check
```

- 数据检查：
- 密钥/隐私扫描：
- Supabase migration 检查：
- Edge Function 合同检查：
- 静态站检查：
- Playwright smoke：
- 额外人工验证：

## 5. 安全与隐私

- [ ] 没有提交 service role key、AI key、token。
- [ ] 没有提交学生姓名、班级、成绩等隐私数据。
- [ ] 新日志/反馈/事件只记录最小必要信息。
- [ ] 如改 RLS，已测未登录、普通用户、管理员。
- [ ] 如改 Edge Function，错误返回不会泄露密钥、prompt 或用户隐私。

## 6. 回滚方式

- 前端回滚：
- 数据回滚：
- Supabase 回滚：
- AI / Edge Function 回滚：
- 域名 / Pages 回滚：

## 7. 发布后观察

- 观察多久：
- 看哪些反馈状态：
- 看哪些 `app_events` / Supabase logs：
- 如果出现 P0/P1，谁来决定回滚：

