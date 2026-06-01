# 迁移训练 · 谓语多轴改为单考点纯池（去并集 + chip 切换）设计

> 日期：2026-06-02
> 来源：组长反馈——「被动语态混入了主谓一致；主谓一致也混入了被动语态」。

## 问题与根因

讲题迁移抽屉里，一道谓语动词题（第39题：`时态·一般现在` + `语态·被动`）的迁移池混进了主谓一致题（"walks"）。

根因链：

1. `question-points.js` `buildQuestionPoints` 对谓语题派生**多个考点轴**：`pred-tense`（带 key，如「一般现在」）、`pred-passive`（无 key）、`pred-agreement`（无 key），按 时态→被动→主谓一致 顺序。
2. `migration-training.js` `buildMigrationData` 把当前题**所有考点轴取并集**（`questionsSharePoint` 任一轴命中即入池）。
3. 于是池 = 所有被动题 ∪ 所有「一般现在」时态题。"walks" 本身是一般现在时（且带 `pred-tense:一般现在`），从**时态轴**漏入。
4. 标题 `buildMigrationPointTitle` 用 ` + ` 把两轴拼成一个混合列表，呈现为「时态·一般现在 + 语态·被动语态」。

两条反馈同源：**广义「时态」轴被并进来，而「一般现在」这个桶天然装着被动、主谓一致题。**

## 既定规则（用户决策）

- 时态是最重要的轴，作主池、默认展示。
- 被动、主谓一致各自**独立纯池**（被动池只含被动，主谓一致池只含主谓一致）。
- 时态池**含所有同时态题**（被动、主谓一致只要同时态都算时态池成员）——用户明确接受。
- 取消并集。

## 方案：单考点纯池 + 考点切换 chip（方案 A）

一次只展示**一个考点**的纯池；标题下加一行 chip 在该题的各考点间切换；默认选中 0 号（谓语题即时态）。单考点题不显示 chip，行为同现状。

### ① 数据层 `migration-training.js`

**新增纯函数 `questionMatchesPoint(item, point)`**：item 的 points 中存在 p 满足 `p.tag === point.tag` 且（key 相等，或任一方 keyless 通配）。等价于把现有 `questionsSharePoint` 的「单点对多点」抽出来。`questionsSharePoint` 可改为「对 a 的每个 point 调 `questionMatchesPoint(b, point)` 取或」，或保持原样仅供 `countAnalysisMigrationCandidates` 用——保持原样，避免牵动计数语义。

**`buildMigrationData(q, options)` 改动**：
- 新增入参 `options.pointIdx`（默认 0）。
- `var points = questionPoints(q);`（已按 时态→被动→主谓一致 顺序）。
- `var idx = (pointIdx >= 0 && pointIdx < points.length) ? pointIdx : 0;`（越界 clamp 到 0）。
- `var selectedPoint = points[idx];`
- 显示池改为**只按 selectedPoint 匹配**：
  ```
  pointBankPool = bankQuestions.filter(item => !sameQuestion(item, q) && questionMatchesPoint(item, selectedPoint));
  pointErrorPool = errorQuestions.filter(item => !sameQuestion(item, q) && questionMatchesPoint(item, selectedPoint));
  ```
  删除原「多标签题按任一轴命中取并集」。
- 标题只用选中考点：`titlePoints = [ poolHomogeneousOnKey(pool, selectedPoint) ? selectedPoint : { tag: selectedPoint.tag } ]`；`getPointTitle(titlePoints)` 不再出现 ` + `。
- 返回新增 `pointChips`：
  ```
  pointChips = points.map((p, i) => ({
    idx: i,
    label: chipLabel(options.getPointTitle([p])),   // 见下
    active: i === idx
  }));
  ```
  `chipLabel(fullTitle)`：取单点面包屑去掉首段大类（「谓语动词 · 」）后的剩余段，如 `时态·一般现在`、`语态·被动语态`。实现：`title.split(' · ').slice(1).join('·')`，为空则回退原 title。

### ② 视图层 `teaching-render.js` + view model

- `buildMigrationContentViewModel`：在返回对象透传 `pointChips: asArray(data.pointChips)`。
- `migrationDrawerHtml` / `migrationStageHtml`：当 `contentModel.pointChips.length > 1` 时，在标题块（heading/countText）下渲染一行 chip：
  ```
  <button onclick="setMigrationPoint(<idx>)" class=...(active 高亮)>label</button>
  ```
  样式复用现有 chip/tab 视觉（drawer 用小圆角按钮行，stage 用 `.teaching-migration-source-tabs` 同类）。`length <= 1` 不渲染。

### ③ index.html 接线

- 新增模块级状态：`var _migrationPointIdx = 0;`（紧邻 `_migrationShowAll`）。
- `getMigrationData`：buildMigrationData 入参加 `pointIdx: _migrationPointIdx`。
- 新增全局 `setMigrationPoint(idx)`：`_migrationPointIdx = idx; _migrationShowAll = false;` 然后重渲迁移抽屉（镜像 `setMigrationSource` 的重渲路径）。注册到底部 window 导出表（紧邻 `setMigrationSource`/`toggleMigrationShowAll`）。
- `openTeachingStageByIdx`（切题）：复位 `_migrationPointIdx = 0;`（与 `_migrationShowAll = false;` 同处）。
- `setMigrationSource`（切真题/模拟/错题）：**不复位** `_migrationPointIdx`（保留当前考点），仅保留原 `_migrationShowAll = false`。

### ④ 计数 / 空态 / tab

- `poolCount`、空态 `emptyState`、来源 tab 计数均由选中考点的纯池驱动；切轴后随之变化（符合预期）。
- 某考点纯池为空 → 显示该考点空态提示。
- 导航徽标「迁移 N 题 →」继续用 `countAnalysisMigrationCandidates`（并集 = 经任一轴可达的相关题总数），**不改**——它是「有多少相关题」的入口提示，与抽屉内分轴纯池口径不同属可接受。

## 边界情况

- 单考点题（多数非谓语题；或仅带时态的谓语题）：`points.length === 1` → 无 chip 行，纯池行为同现状（非谓语题本就单点纯池，无行为变化）。
- 谓语题无 facets 回退 `[{tag: fc}]`：单点，无 chip。
- `pointIdx` 越界（切题未复位的残留）：clamp 到 0。

## 测试

`tests/smoke.spec.js`（直接驱动 `buildMigrationData`）新增断言，用一道谓语 time+passive 题 + 一个含 {被动题, 同时态主谓一致题, 纯被动题} 的题库：
- `pointIdx=0`（时态池）：包含同时态的主谓一致题（符合「时态池含所有同时态题」）。
- `pointIdx=1`（被动池）：只含被动题，**不含**纯主谓一致题。
- `pointChips` 长度 = 2，0 号 active、label 含「时态」，1 号 label 含「被动」。
- 标题不含 ` + `。

可补一个 `test/` 下的 node --test 单元，针对 `questionMatchesPoint`（同 tag 同 key 命中、keyless 通配命中、不同 key 不命中、不同 tag 不命中）。

## 不在本次范围

- 教材视图分类滞后（反馈 C1/C2，单独批次）。
- 真题/模拟分开（反馈 B）。
- `countAnalysisMigrationCandidates` 计数口径调整。
