# Seeklume 反馈、报错与使用数据流程

> 状态：v0.1。目标是让真实老师反馈和线上错误进入可处理闭环。

## 1. 问题来源

- 用户主动反馈：功能建议、使用困难、内容错误、AI 解析不准、系统报错。
- 系统自动错误：前端 JS 报错、Supabase 同步失败、AI 上传失败、Edge Function 错误。
- 使用数据观察：模块打开、Word 上传成功率、AI 解析失败率、迁移训练点击。

## 2. 问题分类

| 类型 | 含义 |
|---|---|
| Bug | 功能坏了或数据保存失败 |
| Data | 题库、标签、解析、知识层内容错误 |
| UX | 用户不会用、流程卡住、提示不清楚 |
| AI | 上传、解析、翻译、助手回答异常 |
| Feature | 新功能建议 |

## 3. 严重程度

- P0：线上主流程不可用、数据泄露、跨账号数据混淆。
- P1：核心功能失败，但有绕路方案。
- P2：影响体验或部分数据。
- P3：建议、优化、低频问题。

## 4. 处理状态

`new` → `triaged` → `in_progress` → `released` → `closed`

## 5. 最小问题池字段

`feedback_reports` 是问题池，不只是留言板。每条反馈至少保留：

| 字段 | 作用 |
|---|---|
| `category` | 判断是 Bug、Data、UX、AI 还是 Feature |
| `severity` | 判断 P0-P3 优先级 |
| `status` | 跟踪是否已分诊、处理中、已发布、已关闭 |
| `reproducible` | 判断能否稳定复现 |
| `affected_users_count` | 粗略判断影响范围 |
| `source` | 区分用户反馈、系统自动记录、管理员补录 |
| `module` / `page_url` | 定位发生在哪个页面和模块 |
| `context` | 保存安全截断后的浏览器、页面和最近错误信息 |

这些字段的目的不是“收集更多用户信息”，而是让开发时能回答三个问题：严重吗、能复现吗、影响多少人。

## 6. 管理员处理闭环

管理员页提供最小问题池：

- 查看最近 20 条反馈。
- 看见类型、严重程度、状态、模块、能否复现、影响人数和创建时间。
- 将反馈按 `new` → `triaged` → `in_progress` → `released` → `closed` 推进。
- 随时直接关闭明显重复或已处理的问题。

这不是完整客服系统，只是确保真实反馈不会散落在聊天记录里，能够进入可追踪状态。

## 7. 数据最小化

反馈和事件只记录：

- 用户 id。
- 页面 URL。
- 模块名。
- 事件类型。
- 错误消息和安全截断后的上下文。
- 能否复现、影响人数这类非隐私排查字段。
- 浏览器和时间。

不记录：

- 密码、token、AI key。
- 完整学生成绩、班级名单。
- 大段用户上传原文。

实现要求：

- `docs/shared/observability.js` 在前端收集阶段做第一层脱敏。
- `docs/shared/cloud.js` 在写入 Supabase 前做最终递归脱敏。
- 嵌套对象和数组里的 `password` / `token` / `key` / `secret` / `authorization` / `cookie` 类字段都会被丢弃，常见 AI key、JWT 和 `password=...` 片段会被替换。

## 8. 非隐私使用事件

`app_events` 只记录产品行为，不记录题目原文、学生姓名、成绩、密码或 token。

当前自动记录：

| 事件 | 含义 |
|---|---|
| `module_view` | 打开了哪个页面模块 |
| `teaching_stage_opened` | 打开讲题台 |
| `teaching_tab_selected` | 讲题台切换到讲题、迁移或图谱 |
| `migration_training_viewed` | 迁移训练被打开，并记录题池数量和展示数量 |
| `migration_source_selected` | 切换真题库、错题本或全部来源 |
| `projection_mode_entered` / `projection_mode_exited` | 投影模式进入和退出 |
| `word_upload_started` | Word 上传开始 |
| `ai_parse_chunk_success` / `ai_parse_completed` | AI 解析成功进度 |
| `ai_parse_*_failed` / `word_import_failed` | AI 或 Word 导入失败 |
| `frontend_error` / `unhandled_rejection` | 前端运行错误 |

这些事件用于回答“老师有没有真的用这个功能”“哪个模块最容易出错”“迁移训练是否被打开”。事件上下文只保留题号、分类、fine tag、模块、题池数量等非隐私字段。

事件会做短时间去重，避免同一个错误或同一个页面打开动作刷屏。但 `source`、`tab`、`status` 不同的事件会保留，例如老师从“真题库”切到“全部”来源时仍会记录。这一点很重要：否则使用数据会漏掉真实的功能选择。

## 9. 复盘节奏

每轮重要发布后检查：

- 哪类问题最多。
- 哪个模块最常报错。
- 哪个功能真实使用最少。
- 下一轮只处理哪几个最高价值问题。
