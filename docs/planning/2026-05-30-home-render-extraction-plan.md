# 首页渲染抽离(home-render)实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:executing-plans。Steps 用 `- [ ]` 跟踪。

**Goal:** 把首页 `renderHomeDashboard`/`renderExamGrid`/`renderHomeCategories` 的纯 HTML 装配迁入新模块 `home-render.js`(`homeDashboardHtml`/`examGridHtml`/`homeCategoriesHtml`),共享 onclick 帮手注入,行为零差异。

**Architecture:** 新建 render 模块;`inlineSidebarAction`/`inlineHomeDashboardAction` 留 index.html inline 并经 deps 注入;`renderHomeDashboardTextParts`/`renderHomeDashboardActionButton` 作模块内部 helper 迁入;3 函数的 DOM 取元素/读全局/build*Model/`innerHTML=` 留原位。`renderClassroomSwitcher` 不动。3 checkpoint。

**Tech Stack:** 原生 ES(IIFE + `window.GrammarHomeRender`,经 `<script src="./modules/home-render.js">` 加载)、Playwright、`check_grammar_modules.py`。

**上游:** sidebar-render(样板,`dfcce00`);设计 `docs/planning/2026-05-30-home-render-extraction-design.md`;backlog 优先级 2。分支 `feature/teaching-render`。

> **执行通则**:行号因并行编辑会漂移,所有定位**按函数名 grep**;提交前确认 `git status --short docs/grammar-fill/index.html` 干净。新模块 script 标签接在 `<script src="./modules/sidebar-render.js">` 之后;契约条目接在 `sidebar-render.js` 之后(顺序两边一致)。

---

## 前置条件

- [ ] index.html 工作区干净(决策地图 WIP 已提交)。
- [ ] 本计划 + 设计文档随末个 checkpoint commit 入库。

## File Structure

| 文件 | 动作 |
|---|---|
| `docs/grammar-fill/modules/home-render.js` | **新建**;CP1 建文件 + `homeDashboardHtml` + 内部 helper;CP2 加 `examGridHtml`;CP3 加 `homeCategoriesHtml` |
| `docs/grammar-fill/index.html` | 加 `<script>`(CP1);3 处改桥;删 2 helper + 3 段内联 HTML |
| `scripts/check_grammar_modules.py` | `EXPECTED_MODULES` 加 `GrammarHomeRender` 条目(CP1),exports CP2/CP3 各 +1 |
| `tests/smoke.spec.js` | `home-render pure html output` 测试,CP1/2/3 各加 1 函数断言 |

---

## Task 1: homeDashboardHtml(checkpoint 1)

**Files:** modules/home-render.js(新建)、index.html、check_grammar_modules.py、tests/smoke.spec.js

- [ ] **Step 1: 加红测试**

在 `tests/smoke.spec.js` 末尾(`sidebar-render pure html output` 测试 `});` 之后)插入:
```js

test('home-render pure html output', async ({ page }) => {
  await page.goto('/docs/grammar-fill/');
  await expect(page.locator('html')).toHaveClass(/ready/);
  await page.waitForFunction(() => !!window.GrammarHomeRender);

  const out = await page.evaluate(() => {
    const R = window.GrammarHomeRender;
    if (!R) return { missing: true };
    const dash = R.homeDashboardHtml(
      { hero: { kickerText: 'K', titleText: 'T', bodyParts: [{ text: '正文', strong: true }] },
        actions: [{ action: { type: 'switch-page', value: 'home' }, icon: '📘', label: '按钮', subtitleText: '副', chrome: { style: '', mouseover: '', mouseout: '' } }],
        textbookSection: { visible: true, titleText: '教材', actionLabel: '更多', action: {} },
        books: [{ action: {}, cover: 'x.png', labelText: '必修一', animationDelayMs: 0 }] },
      { inlineHomeDashboardAction: function(a) { return 'DASH:' + (a && a.type || ''); } }
    );
    return {
      missing: false,
      dashHasHero: dash.includes('正文') && dash.includes('按钮') && dash.includes('DASH:switch-page'),
      dashHasBooks: dash.includes('必修一') && dash.includes('x.png')
    };
  });
  expect(out.missing).toBe(false);
  expect(out.dashHasHero).toBe(true);
  expect(out.dashHasBooks).toBe(true);
});
```

- [ ] **Step 2: 跑红**(自起服务器,过滤 `home-render pure html output`;`GrammarHomeRender` 不存在 → `waitForFunction` 超时)
```bash
python3 -m http.server 8931 >/tmp/hr.log 2>&1 & SRV=$!
for i in $(seq 1 30); do curl -fsS http://localhost:8931/docs/ >/dev/null 2>&1 && break; sleep 0.5; done
SEEKLUME_BASE_URL="http://localhost:8931" npx playwright test tests/smoke.spec.js --project=chromium -g "home-render pure html output" > /tmp/hr-test.log 2>&1
RC=$?; kill $SRV 2>/dev/null; tail -15 /tmp/hr-test.log; echo "exit: $RC"
```
Expected: FAIL。

- [ ] **Step 3: 新建 home-render.js**

创建 `docs/grammar-fill/modules/home-render.js`:
```js
// grammar-fill/modules/home-render.js
//
// Pure home-page render helpers. Model + injected deps in, HTML string out.
// No DOM access, no side effects. onclick 帮手(inlineHomeDashboardAction / inlineSidebarAction)经 deps 注入。

/* eslint-disable */
(function(){
  function textPartsHtml(parts) {
    if (!Array.isArray(parts)) return '';
    return parts.map(function(part) {
      var text = window.escapeHtml(part && part.text || '');
      if (part && part.strong) return '<b style="color:var(--text);">' + text + '</b>';
      return text;
    }).join('');
  }

  function actionButtonHtml(item, inlineHomeDashboardAction) {
    item = item || {};
    var chrome = item.chrome || window.GrammarHomeDashboardModel.getActionButtonChrome(item.tone || '');
    return '<button onclick="' + inlineHomeDashboardAction(item.action) + '" '
         + 'style="' + chrome.style + '" '
         + 'onmouseover="' + chrome.mouseover + '" '
         + 'onmouseout="' + chrome.mouseout + '">'
         + '<span style="font-size:20px;">' + window.escapeHtml(item.icon || '') + '</span>'
         + '<span>' + window.escapeHtml(item.label || '') + '</span>'
         + '<span style="font-size:11px;' + (item.subtitleStyle || '') + 'font-weight:400;">' + window.escapeHtml(item.subtitleText || '') + '</span>'
         + '</button>';
  }

  function homeDashboardHtml(model, deps) {
    deps = deps || {};
    var inlineHomeDashboardAction = deps.inlineHomeDashboardAction;
    model = model || {};
    var hero = model.hero || {};
    var html = '';
    html += '<section style="background:linear-gradient(135deg, var(--accent-bg) 0%, var(--surface) 80%);border-radius:18px;padding:32px 30px;margin-bottom:22px;position:relative;overflow:hidden;">';
    html += '<div style="font-size:14px;color:var(--accent);margin-bottom:6px;font-weight:600;">' + window.escapeHtml(hero.kickerText || '') + '</div>';
    html += '<h2 style="margin:0 0 8px 0;font-size:26px;color:var(--text);line-height:1.4;">' + window.escapeHtml(hero.titleText || '') + '</h2>';
    html += '<p style="margin:0 0 18px;color:var(--text-2);line-height:1.7;font-size:15px;">' + textPartsHtml(hero.bodyParts) + '</p>';
    html += '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:10px;">';
    (model.actions || []).forEach(function(item) {
      html += actionButtonHtml(item, inlineHomeDashboardAction);
    });
    html += '</div>';
    html += '</section>';
    var textbookSection = model.textbookSection || {};
    if (textbookSection.visible) {
      html += '<section>';
      html += '<div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:12px;">';
      html += '<h3 style="margin:0;font-size:16px;color:var(--text);">' + window.escapeHtml(textbookSection.titleText || '') + '</h3>';
      html += '<a onclick="' + inlineHomeDashboardAction(textbookSection.action) + '" style="font-size:13px;color:var(--accent);cursor:pointer;">' + window.escapeHtml(textbookSection.actionLabel || '') + '</a>';
      html += '</div>';
      html += '<div style="display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:10px;">';
      (model.books || []).forEach(function(item) {
        html += '<div onclick="' + inlineHomeDashboardAction(item.action) + '" '
             + 'style="cursor:pointer;border-radius:8px;overflow:hidden;background:var(--surface);box-shadow:0 1px 4px rgba(0,0,0,0.06);transition:all .2s;animation:fadeInUp .4s ease-out ' + (Number(item.animationDelayMs) || 0) + 'ms both;" '
             + 'onmouseover="this.style.transform=\'translateY(-3px)\';this.style.boxShadow=\'0 8px 20px rgba(0,0,0,0.15)\'" '
             + 'onmouseout="this.style.transform=\'\';this.style.boxShadow=\'0 1px 4px rgba(0,0,0,0.06)\'">';
        html += '<div style="width:100%;aspect-ratio:140/190;background:#eee url(\'' + window.escapeHtml(item.cover || '') + '\') no-repeat center/cover;"></div>';
        html += '<div style="padding:5px;text-align:center;font-size:11px;font-weight:600;color:var(--text-2);">' + window.escapeHtml(item.labelText || item.book || '') + '</div>';
        html += '</div>';
      });
      html += '</div>';
      html += '</section>';
    }
    return html;
  }

  window.GrammarHomeRender = {
    homeDashboardHtml: homeDashboardHtml
  };
})();
```

- [ ] **Step 4: index.html 加 `<script>` 标签**

在 `<script src="./modules/sidebar-render.js"></script>` 后加:
```html
<script src="./modules/sidebar-render.js"></script>
<script src="./modules/home-render.js"></script>
```

- [ ] **Step 5: check_grammar_modules.py 加条目**

`EXPECTED_MODULES` 中 `sidebar-render.js` 条目之后加:
```python
    {
        "path": "home-render.js",
        "namespace": "GrammarHomeRender",
        "exports": [
            "homeDashboardHtml",
        ],
    },
```

- [ ] **Step 6: index.html 改 renderHomeDashboard 桥 + 删 2 helper**

(a) grep 确认 `renderHomeDashboardTextParts`/`renderHomeDashboardActionButton` 仅 `renderHomeDashboard` 内调用(应各 1 处:textParts 在 hero `<p>`、actionButton 在 actions.forEach)。

(b) `renderHomeDashboard` 内,把从 `var html = '';` 到 `el.innerHTML = html;` 之前的整段内联 HTML 拼装(hero + 按钮 + 教材画廊,即 `var html=''` 起到 `}` 闭合教材 section、`el.innerHTML=html` 之前)替换为:
```js
  var html = window.GrammarHomeRender.homeDashboardHtml(dashboardModel, { inlineHomeDashboardAction: inlineHomeDashboardAction });
```
保留前面的 `el`/`prepCount`/`errCount`/`dashboardModel = buildDashboardModel(...)` 和后面的 `el.innerHTML = html;`。

(c) 删除整个 `function renderHomeDashboardTextParts(parts) {...}` 和 `function renderHomeDashboardActionButton(item) {...}`(已迁入模块)。`inlineHomeDashboardAction`/`runHomeDashboardAction` **保留**。

- [ ] **Step 7: 全量门禁**

`python3 scripts/check_grammar_modules.py` → `OK: ... (20 modules)`;`npm run check` → 全绿(含 `home-render pure html output` + core-path 真实渲染首页 Dashboard)。

- [ ] **Step 8: commit** `git add` 4 文件 → `git commit -m "refactor(grammar-fill): extract homeDashboardHtml to home-render"`

---

## Task 2: examGridHtml(checkpoint 2)

**Files:** modules/home-render.js、index.html、check_grammar_modules.py、tests/smoke.spec.js

- [ ] **Step 1: 加红断言**

在 `home-render pure html output` 的 evaluate 块内 `dash` 之后加:
```js
    const grid = R.examGridHtml(
      { groups: [{ year: '2024', count: 1, titleText: '', items: [{ action: {}, id: '2024A', type: '真题', tagClass: '', blankCount: 10, descriptionText: '' }] }] },
      { inlineSidebarAction: function(a, fn, v) { return fn + ':' + v; } }
    );
```
return 对象加:`examGridHasCard: grid.includes('category-section') && grid.includes('grid-11') && grid.includes('startByExam:2024A'),`
末尾加:`expect(out.examGridHasCard).toBe(true);`

- [ ] **Step 2: 跑红**(同 Task 1 Step 2,`examGridHtml` 不存在 → 断言抛错/false)。

- [ ] **Step 3: 模块加 examGridHtml**

`home-render.js` 中 `homeDashboardHtml` 之后、导出对象之前加(**照抄原 `renderExamGrid` 模板字面量,仅 `escapeHtml`→`window.escapeHtml`、注入 `inlineSidebarAction`**):
```js
  function examGridHtml(model, deps) {
    deps = deps || {};
    var inlineSidebarAction = deps.inlineSidebarAction;
    model = model || {};
    var html = '';
    (model.groups || []).forEach(function(group) {
      html += `<div class="category-section">`
           + `<div class="category-section-title" style="cursor:pointer;display:flex;align-items:center;gap:6px;user-select:none;" onclick="toggleExamYear(this)"><span class="year-arrow" style="display:inline-block;transition:transform .2s;font-size:11px;">▼</span>${window.escapeHtml(group.titleText || ((group.year || '') + ' 年 · ' + (group.count || 0) + ' 套'))}</div>`
           + `<div class="exam-year-body"><div class="grid-11">`;
      (group.items || []).forEach(function(item) {
        var tagCls = item.tagClass ? `card-tag ${item.tagClass}` : 'card-tag';
        html += `<div class="card" onclick="${inlineSidebarAction(item.action, 'startByExam', item.id)}">`
              + `<span class="${tagCls}">${window.escapeHtml(item.type)}</span>`
              + `<div class="card-title">${window.escapeHtml(item.id)}</div>`
              + `<div class="card-desc">${window.escapeHtml(item.descriptionText || ('语法填空 · ' + item.blankCount + ' 题'))}</div>`
              + `</div>`;
      });
      html += `</div></div></div>`;
    });
    return html;
  }
```
导出对象 `homeDashboardHtml: homeDashboardHtml` 行尾加逗号,追加 `examGridHtml: examGridHtml`。

- [ ] **Step 4: index.html renderExamGrid 改桥**

`renderExamGrid` 内把 `let html = '';` 起到 `grid.innerHTML = html;` 之前的内联拼装,替换为:
```js
  const html = window.GrammarHomeRender.examGridHtml(model, { inlineSidebarAction: inlineSidebarAction });
```
保留 `grid = getElementById('examGrid')`、`if (!grid) return`、`model = buildExamGridModel(BANK.exams)`、`grid.innerHTML = html`。

- [ ] **Step 5: check exports 加 `examGridHtml`**

- [ ] **Step 6: 门禁** `python3 scripts/check_grammar_modules.py`(20 模块)+ `npm run check` 全绿。

- [ ] **Step 7: commit** `-m "refactor(grammar-fill): extract examGridHtml to home-render"`

---

## Task 3: homeCategoriesHtml(checkpoint 3)

**Files:** modules/home-render.js、index.html、check_grammar_modules.py、tests/smoke.spec.js

- [ ] **Step 1: 加红断言**

evaluate 块 `grid` 之后加:
```js
    const cats = R.homeCategoriesHtml(
      { sections: [{ titleText: '考点', items: [{ action: {}, category: 'predicate', tagClass: '', tagText: '谓语', titleText: '谓语动词', descriptionText: '', countText: '5 题', countElementId: 'count-predicate' }] }] },
      { inlineSidebarAction: function(a, fn, v) { return fn + ':' + v; } }
    );
```
return 对象加:`catsHasCard: cats.includes('category-section') && cats.includes('count-predicate') && cats.includes('startByCategory:predicate'),`
末尾加:`expect(out.catsHasCard).toBe(true);`

- [ ] **Step 2: 跑红**(`homeCategoriesHtml` 不存在)。

- [ ] **Step 3: 模块加 homeCategoriesHtml**

`home-render.js` 中 `examGridHtml` 之后、导出对象之前加(照抄原 `renderHomeCategories`,`escapeHtml`→`window.escapeHtml`、注入 `inlineSidebarAction`):
```js
  function homeCategoriesHtml(model, deps) {
    deps = deps || {};
    var inlineSidebarAction = deps.inlineSidebarAction;
    model = model || {};
    var html = '';
    (model.sections || []).forEach(function(section) {
      html += '<div class="category-section">'
        + '<div class="category-section-title">' + window.escapeHtml(section.titleText || '') + '</div>'
        + '<div class="grid-11">';
      (section.items || []).forEach(function(item) {
        var tagClass = item.tagClass ? 'card-tag ' + item.tagClass : 'card-tag';
        html += '<div class="card" onclick="' + inlineSidebarAction(item.action, 'startByCategory', item.category) + '">'
          + '<span class="' + tagClass + '">' + window.escapeHtml(item.tagText || '') + '</span>'
          + '<div class="card-title">' + window.escapeHtml(item.titleText || '') + '</div>'
          + '<div class="card-desc">' + window.escapeHtml(item.descriptionText || '') + '</div>'
          + '<div class="card-count" id="' + window.escapeHtml(item.countElementId || ('count-' + item.category)) + '">' + window.escapeHtml(item.countText || '') + '</div>'
          + '</div>';
      });
      html += '</div></div>';
    });
    return html;
  }
```
导出对象 `examGridHtml: examGridHtml` 行尾加逗号,追加 `homeCategoriesHtml: homeCategoriesHtml`。

- [ ] **Step 4: index.html renderHomeCategories 改桥**

`renderHomeCategories` 内把 `var html = '';` 起到 `root.innerHTML = html;` 之前的内联拼装,替换为:
```js
  var html = window.GrammarHomeRender.homeCategoriesHtml(model, { inlineSidebarAction: inlineSidebarAction });
```
保留 `root = getElementById('homeCategories')`、`if (!root || !window.GrammarCategoryRules) return`、`model = buildHomeCategoryModel(ALL_QUESTIONS)`、`root.innerHTML = html`。

- [ ] **Step 5: check exports 加 `homeCategoriesHtml`**

- [ ] **Step 6: 门禁** 全绿。

- [ ] **Step 7: commit**(含本批 spec/plan 两文档)`-m "refactor(grammar-fill): extract homeCategoriesHtml to home-render"`

---

## 完成定义

- [ ] 3 函数迁入 `home-render.js`,2 helper 作内部 helper;index.html 3 函数 = DOM 编排 + 调模块
- [ ] `inlineSidebarAction`/`inlineHomeDashboardAction` 原位保留并注入;`renderClassroomSwitcher`/`runHomeDashboardAction` 不动
- [ ] `check_grammar_modules.py` 20 模块通过、script 顺序一致
- [ ] smoke +3 断言全绿
- [ ] 每 checkpoint `npm run check` 全绿后 commit

## 非目标(YAGNI)

- 不抽 `renderClassroomSwitcher`、不提取共享 onclick util、不改任何 class/style/onclick 文本/CSS
- examGrid 保留原模板字面量写法(只做 2 处机械替换,降低转写风险)

## 行为不变保证

① 副作用留 inline(DOM 写入、读全局、build*Model 顺序不变) ② `npm run check` core-path smoke 真实渲染首页 ③ render 单测断言各函数输出含关键 class + 注入 onclick。
