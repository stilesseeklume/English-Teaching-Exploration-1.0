# 迁移训练统一到 fine_category + facets（治本）· 设计文档

> 日期：2026-06-01
> 起因（用户原话整理）：
> 1. 介词真题库没筛选、模拟题有；连词反过来——同考点切换来源时筛选器时有时无。
> 2. 怀疑 fine_category 和 facets.word 有冲突。
> 3. 非谓语/谓语迁移好像没做筛选；希望统一，避免"用到后面觉得乱"。
> 4. 期望：迁移 to-do 默认显示全是 to-do，再可选 doing/done 进一步训练。
> 5. 用户洞察："我们是不是有两个体系在打架。"

## 根因（已查证）

迁移训练里**两套分类体系并存、互相打架**：

**体系 A（权威，用户今天建立）**：题库每题的 `fine_category`（51 tag）+ `facets`（多维属性）。确定、写死。

**体系 B（遗留，到处猜测）**：`focus`（focus-rules 关键词猜）、`nonpAxis`、`practicalGuide.migrationKeys`、`safeQuestionFocusKey`、答案派生 `migrationFilterKey`。这些不读 A，用关键词/答案重新猜一套分类。

迁移的默认池、筛选 chip、空态标签全由 B 计算。具体证据：
- `buildMigrationData`（migration-training.js ~500-573）织了 `teachingBankPool`/`trapBankPool`/`bankPool`/`fineBankPool` 等多池拼接，多数来自 B。
- 筛选渲染（teaching-render.js:277）：`scopeSelector.visible ? 新范围选择器 : 旧答案派生chip`。冠词题新选择器不显示→回退旧 chip→真题词<2不出、模拟≥2出 = **筛选时有时无的真相**。
- fine_category vs facets.word **不冲突**：是"分类→词"层级关系（如 prep-collocation → for/on）；用户感到的冲突是叶子数(按fine)与具体词数(按word)曾对不上的错觉（已修：buildAllQuestions 补 facets）。

## 决策

**迁移训练整条链路只认体系 A（fine_category + facets），把体系 B 的猜测逻辑从迁移中彻底拔除；筛选 UI 统一为单一范围选择器，废除旧答案派生 chip。**

**头等原则：删干净死代码。** 我们一路在叠加新体系，旧体系函数仍堆在代码里——不删就是"两套打架"的根源。本次重构**必须把统一后再无人使用的旧函数/分支/CSS/接线全部删除**，让系统轻量干净。每删一个，先 grep 确认零引用（除被删定义自身）再删，删后 `npm run check` 全绿验证无断链。

## 删除清单（统一后零引用，逐项 grep 确认后删）

**migration-training.js**：
- `nonpAxisExactMatch` / `nonpAxisFormMatch`（非谓语专用 B 匹配）
- `getTeachingMigrationKeys` / `hasTeachingMigrationOverlap`（practicalGuide.migrationKeys 驱动的 B 重叠判断）
- `migrationFilterKey` / `buildMigrationFilterChips`（旧答案派生 chip）
- `buildDisplayPools`（B 多池拼接；删 buildMigrationData 的 B 逻辑后成孤儿）

**index.html**：
- `nonpAxisExactMatch` / `nonpAxisFormMatch` 包装（603-608）
- `getTeachingMigrationKeys` / `hasTeachingMigrationOverlap` 包装（3236-3241）
- `teachingMigrationDeps`（611，仅喂迁移）
- `filterMigrationCards`（旧 chip show/hide）+ 其 window 导出
- buildMigrationData 调用点里传的 `safeQuestionFocus*`/`getNonpAxis`/`getQuestionPracticalGuide`/`practicalGuide` 入参

**teaching-render.js**：
- `migrationFilterChipsHtml`（旧 chip 渲染）+ 渲染处的 `: migrationFilterChipsHtml(...)` 回退分支
- `data-mig-filter` 属性输出（迁移卡/行）

**CSS（index.html）**：
- `.mig-filter-chip` 及相关旧 chip 样式（确认无其它复用）

**保留（讲题卡仍用，不删）**：`getNonpAxis`、`teachingGuideDeps`、`getQuestionPracticalGuide`、`detectPredicateForm`、focus-rules。这些服务"讲题卡"面板，与迁移解耦后继续存在。

**smoke.spec.js**：删除/改写引用上述被删函数的断言（migrationFilterKey、buildMigrationFilterChips、旧 type 档断言）。

## 目标行为

**默认池 = 同 fine_category**（用户确认）：
- 讲 `nonpred-to-do` 题 → 默认全是 to-do 题
- 讲 `art-a-an` 题 → 默认全是 a/an 题
- 讲 `prep-collocation` 题 → 默认全是动介搭配题

**范围选择器（唯一筛选 UI，始终显示，真题/模拟/错题一致）**，由细到粗：
- **具体词档**（最细）：当前题的 facets.word/form（如 which、for、to-do）——闭合类/介词可枚举兄弟词，开放类只当前词
- **fine_category 档**（中，默认激活）：同大类全部 fine tag，含 0 题标 0
- **大类档**（最粗）：整个大类

每档标题数（总数 + 真题数，沿用已有 countByFineTag.real）。点档切池。

## 架构改动

### migration-training.js · buildMigrationData 重写（核心）
**删除**：`teachingBankPool` / `teachingErrorPool` / `trapBankPool` / `trapErrorPool` / `bankPool(focus)` / `errorPool(focus)` / `nonpExact*Pool` / `nonpForm*Pool` / `focusFirst` 分支 / `buildDisplayPools` 的 B 拼接。
**保留并简化为**：
- 底池 = 同大类（fallbackBankPool：`item.category === q.category && !same`），已存在。
- 默认 pool = 底池中 `item.fine_category === q.fine_category`（同 fine_category）。
- scopes（已有 T4 逻辑）：word → 各 fine tag → category，每档 count，默认激活当前 fine_category 档。
- 入参 `options` 去掉 `safeQuestionFocus*`/`getNonpAxis`/`getQuestionPracticalGuide`/`practicalGuide`，新增/保留 `fineTags`。

### migration-training.js · 移除 B 辅助函数
删 `nonpAxisExactMatch` / `nonpAxisFormMatch` / `getTeachingMigrationKeys` / `hasTeachingMigrationOverlap`（若仅迁移用）/ `migrationFilterKey` / `buildMigrationFilterChips`（旧 chip）。`buildDisplayPools` 删或简化。

### 标签/标题：用 fine tag 中文名
迁移卡 tagLabel、heading 改用 `getFineTagInfo(fine_category).name`（题库权威），不再用 practicalGuide.title / nonpAxis 标签。空态文案用 fine tag 中文名。

### teaching-render.js · 渲染统一
`migrationStageHtml` / `migrationDrawerHtml`：删除 `: migrationFilterChipsHtml(filterChips)` 回退分支，统一 `migrationScopeSelectorHtml(scopeSelector)`；scopeSelector 始终在有 facets 时显示。删 `migrationFilterChipsHtml` / `filterMigrationCards`（index.html）/ `data-mig-filter` 相关。

### index.html · 调用点清理
`getMigrationData` / `buildMigrationContent` / `buildTeachingMigrationHtml` 去掉传 `safeQuestionFocus*`/`getNonpAxis`/`getQuestionPracticalGuide` 给 buildMigrationData（讲题卡仍可保留这些用于"讲题卡"面板，但**迁移不再依赖**）。`countAnalysisMigrationCandidates` 改为按 fine_category 计数。

## 数据流（统一后）

```
讲题 q (category=article, fine_category=art-a-an, facets={word:'a-an'})
  buildMigrationData(q, {source, bankQuestions, errorQuestions, categoryMap, fineTags})
    底池 = 同大类(article) 排除自身
    scopes = [word:a-an] + [finetag:art-a-an, art-the] + [category:article]，各档count
    activeScope = finetag:art-a-an（默认同 fine_category）
    pool = 底池 ∩ fine_category===art-a-an
  → 真题/模拟/错题 tab 切换：底池按 source 重取，scopes 重算，UI 一致
```

## 测试策略（TDD）

- buildMigrationData 同 fine_category 默认池：讲 art-a-an 题，默认 pool 全是 art-a-an；切 category 档 → 全 article。
- 真题/模拟一致性：同 q 在 source='bank' 真题筛与 'bank' 模拟筛，scopeSelector.visible 都为 true，buttons 结构一致（仅 count 不同）。
- 范围选择器始终显示（有 facets 即 visible），不再回退旧 chip。
- 非谓语 to-do：默认池全 to-do，scopes 含 doing/done 档可切。
- 回归：`npm run check` 12 passed。
- 删除的旧函数（migrationFilterKey/buildMigrationFilterChips）：smoke 中相关断言一并删除/改写。

## 非目标（YAGNI）

- 不动讲题卡（practicalGuide）面板本身——它可继续存在于"讲题"页签；只把**迁移**与它解耦。（注：讲题卡的 facets 优先修复已在上一批完成。）
- 不动决策地图/全局图谱（已统一到 fine_category）。
- 不改题库/facets schema/导入解析。
- 谓语题无具体词档（facets 无单一 word），只有 fine tag + 大类档——预期，非缺陷。

## 风险

- buildMigrationData 是迁移核心，重写面较大；删 B 池逻辑需确认无其它消费者（countAnalysisMigrationCandidates、抽屉迁移、讲题台迁移都走它）。
- 删旧函数前需 grep 确认仅迁移使用；focus/nonpAxis 若讲题卡仍用则保留定义、仅迁移不传。
- smoke 中引用 migrationFilterKey/buildMigrationFilterChips/旧 type 档的断言需同步清理。
