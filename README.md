# Seeklume · 英语教学系统 1.0

Seeklume 是面向高中英语教师的试卷讲评工作台。当前 v1 聚焦语法填空：把真题、错题、备课篇章、考点知识库和 AI 辅助解析放在同一个课堂可用的网页里，帮助老师从“对答案”转向“讲规律、讲语篇、讲迁移”。

线上入口：

- GitHub Pages 发布目录：`docs/`
- 自定义域名：`https://seeklume.work/`
- 当前主模块：`docs/grammar-fill/`

## 当前范围

v1 只做语法填空，只服务老师端。完形填空、阅读理解、读后续写、应用文、学生端、班级管理和成绩分析都不属于当前公开版本。

公开仓库里可以部署的是非敏感教学工具和题库数据。涉及学生姓名、班级、分数、画像或其它隐私数据的成绩分析不进入 GitHub Pages 发布路径。

## 已有能力

| 能力 | 当前状态 |
|---|---|
| 按套卷练习 | 19 套公开语法填空题库，190 道题，按年份和试卷组织 |
| 按考点练习 | 11 个粗考点 + fine tag / trap / focus 等精细标签 |
| 讲题台 | 点击空格打开答案、中文句、分析、讲题卡、迁移训练和考点知识 |
| 迁移训练 | 从真题库、错题本和备课资料中按相近考点生成迁移题 |
| 知识库 | 考点树、教材视图、书本速查、知识地图、全局图谱 |
| 错题本 | 本地保存、JSON 批量导入、Word/AI 导入、云同步 |
| 备课资料 | 导入完整篇章，像套卷一样进入课堂讲题路径 |
| 账户系统 | Supabase Auth、跨设备同步、账户设置、数据导出/清空申请 |
| 管理员 | 管理员视图、反馈问题池、view-as 只读边界 |
| AI | DeepSeek 经 Supabase Edge Function 代理，用于 Word 解析、翻译和助手 |
| 反馈与观测 | 反馈弹窗、最小化非隐私使用事件、错误上下文脱敏 |

## 技术架构

当前继续保持轻量静态站架构：

```text
浏览器原生 HTML/CSS/JS
  -> GitHub Pages 发布 docs/
  -> Cloudflare 自定义域名
  -> Supabase Auth / Postgres / Edge Functions
  -> DeepSeek API 代理
```

当前明确不引入 React、Vue、Vite、TypeScript 或新的前端框架。工程方向是把 `docs/grammar-fill/index.html` 逐步拆成纯模块和状态模型，而不是重写成新技术栈。

## 项目结构

```text
.
├── AGENTS.md                         # AI agent 工作约定，工程协作先读这里
├── PROJECT_LOG.md                    # 项目日志，记录关键决策、改动和验证
├── PROJECT_CHARTER.md                # 产品边界和长期判断标尺
├── docs/                             # GitHub Pages 发布目录
│   ├── index.html                    # 公开首页
│   ├── privacy.html                  # 隐私说明
│   ├── config.js                     # Supabase 公开配置
│   ├── grammar-fill/                 # 语法填空主应用
│   │   ├── index.html                # 页面接线层，仍较大，持续收敛中
│   │   └── modules/                  # 纯逻辑、视图模型和状态模型
│   ├── shared/                       # 登录、云端、AI、反馈、Word 导入等共享模块
│   ├── data/                         # 发布题库和知识库数据
│   └── planning/                     # 工程流程、回归、发布、隐私和路线图
├── data/                             # 原始题库和构建源
├── methodology/                      # 教学方法论与原始资料
├── classroom-materials/              # 课堂模板和教研产出
├── scripts/                          # 构建、检查、发布前门禁脚本
├── supabase/                         # Edge Functions、migration、RLS 自查
├── tests/                            # Playwright smoke 测试
├── package.json                      # 本地工程检查命令
└── CLAUDE.md                         # 研究资料流和历史协作说明
```

## 本地运行

静态站可以直接用本地 HTTP 服务打开：

```bash
cd /Users/zhenliu/Desktop/英语教学系统1.0
python3 -m http.server 8787
```

然后访问：

```text
http://localhost:8787/docs/
http://localhost:8787/docs/grammar-fill/
```

不要直接用 `file://` 验证主应用；模块脚本、浏览器权限和部分路径行为在本地 HTTP 服务下更接近线上。

## 工程验证

发布前基线命令：

```bash
npm run check
```

这条命令会运行：

- 题库结构和数据链路检查
- 语法填空模块契约和纯模块边界检查
- 公开密钥和隐私数据扫描
- Supabase migration rollback / RLS 自查要求
- Edge Function 合同检查
- 静态站关键文件和基础 JS 语法检查
- Playwright 浏览器 smoke 测试

常用小步检查：

```bash
python3 scripts/check_grammar_modules.py
npx playwright test tests/smoke.spec.js --project=chromium -g "grammar-fill core path"
npm run check
```

## 发布流程

`main` 是稳定线上基线。GitHub Pages 从 `main` 的 `docs/` 发布。

正式发布前：

```bash
git status --short --branch
npm run check
```

合并到 `main` 并 push 后，GitHub Pages 会自动发布。线上可能有几分钟部署或 CDN 缓存延迟。

生产 Supabase migration 不是普通 push 的一部分。执行生产库 migration 必须单独确认、备份，并按 `docs/planning/release-runbook.md` 操作。

## AI 协作入口

新 agent 接手时，先读：

```text
AGENTS.md
PROJECT_LOG.md
docs/planning/*.md
```

其中 `AGENTS.md` 是当前工程协作规则，`PROJECT_LOG.md` 是最新状态记录，`docs/planning/` 是发布、回归、隐私、数据链路和路线图依据。

`CLAUDE.md` 仍保留研究资料流和早期题库处理流程，但工程实施不再以它作为唯一入口。
