# 全局图谱重做 · 设计 + 实现计划

> 2026-05-29 brainstorming 确认。非演示关键路径（教研会不演示），可从容重做。

## Context（为什么重做）

现 `全局图谱` = 手工排版的 SVG 决策树（`KNOWLEDGE_CORE.teaching_graph`，6 簇/~36 节点）。三个硬伤：
- **质量**：节点 x/y 手写死（2500×1740 画布）→ 易挤乱、加节点即崩、维护噩梦。
- **交互**：手搓 SVG 拖拽/缩放 → 触屏（教室一体机）极难用。
- **内容**：决策树本身是对的，但只有抽象节点，叶子和真实题目对不上。

用户拍板：**保留"做题决策地图"用途**，重做成 **引导 + 全貌 双模式**，去掉拖拽大图。

## 设计

一套数据、两个模式，**复用 `teaching_graph` 的节点 + `decision_tip` + parent 关系，丢弃手写 x/y**。

### 模式 ① 引导走一遍（默认）
- 中央卡片：当前节点 `title` + `decision_tip`（一句话怎么判断）+ **大按钮 = 子节点选项**（子节点 = parent 指向当前节点的节点；按钮文案 = 子节点 title/subtitle）。
- 点选项 → 切到该子节点；顶部**面包屑**记录路径，支持"← 上一步"。
- 叶子节点（无子节点，category/fine_refs 指向具体考点）→ 显示考点 + **"看这类真题 N 道 →"**（复用按考点/迁移取题）。
- 纯点击，无缩放无拖拽。

### 模式 ② 看全貌（切换按钮）
- 整棵决策树 = **纵向缩进大纲**（CSS 自动缩进，按 parent 递归；不再手摆坐标）；可展开/收起；**当前引导路径高亮**。
- 点大纲任一节点 → 跳到引导模式的该步。

## 组件与数据流（纯 vanilla，不引库）

- **纯模型**（放 `knowledge-view-model.js` 或新 `decision-map-model.js`）：
  - `buildDecisionTree(coreNodes)`：按 `parent` 归子，返回 `{rootId, byId, childrenOf}`。
  - `buildGuidedStepModel(byId, childrenOf, currentId)`：当前节点 + 选项(子节点) + 是否叶子 + 面包屑路径 + 上一步目标。
  - `buildDecisionOutlineModel(byId, childrenOf, rootId, currentPathIds)`：扁平化(含 depth)供缩进渲染 + 当前路径高亮标记。
  - 叶子取题：复用现有按 category/fine 取题逻辑。
- **渲染层**（`index.html`，替换 `renderGlobalGraph`）：`renderDecisionMapGuided` / `renderDecisionMapOutline` / 模式切换 + 面包屑 + 选项点击。
- **状态**：`GrammarAppState` 加 `decisionMap: { mode:'guided'|'overview', currentId }`（规范化 + 同步桥），或先用局部 var 起步。

## 实现步骤

1. 纯模型 + 单测：`buildDecisionTree` / `buildGuidedStepModel` / `buildDecisionOutlineModel`（不碰 DOM）。`check_grammar_modules.py` 加契约，`smoke.spec.js` 加断言。
2. CSS：决策卡、选项大按钮、面包屑、缩进大纲、当前路径高亮（投影/触屏字号友好）。
3. 渲染：实现 `renderDecisionMapGuided` + `renderDecisionMapOutline` + 模式切换；`setKnowledgeView('system')` 改调新渲染。
4. 叶子接真题：叶子节点按 category/fine 拉题，点击进讲题/迁移。
5. 讲题台「图谱」tab 的"全图定位"：改成跳新决策地图（全貌 + 高亮该节点），更新 `teaching-view-model` 相关 plan + smoke。
6. 拆除旧 SVG：删 `renderGlobalGraph`/`renderGlobalGraphInspector`/`globalGraphState` 拖拽缩放 + `knowledge-view-model` 的 `buildGlobalGraphSvgModel/PageModel/InspectorModel`（或留薄壳避免大改 smoke，逐步删）。重复的"🗺知识地图(卡片)"并入或删。
7. 全门禁 `npm run check` 绿；浏览器实走引导+全貌+全图定位。

## 验证
- `check_grammar_modules.py` + `npm run check` 9/9。
- 浏览器：知识库→全局图谱→引导点到叶子→看真题；切全貌→点节点跳引导；讲题台「图谱」→全图定位→落到新地图。

## 范围 / 非目标
- 保留决策树**结构与粒度**（~36 节点，不膨胀到 102）。
- 不引入任何前端库（CSS + vanilla 实现树与卡片）。
- 不动演示关键路径（线 A/B/C 等）。教研会前若时间紧，本项可整体延后，不阻塞演示。
