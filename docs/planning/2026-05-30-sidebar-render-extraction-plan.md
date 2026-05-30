# 侧边栏渲染抽离(sidebar-render)实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:executing-plans。Steps 用 `- [ ]` 跟踪。

**Goal:** 把 `index.html` 的纯函数 `renderSidebarModel(model)` 迁入新模块 `sidebar-render.js` 的 `sidebarHtml(model, deps)`,共享 onclick 帮手注入,行为零差异。

**Architecture:** 新建独立 render 模块(数据归 `sidebar-view-model`、HTML 归 `sidebar-render`);`inlineSidebarAction`/`inlineSidebarCall` 留 index.html inline(home 共用)并通过 `deps` 注入;`renderPageSidebar`/`renderContextSidebar` 的 DOM 编排留原位,只改调用点。单 checkpoint。

**Tech Stack:** 原生 ES(IIFE + `window.GrammarSidebarRender` 全局,经 `<script src="./modules/sidebar-render.js">` 加载)、Playwright、`check_grammar_modules.py`。

**上游:** teaching-render batch 1/2/3(样板);设计 `docs/planning/2026-05-30-sidebar-render-extraction-design.md`;backlog `docs/planning/architecture-extraction-backlog.md`。分支 `feature/teaching-render`。

---

## 前置条件

- [ ] index.html 工作区干净(用户决策地图 WIP 先提交):`git status --short docs/grammar-fill/index.html` 无输出。
- [ ] 本计划 + 设计文档随本批 commit 一并入库(见 Step 8)。

## File Structure

| 文件 | 动作 |
|---|---|
| `docs/grammar-fill/modules/sidebar-render.js` | **新建**,IIFE + 导出 `sidebarHtml` |
| `docs/grammar-fill/index.html` | 加 `<script>`(3963 后);删 `renderSidebarModel`(5983-6039);改 2 处桥 |
| `scripts/check_grammar_modules.py` | `EXPECTED_MODULES` 末尾(teaching-render 后)加 sidebar-render 条目 |
| `tests/smoke.spec.js` | 加 `sidebar-render pure html output` 测试 |

---

## Task 1: 抽 sidebarHtml 到 sidebar-render 模块(单 checkpoint)

- [ ] **Step 1: 加失败测试(红)**

在 `tests/smoke.spec.js` 中 `teaching-render pure html output` 测试闭合 `});`(当前文件该测试末尾)**之后**,插入新测试:
```js

test('sidebar-render pure html output', async ({ page }) => {
  await page.goto('/docs/grammar-fill/');
  await expect(page.locator('html')).toHaveClass(/ready/);
  await page.waitForFunction(() => !!window.GrammarSidebarRender);

  const out = await page.evaluate(() => {
    const R = window.GrammarSidebarRender;
    if (!R) return { missing: true };
    const examGroups = R.sidebarHtml(
      { kind: 'exam-groups', title: '套卷', groups: [{ year: '2024', items: [{ id: '2024A', type: '真题', active: true, action: {}, blankCount: 10 }] }] },
      { inlineSidebarAction: function(a, fn, v) { return fn + ':' + v; } }
    );
    const hidden = R.sidebarHtml({ hidden: true }, {});
    return {
      missing: false,
      examGroupsHasItem: examGroups.includes('context-sidebar-year') && examGroups.includes('context-sidebar-item') && examGroups.includes('startByExam:2024A'),
      hiddenEmpty: hidden === ''
    };
  });
  expect(out.missing).toBe(false);
  expect(out.examGroupsHasItem).toBe(true);
  expect(out.hiddenEmpty).toBe(true);
});
```

- [ ] **Step 2: 跑红**

先确认 index.html 干净后,自起服务器跑过滤测试:
```bash
python3 -m http.server 8931 >/tmp/sr.log 2>&1 & SRV=$!
for i in $(seq 1 30); do curl -fsS http://localhost:8931/docs/ >/dev/null 2>&1 && break; sleep 0.5; done
SEEKLUME_BASE_URL="http://localhost:8931" npx playwright test tests/smoke.spec.js --project=chromium -g "sidebar-render pure html output" > /tmp/sr-test.log 2>&1
RC=$?; kill $SRV 2>/dev/null; tail -20 /tmp/sr-test.log; echo "exit: $RC"
```
Expected: FAIL(`window.GrammarSidebarRender` 不存在 → `waitForFunction` 超时 或 `R` undefined)。

- [ ] **Step 3: 新建 sidebar-render.js**

创建 `docs/grammar-fill/modules/sidebar-render.js`:
```js
// grammar-fill/modules/sidebar-render.js
//
// Pure sidebar render helper. Model + injected deps in, HTML string out.
// No DOM access, no side effects. onclick 帮手 inlineSidebarAction 经 deps 注入。

/* eslint-disable */
(function(){
  function sidebarHtml(model, deps) {
    deps = deps || {};
    var inlineSidebarAction = deps.inlineSidebarAction;
    if (!model || model.hidden) return '';
    var html = '<div class="context-sidebar-title">' + window.escapeHtml(model.title || '') + '</div>';
    if (model.emptyText) {
      return html + '<div class="context-sidebar-empty">' + window.escapeHtml(model.emptyText) + '</div>';
    }

    if (model.kind === 'exam-groups') {
      (model.groups || []).forEach(function(group) {
        html += '<div class="context-sidebar-year">' + window.escapeHtml(group.year) + ' 年</div>';
        (group.items || []).forEach(function(item) {
          var activeCls = item.active ? ' active' : '';
          html += '<div class="context-sidebar-item' + activeCls + '" onclick="' + inlineSidebarAction(item.action, 'startByExam', item.id) + '">'
                + '<span class="cs-tag' + (item.tagClass || '') + '">' + window.escapeHtml(item.type || '真题') + '</span>'
                + window.escapeHtml(item.id)
                + '<span class="cs-num">' + window.escapeHtml(item.countText || ((item.blankCount || 0) + '题')) + '</span>'
                + '</div>';
        });
      });
    } else if (model.kind === 'categories') {
      (model.items || []).forEach(function(item) {
        var activeCls = item.active ? ' active' : '';
        html += '<div class="context-sidebar-item' + activeCls + '" onclick="' + inlineSidebarAction(item.action, 'startByCategory', item.category) + '">'
              + '<span class="cs-tag">' + window.escapeHtml(item.label || item.category || '') + '</span>'
              + window.escapeHtml(item.countText || ((item.count || 0) + ' 题'))
              + '</div>';
      });
    } else if (model.kind === 'error-groups') {
      (model.groups || []).forEach(function(group) {
        html += '<div class="context-sidebar-year">' + window.escapeHtml(group.label || group.category || '') + '</div>';
        (group.items || []).forEach(function(item) {
          html += '<div class="context-sidebar-item" onclick="' + inlineSidebarAction(item.action, 'viewErrorQuestion', item.id) + '">'
                + '<span class="cs-tag">' + window.escapeHtml(item.answer || '') + '</span>'
                + window.escapeHtml(item.noText || ('第' + (item.no || '') + '题'))
                + '</div>';
        });
      });
    } else if (model.kind === 'error-items') {
      (model.items || []).forEach(function(item) {
        var activeCls = item.active ? ' active' : '';
        html += '<div class="context-sidebar-item' + activeCls + '" onclick="' + inlineSidebarAction(item.action, 'viewErrorQuestion', item.id) + '">'
              + '<span class="cs-tag">' + window.escapeHtml(item.categoryLabel || '') + '</span>'
              + window.escapeHtml(item.noText || ('第' + (item.no || '') + '题'))
              + '<span class="cs-cat">' + window.escapeHtml(item.answer || '') + '</span>'
              + '</div>';
      });
    } else if (model.kind === 'prep-items') {
      (model.items || []).forEach(function(item) {
        var activeCls = item.active ? ' active' : '';
        html += '<div class="context-sidebar-item' + activeCls + '" onclick="' + inlineSidebarAction(item.action, 'viewPrepPassage', item.id) + '">'
              + window.escapeHtml(item.title || '未命名备课')
              + '<span class="cs-num">' + window.escapeHtml(item.countText || ((item.blankCount || 0) + '题')) + '</span>'
              + '</div>';
      });
    }
    return html;
  }

  window.GrammarSidebarRender = {
    sidebarHtml: sidebarHtml
  };
})();
```

- [ ] **Step 4: index.html 加 `<script>` 标签**

在 `docs/grammar-fill/index.html` 的 `<script src="./modules/teaching-render.js"></script>`(当前 3963)后加一行:
```html
<script src="./modules/teaching-render.js"></script>
<script src="./modules/sidebar-render.js"></script>
```

- [ ] **Step 5: check_grammar_modules.py 加模块条目**

`scripts/check_grammar_modules.py` 中 `EXPECTED_MODULES` 末尾(teaching-render 条目之后、闭合 `]` 之前):
```python
            "teachingDockHtml",
        ],
    },
    {
        "path": "sidebar-render.js",
        "namespace": "GrammarSidebarRender",
        "exports": [
            "sidebarHtml",
        ],
    },
]
```
(顺序须与 index.html script 标签一致——两边都把 sidebar-render 放 teaching-render 之后。)

- [ ] **Step 6: index.html 删 renderSidebarModel + 改 2 处桥**

先确认调用点恰好 2 处:`grep -n "renderSidebarModel(" docs/grammar-fill/index.html` → 应为 6071、6091 两处(均在 `renderPageSidebar`/`renderContextSidebar` 内)。

(a) 删除整个 `function renderSidebarModel(model) { ... }`(从 `function renderSidebarModel(model) {` 到其闭合 `}`,当前 5983-6039;其后是注释行 `// ────────── 页面侧边栏…`,保留)。

(b) 把两处桥调用(replace_all)`document.getElementById('contextSidebarContent').innerHTML = renderSidebarModel(model);` 改为:
```js
  document.getElementById('contextSidebarContent').innerHTML = window.GrammarSidebarRender.sidebarHtml(model, { inlineSidebarAction: inlineSidebarAction });
```
`inlineSidebarAction`/`inlineSidebarCall` 定义(5978/上方)**保留不动**(home 卡片仍用)。

- [ ] **Step 7: 全量门禁**

Run: `python3 scripts/check_grammar_modules.py` → `OK: ... (19 modules)`(校验 script 顺序 + GrammarSidebarRender 导出 + 纯模块边界)。
Run: `npm run check` → 全绿(含 `sidebar-render pure html output` 新测试 + `grammar-fill core path` 真实渲染侧边栏)。

- [ ] **Step 8: checkpoint commit**

```bash
git add docs/grammar-fill/modules/sidebar-render.js docs/grammar-fill/index.html scripts/check_grammar_modules.py tests/smoke.spec.js docs/planning/2026-05-30-sidebar-render-extraction-design.md docs/planning/2026-05-30-sidebar-render-extraction-plan.md
git commit -m "refactor(grammar-fill): extract sidebarHtml to sidebar-render"
```

---

## 完成定义

- [ ] `sidebarHtml(model, deps)` 迁入新 `sidebar-render.js`,`<script>` 标签 + `EXPECTED_MODULES` 条目齐、顺序一致
- [ ] index.html 删 `renderSidebarModel`,2 处桥改注入式调用;`inlineSidebarAction`/`inlineSidebarCall` 原位保留(home 仍可用)
- [ ] `check_grammar_modules.py` 19 模块通过
- [ ] smoke +1 测试(3 断言)全绿
- [ ] `npm run check` 全绿后 commit

## 非目标(YAGNI)

- 不动 home 卡片渲染(5926/5948)、不提取共享 onclick util(留 home-render 批)
- 不碰 `renderPageSidebar`/`renderContextSidebar` 的 DOM 编排(只改 innerHTML 那一行)
- 不改任何 class/onclick 文本/CSS

## 行为不变保证

① 副作用全留 inline(DOM 取元素、`el.style.display`、`delegateToContext`/`hidden` 分支不变) ② `npm run check` 的 core-path smoke 真实渲染侧边栏 ③ render 单测断言模块输出含关键 class + 注入 onclick。
