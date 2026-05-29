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
- 讲题 tab 面板显示模型由 `GrammarTeachingGuide` 提供，并能生成 kicker、标题、副标题和实际讲题卡选择；`index.html` 继续负责 HTML 拼接、转义和讲题卡渲染。
- 讲题抽屉里的讲题卡/解题面板显示数据由 `GrammarTeachingGuide` 提供；`index.html` 继续负责 HTML 拼接、浮层开关和转义。
- 解析/讲题浮层开关计划由 `GrammarTeachingGuide` 提供，并能生成关闭 selector、目标 panel selector、是否打开和 active class；`index.html` 继续只负责 DOM class 写入。
- 解析抽屉显示模型由 `GrammarTeachingGuide` 提供，并能生成答案、中文句子、浮层按钮、上下题导航显隐、迁移数量和解题数据；解析抽屉迁移候选计数由 `GrammarMigrationTraining` 提供；`index.html` 继续负责题干句子 HTML、按钮样式、浮层开关和抽屉 DOM。
- 考点理论抽屉的空状态、当前考点标题、课堂路径、overview 和折叠 section 由 `GrammarTeachingGuide` 提供；`index.html` 继续负责转义和原有 HTML 内容挂载。
- 讲题台纯逻辑模块 `GrammarTeachingViewModel` 能加载，并能生成 tab 标准化和图谱节点选择结果。
- 讲题台外壳显示模型由 `GrammarTeachingViewModel` 提供，并能生成来源、题号文案、分类文案、focus layout 状态和中文句子折叠数据；`index.html` 继续负责题干 HTML、tab 内容渲染和 DOM 写入。
- 讲题台思维导图规则由 `GrammarTeachingViewModel` 提供，并能生成 mindmap 定义和 active keys。
- 讲题台知识 tab 显示模型由 `GrammarTeachingViewModel` 提供，并能生成导图标题、路径、全图定位、分支 active 状态和规则编号；`index.html` 继续负责 HTML 拼接和全图定位点击。
- 讲题卡显示模型会规范标题、触发句、前三步、常错文案和解题兜底文案，防止讲题抽屉展示规则回流到大 HTML。
- 迁移训练纯逻辑模块 `GrammarMigrationTraining` 能生成课堂迁移 key，并判断两道题是否有迁移训练重合点。
- 迁移训练推荐规则由 `GrammarMigrationTraining` 提供，并能生成 tabs、header、推荐池数量、空状态和迁移题卡元数据。
- 迁移训练面板显示模型由 `GrammarMigrationTraining` 提供，并能生成 tabs active 状态、标题、副标题、计数文案和空状态提示数据；`index.html` 继续负责讲题台/抽屉两套容器样式、句子 HTML 和跳题副作用。
- 迁移训练内容显示模型由 `GrammarMigrationTraining` 提供，并能组合 tabs、标题、副标题、计数、空态、行模型和抽屉卡片模型；`index.html` 继续负责讲题台/抽屉两套 HTML 结构、句子 HTML 和点击跳题副作用。
- 迁移训练题卡行显示模型由 `GrammarMigrationTraining` 提供，并能生成序号、题源、真题/模拟/错题标签、行 class 和讲题线索；`index.html` 继续负责句子渲染和点击跳转。
- 抽屉版迁移训练卡片显示模型由 `GrammarMigrationTraining` 提供，并能生成题源、真题/模拟标签、错题强调、讲法和“点击进入完整讲解”文案；`index.html` 继续负责句子渲染和点击跳转。
- 知识图谱纯逻辑由 `GrammarTeachingViewModel` 提供，并能生成节点索引、关联节点、节点边界、预设视图、节点类型标签、节点颜色、聚焦状态和节点文字换行。
- 知识图谱 inspector/search 规则由 `GrammarTeachingViewModel` 提供，并能生成节点标签组、节点路径、相关题池、图谱搜索结果、知识地图分类标签和根节点颜色。
- 题目模型纯逻辑模块 `GrammarQuestionModel` 能加载，并能生成套卷题目、套卷状态、错题状态、fine tag 展示信息和知识库频次统计。
- 状态工具模块 `GrammarAppState` 不只保存状态，还能生成讲题上下文快照、比较题组上下文、规范题号范围，并构造讲题 session。
- 练习页显示状态由 `GrammarAppState` 提供重置、答案切换和中文切换规则；旧 `showAnswers` / `showChinese` 变量仍保留兼容，但页面状态变化会同步回状态容器。
- 原文/抽屉字号状态由 `GrammarAppState` 提供夹取和增减规则；旧 `passageFontSize` / `drawerFontSize` 变量仍保留兼容，但页面字号变化会同步回状态容器。
- 练习显示和字号页面快照桥有 smoke 覆盖，答案切换和原文字号调整后，快照桥与 `GrammarAppState.showAnswers/showChinese/passageFontSize/drawerFontSize` 会保持一致。
- 主页视图状态由 `GrammarAppState` 提供规范化和 dock key 选择；旧 `_currentHomeView` 变量仍保留兼容，但主页/套卷/考点分类切换会同步回状态容器。
- 知识库视图状态由 `GrammarAppState` 提供规范化和节点/key 状态构造；旧 `currentKnowledgeView/currentKnowledgeKey/currentKnowledgeNodeId/currentIsPattern` 变量仍保留兼容，但教材/考点/书本速查/知识地图/全局图谱切换会同步回状态容器。
- 知识库视图状态快照桥有 smoke 覆盖，教材视图和书本速查切换后快照桥与 `GrammarAppState.currentKnowledgeView/currentKnowledgeKey/currentKnowledgeNodeId` 会保持一致。
- 知识库搜索索引缓存由 `GrammarAppState` 提供规范化和状态构造；`GrammarKnowledgeViewModel` 继续负责构建/查询索引，`index.html` 只负责输入框、导航显隐和搜索结果渲染。
- 教材 unit 题单小面板上下文由 `GrammarAppState` 提供来源、筛选、tag 列表和清空状态构造；旧 `_unitMiniContext` 变量仍保留兼容，但打开真题/错题列表、切换筛选和返回恢复会同步回状态容器。
- 全局图谱缩放、平移、聚焦节点和预设视图状态由 `GrammarAppState` 提供状态构造；`index.html` 继续负责 SVG 渲染、鼠标事件、按钮和 inspector 内容。
- 教材视图模式由 `GrammarAppState` 提供规范化和状态构造；旧 `_textbookViewMode` 变量仍保留兼容，但画廊/列表切换会同步回状态容器。
- 错题本/备课资料批量模式由 `GrammarAppState` 同步；旧 `_errorBulkMode` / `_prepBulkMode` 变量仍保留兼容，但批量删除模式开关会同步回状态容器。
- 返回状态由 `GrammarAppState` 提供 dock 返回动作、上一视图返回目标、抽屉返回状态设置与消费；`index.html` 保留实际切页、关抽屉和遮罩动画副作用。
- 抽屉返回状态页面快照桥有 smoke 覆盖，设置和清空返回目标后快照桥与 `GrammarAppState.drawerReturnTo` 会保持一致。
- 抽屉关闭动作计划由 `GrammarAppState` 提供，覆盖关抽屉/overlay、清选中题、关浮层、清高亮、刷新课堂切换条和是否清返回上下文；`index.html` 继续只负责 DOM 和渲染副作用。
- 抽屉 tab 切换动作计划由 `GrammarAppState` 提供，覆盖 tab 归一、教学台转交、普通抽屉 chrome、内容类型和错误兜底；`index.html` 继续只负责 DOM class 与真实内容渲染。
- 迁移训练来源偏好由 `GrammarAppState` 提供规范化和状态构造；旧 `_migrationSource` 变量仍保留兼容，`index.html` 继续负责 localStorage、使用事件和渲染。
- 紧凑/投影视图状态由 `GrammarAppState` 提供状态构造；`index.html` 继续负责 body class、fullscreen API、localStorage、使用事件和 DOM 按钮同步。
- 投影/讲题全屏请求状态通过 `index.html` 的 `applyProjectionState` 同步桥落回 `GrammarAppState`；`index.html` 继续负责 fullscreen API、事件监听和 body class。
- 抽屉高度状态由 `GrammarAppState` 提供解析、夹取和拖拽高度计算；`index.html` 继续负责拖拽事件、DOM style 和 localStorage。
- 字号 CSS 变量和显示文案由 `GrammarAppState` 提供；`index.html` 继续负责把变量写入 DOM 和更新页面数字。
- 讲题返回栈由 `GrammarAppState` 提供 top/label/push/pop/clear 规则；`index.html` 继续负责迁移题、教材题和原题之间的实际导航。
- 上一视图和普通题号导航由 `GrammarAppState` 提供规范化、练习入口返回目标和上一题/下一题循环规则；`index.html` 继续负责实际切页、讲题 session 分支和 DOM 渲染。
- 上一视图返回状态快照桥有 smoke 覆盖，设置和清空 previousView 后快照桥与 `GrammarAppState.previousView` 会保持一致。
- 页面/dock 激活状态由 `GrammarAppState` 提供 page key、dock key、页面切换状态和 dock 激活状态规则；`index.html` 继续负责登录守卫、body class、DOM active class、渲染和使用事件。
- 页面导航状态快照桥有 smoke 覆盖，切换套卷/考点 dock 后快照桥与 `GrammarAppState.activePage` / `activeDock` / `currentHomeView` 会保持一致。
- 讲题跨页保留状态由 `GrammarAppState` 提供状态构造和切页时是否关闭讲题台判断；`index.html` 继续负责实际切页和讲题台关闭副作用。
- 选中题状态由 `GrammarAppState` 提供按下标选择、按上下文恢复、按题号查找和清空规则；`index.html` 继续负责 DOM 高亮、讲题台渲染和兼容变量同步。
- 讲题 session 内部状态由 `GrammarAppState` 提供 tab 标准化、答案显示切换/强制显示和 session 清空规则；`index.html` 继续负责讲题台 DOM、事件记录、全屏和内容渲染。
- 选中题和讲题 session 页面快照桥有 smoke 覆盖，打开讲题台和切换迁移 tab 后，快照桥与 `GrammarAppState.selectedQuestion/teachingSession` 会保持一致。
- 讲题 dock 显示状态由 `GrammarAppState` 提供数据模型，覆盖上一题/下一题、题号轨道、讲题/迁移/图谱 tab、返回按钮和退出按钮；`index.html` 继续负责按钮 HTML 和点击绑定。
- 讲题迁移训练临时 registry 由 `GrammarAppState` 提供注册、清空和按 id 查回状态构造；`index.html` 继续负责迁移训练渲染和点击跳题副作用。
- 练习上下文状态由 `GrammarAppState` 提供 `currentExam/currentQuestions` 规范化和清空规则；`index.html` 继续负责入口副作用和渲染，但套卷、考点、错题、备课、迁移题和教材题入口统一经由同步桥落状态。
- 练习上下文页面快照桥有 smoke 覆盖，套卷进入练习页后，快照桥与 `GrammarAppState.currentExam/currentQuestions` 会保持一致。
- 讲题返回/基准上下文状态由 `GrammarAppState` 提供返回栈规范化、返回栈状态构造、基准上下文构造/清空和退出讲题时是否恢复原上下文判断；`index.html` 继续负责实际导航、渲染、抽屉返回和全屏退出。
- 讲题返回栈、基准上下文和跨页保留页面快照桥有 smoke 覆盖，打开讲题台后，快照桥与 `GrammarAppState.teachingReturnStack/teachingBaseContext/keepTeachingOnPageSwitch` 会保持一致。
- 套卷导航和页面返回纯逻辑由 `GrammarQuestionModel` / `GrammarAppState` 提供，并能生成排序后的套卷列表、当前题号、上一视图返回文案和 dock 返回文案。
- 套卷练习入口由 `GrammarQuestionModel.createExamStateFromId` 生成完整练习上下文；缺失套卷提示由 `GrammarQuestionModel` 提供；投影入口 guard 由 `GrammarAppState` 提供；`index.html` 继续负责页面 active 检查、弹窗和真实投影副作用。
- dock 返回动作、上一视图返回目标和抽屉返回状态消费由 `GrammarAppState` 提供，并能区分返回主页、返回上一页、返回知识地图、返回全局图谱和抽屉上下文返回。
- `GrammarAppState` 状态桥会跟随套卷进入、讲题台打开、tab 切换和退出讲题更新，作为后续减少全局变量的回归保护。
- 页面侧边栏数据模型由 `GrammarSidebarViewModel` 提供，并能生成套卷按年份分组、考点计数、错题分组、备课列表和当前项高亮。
- 页面侧边栏显示/动作模型由 `GrammarSidebarViewModel` 提供，并能生成 item action、题量文案和题号文案。
- 首页考点分类卡片和入口模型由 `GrammarCategoryRules` 提供，并能生成分组标题、卡片标签/标题/描述、题量文案、入口 action 元数据、按考点练习入口状态和空分类提示。
- 按考点练习入口的题目筛选和练习上下文计划由 `GrammarCategoryRules` 提供；`index.html` 继续只负责关闭抽屉、同步状态、切页和渲染。
- 主页 Dashboard 数据模型由 `GrammarHomeDashboardModel` 提供，并能生成题库/错题/备课统计文案、新/活跃用户状态、hero 文案、教材封面画廊、教材速览入口、行动入口副文案和 action 元数据。
- 主页 Dashboard 行动按钮 chrome 由 `GrammarHomeDashboardModel` 提供，并能生成按钮 tone 对应的 style、hover 和副文案样式；`index.html` 继续负责 onclick 串、HTML 标签和真实跳转副作用。
- 主页 Dashboard 行动入口执行计划由 `GrammarHomeDashboardModel` 提供，覆盖上传 Word、切页和打开教材；`index.html` 继续只负责真实切页、点击上传按钮、知识库视图切换和打开教材弹窗。
- 首页套卷入口数据模型由 `GrammarExamGridModel` 提供，并能生成年份分组、分组标题、卡片描述、入口 action、真题/模拟标签样式、未知年份兜底和每套题量。
- 首页套卷年份折叠/展开的 body 显示和箭头状态计划由 `GrammarExamGridModel` 提供；`index.html` 继续只负责读取当前 DOM 状态并写入 style。
- 课堂顶部切换条数据模型由 `GrammarClassroomSwitcherModel` 提供，并能生成套卷下拉、题号下拉、答案按钮和进度文案。
- 练习页视图状态由 `GrammarPracticeViewModel` 提供，并能生成外壳模型、标题/题量、答案/中文按钮状态、底部提示、中文翻译来源和翻译用原文。
- 练习页正文规则由 `GrammarPracticeViewModel` 提供，并能生成考点模式分组、提示文案、正文来源、段落切分和未定位空格兜底列表。
- 练习页空格替换规则由 `GrammarPracticeViewModel` 提供，并能处理按题号精确替换、考点模式句子模型和套卷/备课正文按位置顺序替换。
- 练习页正文显示模型由 `GrammarPracticeViewModel` 提供，并能生成正文类型、答案/空格 slot 和未定位空格提示文案。
- 练习页按题号打开解析、考点分布条跳到首个同类题的导航计划由 `GrammarPracticeViewModel` 提供；`index.html` 继续只负责执行 `showAnalysisByIdx` 打开真实讲解。
- 练习页考点分布条模型由 `GrammarKnowledgeViewModel` 提供，并能生成标题和每个 tag 的展示文案。
- 知识库页面数据模型由 `GrammarKnowledgeViewModel` 提供，并能生成考点分布、搜索索引和结果、fine category 统计、教材册/单元统计和 unit 题单筛选结果。
- 知识库搜索面板、考点视图和教材/unit 题单显示模型由 `GrammarKnowledgeViewModel` 提供，并能生成搜索导航显隐、结果标题/action、空态/溢出提示、考点视图 header/图例/tag 弹窗文案、教材画廊/列表切换、教材册统计、modal 副标题、unit 筛选 chip 和题卡元数据。
- 知识库搜索清空、搜索结果跳转和 subsection 展开/高亮计划由 `GrammarKnowledgeViewModel` 提供；`index.html` 继续只负责输入框清空、DOM 显隐、滚动和高亮定时器副作用。
- 知识库 subsection 手动折叠/展开计划由 `GrammarKnowledgeViewModel` 提供；`index.html` 继续只负责读取 class 并执行 classList 切换。
- 教材弹窗和 Unit 题单弹窗显示模型由 `GrammarKnowledgeViewModel` 提供，并能生成关闭文案、header、筛选显隐、空态、隐藏数量和讲题/投影动作元数据；`index.html` 继续负责 DOM、动画、滚动、关闭和真实跳题副作用。
- 知识库侧栏导航、知识地图页、知识节点详情、全局图谱页面按钮、inspector、搜索结果和 SVG 集群/边/节点显示模型由 `GrammarKnowledgeViewModel` 提供；`index.html` 继续负责 DOM/SVG 标签拼接、拖拽缩放和真实导航副作用。
- 全局图谱搜索清空模型由 `GrammarKnowledgeViewModel` 提供；`index.html` 继续负责输入框、结果容器和 class 切换副作用。
- 书本速查/跨考点模式正文模型由 `GrammarKnowledgeViewModel` 提供，并能生成 header、overview、折叠 subsection 和原有正文 HTML；`index.html` 继续负责插入 DOM、折叠切换和滚动定位副作用。
- 知识库视图切换 chrome 模型由 `GrammarKnowledgeViewModel` 提供，并能生成顶部按钮 active、侧栏显隐、渲染动作和书本速查 fallback key；`index.html` 继续负责 DOM class/style 写入和真实渲染调用。
- 精细考点视图级模型由 `GrammarKnowledgeViewModel` 提供，并能生成空态、总 tag 数、分类 badge、扩展标签显隐和 tag 弹窗 action；`index.html` 继续负责卡片 HTML、alert 副作用和 DOM 写入。
- 教材视图级模型由 `GrammarKnowledgeViewModel` 提供，并能生成空态、画廊/列表模式、切换按钮、书册列表和封面缓存；`index.html` 继续负责教材卡片 HTML、modal 和点击副作用。
- 错题本/备课资料数据模型由 `GrammarSavedMaterialsModel` 提供，并能生成 JSON 批量导入解析结果、导入结果文案、批量模式状态、选择数量文案、单条/批量删除动作计划、确认文案、云端删除方法元数据、单条云端删除失败计划和批量云端删除失败汇总/观测 payload。
- 错题本/备课资料列表显示模型由 `GrammarSavedMaterialsModel` 提供，并能生成统计文案、空态文案、分组标题、列表项元数据和批量勾选显隐。
- 错题本/备课资料批量导入表单显隐计划由 `GrammarSavedMaterialsModel` 提供；`index.html` 继续只负责读取当前 DOM 状态并执行 class 切换。
- 错题本/备课资料进入练习页动作计划由 `GrammarSavedMaterialsModel` 提供，覆盖入口存在性、关抽屉、显示状态重置、previousView 来源、切页和渲染意图；`index.html` 继续负责构造实际练习上下文。
- 错题本/备课资料批量选择状态由 `GrammarSavedMaterialsModel` 提供，覆盖 checkbox selector、信息节点 id、选中数量文案和全选/清空计划；`index.html` 继续负责读取/写入真实 checkbox。
- Word/AI 统一导入面板和确认计划由 `GrammarSavedMaterialsModel` 提供，并能生成标题、模式提示、合集提醒、题数汇总、选中数量文案、题卡元数据、备课整篇导入列表、错题勾选单题列表、无效选择计数和确认导入结果文案；`word-import.js` 继续负责 DOM、复选框读取、保存、重渲染和弹窗副作用。
- Word/AI 入库计划由 `GrammarSavedMaterialsModel` 提供，并能生成 DeepSeek 结果对应的备课资料/错题本对象、稳定 id、重复跳过、nextItems 和导入提示文案；`word-import.js` 继续负责保存、渲染、云同步和弹窗副作用。
- Word/AI 导入进度与失败提示由 `GrammarSavedMaterialsModel` 提供，并能生成初始进度、长文档确认、拆分进度、分批解析进度、完成进度、网络/超时/HTTP 错误归一化文案和失败兜底确认文案；`word-import.js` 继续负责 overlay、confirm、alert、解析请求、事件记录和计时器副作用。
- Word 导入残余提示文案由 `GrammarSavedMaterialsModel` 提供，覆盖导入模块缺失、Word 模块缺失、内容过短、未识别段落、AI 未登录、AI 未识别题目、原始文本 fallback 和非 docx 文件；`word-import.js` 继续负责文件读取、AI 请求、弹窗触发和 DOM 回填。
- 云同步本地迁移、上传成功、读取失败和上传失败计划由 `GrammarSavedMaterialsModel` 提供；同步状态徽标和同步 inflight 计数状态由 `GrammarAppState` 提供；`index.html` 继续负责云端请求、弹窗和 DOM 写入。
- 云端首次回拉结果和失败处理计划由 `GrammarSavedMaterialsModel` 提供，并能生成回拉是否应用、渲染意图、云端数量、同步状态、失败事件和 alert 文案；`index.html` 继续负责真实 Supabase 拉取、迁移 confirm、渲染和错误记录副作用。
- 错题本/备课资料云同步差异和执行阶段计划由 `GrammarSavedMaterialsModel` 提供，并能生成本地 upsert 列表、回拉阶段、云端待删除 id、云端方法名和失败事件元数据；`index.html` 继续负责真实 Supabase upsert/pull/delete 调用。
- 本地错题本/备课资料上传到云端的动作计划由 `GrammarSavedMaterialsModel` 提供，并能生成两类 upsert 计划、回拉方法、成功文案和失败事件元数据；`index.html` 继续负责真实云端调用、保存和渲染。
- 本地资料上传后的云端回拉结果计划由 `GrammarSavedMaterialsModel` 提供，并能生成云端数据/fallback 数据选择、保存意图和渲染意图；`index.html` 继续负责真实 pull、保存和 DOM 渲染。
- Word 导入文本预处理由 `GrammarWordImportModel` 提供，并能生成规范化文本、标题识别、答案提取、fallback 空格、长文档拆篇、AI 解析结果规范化、空格标记修复和最终篇章去重；`word-import.js` 继续负责文件读取、AI 请求、overlay 和保存副作用。
- 套卷入口能进入练习页。
- 考点入口能进入练习页，点击考点模式空格能打开讲题台。
- 套卷/考点分类 dock 点击后，`GrammarAppState.currentHomeView` 与当前高亮 dock 保持一致。
- 练习页能渲染 10 个空格。
- 练习页答案按钮能切换空格/答案；中文按钮会关闭答案模式，返回英文后恢复空格状态，且 `GrammarAppState` 与页面按钮显示一致。
- 原文字号按钮能更新显示数值和 CSS 变量，且 `GrammarAppState.passageFontSize` 同步更新。
- 知识库基础交互能进入教材视图、考点视图、书本速查，并能执行搜索。
- 知识库教材视图、考点视图、书本速查切换后，`GrammarAppState.currentKnowledgeView` 与页面当前视图保持一致。
- 知识库搜索执行后，页面结果列表能出现，且 `GrammarAppState.knowledgeSearchIndex` 保持已构建索引。
- 知识库搜索索引页面快照桥有 smoke 覆盖，搜索执行后快照桥与 `GrammarAppState.knowledgeSearchIndex` 会保持一致。
- 教材 unit 题单小面板打开后，`GrammarAppState.unitMiniContext` 能保存 unit、来源、默认筛选和 fine tag 列表。
- 全局图谱打开和缩放后，`GrammarAppState.globalGraphState` 会保存选中节点、聚焦集合和缩放状态。
- 全局图谱状态页面快照桥有 smoke 覆盖，打开和缩放图谱后快照桥与 `GrammarAppState.globalGraphState` 会保持一致。
- 教材视图画廊/列表模式切换后，`GrammarAppState.textbookViewMode` 与页面当前视图保持一致。
- 点击空格能打开讲题台。
- 迁移训练 tab 能打开。
- 迁移训练题卡行的题源标签和类型标签有纯函数断言覆盖。
- 迁移训练抽屉卡片的题源、类型标签、讲法和 CTA 文案有纯函数断言覆盖。
- 迁移训练来源能切换到真题库 / 我的错题 / 全部，并持久化到本地偏好。
- 迁移训练来源切换后，localStorage 和 `GrammarAppState.migrationSource` 会保持一致。
- 迁移训练来源页面快照桥有 smoke 覆盖，切换来源后快照桥、localStorage 和 `GrammarAppState.migrationSource` 会保持一致。
- 迁移训练来源切换动作计划有纯函数断言覆盖，防止来源规范化、事件 payload、讲题台/抽屉重渲染目标继续散落在 `setMigrationSource` 中。
- 迁移训练面板 tabs active、标题、计数文案和空状态提示有纯函数断言覆盖，防止讲题台和抽屉迁移训练面板规则重复散落在大 HTML 中。
- 紧凑模式、投影进入/退出和投影抽屉尺寸切换后，页面 class 与 `GrammarAppState` 会保持一致。
- 投影进入/退出后，`GrammarAppState.projectionMode`、`GrammarAppState.teachingFullscreenRequested` 和抽屉投影尺寸会保持一致。
- 抽屉高度解析、上下限夹取和拖拽高度计算有纯函数断言覆盖。
- 讲题返回栈 push/pop/clear 和返回文案有纯函数断言覆盖。
- 上一视图规范化、练习入口返回目标和普通空格上一题/下一题循环索引有纯函数断言覆盖。
- page/dock key 规范化、页面切换状态和 dock 激活状态有纯函数断言覆盖，主页、套卷、练习页、知识库和考点 dock 切换后会同步到 `GrammarAppState`。
- 页面登录守卫状态有纯函数断言覆盖，错题本、备课资料和管理员页的受保护页面规则由 `GrammarAppState` 提供，`index.html` 继续负责真实登录弹窗和切页。
- 页面 shell 状态有纯函数断言覆盖，`guest` / `in-modules` body class 与模块问候刷新判断由 `GrammarAppState` 提供，`index.html` 继续负责 DOM 写入。
- 页面切换渲染计划有纯函数断言覆盖，首页、错题本、备课资料和管理员页的渲染动作选择由 `GrammarAppState` 提供，`index.html` 继续负责真实渲染副作用。
- 页面切换总计划、模块卡入口计划和回主页计划有纯函数断言覆盖，防止入口动作状态继续散落在 `enterModule` / `goHome` / `switchPage` 中。
- 讲题跨页保留状态构造和切页关闭判断有纯函数断言覆盖，迁移题/教材题/恢复原题跳转统一经由同步桥保留讲题台。
- 教材视图模式规范化和状态构造有纯函数断言覆盖。
- 知识库搜索索引规范化和状态构造有纯函数断言覆盖。
- 教材 unit 题单上下文规范化、筛选更新和清空状态有纯函数断言覆盖。
- 教材视图模式和 unit 题单上下文的页面快照桥有 smoke 覆盖，教材列表模式、Unit 题单打开和筛选切换后，快照桥与 `GrammarAppState` 会保持一致。
- 知识库搜索面板、考点视图、教材视图和 unit 题单显示模型有纯函数断言覆盖，防止搜索结果、tag 说明、教材统计和 unit 题卡规则继续散落在大 HTML 中。
- 教材弹窗打开动作计划有纯函数断言覆盖，防止列表模式滚动、画廊模式开弹窗和 modal 文案选择继续散落在 `openTextbookModal` 中。
- 教材 Unit 题单打开和筛选动作计划有纯函数断言覆盖，防止真题/错题来源、默认筛选和 modal 重开延迟继续散落在 `openUnitQuestionList` / `setUnitMiniFilter` 中。
- 教材 Unit 题单筛选重开延迟有纯函数断言覆盖，重开时间晚于 modal 关闭动画；页面关闭函数会清理 pending timer 和残留 wrapper，防止筛选切换后重复弹窗。
- 教材 Unit 题单讲题/投影跳转动作计划有纯函数断言覆盖，防止来源判断、上一视图、讲题参数和返回上下文继续散落在 `_gotoUnitQuestion` 中。
- 教材 Unit 题单抽屉返回动作计划有纯函数断言覆盖，防止返回教材视图、匹配书册、恢复 mini modal 上下文和遮罩延迟继续散落在 `executeDrawerReturn` 中。
- 知识库侧栏导航、知识地图页、知识节点详情、全局图谱页面、inspector、搜索结果和 SVG 显示模型有纯函数断言覆盖，防止图谱展示数据继续散落在大 HTML 中。
- 书本速查/跨考点模式正文模型有纯函数断言覆盖，防止正文结构规则继续留在 `selectKnowledgeCategory`。
- 知识库视图切换 chrome 模型有纯函数断言覆盖，防止按钮 active、侧栏显隐和 book fallback 规则继续留在 `setKnowledgeView`。
- 全局图谱状态规范化、平移、缩放、适配边界、居中节点和聚焦节点有纯函数断言覆盖。
- 全局图谱预设聚焦和节点选中动作计划有纯函数断言覆盖，防止目标节点、关联节点、focus mode 和 bounds 计算继续散落在 `focusGlobalGraphPreset` / `selectGlobalGraphNode` 中。
- 选中题按下标选择、按上下文恢复、按题号查找和清空状态有纯函数断言覆盖。
- 讲题 tab 更新、答案显示切换/强制显示和 session 清空有纯函数断言覆盖。
- 讲题 guide 面板模型有纯函数断言覆盖，防止讲题标题、副标题和讲题卡选择规则继续散落在大 HTML 中。
- 解析/讲题浮层开关计划有纯函数断言覆盖，防止 selector、打开/关闭判断和 active class 规则继续散落在 `toggleAnalysisFloat` 中。
- 解析抽屉显示模型和解析抽屉迁移候选计数有纯函数断言覆盖，防止答案/中文/浮层按钮/上下题导航/迁移数量规则继续散落在大 HTML 中。
- 讲题台外壳模型有纯函数断言覆盖，防止来源、题号、分类、focus layout 和中文句子折叠规则继续散落在大 HTML 中。
- 讲题 dock 模型有纯函数断言覆盖，防止讲题台导航、tab 激活和返回按钮规则继续散落在大 HTML 中。
- 讲题台打开动作计划有纯函数断言覆盖，防止选中题、基准上下文捕获、session 构造、全屏请求、抽屉关闭和使用事件 payload 继续散落在 `openTeachingStageByIdx` 中。
- 讲题台题号跳转动作计划有纯函数断言覆盖，防止上一题/下一题/指定题号跳转的目标下标、讲题选项和浮层关闭标记继续散落在 `jumpTeachingQuestion` 中。
- 讲题台空格显隐动作计划有纯函数断言覆盖，防止题干/迁移题答案显示文本、revealed 状态和答案同步标记继续散落在空格点击 handler 中。
- 抽屉 tab 切换动作计划有纯函数断言覆盖，防止 tab 归一、教学台转交、内容类型和错误兜底规则继续散落在 `switchDrawerTab` 中。
- 课堂切换条导航计划有纯函数断言覆盖，防止套卷上一/下一、套卷下拉、题号下拉和题号上一/下一计算继续散落在大 HTML 中。
- 模块页问候语时间段和带用户名文案有纯函数断言覆盖，防止问候规则继续重复散落在首页和模块页脚本中。
- 讲题知识面板模型有纯函数断言覆盖，防止知识 tab 的导图标题、路径、定位和 active 分支规则继续散落在大 HTML 中。
- 讲题台全图定位入口计划有纯函数断言覆盖，防止关闭讲题台、切到知识库全局图谱、延迟选中节点等动作意图继续散落在 `openGlobalGraphForTeachingQuestion` 中。
- 讲题迁移训练 registry 注册、查回和清空有纯函数断言覆盖。
- 练习上下文规范化、从 `currentExam.questions` 回推题组和清空上下文有纯函数断言覆盖。
- 讲题返回栈规范化、返回栈状态构造、基准上下文构造/清空和退出讲题时是否恢复原上下文有纯函数断言覆盖。
- 讲题返回 action 计划和退出讲题 teardown 计划有纯函数断言覆盖，防止“返回教材/返回原题/恢复基准上下文/清空选中题”的分支继续散落在大 HTML 中。
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
- 错题本/备课资料批量导入表单的 form id、show class 和强制开关计划有纯函数断言覆盖。
- 错题本/备课资料批量模式打开、选择数量显示和取消后状态回落会同步到 `GrammarAppState`。
- 错题本/备课资料批量模式页面快照桥有 smoke 覆盖，批量模式打开/取消后，快照桥与 `GrammarAppState` 会保持一致。
- 错题本/备课资料批量选择 selector、信息节点、数量文案和全选计划有纯函数断言覆盖。
- 错题本/备课资料单条云端删除失败提示、事件名和观测 payload 有纯函数断言覆盖，防止单条删除失败分支继续散落在两个页面函数里。
- 云同步提示文案、同步徽标显示模型和同步引用计数状态有纯函数断言覆盖，防止同步规则继续散落在大 HTML 中。
- 本地资料上传云端失败计划有纯函数断言覆盖，包括事件名、模块、alert 文案和观测 payload，防止 `uploadLocalToCloud` 的 catch 分支重新构造上传计划。
- 错题本/备课资料云同步队列 pending 与 rerunRequested 合并重跑状态有纯函数断言覆盖，防止连续保存时的同步合并规则继续散落在大 HTML 中。
- 错题本/备课资料云同步队列 key 映射由 `GrammarAppState` 提供，防止 `errorSyncQueue` / `prepSyncQueue` 选择规则继续留在 `index.html`。
- 错题本/备课资料云同步队列页面桥有 smoke 覆盖，连续请求、合并重跑和完成清空会同步回 `GrammarAppState.errorSyncQueue`。
- 错题本/备课资料云同步执行阶段计划有纯函数断言覆盖，防止 `syncErrorBookToCloud` / `syncPrepToCloud` 继续各自手写 upsert、pull、cleanup 和失败事件元数据。
- 云登录生命周期状态有纯函数断言覆盖，包括云用户 key、首次到达用户、`?admin` 入口、本地资料上传提示和退出清理状态，防止登录/迁移提示规则继续散落在大 HTML 中。
- 退出登录中的 `cloudLoggingOut` 状态有纯函数断言覆盖，退出清理会复位该标记，防止退出流程继续依赖裸全局变量。
- 云生命周期快照/局部 patch 计划有纯函数断言覆盖，包括云用户 key、首次到达用户、`?admin` 入口、本地资料上传提示和退出状态，防止这几项登录相关规则继续分散在多个裸变量里。
- 云端学习数据写入 guard 和保存后同步动作计划有纯函数断言覆盖，确保普通登录用户可写并触发对应队列，管理员 view-as 和访客状态不可写。
- 本地错题本和备课资料带 `_owner`，不同账号的本地残留不会串到当前用户。
- 普通用户进入管理员页时看不到用户列表。
- 管理员能查看最近反馈并推进反馈状态。
- 管理员 view-as 能读取目标用户数据，但 view-as 状态下不会写入目标用户错题本。
- 备课资料能进入讲题页。
- 错题本/备课资料进入练习页动作计划有纯函数断言覆盖，防止 previousView 来源、切页和渲染意图继续在两个入口函数里重复分叉。
- 投影模式能打开和退出。
- 套卷缺失提示和投影入口 guard 有纯函数断言覆盖，防止练习入口/投影入口状态规则继续散落在大 HTML 中。
- Word 上传能走到 AI 解析；当 Edge Function 返回成功结果时，系统会打开统一导入面板，确认后写入备课资料，并记录成功事件。
- Word 上传能走到 AI 解析；当 Edge Function 返回错误时，系统会记录 `ai_parse_http_failed`，并用空格兜底打开统一导入面板。
- Word/AI 失败事件会标记来源模块为 `word-import`，方便后续排查。
- Word 导入模块缺失、内容过短、未识别段落、AI 未登录、AI 未识别题目、原始文本 fallback 和非 docx 文件提示有纯函数断言覆盖，防止提示规则继续散落在 `word-import.js`。
- 浏览器控制台没有致命错误。

## 4. 还没覆盖的范围

- 真实 Supabase 账号登录、注册、退出。
- 真实 Supabase 跨账号数据隔离。
- 真实 Supabase 管理员 RPC 和 RLS 联调。
- 真实 Word 样本上传成功率。
- 真实 AI/Edge Function 成功路径和长文档分批解析。
- 账号删除申请的管理员处理流程和服务端 Auth 用户删除。
- 错题本新增、真实批量删除云端一致性、真实云端同步冲突。
- 备课资料导入、真实批量删除云端一致性、真实云端同步冲突。
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

如果本机默认 smoke 端口在本地环境不稳定，可以临时指定测试端口：

```bash
SEEKLUME_SMOKE_PORT=8931 npm run check
```

`scripts/check_browser_smoke.sh` 会在没有外部 `SEEKLUME_BASE_URL` 时自行启动本地静态服务器、等待 `/docs/` 可访问，再把 `SEEKLUME_BASE_URL` 交给 Playwright；这比直接依赖 Playwright 的内置 webServer 更稳。
