# 项目日志

> 按日期记录关键决策、进度和下一步。论文写作时可回溯引用。

---

## 项目概况

**项目名**：英语教学系统 1.0  
**定位**：一套辅助教师进行英语教学的体系化工具，当前聚焦试卷讲评课  
**技术栈**：纯前端 HTML/CSS/JS + Supabase 后端（用户系统 + 云同步）  
**部署**：GitHub Pages + 自定义域名 `seeklume.work`  
**仓库**：已关联 GitHub，`main` 分支  

### 三个核心目标

1. **讲卷框架** — 固定导问流程，按步骤引导学生
2. **题库积累** — 每道讲过的题存下来，打上考点标签
3. **跨卷联动** — 讲新卷子时自动关联旧卷同考点题

---

## 2026-05-12（启动日）

### 产出

- **语法填空课堂助手 v1.0 上线**：`src/grammar-fill/index.html`
  - 四个模块：按套卷练习、按考点分类练习、错题本、备课资料
  - 11 个考点标签：谓语动词 · 非谓语动词 · 词性转换 · 数词 · 冠词 · 代词 · 介词 · 逻辑连词 · 定语从句 · 名词性从句 · 状语从句
  - 抽屉式解析面板（可拖拽调整高度），支持上下箭头键盘导航
  - 解析面板：答案 + 定位句 + 解题步骤 + 技巧提示 + 考点理论展开
  - 迁移训练 tab：跨卷同考点题目关联，每套卷取 1 题
  - 字号调节：原文和抽屉独立缩放
- **题库生成脚本**：`scripts/build_grammar_bank.py` — 从 `data/语法填空库/*.md` 生成 `data/grammar_bank.js`
- **GitHub Pages 部署**：`docs/` 目录 + `scripts/deploy.sh`
- **自定义域名**：`seeklume.work` 绑定到 GitHub Pages
- **Supabase 后端接入**：
  - 用户注册/登录（用户名 + 密码，无需邮箱）
  - 错题本和备课资料云端同步
  - 管理员视图（`liuzhenlzstiles@icloud.com` 为管理员）
  - 审批注册模式（关掉邮箱验证，管理员手动审批）
- **Word 文档 + AI 解析**：错题本支持上传 Word 文档，DeepSeek AI 自动识别语法填空题目并解析
- **项目首页**：`docs/index.html`，对外展示项目定位

### 关键决策

- 数据源采用 `data/语法填空库/*.md`（markdown 原始文件），通过 Python 脚本构建为 JS
- 前端数据加载方式：`<script src="../../data/grammar_bank.js">`（外部引用，非内联）
- 后端选 Supabase（免费额度足够个人/小团队使用）

### 提交记录

```
8f8a84c 语法填空课堂助手 v1.0
222ad67 更新 README
49166b4 添加 MIT License
3bd7f60 添加访问密码保护（SHA-256 哈希）
4dda1df Initial commit
2dd5ff2 合并远程仓库
ebcad3a 修正密码：progess -> progress
bf9d25b 接入 Supabase 后端 + 管理员视图
1c932c9 加云同步状态指示器
98eb25f 配置自定义域名 seeklume.work
313964c 添加 Word 文档上传 + DeepSeek AI 智能解析功能
11a3e45 错题本也支持 Word 文档上传 + AI 解析
8cad4e7 修复 UX：返回上一页 + 字号统一缩放
64b9821 添加浮动回到顶部按钮
fde8392 浮动按钮改为始终可见
d29c166 注册登录改为用户名+密码
5620456 抽屉解析改为三tab：解析 + 迁移训练 + 考点理论
```

---

## 2026-05-13（今日）

### 产出

- **多终端并行开发**：多个终端同时跑项目，推进语法填空工具迭代
- **`src/grammar-fill/index.html` 持续迭代**（当前版本：含解析/迁移训练/考点理论三 tab 抽屉）
- ~~**`src/grammar-fill/standalone.html`** (537KB)：数据内联的自包含版本~~ → 2026-05-17 已删除（不再需要线下版）
- **`docs/grammar-fill/index.html`**：部署版本同步更新
- **今日新增临时文件**：
  - `辅助ai的临时性文件/20250513语法填空_import.json` — 错题导入数据
  - `辅助ai的临时性文件/20250513语法填空_备课资料.json` — 备课资料导入数据
  - `辅助ai的临时性文件/山东二模·课堂讲评讲义.md` — 课堂讲评材料
- **项目日志建立**：本文件，开始记录每日进度
- **论文与分享方向初步确定**（见下方关键决策）
- **后端迁移 Supabase → LeanCloud（进行中）**：
  - `src/grammar-fill/index.html` 已改：`window.SUPABASE_URL` → `window.LC_APP_ID`，`supabase.createClient` → `AV.init`，管理员判断从邮箱改为手机号
  - `docs/grammar-fill/index.html` **尚未同步**——部署版仍硬编码 Supabase 密钥
- **考点知识库大扩充**：
  - `predicate`（谓语动词）从 3 条扩至 5 大块：时间标志、语境并列、时态呼应、语态、主谓一致
  - 新增 `nonpredicate`（非谓语动词）完整分类：4 种考法（状语补语、定语、宾语、主语表语）
  - 新增 `word`（词性转换）开始填充
  - `src/grammar-fill/index.html` 和 `docs/grammar-fill/index.html` 均在同步修改

### 工作状态

- **待提交的修改**（`git status` 显示 modified 但未 commit）：
  - `src/grammar-fill/index.html` — LeanCloud 替换 + 知识库扩充
  - `docs/grammar-fill/index.html` — 知识库扩充（但 Supabase 部分未改）
- **未跟踪文件**：`PROJECT_LOG.md`、`supabase/.temp/`

### 发现的 Bug / 待解决问题

- ~~**HTML 独立部署问题**：standalone.html 用于离线/U 盘版~~ → 2026-05-17 已确认不再需要线下版，全部走 seeklume.work 线上
- ~~**docs/ 部署版落后**：LeanCloud 替换只改了 src/~~ → LeanCloud 迁移已回滚，现仍是 Supabase

### 关键决策

- **论文定位**：技术+教育融合 — AI 辅助教师构建试题知识库，实现跨卷联动。核心问题不是「我做了个系统」，而是解决教学痛点「试卷讲评课缺乏结构化引导」「教师难以横向对比真题发现命题规律」
- **首次分享场合**：校内教研组，十几人规模，小面积尝试
- **分享目标**：让老师觉得有用、想用，重点展示 demo（选一篇真题，走一遍导问流程）
- **Git/GitHub**：本会话中已讲解基础概念（commit = 快照，branch = 平行版本，push/pull = 同步）

### 文献基础（写论文可直接引用）

- 陈康等教育部考试院专家论文 21 篇（含框架论文、年度评析 9 篇、读后续写 8 篇、理论 3 篇）
- 课程标准结构化拆解 8 份 md
- 高考评价体系 + 评价体系说明 + 教育评价改革总体方案
- 方法论综合文档 5 份（应用文写作、读后续写、七选五、阅读理解、完形填空、语法填空）
- 课堂模板 4 份（读后续写双轨提纲、应用文双支架提纲、质量自检清单、设计依据）

---

## 下一步（按优先级）

- [x] ~~确认 `standalone.html` 是否完整可用~~ → 2026-05-17 已删除，不再需要线下版
- [ ] 清理 `辅助ai的临时性文件/` 目录中已使用的中间文件
- [ ] 准备论文写作框架（研究问题 + 文献综述 + 方法论 + 预期贡献）
- [ ] 准备教研组分享 outline（痛点 → Demo → 反馈收集）
- [ ] `git add PROJECT_LOG.md && git commit && git push`

---

## 2026-05-28

### 产出

- 建立工程化分支 `codex/engineering-hardening`，以 `261b693` 作为当前回滚基线。
- 新增发布前检查：
  - `scripts/check_grammar_bank.py`：检查题库结构、分类、题号、解析、fine tag。
  - `scripts/check_grammar_modules.py`：检查语法填空模块加载顺序、导出 API 和纯逻辑模块边界。
  - `scripts/check_public_secrets.py`：检查公开仓库密钥泄露。
  - `scripts/check_static_site.sh` / `scripts/check_all.sh`：静态站发布门禁。
  - `scripts/check_supabase_migrations.py`：检查数据库 migration 是否有 rollback，RLS 变更是否有自查脚本。
  - `scripts/check_edge_functions.py`：检查 Edge Function 的接口合同、鉴权、错误返回和 AI key 配置。
  - `tests/smoke.spec.js` + Playwright：自动打开首页、隐私页、语法填空页，验证套卷、讲题台、迁移训练、反馈提交、模拟登录/退出、登录态错题本、备课资料、本地跨账号隔离、投影模式、管理员查看边界，以及 Word 上传的 AI 成功导入、AI/Edge Function 错误降级导入和错误记录。
- 修复安全问题：`scripts/translate_bank.py` 不再硬编码 DeepSeek key，只从 `DEEPSEEK_API_KEY` 环境变量读取。
- 补齐工程文档：
  - `docs/planning/engineering-process.md`
  - `docs/planning/data-lineage.md`
  - `docs/planning/security-privacy.md`
  - `docs/planning/feedback-observability.md`
  - `docs/planning/regression-checks.md`
- 新增 GitHub issue / PR 模板，把目标、影响范围、验收、回滚、安全隐私检查固定到协作流程。
- 新增 Supabase migration：`feedback_reports` 与 `app_events`，用于用户反馈和最小化运行事件记录；同时补对应 rollback SQL 和 RLS 自查脚本。
- 强化 Supabase migration 门禁：`scripts/check_supabase_migrations.py` 现在会检查 rollback 是否覆盖新建 public 表和新建 policy，并要求 RLS 自查脚本覆盖匿名/普通用户/管理员/清理步骤。
- 调整 Playwright smoke 端口：默认从 `8787` 改为 `8797`，并支持 `SEEKLUME_SMOKE_PORT` 覆盖，避免和本机其他服务端口冲突导致误报。
- 新增前端反馈与报错底座：`docs/shared/observability.js`，并在语法填空页接入反馈按钮、反馈弹窗、云同步失败记录。
- 强化反馈和事件上下文脱敏：前端收集和 Supabase 写入前都会递归过滤嵌套的 password/token/key/secret/authorization/cookie 类字段，并替换常见 AI key、JWT 和敏感赋值片段。
- 调整错误观测模块：允许业务模块覆盖当前页面模块，避免 Word/AI 报错只显示为 `lesson-prep`，方便后续定位。
- 补齐反馈问题池字段：`reproducible`、`affected_users_count`、`source`，用于后续分诊、排序和复盘；前端反馈弹窗同步增加“能否复现”和“影响人数”。
- 管理员页新增最小反馈问题池：可查看最近反馈，并将状态从 `new` 推进到 `triaged` / `in_progress` / `released` / `closed`。
- 接入非隐私使用事件：模块打开、讲题台打开、讲题 tab 切换、迁移训练查看/来源切换、投影模式进入/退出，便于判断真实功能使用情况。
- 调整事件去重规则：短时间重复事件仍去重，但 `source` / `tab` / `status` 不同的事件会保留，避免漏掉迁移来源切换和反馈状态推进。
- 拆出第一批纯逻辑/状态模块：
  - `docs/grammar-fill/modules/category-rules.js`
  - `docs/grammar-fill/modules/teaching-axes.js`
  - `docs/grammar-fill/modules/migration-training.js`
  - `docs/grammar-fill/modules/question-model.js`
  - `docs/grammar-fill/modules/passage-utils.js`
  - `docs/grammar-fill/modules/app-state.js`
- 继续拆文本处理纯逻辑：`docs/grammar-fill/modules/passage-utils.js` 承接题目句定位、空格前缀计算和英文/中文句子对齐；`index.html` 继续负责 HTML 拼接和交互按钮，避免把 UI 副作用塞进纯模块。
- 继续拆讲题台纯逻辑：新增 `docs/grammar-fill/modules/teaching-view-model.js`，承接讲题 tab 标准化、讲题头部信息、知识图谱节点选择和思维导图激活规则；`index.html` 保留包装函数，降低一次性重构风险。
- 继续拆题目判断纯逻辑：新增 `docs/grammar-fill/modules/focus-rules.js`，承接题目文本聚合、词性转换目标识别、谓语线索识别、陷阱 ID 推断和小考点识别；`index.html` 保留旧函数名作为包装，降低对迁移训练、讲题卡和知识图谱的影响。
- 继续拆讲题卡规则：`docs/grammar-fill/modules/teaching-guide.js` 承接 `FOCUS_GUIDES`、`TRAP_GUIDES`、讲题卡生成和课堂路径生成；`index.html` 只保留兼容包装，避免迁移训练、抽屉和投影模式一次性改调用入口。
- 继续拆讲题台思维导图规则：`docs/grammar-fill/modules/teaching-view-model.js` 承接 `TEACHING_GRAMMAR_MINDMAPS` 和思维导图定义选择；`index.html` 保留兼容常量和包装函数，避免 UI 渲染层同步大改。
- 继续拆题目模型纯逻辑：`docs/grammar-fill/modules/question-model.js` 承接套卷题目构造、套卷状态构造、错题状态构造、fine tag 展示信息和知识库频次统计；`index.html` 保留旧函数名作为包装，降低知识库、错题本和讲题台同步改造风险。
- 继续拆迁移训练和知识图谱纯逻辑：`docs/grammar-fill/modules/migration-training.js` 承接课堂迁移 key 生成与重合判断，`docs/grammar-fill/modules/teaching-view-model.js` 承接图谱节点索引、节点类型标签、颜色、尺寸、关联节点、聚焦状态、预设视图、边界计算和文字换行；`index.html` 继续保留兼容包装，避免 UI 层一次性大改。
- 继续拆迁移训练推荐规则：`docs/grammar-fill/modules/migration-training.js` 承接按课堂判断 key、非谓语形式/功能、fine tag、trap、focus、粗分类兜底构建推荐池，并生成 header、tabs、空状态和迁移题卡元数据；`index.html` 只负责注册题卡、生成句子 HTML 和渲染按钮。
- 继续拆知识图谱数据逻辑：`docs/grammar-fill/modules/teaching-view-model.js` 承接节点标签组、节点路径、节点与题目匹配、相关题池筛选、图谱搜索、知识地图分类标签和根节点颜色；`index.html` 只保留渲染面板、按钮和 DOM 事件。
- 推进状态收敛：`GrammarAppState` 由一次性初始化升级为同步桥，覆盖进入套卷/错题/备课、打开讲题台、讲题 tab 切换、迁移题跳转和退出讲题等关键状态变化。
- 继续推进状态收敛：`docs/grammar-fill/modules/app-state.js` 承接当前题号计算、上一视图返回文案和 dock 返回文案；`docs/grammar-fill/modules/question-model.js` 承接套卷排序；`index.html` 只负责读取 DOM 当前页和触发实际导航。
- 继续推进状态收敛：`docs/grammar-fill/modules/app-state.js` 承接讲题上下文快照、题组上下文比较、题号范围规范和讲题 session 构造；`index.html` 保留旧入口和 UI 副作用，避免讲题台、迁移跳题、投影模式一次性大改。
- 继续拆页面数据模型：新增 `docs/grammar-fill/modules/sidebar-view-model.js`，承接侧边栏的套卷按年份分组、考点计数、错题分组、备课列表和激活项判断；`index.html` 继续负责 HTML 拼接和点击事件。
- 继续拆主页 Dashboard 规则：新增 `docs/grammar-fill/modules/home-dashboard-model.js`，承接新/活跃用户判断、按时间欢迎语、教材封面顺序和首页行动入口元数据；`index.html` 保留现有视觉和 DOM 交互。
- 继续拆套卷入口规则：新增 `docs/grammar-fill/modules/exam-grid-model.js`，承接首页套卷列表的年份分组、真题/模拟标签样式、题量统计和卡片数据；`index.html` 只负责生成 HTML 和触发进入套卷。
- 继续拆课堂切换条规则：新增 `docs/grammar-fill/modules/classroom-switcher-model.js`，承接课堂顶部套卷下拉、题号下拉、答案按钮和进度文案的数据模型；`index.html` 继续负责更新 DOM 和触发导航。
- 继续拆练习页视图状态：新增 `docs/grammar-fill/modules/practice-view-model.js`，承接练习页标题/题量、答案/中文切换按钮、中文翻译来源和翻译用原文生成；`index.html` 保留正文 HTML 渲染、AI 翻译请求和点击事件。
- 继续拆练习页正文规则：`docs/grammar-fill/modules/practice-view-model.js` 承接考点模式按套卷分组、考点页提示文案、套卷/备课 passage 来源、段落切分和未定位空格兜底列表；同时修正考点模式点击题目时的索引字段。
- 继续拆知识库页面数据模型：新增 `docs/grammar-fill/modules/knowledge-view-model.js`，承接考点分布统计、书本速查搜索索引、fine category 统计、教材单元分组、教材册题量统计和 unit 题单筛选；`index.html` 继续负责具体 HTML、弹窗和导航副作用。
- 回填浙江首考缺失解析，修复发布检查暴露的数据质量问题。
- 明确题库数据产物边界：`data/grammar_bank.js` 保留“自动生成勿手改”头部，`docs/data/grammar_bank.js` 保留“当前 canonical，可手改但必须跑检查”头部，并把该规则纳入检查脚本。
- 强化题库数据链路门禁：`scripts/check_grammar_bank.py` 现在会检查 `data/grammar_bank.js` 自动生成头部，并核对 `data/语法填空库/*.md`、`data/grammar_bank.json`、`docs/data/grammar_bank.js` 的套卷清单一致。
- 统一发布前命令为 `npm run check`，底层仍调用 `scripts/check_all.sh`；新增 `docs/planning/release-checklist-template.md`，把发布目标、影响范围、验证、回滚和发布后观察固定成模板。
- 补齐用户数据权利最小版本：账户设置支持导出错题本/备课资料 JSON、清空自己的云端学习数据，并可提交账号删除申请到反馈问题池；账号真实删除仍需后续服务端 Edge Function 或管理员处理，避免前端暴露 service role key。
- 补强大改回滚流程：`docs/planning/engineering-process.md` 和 `docs/planning/release-runbook.md` 明确回滚基线、checkpoint commit 和本地大改失败时的处理方式。checkpoint 是本地安全快照，不等同于正式发布。
- 新增 `AGENTS.md` 作为 AI 工作规程：固定要求新对话先读 `PROJECT_LOG.md` 与 `docs/planning/*.md`，明确技术路线、安全边界、编辑规则、验证命令、Supabase/AI 授权边界和收尾汇报格式，降低跨对话交接成本。
- 继续拆练习页正文规则：`docs/grammar-fill/modules/practice-view-model.js` 承接按题号替换空格、考点模式句子模型、套卷/备课正文按位置顺序替换和未匹配空格统计；`index.html` 只负责生成 HTML 标签和点击事件。
- 继续推进状态收敛：`docs/grammar-fill/modules/app-state.js` 承接练习页显示状态的重置、答案切换和中文切换纯规则；`index.html` 保留 `showAnswers` / `showChinese` 兼容变量，但所有练习页显示状态变化统一经由 `GrammarAppState` 同步桥。
- 继续推进状态收敛：`docs/grammar-fill/modules/app-state.js` 承接原文/抽屉字号的夹取和增减规则；`index.html` 保留 `passageFontSize` / `drawerFontSize` 兼容变量，只负责把状态结果写入 CSS 变量和页面数字。
- 继续推进状态收敛：`docs/grammar-fill/modules/app-state.js` 承接主页视图规范化和 dock key 选择；`index.html` 保留 `_currentHomeView` 兼容变量，但主页/套卷/考点分类切换统一经由 `GrammarAppState` 同步桥。
- 继续推进状态收敛：`docs/grammar-fill/modules/app-state.js` 承接知识库视图规范化和节点/key 状态构造；`index.html` 保留 `currentKnowledgeView/currentKnowledgeKey/currentKnowledgeNodeId/currentIsPattern` 兼容变量，但教材/考点/书本速查/知识地图/全局图谱切换统一经由 `GrammarAppState` 同步桥。

### 验证

- `bash scripts/check_all.sh` 通过。
- `npm run check` 通过。
- `python3 scripts/check_grammar_modules.py` 通过，16 个语法填空模块契约有效。
- `python3 scripts/check_grammar_modules.py` 覆盖 `GrammarPracticeViewModel` 的空格替换、考点练习模型和顺序替换 API，防止练习页正文规则回流到大 HTML。
- `npx playwright test tests/smoke.spec.js --project=chromium -g "grammar-fill core path"` 通过，覆盖语法填空核心路径和本轮新增 PracticeViewModel 断言。
- `python3 scripts/check_grammar_bank.py` 会检查公开题库 canonical 头部，防止数据真源和发布数据角色再次混淆。
- `python3 scripts/check_grammar_bank.py` 会检查原始 markdown、结构化 JSON、公开发布 JS 的套卷清单一致，防止新增题库素材后忘记重新生成或发布。
- `python3 scripts/check_supabase_migrations.py` 会检查 migration、rollback 和 RLS 自查脚本的覆盖关系，防止数据库结构改动缺少回滚和权限验证路径。
- `npm run check` 中的 Playwright smoke 会使用独立本地端口；若本机端口冲突，可通过 `SEEKLUME_SMOKE_PORT=8897 npm run check` 指定。
- `npx playwright test tests/smoke.spec.js --project=chromium` 通过，9 条 smoke 测试全部通过。
- Playwright smoke 已断言 `GrammarTeachingViewModel` 加载，并覆盖讲题台打开、迁移 tab 和图谱节点选择基础逻辑。
- Playwright smoke 已断言 `GrammarPassageUtils` 能生成题目英文句、空格前缀和对应中文句，防止讲题台句子定位规则从 HTML 迁出后静默失效。
- Playwright smoke 已断言 `GrammarFocusRules` 加载，并覆盖小考点识别与陷阱 ID 推断基础逻辑。
- Playwright smoke 已断言 `GrammarTeachingGuide` 能生成讲题卡和课堂路径，防止讲题卡规则从 HTML 迁出后静默失效。
- Playwright smoke 已断言 `GrammarTeachingViewModel` 能生成思维导图定义和 active keys，防止思维导图规则从 HTML 迁出后静默失效。
- Playwright smoke 已断言 `GrammarMigrationTraining` 能生成课堂迁移 key 并判断 key 重合，防止迁移训练推荐规则从 HTML 迁出后静默失效。
- Playwright smoke 已断言 `GrammarMigrationTraining` 能生成完整迁移训练数据，包括 tabs、header、推荐池数量和迁移题卡元数据，防止迁移训练筛题规则从 HTML 迁出后静默失效。
- Playwright smoke 已断言 `GrammarTeachingViewModel` 能生成知识图谱节点索引、关联节点、边界、预设视图、节点标签/颜色和文字换行，防止全局图谱计算规则从 HTML 迁出后静默失效。
- Playwright smoke 已断言 `GrammarTeachingViewModel` 能生成节点标签组、节点路径、相关题池、图谱搜索结果、知识地图分类标签和根节点颜色，防止知识图谱 inspector/search 规则从 HTML 迁出后静默失效。
- Playwright smoke 已断言 `GrammarQuestionModel` 能生成套卷题目、套卷状态、fine tag 信息和知识库频次标签，防止题目模型从 HTML 迁出后静默失效。
- Playwright smoke 已覆盖 `GrammarAppState` 同步：进入套卷、打开讲题台、切换讲题 tab、退出讲题后状态容器与页面状态一致。
- Playwright smoke 已断言 `GrammarAppState` 状态工具能生成上下文快照、比较题组上下文、循环题号、夹取题号，并构造讲题 session，防止状态逻辑迁出后静默失效。
- Playwright smoke 已断言 `GrammarAppState` 能重置练习页显示状态、切换答案和切换中文，并覆盖页面按钮点击后 `showAnswers` / `showChinese` 与按钮显示同步。
- Playwright smoke 已断言 `GrammarAppState` 能夹取和增减字号，并覆盖原文字号按钮点击后状态容器、页面显示和 CSS 变量同步。
- Playwright smoke 已断言 `GrammarAppState` 能规范主页视图和 dock key，并覆盖套卷/考点分类 dock 点击后 `currentHomeView` 与当前高亮 dock 同步。
- Playwright smoke 已断言 `GrammarAppState` 能规范知识库视图状态，并覆盖教材视图、考点视图和书本速查切换后状态容器与页面一致。
- Playwright smoke 已断言 `GrammarQuestionModel` 能生成按年份倒序的套卷列表，`GrammarAppState` 能计算当前题号、上一视图返回文案和 dock 返回文案。
- Playwright smoke 已断言 `GrammarSidebarViewModel` 能生成侧边栏套卷分组、考点列表、错题分组、备课列表和当前项高亮数据，防止侧边栏规则从 HTML 迁出后静默失效。
- Playwright smoke 已断言 `GrammarHomeDashboardModel` 能生成首页新/活跃用户状态、欢迎语、教材封面画廊和行动入口数据，防止主页 Dashboard 规则从 HTML 迁出后静默失效。
- Playwright smoke 已断言 `GrammarExamGridModel` 能生成首页套卷卡片分组、模拟卷标签样式、未知年份兜底和题量统计，防止套卷入口规则从 HTML 迁出后静默失效。
- Playwright smoke 已断言 `GrammarClassroomSwitcherModel` 能生成课堂顶部切换条选项、禁用状态、答案按钮文案和进度文案，防止课堂导航规则从 HTML 迁出后静默失效。
- Playwright smoke 已断言 `GrammarPracticeViewModel` 能生成练习页标题/题量、答案/中文按钮状态、中文翻译段落和翻译用填空原文，防止练习页状态规则从 HTML 迁出后静默失效。
- Playwright smoke 已断言 `GrammarPracticeViewModel` 能生成考点模式分组、提示文案、正文来源、段落切分和未定位空格兜底列表，并覆盖考点模式点击空格打开讲题台。
- Playwright smoke 已断言 `GrammarKnowledgeViewModel` 能生成考点分布、知识库搜索结果、fine category 统计、教材册/单元统计和 unit 题单筛选结果，防止知识库数据规则从 HTML 迁出后静默失效。
- Playwright smoke 已覆盖知识库基础交互：进入知识库、切换教材视图/考点视图/书本速查、执行搜索后再回到套卷练习。
- Playwright smoke 已覆盖非隐私使用事件写入：讲题 tab、迁移训练查看、迁移来源切换、投影模式进入/退出。
- Playwright smoke 已覆盖普通用户不能查看管理员列表、管理员可查看并更新反馈状态、管理员 view-as 可读，以及 view-as 状态下不写入被查看用户数据。
- Playwright smoke 已覆盖反馈提交会写入分类、复现情况、影响人数、来源和递归脱敏错误上下文。
- Playwright smoke 已覆盖账户设置：导出学习数据不含 password/token/key，清空学习数据会调用 `error_book` / `lesson_prep` 云端删除，账号删除申请会写入 `feedback_reports`。
- Playwright smoke 已覆盖错题本单条删除会调用云端 `error_book` 删除，备课资料单条删除会调用云端 `lesson_prep` 删除。
- Playwright smoke 已覆盖 Word 上传 AI 解析成功后进入统一导入面板、确认导入备课资料，并记录 `ai_parse_chunk_success` / `ai_parse_completed` 成功事件。
- 本地静态服务器打开 `http://localhost:8787/docs/grammar-fill/`，页面正常加载。
- 浏览器验证反馈按钮唯一，反馈弹窗可打开/关闭，控制台无错误。

### 风险与下一步

- `feedback_reports` / `app_events` 需要在生产 Supabase 执行 migration 后才会真正落库；执行前不影响主功能。
- `app-state.js` 当前是同步桥，旧全局变量尚未全面迁移；讲题台 UI 渲染仍主要在大 HTML 中。
- Playwright 当前仍是 smoke 级别；已覆盖模拟 Supabase 登录/退出、错题本/备课资料/投影、本地跨账号隔离、管理员只读边界，以及 Word 上传的模拟 AI 成功导入和 AI 解析失败降级路径，但还没覆盖真实 Supabase 账号、真实 Word 样本成功率、真实 AI/Edge Function 运行路径和真实管理员后端。
- 下一步继续拆剩余页面渲染前的数据模型、收敛 `app-state.js` 与旧全局变量之间的同步边界，并扩展 Playwright 核心路径测试。

*此日志随项目推进持续更新。最后更新：2026-05-28*
