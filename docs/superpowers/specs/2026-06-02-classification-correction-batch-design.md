# 迁移正确性批次 v2 · 标注自检纠错 + 错题精确迁移 + 名词叶子合并 + 介词按词迁移 设计

> 日期：2026-06-02　目标：明天课堂可用
> 来源：组长试用反馈连发 4 例（myself 标人称、to be lifted 标 done、名词标题≠小标、from 迁出 to）。

## 总根因

AI 解析给每题生成**多个冗余分类字段**：散文类（`grammar_point` / `explanation` / `nonp_form`）质量高，结构化枚举类（`fine_category` / `facets`）质量差且与散文矛盾。迁移/标签/points 读的是 canonical 的 `fine_category` + `facets`，于是错值如实显示。**修法不是抛弃 canonical 字段，而是用 AI 自己写对的散文字段去纠正它们。** 另有两处独立问题：错题项无 `.points`（keyless 通配乱配）、决策地图叶子命名/粒度问题。

**今晚批次 = A（字段纠错层）+ B（错题精确迁移）+ C（名词叶子合并）**，三件互相独立、分开实现+提交。**D（介词按词迁移）实现期发现与现有主题分类轴冲突，需先定结构，移出今晚批次**（见末节）。

---

## A. 字段纠错层（核心）

**模块**：新增纯函数 `docs/grammar-fill/modules/question-correction.js` → `window.GrammarQuestionCorrection.correctClassification(raw)`。输入题对象，返回**浅拷贝**（命中规则才改对应字段，否则返回等价拷贝）。无 DOM、无副作用、幂等。

**接入**：`question-model.js` 的 `buildAllQuestions`（:10 map 内）和 `createExamQuestionFromRaw`（:80）在读字段/`buildQuestionPoints` **之前**，先 `var c = correctClassification(q); ` 用 `c` 取代 `q` 作为后续所有字段来源（含 `buildQuestionPoints(c)`）。`question-correction.js` 脚本标签放在 `question-points.js`、`question-model.js` **之前**（index.html :426 前）。

**v1 规则**（只动高置信，currentValue 与目标不同才覆盖）：

- **R1 反身代词**：`category==='pronoun'` 且（`/(?:self|selves)$/i.test(answer)` 或 `/反身/.test(grammar_point + explanation)`）→ 置 `fine_category='pron-reflexive'`、`facets={...facets, type:'reflexive'}`。
- **R2 非谓语形式对齐 nonp_form**：`category==='nonpredicate'` 且有 `nonp_form` → 按权威 `nonp_form` 反推 canonical：
  - `to_do` / `to_be_done` → `fine_category='nonpred-to-do'`、`facets.form='to-do'`
  - `doing` → `fine_category='nonpred-doing'`、`facets.form='doing'`
  - `done` → `fine_category='nonpred-done'`、`facets.form='done'`
  - 与现值一致则不动。（合法 fine 标签仅 nonpred-to-do / nonpred-doing / nonpred-done，已核。）

**观察**：纠正条数累加，`buildAllQuestions` 结束后 `console.info('[correction] 纠正 N 题')`（仅信息，不抛错）。

**不做**：低置信「待核」标记（YAGNI）。

**测试**（smoke）：
- myself 题（pronoun, answer 'myself', fine_category 'pron-personal'）→ `correctClassification` 后 `fine_category==='pron-reflexive'`、`buildQuestionPoints` 得 `pron-reflexive`、`getFineTagInfo` 名='反身代词'。
- to_be_done 题（nonpredicate, nonp_form 'to_be_done', fine_category 'nonpred-done', facets.form 'done'）→ 纠后 `fine_category==='nonpred-to-do'`、`facets.form==='to-do'`。
- 已标对的题（pron-reflexive / nonpred-to-do）→ 不变；对同一题纠两次 == 纠一次（幂等）。

---

## B. 错题项补「纠正后的带 key points」（修 from→to）

**根因**：`errorBookQuestions` 直接进 `buildMigrationData`（index.html :3849），其元素无 `.points`，`questionPoints` 回退成 keyless `[{tag:fine_category}]`，被 `questionMatchesPoint` 的 keyless 通配匹配任意 key——介词 from 的题把 to 的错题迁出来。

**修法**：在 `getMigrationData`（index.html :3829 起）把 `errorQuestions` 改为派生纠正后的带 key points：
```js
errorQuestions: errorBookQuestions.map(function(it){
  var c = window.GrammarQuestionCorrection.correctClassification(it);
  return Object.assign({}, c, { points: window.GrammarQuestionPoints.buildQuestionPoints(c) });
}),
```
（bankQuestions=ALL_QUESTIONS 已在 A 里带纠正后 points，无需再处理。）

**测试**（smoke）：构造 currentQ=介词 answer 'from'（points 带 key 'from'），errorQuestions 含一个 answer 'to' 的介词错题（**无 .points**）。`source:'errors'`：未经映射时该 to 题会被 keyless 通配匹进（poolCount≥1）；经 B 的映射（带 key points）后，to 题 key='to'≠'from' → 不入池（poolCount==0 或不含该题）。断言映射后 from 的错题池**不含** to 题。

---

## C. 名词叶子合并（修 标题≠小标）

**根因**：`decision_map.js` 中 `num-plural` 被两个叶子共用——`l_noun_count`（title「可数 / 不可数」）+ `l_noun_plural`（title「名词复数形式」）。标题解析器挑了「可数/不可数」，与小标（fine 名「名词复数」）不符。

**修法**（数据）：在 `docs/data/decision_map.js` 删除 `l_noun_count` 节点（:56），把保留的 `l_noun_plural`（:57）title 改为 **「名词复数」**（与 fine 名完全一致）。这样 `num-plural` 只剩一个叶子、标题=小标。

**测试**（smoke）：`buildMigrationPointTitle(... [{tag:'num-plural'}])` 末段 == 「名词复数」；决策地图节点里不再有 `l_noun_count` / 标题含「可数 / 不可数」的 num-plural 叶子。（沿用既有「Phase2 卫生」式断言。）

---

## D. 介词按词迁移（问题2）—— 暂缓，需先定结构

**实现期发现的冲突**：`decision_map.js` 的「介词」节点（id `prep`）下已有 **5 个主题叶子**：`l_prep_common`(prep-common 常见)、`l_prep_time`(prep-time 时间)、`l_prep_loc`(prep-place 地点)、`l_prep_verb`(prep-collocation 动介搭配)、`l_prep_other`(prep-other 其他)。

"按 by/as/for/to 拆"是**按具体词**的轴，和现有"按主题/搭配"的轴**是两套不同的归类维度**。一道题只有一个 category 派生 point：
- 若把 point 改成单一 `prep-word`（按词），则 5 个主题叶子无题命中、知识地图计数全清零——**破坏现有结构**。
- 若给介词加**双 point**（`[{tag:fc 主题}, {tag:'prep-word', key:word}]`），主题地图保留、迁移又能按词，且正好复用本项目刚上线的多考点 chip（"按主题" / "按词" 切换）。但这是新的结构决策，有计数/地图显示的连带影响。

**结论**：D 不在今晚批次。它是结构选择题（破坏主题轴 vs 加双轴），赶在课前改有回归风险。**B 已修好你看到的介词问题**（错题 tab from 迁出 to）；bank 内介词迁移本就按 (主题,词) 区分。D 留作明天单独 spec，二选一：
- D1：保留主题轴，介词加 `prep-word` 第二 point，迁移抽屉用 chip 切「主题/按词」。
- D2：放弃主题轴，介词统一改按词（删 5 主题叶子，只留按词）。

---

## 实现顺序与隔离（本批次 = A + B + C）

A → B → C（B 依赖 A 的 correction 模块；C 改 decision_map.js）。每件单独提交、单独 smoke。全部完成后跑一次 `npm run check && npm run test:smoke` 全绿。D 见上，另排。

## 不在本批次

- AI 解析提示词改造（治增量，另排）。
- 「待核」低置信标记机制。
- 错题项在 loadErrorBook 层统一补 points（本批次只在迁移入口补，范围最小）。
