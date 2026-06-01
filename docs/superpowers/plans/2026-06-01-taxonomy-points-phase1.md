# 考点体系地基 · Phase 1（数据层）Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax.

**Goal:** 把考点体系落成"统一 `points` 标签清单"的数据地基——重订 tag、用纯函数从 `fine_category+facets+answer` 派生每题的 `points`（谓语多标签、引导词单标签）、修完整性。引擎/视图（Phase 2/3）之后都读 `points`。

**Architecture:** `points` 不写进题库，**加载时由 deriver 纯函数派生**（`buildQuestionPoints(q)`）。tag 体系在 `grammar_fine_tags.js` 重订。本期不动迁移引擎/视图，只产出 `q.points` 并验证其正确。

**Tech Stack:** 纯 JS（IIFE + `window.*` 模块，无构建）；Playwright smoke（浏览器内断言 `window.*`）；`bash scripts/check_all.sh`。

---

## 文件结构

- Modify `docs/data/grammar_fine_tags.js` — tag 重订（冠词 a/an/零拆分、代词 6 类、删 adj-vs-adv、attrib 加 only-that）、`frequency` 字段、计数注释订正、`textbook_units.maps_to` 重映射。
- Create `docs/grammar-fill/modules/question-points.js` — `buildQuestionPoints(q)` deriver（纯函数，本期核心）。
- Modify `docs/grammar-fill/index.html` — `<script>` 引入新模块；`buildAllQuestions` 后给每题挂 `q.points`。
- Modify `docs/grammar-fill/modules/question-model.js` — `buildAllQuestions` 调用 deriver。
- Modify `scripts/check_grammar_modules.py` — 新模块导出契约 + points 完整性校验。
- Test `tests/smoke.spec.js` — 断言新 tag、deriver 行为、真题 points。

---

## Task 1: 重订 tag 体系（grammar_fine_tags.js）

**Files:** Modify `docs/data/grammar_fine_tags.js`；Test `tests/smoke.spec.js`

- [ ] **Step 1: 写失败测试**（smoke 末尾新增）

```javascript
test('fine-tags 体系重订：冠词a/an/零、代词6类、删adj-vs-adv、attrib only-that', async ({ page }) => {
  await page.goto('/docs/grammar-fill/');
  await page.waitForFunction(() => !!window.GRAMMAR_FINE_TAGS, null, { timeout: 15000 });
  expect(await page.evaluate(() => {
    var t = window.GRAMMAR_FINE_TAGS.tags_by_id || {};
    var has = function(id){ return !!t[id]; };
    return (has('art-a') && has('art-an') && has('art-the') && has('art-zero')
      && t['art-zero'].frequency === '几乎不考'
      && !has('art-a-an')
      && has('pron-personal') && has('pron-possessive') && has('pron-reflexive')
      && has('pron-demonstrative') && has('pron-indefinite') && has('pron-it')
      && !has('word-adj-vs-adv')
      && has('attrib-only-that')) ? 'ok'
      : 'bad:' + JSON.stringify(Object.keys(t).filter(function(k){return k.indexOf('art-')===0||k.indexOf('pron-')===0;}));
  })).toBe('ok');
});
```

- [ ] **Step 2: 运行确认失败**

Run: `npx playwright test tests/smoke.spec.js --project=chromium -g "体系重订" 2>&1 | grep -iE "passed|failed|bad:"`
Expected: FAIL（现 tags 里有 art-a-an / word-adj-vs-adv，无 art-a/art-an/art-zero/pron-reflexive/attrib-only-that）。

- [ ] **Step 3: 改 grammar_fine_tags.js 的 tags 数组**

在 `tags: [` 数组内做以下编辑（保持现有其他 tag 不动）：

冠词：把 `{ id: 'art-a-an', ... }` 一行替换为三行；`art-the` 保留；新增 `art-zero`：
```javascript
      { id: 'art-a',    category: 'article', source: '体系重订2026-06-01', name: '不定冠词 a' },
      { id: 'art-an',   category: 'article', source: '体系重订2026-06-01', name: '不定冠词 an' },
      { id: 'art-the',  category: 'article', source: '体系重订2026-05-31', name: '定冠词 the' },
      { id: 'art-zero', category: 'article', source: '体系重订2026-06-01', name: '零冠词', frequency: '几乎不考' },
```

代词：把现有 `pron-personal` / `pron-indefinite` / `pron-it` 三行替换为六行：
```javascript
      { id: 'pron-personal',      category: 'pronoun', source: '体系重订2026-06-01', name: '人称代词（主格/宾格）' },
      { id: 'pron-possessive',    category: 'pronoun', source: '体系重订2026-06-01', name: '物主代词（形容性/名词性）' },
      { id: 'pron-reflexive',     category: 'pronoun', source: '体系重订2026-06-01', name: '反身代词' },
      { id: 'pron-demonstrative', category: 'pronoun', source: '体系重订2026-06-01', name: '指示代词' },
      { id: 'pron-indefinite',    category: 'pronoun', source: '体系重订2026-05-31', name: '不定代词' },
      { id: 'pron-it',            category: 'pronoun', source: '体系重订2026-05-31', name: '形式 it（形式主宾/强调）' },
```

词性：删除 `{ id: 'word-adj-vs-adv', ... }` 整行（其余 word-* 不动）。

定从：在 attrib 段新增一行（其余 attrib-* 不动）：
```javascript
      { id: 'attrib-only-that', category: 'attrib', source: '体系重订2026-06-01', name: '只能用 that（被逼用 that）' },
```

定从 `attrib-as`：在其 name 后加字段 `frequency` 仅标 but/than 罕见——本期 as 整体不标，留备注即可（不改）。

- [ ] **Step 4: 订正计数注释 + stats**

把文件头注释 `主考点 tag：51 个` 改为实际数（重订后重新数：原 53 − art-a-an(1) + art-a/an/zero(3) − word-adj-vs-adv(1) + attrib-only-that(1) − pron 原3 + pron 新6(净+3) = 58）。同步：
- 头注释 `主考点 tag：51 个` → `主考点 tag：58 个`
- `// logic 逻辑连词（2）` → `（1）`；`// advclause 状语从句（6）` → `（9）`
- `source: '...13 类 51 个主标'` → `58 个主标`
- 末尾 `stats` 若有 main 计数，改为 58。

- [ ] **Step 5: 运行确认通过**

Run: `npx playwright test tests/smoke.spec.js --project=chromium -g "体系重订" 2>&1 | grep -iE "passed|failed|bad:"`
Expected: `1 passed`。

- [ ] **Step 6: Commit**

```bash
git add docs/data/grammar_fine_tags.js tests/smoke.spec.js
git commit -m "feat(taxonomy): 重订tag体系(冠词a/an/零拆分·代词6类·删adj-vs-adv·attrib only-that·frequency字段·计数订正)"
```

---

## Task 2: 修复 textbook_units.maps_to 断裂

**Files:** Modify `docs/data/grammar_fine_tags.js`；Test `tests/smoke.spec.js`

**背景**：`textbook_units[*].maps_to` 全引用旧体系 id（pred-tense-continuous/attrib-choice…），现行 tag 里都不存在 → `tag_to_units` 反向索引一条不命中。本期把 maps_to 重映射到现行 tag id。

- [ ] **Step 1: 写失败测试**

```javascript
test('textbook_units 反向索引能命中现行 tag', async ({ page }) => {
  await page.goto('/docs/grammar-fill/');
  await page.waitForFunction(() => !!window.GRAMMAR_FINE_TAGS, null, { timeout: 15000 });
  expect(await page.evaluate(() => {
    var d = window.GRAMMAR_FINE_TAGS, t2u = d.tag_to_units || {}, byId = d.tags_by_id || {};
    var keys = Object.keys(t2u);
    if (!keys.length) return 'empty';
    // 所有 tag_to_units 的键都必须是现行 tag id
    var bad = keys.filter(function(k){ return !byId[k]; });
    return bad.length === 0 ? 'ok' : 'bad:' + bad.slice(0,5).join(',');
  })).toBe('ok');
});
```

- [ ] **Step 2: 运行确认失败**

Run: `npx playwright test tests/smoke.spec.js --project=chromium -g "textbook_units 反向" 2>&1 | grep -iE "passed|failed|bad:|empty"`
Expected: FAIL（`bad:` 列出旧 id，或反向索引为空）。

- [ ] **Step 3: 重映射 maps_to**

在 `grammar_fine_tags.js` 的 `textbook_units` 数组里，把每个单元的 `maps_to` 旧 id 改为现行 id。映射规则（旧→新）：
```
pred-tense-* → pred-tense；pred-passive-* → pred-passive；pred-sva-* / pred-agreement-* → pred-agreement
nonp-* → nonpred-to-do/doing/done（按形式）
attrib-choice/attrib-pronoun-* → attrib-pronoun；attrib-adverb-* → attrib-adverb；attrib-prep-* → attrib-prep-relative；attrib-only-that → attrib-only-that；attrib-as → attrib-as
aux:struct-* → 删除该 maps_to 项（structure 是教学辅助，不参与考点）
word-adj-adv-* → word-adj 或 word-adv（按内容）；word-noun-* → word-noun
art-* → art-a/art-an/art-the/art-zero（按内容）
special-tag-question → special-tag-question（已存在）
```
对照 `tags_by_id` 逐项改；无法对应的旧 id 删除该 maps_to 条目（宁缺勿错）。

- [ ] **Step 4: 运行确认通过**

Run: `npx playwright test tests/smoke.spec.js --project=chromium -g "textbook_units 反向" 2>&1 | grep -iE "passed|failed|bad:"`
Expected: `1 passed`。

- [ ] **Step 5: Commit**

```bash
git add docs/data/grammar_fine_tags.js tests/smoke.spec.js
git commit -m "fix(taxonomy): textbook_units.maps_to 重映射到现行tag(修复教材视图断裂)"
```

---

## Task 3: `buildQuestionPoints` deriver 模块

**Files:** Create `docs/grammar-fill/modules/question-points.js`；Modify `docs/grammar-fill/index.html`（引入 script）；Test `tests/smoke.spec.js`

- [ ] **Step 1: 写失败测试**

```javascript
test('buildQuestionPoints 按规则派生 points（谓语多标签/引导词单标签）', async ({ page }) => {
  await page.goto('/docs/grammar-fill/');
  await page.waitForFunction(() => !!window.GrammarQuestionPoints, null, { timeout: 15000 });
  expect(await page.evaluate(() => {
    var bp = window.GrammarQuestionPoints.buildQuestionPoints;
    var key = function(pts){ return pts.map(function(p){ return p.tag + (p.key?(':'+p.key):''); }).sort().join('|'); };
    var cases = [
      [{ category:'logic', fine_category:'logic-coordinating', answer:'or', facets:{word:'or'} }, 'logic-coordinating:选择'],
      [{ category:'logic', fine_category:'logic-coordinating', answer:'but', facets:{word:'but'} }, 'logic-coordinating:转折'],
      [{ category:'attrib', fine_category:'attrib-pronoun', answer:'which', facets:{word:'which'} }, 'attrib-pronoun:which'],
      [{ category:'article', fine_category:'art-a-an', answer:'an', facets:{word:'a-an'} }, 'art-an'],
      [{ category:'article', fine_category:'art-a-an', answer:'a', facets:{word:'a-an'} }, 'art-a'],
      [{ category:'predicate', fine_category:'pred-passive', answer:'was built', facets:{tense:'past', voice:'passive'} }, 'pred-passive|pred-tense:past'],
      [{ category:'predicate', fine_category:'pred-tense', answer:'goes', facets:{tense:'present', voice:'active', agreement:true} }, 'pred-agreement|pred-tense:present'],
      [{ category:'nonpredicate', fine_category:'nonpred-to-do', answer:'to bite', facets:{form:'to-do'} }, 'nonpred-to-do'],
      [{ category:'pronoun', fine_category:'pron-personal', answer:'mine', facets:{type:'possessive'} }, 'pron-possessive']
    ];
    for (var i=0;i<cases.length;i++){
      var got = key(bp(cases[i][0]));
      if (got !== cases[i][1]) return 'bad@'+i+':'+got+'≠'+cases[i][1];
    }
    return 'ok';
  })).toBe('ok');
});
```

- [ ] **Step 2: 运行确认失败**

Run: `npx playwright test tests/smoke.spec.js --project=chromium -g "buildQuestionPoints" 2>&1 | grep -iE "passed|failed|bad@|Error"`
Expected: FAIL（`window.GrammarQuestionPoints` 未定义）。

- [ ] **Step 3: 创建 `docs/grammar-fill/modules/question-points.js`**

```javascript
// grammar-fill/modules/question-points.js
//
// 由 fine_category + facets + answer 派生每题的 points 标签清单。
// 谓语 → 多标签（时态/语态/一致各一轴）；其余 → 单标签。纯函数，无 DOM。

/* eslint-disable */
(function(){
  // 并列连词 word → 逻辑关系组
  var LOGIC_RELATION = {
    and:'并列', both:'并列',
    but:'转折', yet:'转折',
    or:'选择', either:'选择',
    so:'因果', for:'因果',
    nor:'否定并列', neither:'否定并列'
  };

  function lower(v){ return String(v == null ? '' : v).trim().toLowerCase(); }

  function buildQuestionPoints(q){
    q = q || {};
    var cat = q.category || '';
    var fc = q.fine_category || '';
    var fa = q.facets || {};
    var word = fa.word || '';
    var ans = lower(q.answer);

    if (cat === 'logic') {
      var rel = LOGIC_RELATION[lower(word) || ans];
      if (!rel) rel = (fa.kind === 'correlative') ? '关联结构' : '并列';
      return [{ tag: 'logic-coordinating', key: rel }];
    }
    if (cat === 'attrib') {
      return [{ tag: fc || 'attrib-pronoun', key: String(word || ans) }];
    }
    if (cat === 'nounclause' || cat === 'preposition') {
      return [{ tag: fc, key: String(word || ans) }];
    }
    if (cat === 'article') {
      if (ans === 'a')  return [{ tag: 'art-a' }];
      if (ans === 'an') return [{ tag: 'art-an' }];
      if (ans === 'the') return [{ tag: 'art-the' }];
      return [{ tag: 'art-zero', frequency: '几乎不考' }];
    }
    if (cat === 'pronoun') {
      var ptype = lower(fa.type);
      if (ptype === 'possessive')   return [{ tag: 'pron-possessive' }];
      if (ptype === 'reflexive')    return [{ tag: 'pron-reflexive' }];
      if (ptype === 'demonstrative')return [{ tag: 'pron-demonstrative' }];
      if (ptype === 'indefinite')   return [{ tag: 'pron-indefinite', key: ans }];
      if (ptype === 'it' || fc === 'pron-it') return [{ tag: 'pron-it' }];
      return [{ tag: 'pron-personal' }];
    }
    if (cat === 'predicate') {
      var pts = [];
      if (fa.tense) pts.push({ tag: 'pred-tense', key: String(fa.tense) });
      if (lower(fa.voice) === 'passive') pts.push({ tag: 'pred-passive' });
      if (fa.agreement === true || fa.agreement === 'true') pts.push({ tag: 'pred-agreement' });
      if (!pts.length) pts.push({ tag: fc || 'pred-tense' });
      return pts;
    }
    // nonpredicate / word / number / advclause / modal / special：单标签=fine_category
    return [{ tag: fc }];
  }

  window.GrammarQuestionPoints = { buildQuestionPoints: buildQuestionPoints };
})();
```

- [ ] **Step 4: 在 index.html 引入新模块**

在 `index.html` 里 `question-model.js` 的 `<script src=...>` 之前，加一行：
```html
  <script src="modules/question-points.js"></script>
```
（与其他 `modules/*.js` 同目录同写法；放在 question-model 之前，保证加载顺序。）

- [ ] **Step 5: 运行确认通过**

Run: `npx playwright test tests/smoke.spec.js --project=chromium -g "buildQuestionPoints" 2>&1 | grep -iE "passed|failed|bad@"`
Expected: `1 passed`。

- [ ] **Step 6: Commit**

```bash
git add docs/grammar-fill/modules/question-points.js docs/grammar-fill/index.html tests/smoke.spec.js
git commit -m "feat(points): buildQuestionPoints deriver(谓语多标签/引导词单标签;由fine_category+facets+answer派生)"
```

---

## Task 4: 给每题挂 `q.points`

**Files:** Modify `docs/grammar-fill/modules/question-model.js`；Test `tests/smoke.spec.js`

- [ ] **Step 1: 写失败测试**

```javascript
test('真题加载后每题都带非空 points，且 tag 都是现行 tag', async ({ page }) => {
  await page.goto('/docs/grammar-fill/');
  await page.waitForFunction(() => Array.isArray(window.ALL_QUESTIONS) && window.ALL_QUESTIONS.length > 0, null, { timeout: 15000 });
  expect(await page.evaluate(() => {
    var qs = window.ALL_QUESTIONS, byId = (window.GRAMMAR_FINE_TAGS||{}).tags_by_id || {};
    var noPoints = 0, badTag = [];
    qs.forEach(function(q){
      if (!Array.isArray(q.points) || !q.points.length) { noPoints++; return; }
      q.points.forEach(function(p){ if (!byId[p.tag]) badTag.push(q.no + ':' + p.tag); });
    });
    return (noPoints === 0 && badTag.length === 0) ? 'ok'
      : 'bad:noPoints=' + noPoints + ' badTag=' + badTag.slice(0,8).join(',');
  })).toBe('ok');
});
```

- [ ] **Step 2: 运行确认失败**

Run: `npx playwright test tests/smoke.spec.js --project=chromium -g "每题都带非空 points" 2>&1 | grep -iE "passed|failed|bad:"`
Expected: FAIL（`q.points` 还不存在 → noPoints>0）。

- [ ] **Step 3: 在 buildAllQuestions 里挂 points**

`question-model.js` 的 `createExamQuestionFromRaw`（返回题对象处）末尾，给返回对象加 `points`。在 return 的对象里加一行字段：
```javascript
      points: (window.GrammarQuestionPoints
        ? window.GrammarQuestionPoints.buildQuestionPoints(raw)
        : [{ tag: raw.fine_category }]),
```
（`raw` 已含 category/fine_category/facets/answer。放在 facets 字段之后。）

- [ ] **Step 4: 运行确认通过**

Run: `npx playwright test tests/smoke.spec.js --project=chromium -g "每题都带非空 points" 2>&1 | grep -iE "passed|failed|bad:"`
Expected: `1 passed`。若 `badTag` 报某 tag（如 only-that 相关或漏映射），回 Task 3 deriver 或 Task 1 tag 补齐。

- [ ] **Step 5: 全量 smoke 回归**

Run: `npx playwright test tests/smoke.spec.js --project=chromium 2>&1 | grep -iE "passed|failed"`
Expected: 全绿（本期未动引擎/视图，原断言应仍通过）。

- [ ] **Step 6: Commit**

```bash
git add docs/grammar-fill/modules/question-model.js tests/smoke.spec.js
git commit -m "feat(points): 加载时给每题派生挂载 q.points(引擎/视图Phase2/3将消费)"
```

---

## Task 5: check_all 校验 points + 新模块契约

**Files:** Modify `scripts/check_grammar_modules.py`

- [ ] **Step 1: 加新模块导出契约**

在 `EXPECTED_MODULES` 列表加一项：
```python
    {
        "path": "question-points.js",
        "namespace": "GrammarQuestionPoints",
        "exports": ["buildQuestionPoints"],
    },
```

- [ ] **Step 2: 运行 check 确认通过**

Run: `npm run check 2>&1 | grep -iE "OK: all|FAIL|module contracts"`
Expected: `OK: all engineering checks passed`（含 question-points.js 契约校验）。若报模块数不符，同步该脚本里模块计数。

- [ ] **Step 3: Commit**

```bash
git add scripts/check_grammar_modules.py
git commit -m "chore(check): 纳入 question-points.js 模块契约校验"
```

---

## Self-Review 记录

- **Spec 覆盖**：tag 重订(T1)、完整性 计数+textbook(T1/T2)、points deriver(T3)、挂载(T4)、校验(T5)。Spec 六①数据层全覆盖。引擎(②)、视图(③)属 Phase 2/3，不在本计划。
- **类型一致**：`points` 元素 `{tag, key?, frequency?}` 全计划统一；deriver 返回数组、消费处按数组处理。
- **占位符**：无 TBD；deriver 代码完整；only-that 本期不自动派生（需先行词上下文），attrib 题暂归 attrib-pronoun+key，only-that 标注留 Phase 后续人工——已在 spec 注明，不阻塞。
- **风险**：谓语"pred-tense 总挂"可能过标（纯一致题也挂时态）——v1 可接受，Phase 后续按真题复核收敛。
