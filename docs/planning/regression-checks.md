# Seeklume 回归检测说明

> 状态：v0.1。目标是让每次改代码后，都能用命令证明旧功能没有明显坏掉。

## 1. 一条总命令

发布前运行：

```bash
npm run check
```

这条命令会调用 `bash scripts/check_all.sh`，目前包含七层检查：

| 检查 | 文件 | 作用 |
|---|---|---|
| 数据回归 | `scripts/check_grammar_bank.py` | 检查每套 10 题、字段完整、分类合法、fine tag 合法、生成产物头部、源 markdown 与发布题库套卷清单一致 |
| 模块边界检查 | `scripts/check_grammar_modules.py` | 检查语法填空模块是否被 HTML 正确加载、是否暴露约定 API、纯逻辑模块是否避免 DOM/网络副作用 |
| 密钥扫描 | `scripts/check_public_secrets.py` | 防止 AI key、Supabase service role key、学生隐私误进公开仓库 |
| Supabase migration 检查 | `scripts/check_supabase_migrations.py` | 检查 migration 是否有 rollback，rollback 是否覆盖新建表/新建 policy，RLS 变更是否有覆盖匿名/普通用户/管理员/清理步骤的自查脚本 |
| Edge Function 检查 | `scripts/check_edge_functions.py` | 检查接口合同、POST/CORS/鉴权、错误 JSON 和 AI key 配置 |
| 静态站检查 | `scripts/check_static_site.sh` | 检查关键 HTML/JS 文件存在，基础 JS 语法通过 |
| 浏览器 smoke | `tests/smoke.spec.js` | 自动打开页面，点一遍首页、套卷、讲题台、迁移来源切换、反馈提交、模拟登录/退出、账户数据导出/清空/删除申请、错题本、备课资料、删除同步、跨账号隔离、管理员边界、投影模式、Word/AI 成功导入和失败降级路径 |

## 2. Playwright 是什么

Playwright 是一个自动控制浏览器的测试工具。它会像真实用户一样打开网页、点击按钮、检查页面内容。

当前第一版只做“冒烟测试”：确认最核心页面能打开、最核心点击不会报错。它不是完整验收，还不能证明所有业务都没问题。

## 3. 当前覆盖范围

- `docs/index.html` 首页能打开。
- `docs/privacy.html` 隐私说明能打开。
- `docs/grammar-fill/` 能加载题库和模块脚本。
- 语法填空模块加载顺序和导出 API 符合 `scripts/check_grammar_modules.py` 里的契约。
- 文本处理纯逻辑模块 `GrammarPassageUtils` 能加载，并能生成题目英文句、空格前缀和对应中文句。
- 题目判断纯逻辑模块 `GrammarFocusRules` 能加载，并能生成小考点识别和陷阱 ID 推断结果。
- 讲题卡纯逻辑模块 `GrammarTeachingGuide` 能加载，并能生成讲题卡和课堂路径。
- 讲题台纯逻辑模块 `GrammarTeachingViewModel` 能加载，并能生成 tab 标准化和图谱节点选择结果。
- 讲题台思维导图规则由 `GrammarTeachingViewModel` 提供，并能生成 mindmap 定义和 active keys。
- 迁移训练纯逻辑模块 `GrammarMigrationTraining` 能生成课堂迁移 key，并判断两道题是否有迁移训练重合点。
- 迁移训练推荐规则由 `GrammarMigrationTraining` 提供，并能生成 tabs、header、推荐池数量、空状态和迁移题卡元数据。
- 知识图谱纯逻辑由 `GrammarTeachingViewModel` 提供，并能生成节点索引、关联节点、节点边界、预设视图、节点类型标签、节点颜色、聚焦状态和节点文字换行。
- 知识图谱 inspector/search 规则由 `GrammarTeachingViewModel` 提供，并能生成节点标签组、节点路径、相关题池、图谱搜索结果、知识地图分类标签和根节点颜色。
- 题目模型纯逻辑模块 `GrammarQuestionModel` 能加载，并能生成套卷题目、套卷状态、错题状态、fine tag 展示信息和知识库频次统计。
- 状态工具模块 `GrammarAppState` 不只保存状态，还能生成讲题上下文快照、比较题组上下文、规范题号范围，并构造讲题 session。
- 练习页显示状态由 `GrammarAppState` 提供重置、答案切换和中文切换规则；旧 `showAnswers` / `showChinese` 变量仍保留兼容，但页面状态变化会同步回状态容器。
- 原文/抽屉字号状态由 `GrammarAppState` 提供夹取和增减规则；旧 `passageFontSize` / `drawerFontSize` 变量仍保留兼容，但页面字号变化会同步回状态容器。
- 主页视图状态由 `GrammarAppState` 提供规范化和 dock key 选择；旧 `_currentHomeView` 变量仍保留兼容，但主页/套卷/考点分类切换会同步回状态容器。
- 知识库视图状态由 `GrammarAppState` 提供规范化和节点/key 状态构造；旧 `currentKnowledgeView/currentKnowledgeKey/currentKnowledgeNodeId/currentIsPattern` 变量仍保留兼容，但教材/考点/书本速查/知识地图/全局图谱切换会同步回状态容器。
- 套卷导航和页面返回纯逻辑由 `GrammarQuestionModel` / `GrammarAppState` 提供，并能生成排序后的套卷列表、当前题号、上一视图返回文案和 dock 返回文案。
- `GrammarAppState` 状态桥会跟随套卷进入、讲题台打开、tab 切换和退出讲题更新，作为后续减少全局变量的回归保护。
- 页面侧边栏数据模型由 `GrammarSidebarViewModel` 提供，并能生成套卷按年份分组、考点计数、错题分组、备课列表和当前项高亮。
- 主页 Dashboard 数据模型由 `GrammarHomeDashboardModel` 提供，并能生成新/活跃用户状态、按时间欢迎语、教材封面画廊和行动入口元数据。
- 首页套卷入口数据模型由 `GrammarExamGridModel` 提供，并能生成年份分组、真题/模拟标签样式、未知年份兜底和每套题量。
- 课堂顶部切换条数据模型由 `GrammarClassroomSwitcherModel` 提供，并能生成套卷下拉、题号下拉、答案按钮和进度文案。
- 练习页视图状态由 `GrammarPracticeViewModel` 提供，并能生成标题/题量、答案/中文按钮状态、中文翻译来源和翻译用原文。
- 练习页正文规则由 `GrammarPracticeViewModel` 提供，并能生成考点模式分组、提示文案、正文来源、段落切分和未定位空格兜底列表。
- 练习页空格替换规则由 `GrammarPracticeViewModel` 提供，并能处理按题号精确替换、考点模式句子模型和套卷/备课正文按位置顺序替换。
- 知识库页面数据模型由 `GrammarKnowledgeViewModel` 提供，并能生成考点分布、搜索索引和结果、fine category 统计、教材册/单元统计和 unit 题单筛选结果。
- 套卷入口能进入练习页。
- 考点入口能进入练习页，点击考点模式空格能打开讲题台。
- 套卷/考点分类 dock 点击后，`GrammarAppState.currentHomeView` 与当前高亮 dock 保持一致。
- 练习页能渲染 10 个空格。
- 练习页答案按钮能切换空格/答案；中文按钮会关闭答案模式，返回英文后恢复空格状态，且 `GrammarAppState` 与页面按钮显示一致。
- 原文字号按钮能更新显示数值和 CSS 变量，且 `GrammarAppState.passageFontSize` 同步更新。
- 知识库基础交互能进入教材视图、考点视图、书本速查，并能执行搜索。
- 知识库教材视图、考点视图、书本速查切换后，`GrammarAppState.currentKnowledgeView` 与页面当前视图保持一致。
- 点击空格能打开讲题台。
- 迁移训练 tab 能打开。
- 迁移训练来源能切换到真题库 / 我的错题 / 全部，并持久化到本地偏好。
- 使用数据能记录 `module_view`、讲题台 tab、迁移训练打开、迁移来源切换、投影模式进入/退出等非隐私事件。
- 反馈按钮能提交到 `feedback_reports`，并带最近错误上下文。
- 反馈记录会保存分类、严重程度、能否复现、影响人数和来源，方便后续分诊。
- 反馈/错误上下文会递归过滤 `password` / `token` / `key` / `secret` / `authorization` / `cookie` 类敏感字段，并替换常见 AI key、JWT 和敏感赋值片段。
- 模拟 Supabase 登录后，用户信息条和受保护页面状态会更新。
- 账户设置能导出错题本和备课资料 JSON，且导出内容不包含密码/token/key。
- 账户设置能清空自己的错题本和备课资料，并调用云端 `error_book` / `lesson_prep` 全量删除。
- 账号删除申请会写入 `feedback_reports`，作为管理员处理的隐私请求。
- 模拟退出后，本地状态会清理并跳回首页。
- 模拟登录用户后，错题本和备课资料能从 Supabase stub 渲染。
- 错题本单条删除会更新页面，并调用云端 `error_book` 删除。
- 备课资料单条删除会更新页面，并调用云端 `lesson_prep` 删除。
- 本地错题本和备课资料带 `_owner`，不同账号的本地残留不会串到当前用户。
- 普通用户进入管理员页时看不到用户列表。
- 管理员能查看最近反馈并推进反馈状态。
- 管理员 view-as 能读取目标用户数据，但 view-as 状态下不会写入目标用户错题本。
- 备课资料能进入讲题页。
- 投影模式能打开和退出。
- Word 上传能走到 AI 解析；当 Edge Function 返回成功结果时，系统会打开统一导入面板，确认后写入备课资料，并记录成功事件。
- Word 上传能走到 AI 解析；当 Edge Function 返回错误时，系统会记录 `ai_parse_http_failed`，并用空格兜底打开统一导入面板。
- Word/AI 失败事件会标记来源模块为 `word-import`，方便后续排查。
- 浏览器控制台没有致命错误。

## 4. 还没覆盖的范围

- 真实 Supabase 账号登录、注册、退出。
- 真实 Supabase 跨账号数据隔离。
- 真实 Supabase 管理员 RPC 和 RLS 联调。
- 真实 Word 样本上传成功率。
- 真实 AI/Edge Function 成功路径和长文档分批解析。
- 账号删除申请的管理员处理流程和服务端 Auth 用户删除。
- 错题本新增、批量删除、真实云端同步冲突。
- 备课资料导入、批量删除、真实云端同步冲突。
- Edge Function 运行时错误处理。

这些是后续要逐步补的核心路径。

## 5. 本地运行说明

第一次运行会安装 npm 依赖并下载 Playwright Chromium：

```bash
npm ci
npx playwright install chromium
npm run check
```

如果只是在临时环境里做数据修正，且浏览器无法安装，可以临时跳过浏览器 smoke：

```bash
SKIP_BROWSER_SMOKE=1 bash scripts/check_all.sh
```

正式发布前不能用跳过结果代替完整验收。

如果本机 `8797` 端口被占用，可以临时指定测试端口：

```bash
SEEKLUME_SMOKE_PORT=8897 npm run check
```
