# grammar-fill 去全局化 · 第一期（地基）实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把 `grammar-fill/index.html` 的 ~3568 行内联 CSS 抽到外部 `styles.css`，立下"不再往 index.html 堆业务逻辑"的护栏，并产出一张引擎内部边界地图，为后续逐块搬迁提供准确依据。

**Architecture:** 纯原生、零构建。CSS 平移到 `styles.css` 经 `<link>` 引入（保留 boot-cloak 关键 CSS 内联以防闪白）。引擎暂不搬迁——本期只产出"待搬清单"地图，因为代码真实边界（如 `renderCategoryStats` 混在投影段、函数闭包引用内联全局 `teachingFullscreenRequested`）需先探明。

**Tech Stack:** 原生 HTML/CSS/JS，`window.Grammar*` 全局命名约定，Playwright smoke 测试（`npm run test:smoke`）作行为不变验证。

---

## 文件结构

- 修改：`docs/grammar-fill/index.html`（删除主 `<style>` 块，替换为 `<link>`）
- 新建：`docs/grammar-fill/styles.css`（承载抽出的 ~3568 行 CSS）
- 新建：`docs/grammar-fill/ARCHITECTURE.md`（护栏铁律 + 模块文件头规范）
- 新建：`docs/superpowers/specs/2026-06-01-grammar-fill-engine-map.md`（引擎待搬清单地图）

验证基线：`docs/grammar-fill/index.html` 当前 9731 行；主 `<style>` 为第 9–3576 行；`<style id="boot-cloak">` 在 3587–3591 行（保留内联）。

---

## Task 1: 立护栏（ARCHITECTURE.md）

**Files:**
- Create: `docs/grammar-fill/ARCHITECTURE.md`

- [ ] **Step 1: 写护栏文档**

创建 `docs/grammar-fill/ARCHITECTURE.md`，内容如下：

```markdown
# grammar-fill 架构护栏

## 铁律
1. **index.html 不再新增业务逻辑。** 终态只剩三样：HTML 骨架、`<script>` 装配清单、~10 行启动代码。
   新逻辑一律进 `modules/`，不进 index.html。
2. CSS 进 `styles.css`，不再内联（boot-cloak 关键 CSS 例外，须内联防闪白）。
3. 模块通信沿用现有 `window.Grammar*` 全局命名约定，不发明新机制、不引入构建工具。
4. 不动 `shared/`、不动其他题型，除非任务明确要求。

## 每个 module 文件头必须写"三件套"
\```js
// grammar-fill/modules/xxx.js
//
// 职责：这个模块做什么（一句话）
// 用法：怎么调用（入口挂在 window.GrammarXxx 上）
// 依赖：依赖哪些全局 / 模块 / DOM
\```

## 模块抽取手法（每块搬迁遵循）
1. 在 modules/ 新建文件，写三件套文件头。
2. IIFE 包裹，入口挂 window.GrammarXxx（参照 app-state.js / teaching-render.js）。
3. 外部依赖通过 deps 对象在调用时传入（参照 focusRuleDeps() / teachingViewModelDeps()），不在模块内直接抓散落全局。
4. 在 index.html 装配清单按正确加载顺序加入 `<script>` 引用。
5. 删除 index.html 对应内联代码，替换为对模块入口的调用。
6. 单独 commit，单独跑 `npm run test:smoke` 验证。
```

- [ ] **Step 2: Commit**

```bash
git add docs/grammar-fill/ARCHITECTURE.md
git commit -m "docs(grammar-fill): 立架构护栏 — index.html 不再进业务逻辑"
```

---

## Task 2: 抽 CSS 到 styles.css

**Files:**
- Create: `docs/grammar-fill/styles.css`
- Modify: `docs/grammar-fill/index.html:9-3576`

- [ ] **Step 1: 跑基线 smoke 测试，确认当前是绿的**

Run: `npm run test:smoke`
Expected: PASS（3 个 grammar-fill 相关用例全过）。若此处已失败，先停下排查，不要继续。

- [ ] **Step 2: 记录基线行数**

Run: `wc -l docs/grammar-fill/index.html`
Expected: `9731 docs/grammar-fill/index.html`

- [ ] **Step 3: 把主 `<style>` 内容抽到 styles.css**

主 `<style>` 标签在第 9 行，`</style>` 闭合在第 3576 行。CSS 内容是第 10–3575 行。
抽出内容（不含 `<style>`/`</style>` 标签本身）到新文件：

Run:
```bash
sed -n '10,3575p' docs/grammar-fill/index.html > docs/grammar-fill/styles.css
```

确认行数：
Run: `wc -l docs/grammar-fill/styles.css`
Expected: `3566 docs/grammar-fill/styles.css`

- [ ] **Step 4: 把 index.html 第 9–3576 行整块替换成 `<link>`**

3568 行太大不宜用编辑器逐字匹配，用确定性的拼接命令：保留前 8 行 → 插入 `<link>` → 接上第 3577 行起的剩余内容。

Run:
```bash
cd docs/grammar-fill && { sed -n '1,8p' index.html; echo '<link rel="stylesheet" href="./styles.css">'; sed -n '3577,$p' index.html; } > index.html.new && mv index.html.new index.html && cd -
```

效果：
- 主 `<style>` 块（9–3576）被替换为一行 `<link>`，位置不变（`<head>` 内、boot-cloak 之前），层叠顺序不变。
- **保留**了原第 3587–3591 行的 `<style id="boot-cloak">` 与第 3592 行 `<noscript>`（它们在第 3577 行之后，未被触碰）——这两块是防闪白关键 CSS，必须先于外部样式表内联存在。

- [ ] **Step 5: 确认 index.html 已瘦身、且不再含主内联样式**

Run: `wc -l docs/grammar-fill/index.html`
Expected: 约 `6164`（9731 − 3568 + 1）。

Run: `grep -c '<link rel="stylesheet" href="./styles.css">' docs/grammar-fill/index.html`
Expected: `1`

Run: `grep -n '<style' docs/grammar-fill/index.html`
Expected: 只剩 boot-cloak 与 noscript 两处（不再有主 `<style>`）。

- [ ] **Step 6: 跑 smoke 测试，确认行为不变**

Run: `npm run test:smoke`
Expected: PASS（与 Step 1 相同的 3 个用例全过）。

- [ ] **Step 7: 肉眼/截图核对视觉一致**

Run: `python3 -m http.server 8931` （后台起本地服务）
浏览器打开 `http://localhost:8931/docs/grammar-fill/`，逐项确认：
- 首页 dashboard 卡片布局正常
- 进入一道题、打开讲题台，排版正常
- 切换暗色主题（若 UI 有入口），颜色正常
- 触发投影模式（讲题台全屏），布局正常
- 无明显闪白/错位

确认无异常后停掉本地服务。

- [ ] **Step 8: Commit**

```bash
git add docs/grammar-fill/styles.css docs/grammar-fill/index.html
git commit -m "refactor(grammar-fill): 抽离内联 CSS 到 styles.css（index.html 9731→~6164 行）"
```

---

## Task 3: 画引擎地图（待搬清单）

**Files:**
- Create: `docs/superpowers/specs/2026-06-01-grammar-fill-engine-map.md`

目的：内联引擎（CSS 抽离后约在 index.html 第 ~432 行 `<script>` 起到文件末尾）的真实边界比分节注释复杂，搬迁前需精确登记每一块。本任务**只读代码、产出地图，不改任何业务代码**。

- [ ] **Step 1: 列出引擎所有分节注释及其绝对行号**

Run:
```bash
grep -nE '// ─{2,}|// ={2,}|// ── ' docs/grammar-fill/index.html
```
把输出整理成"分节 → 起始行"清单。

- [ ] **Step 2: 列出引擎里所有顶层函数定义及行号**

Run:
```bash
grep -nE '^\s*function [A-Za-z_]+\s*\(' docs/grammar-fill/index.html
```

- [ ] **Step 3: 找出每个候选搬迁块引用的内联全局变量（闭包依赖）**

对每个候选块（投影模式、云同步UI、Dashboard、侧边栏、迁移训练、三视图），人工核查它引用了哪些**定义在内联脚本顶层、而非模块里**的可变变量（例如 `teachingFullscreenRequested`、`practiceContext`、`BANK`、`CATEGORY_MAP`）。这些是搬迁时必须通过 deps 传入的依赖。

- [ ] **Step 4: 写地图文档**

创建 `docs/superpowers/specs/2026-06-01-grammar-fill-engine-map.md`，对每个候选搬迁块登记一行表格：

```markdown
# grammar-fill 引擎待搬清单（地图）

> CSS 抽离后，引擎为 index.html 内联 `<script>` 块。本表为逐块搬迁的依据。

| 块名 | 行号区间 | 包含的函数 | 引用的内联全局（需 deps 传入） | 触碰的 DOM id | 已委托的模块 | 孤立度 | 建议搬迁顺序 |
|------|----------|------------|-------------------------------|---------------|--------------|--------|--------------|
| 投影模式 | … | getFullscreenElement, applyProjectionState, requestTeachingFullscreen, exitTeachingFullscreen, enterProjectionMode, exitProjectionMode, setDrawerProjectionSize, … | teachingFullscreenRequested | teachingStage | GrammarAppState | 高 | 1 |
| 管理员页 | … | … | … | … | … | 高 | 2 |
| 云同步 UI | … | … | … | … | GrammarCloud | 中 | 3 |
| Dashboard 主页 | … | … | … | … | GrammarHomeDashboardModel | 中 | 4 |
| 侧边栏(页面+Dock) | … | … | … | … | GrammarSidebarViewModel | 中 | 5 |
| 迁移训练数据源 | … | … | … | … | GrammarMigrationTraining | 中 | 6 |
| 三视图可视化 | … | renderCategoryStats, jumpToCategory, … | practiceContext, CATEGORY_MAP | … | GrammarKnowledgeViewModel | 中 | 7 |

## 边界注意事项
- `renderCategoryStats` / `jumpToCategory` 物理上位于"投影模式"注释段尾部，但概念属于"三视图/考点速查"——搬迁时归入三视图块，不要跟投影一起搬。
- （核查中发现的其它跨段函数、命名不一致等，逐条记于此。）
```

把 Step 1–3 的真实结果填进表格（不留 `…` 占位）。

- [ ] **Step 5: Commit**

```bash
git add docs/superpowers/specs/2026-06-01-grammar-fill-engine-map.md
git commit -m "docs(grammar-fill): 引擎待搬清单地图（搬迁依据）"
```

---

## 本期完成的判定标准

- [ ] `ARCHITECTURE.md` 护栏文档已提交
- [ ] `styles.css` 已抽出，`index.html` 降到约 6164 行，主内联 `<style>` 已消失，boot-cloak 保留
- [ ] `npm run test:smoke` 在 CSS 抽离后仍全绿
- [ ] 视觉肉眼核对无回归
- [ ] 引擎地图文档已填实并提交

## 下一期（不在本计划内）

地图就绪后，按地图建议顺序逐块搬迁引擎，每块一份小计划/一次 commit/一次 smoke 验证，从"投影模式"开始。
