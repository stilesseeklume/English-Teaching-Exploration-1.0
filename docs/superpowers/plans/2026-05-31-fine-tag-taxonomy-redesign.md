# Fine Tag 体系重订 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把 fine tag 体系按"引导词/形式 + 动词作用"重订为 13 类 52 tag，重标全部题目，三套尺子（tag 定义 / 决策地图 / 讲解 / 教材视图）对齐，迁移统一为纯 fine_category。

**Architecture:** 纯前端 + 数据。先重写 tag 定义文件（`check_grammar_bank.py` 自动据此把白名单换成新 tag，并列出所有旧 tag 题=重标清单）；再分"确定性映射"+"逐题判定"两步重标题库（逐题判定的边界题需用户确认）；然后对齐决策地图/讲解/教材；最后迁移统一为纯 fine_category。设计依据：`docs/superpowers/specs/2026-05-31-fine-tag-taxonomy-redesign-design.md`（§I 体系、§II 映射、§2.4 归类准则、§III 对齐、§IV 迁移）。

**Tech Stack:** 原生 JS（IIFE 模块）、Python 校验脚本、Playwright smoke。

**全部做完一起上线**（用户指示）：本计划期间只在 `feature/teaching-render` 分支 commit，不 push；全部 Task 完成 + 回归绿后再合并 main 部署。

**验证**：`python3 scripts/check_grammar_bank.py`（结构+tag白名单）；`npm run check`（全套）；`npm run test:smoke`。

---

## 新 tag 全集（52 个，Task 1 写入）

```
predicate:    pred-tense, pred-passive, pred-agreement
nonpredicate: nonpred-to-do, nonpred-doing, nonpred-done
word:         word-noun, word-adj, word-adv, word-verb, word-adj-vs-adv, word-comparative
number:       num-plural, num-possessive, num-numeral
article:      art-a-an, art-the, art-zero
pronoun:      pron-personal, pron-indefinite, pron-it
preposition:  prep-time, prep-place, prep-manner, prep-reason, prep-collocation
logic:        logic-coordinating, logic-correlative
attrib:       attrib-pronoun, attrib-adverb, attrib-prep-relative, attrib-as
nounclause:   nounc-that, nounc-whether-if, nounc-wh-pronoun, nounc-wh-adverb, nounc-ever
advclause:    advc-time, advc-cause, advc-condition, advc-concession, advc-purpose-result, advc-manner-place
modal:        modal-speculation, modal-ability-permission, modal-advice-obligation, modal-other
special:      special-subjunctive, special-emphasis, special-inversion, special-tag-question, special-ellipsis
```

## 文件结构

| 文件 | 改动 |
|------|------|
| `docs/data/grammar_fine_tags.js` | 重写 `tags` 为 52 新 tag；`categories` 13 类不变；`textbook_units[].maps_to` 重映射到新 tag |
| `docs/data/grammar_bank.js` | 190 题 `fine_category` 重标为新 tag（确定性映射 + 逐题判定） |
| `docs/data/decision_map.js` | 叶子 `fine` 指向新 tag；名从按引导词、非谓语按形式；父节点 `kd` 对齐 |
| `docs/data/grammar_knowledge.js` | 讲解 section key 与新 tag 口径对齐（按需） |
| `docs/grammar-fill/modules/migration-training.js` | 迁移池统一为纯 `fineBankPool`，删 fallback/nonpAxis 分支 |
| `docs/grammar-fill/index.html` | A3 迁移取句修复（定位后） |
| `scripts/check_grammar_bank.py` | 验证（自动读新白名单；如需放宽 category 校验则改） |
| `tests/smoke.spec.js` | 迁移统一断言 |

---

## Task 1: 重写 tag 定义文件为新 52 体系

**Files:**
- Modify: `docs/data/grammar_fine_tags.js`（`tags` 数组、`textbook_units[].maps_to`）

- [ ] **Step 1: 备份当前旧 tag→题数映射（供 Task 2 核对）**

Run（记录旧 tag 分布，存档）：
```bash
cd /Users/zhenliu/Desktop/英语教学系统1.0/docs && grep -o 'fine_category"\?:\s*"[^"]*"' data/grammar_bank.js | sed 's/.*"\([^"]*\)"$/\1/' | sort | uniq -c | sort -rn > /tmp/old_tag_counts.txt && cat /tmp/old_tag_counts.txt
```
Expected: 28 行（旧 tag + 题数），与设计文档 §II 一致。

- [ ] **Step 2: 重写 `tags` 数组为 52 新 tag**

把 `grammar_fine_tags.js` 的 `tags: [ ... ]` 整段替换为新 52 tag（保留 `{ id, category, source, name }` 结构；source 用对应语法通霸章节或 '体系重订2026-05-31'）。按上面"新 tag 全集"逐类写出，name 用设计文档 §I 的中文名。示例（predicate/nonpredicate 段）：
```js
    tags: [
      // predicate 谓语动词
      { id: 'pred-tense',     category: 'predicate', source: '语法通霸 11', name: '时态（现/过/将/进行/完成）' },
      { id: 'pred-passive',   category: 'predicate', source: '语法通霸 12', name: '被动语态' },
      { id: 'pred-agreement', category: 'predicate', source: '语法通霸 15', name: '主谓一致' },
      // nonpredicate 非谓语
      { id: 'nonpred-to-do',  category: 'nonpredicate', source: '语法通霸 04', name: '不定式 to do' },
      { id: 'nonpred-doing',  category: 'nonpredicate', source: '语法通霸 04', name: '现在分词 doing' },
      { id: 'nonpred-done',   category: 'nonpredicate', source: '语法通霸 04', name: '过去分词 done' },
      // ... 其余 11 类按"新 tag 全集"全部写出
    ],
```
（必须把 52 个全部写出，不能省略。category 用现有 13 个 category id。）

- [ ] **Step 3: 重映射 `textbook_units[].maps_to` 到新 tag**

逐条把每个 unit 的 `maps_to: [...]` 里的旧 tag 换成对应新 tag（用 Task 2 的映射表，§2.1）。例：`['pred-passive-form','pred-passive-implicit']` → `['pred-passive']`；`['nonp-attribute','nonp-subject-predicative']` → 该单元主题决定（过去分词复习→`['nonpred-done']`）。逐 unit 改，去重。

- [ ] **Step 4: 更新 `aux_tags` / stats 注释（如有旧 tag 引用）**

`aux_tags`（结构辅助，不参与考点）保留或清理；`stats.main_tags` 注释更新为 52。`aux_tags` 若引用旧考点 tag 则移除。

- [ ] **Step 5: 验证 tags 文件可解析 + 校验脚本能读新白名单**

Run:
```bash
cd /Users/zhenliu/Desktop/英语教学系统1.0 && node -e "global.window={};require('./docs/data/grammar_fine_tags.js');console.log('tags:',window.GRAMMAR_FINE_TAGS.tags.length)" && python3 scripts/check_grammar_bank.py 2>&1 | grep -i "unknown fine_category" | head
```
Expected: `tags: 52`；且 check 报 "unknown fine_category values: [...]"（列出所有旧 tag——这正是 Task 2/3 的重标清单，此刻预期失败）。

- [ ] **Step 6: Commit**
```bash
git add docs/data/grammar_fine_tags.js && git commit -m "feat(taxonomy): 重写fine tag为13类52体系(引导词/形式) + 教材单元映射"
```

---

## Task 2: 生成重标对照表（确定性映射 + 逐题判定）

**Files:**
- Create: `docs/planning/2026-05-31-retag-mapping.md`（对照表 + 待确认项）

> 本 Task 只产出对照表，不改题库（Task 3 才写库）。

- [ ] **Step 1: 写确定性映射表（§2.1，18 个有题旧 tag）**

在对照表文档写下确定性 old→new（这些一对一、无需读题）：
```
pred-tense-present / pred-tense-past-future / pred-tense-perfect  → pred-tense
pred-passive-form                                                 → pred-passive
pred-sva-form                                                     → pred-agreement
word-adj-adv-choice                                               → word-adj-vs-adv
word-noun-derivation                                              → word-noun        （除动名词外，见 Step 2）
word-cmp-comparative                                              → word-comparative
num-plural                                                        → num-plural
num-possessive                                                    → num-possessive
art-a-an / art-the                                                → art-a-an / art-the
pron-personal-possessive                                          → pron-personal
pron-it                                                           → pron-it
prep-verb                                                        → prep-collocation
logic-conj-phrase                                                → logic-coordinating
attrib-choice                                                    → attrib-pronoun
attrib-adverb                                                    → attrib-adverb
```

- [ ] **Step 2: 逐题判定边界题（§2.2 + §2.4），AI 读"句子+答案+解析"**

对以下旧 tag 的每道题，AI 读题判定新 tag，写进对照表（列：exam/题号/句子片段/答案/旧tag/新tag/依据）：
- **nonp-\*（7 个，~70 题）**：按 §2.4——分词/不定式作非谓语成分→`nonpred-to-do/doing/done`（按答案形式）；**动名词作主/宾（名词作用）→`word-noun`**；**-ed/-ing 表性质作定语/表语（形容词作用）→`word-adj`**。
- **prep-common（24 题）**：按介词语义→`prep-time/place/manner/reason/collocation`。
- **attrib-restrictive-non（8 题）**：按所填关系词→`attrib-pronoun`（who/which/that/whose）或 `attrib-adverb`（when/where/why）。
- **nounc-wh-words（12 题）**：按引导词→`nounc-wh-pronoun`（what/who/which）或 `nounc-wh-adverb`（when/where/how/why）。

- [ ] **Step 3: 标记 ambiguous 项**

凡判定依赖语境、拿不准的（典型：-ed 是"公认的"形容词还是"被认出"分词；动名词 vs 现在分词），在对照表单列「⚠️ 待用户确认」区，写清两种可能 + 倾向。

- [ ] **Step 4: 交用户确认 ambiguous 区**

把「待确认」清单交用户逐条裁定，回填对照表。**这是硬门：未确认不进 Task 3。**

- [ ] **Step 5: Commit 对照表**
```bash
git add docs/planning/2026-05-31-retag-mapping.md && git commit -m "docs: fine tag 重标对照表(确定性映射+逐题判定+用户裁定)"
```

---

## Task 3: 应用重标到题库 + 校验通过

**Files:**
- Modify: `docs/data/grammar_bank.js`

- [ ] **Step 1: 按对照表逐题改 `fine_category`**

依 Task 2 对照表，把每题 `fine_category` 改为新 tag。非谓语题若带 `nonp_function/nonp_form/nonp_rule` 等旧辅助字段：保留 `nonp_form`（迁移筛选键用），其余按需保留。**确定性映射部分可用脚本批量替换**（注意 word-noun-derivation 全部→word-noun，但动名词题在 Step 2 已单独判走 nonpred-doing/word-noun，无冲突——动名词不在 word-noun-derivation 里）。

- [ ] **Step 2: 跑校验，必须无 unknown tag**

Run:
```bash
cd /Users/zhenliu/Desktop/英语教学系统1.0 && python3 scripts/check_grammar_bank.py 2>&1 | tail -5
```
Expected: 通过（无 "unknown fine_category"、无 "missing fine_category"）。若报 unknown，列出的就是漏改的题，回 Step 1 补。

- [ ] **Step 3: 抽样核对新分布**

Run:
```bash
cd /Users/zhenliu/Desktop/英语教学系统1.0/docs && grep -o 'fine_category"\?:\s*"[^"]*"' data/grammar_bank.js | sed 's/.*"\([^"]*\)"$/\1/' | sort | uniq -c | sort -rn
```
Expected: 所有 tag ∈ 52 新集；非谓语题分布到 nonpred-to-do/doing/done + 部分进 word-noun/word-adj；名从分到 wh-pronoun/wh-adverb。人工扫一眼无异常。

- [ ] **Step 4: Commit**
```bash
git add docs/data/grammar_bank.js && git commit -m "feat(bank): 190题fine_category重标到新52体系(确定性+逐题判定)"
```

---

## Task 4: 决策地图对齐新 tag

**Files:**
- Modify: `docs/data/decision_map.js`

- [ ] **Step 1: 非谓语叶子改为按形式 → 新 tag**

`l_nonp_todo/doing/done` 的 `fine` 改为 `nonpred-to-do`/`nonpred-doing`/`nonpred-done`（节点标签 to do/doing/done 与 tag 一致）。

- [ ] **Step 2: 名词性从句叶子改为按引导词**

把 `l_nounc_subject/object/predicative/appositive`（按成分）改为按引导词的叶子：`that 引导`→`nounc-that`、`whether/if`→`nounc-whether-if`、`连接代词`→`nounc-wh-pronoun`、`连接副词`→`nounc-wh-adverb`、`wh-ever`→`nounc-ever`。节点 title 同步改为引导词措辞。

- [ ] **Step 3: 其余类别叶子 `fine` 批量对齐新 tag**

谓语（tense/passive/agreement）、词性、介词（time/place/manner/reason/collocation）、定从（pronoun/adverb/prep-relative/as）、状从、情态、特殊句式——逐叶子把 `fine` 改成对应新 tag。父节点 `kd`（讲解 section）对齐 Task 5 的 section key。

- [ ] **Step 4: 验证图谱仍渲染 + 叶子迁移按新 tag**

Run:
```bash
npx playwright test tests/smoke.spec.js --project=chromium -g "grammar-fill core path" 2>&1 | tail -3
```
Expected: PASS（图谱渲染、Task 2 的 startByFineTag 断言仍过——注意该断言用的旧 tag `pred-passive-form` 已不存在，需在本 Task 同步把该断言改用新 tag `pred-passive`）。

- [ ] **Step 5: 同步修测试中的旧 tag 引用**

`tests/smoke.spec.js` 中所有硬编码旧 tag（`pred-passive-form` 等）改为新 tag（`pred-passive`）。Run 上述命令至 PASS。

- [ ] **Step 6: Commit**
```bash
git add docs/data/decision_map.js tests/smoke.spec.js && git commit -m "feat(graph): 决策地图叶子对齐新tag(名从按引导词/非谓语按形式)"
```

---

## Task 5: 讲解(KNOWLEDGE_DATA)与 kd 锚点对齐

**Files:**
- Modify: `docs/data/grammar_knowledge.js`（section key 按需）
- Modify: `docs/data/decision_map.js`（父节点 `kd`，若 Task 4 未全改）

- [ ] **Step 1: 核对讲解 section key 与新 tag 口径**

`grep -n "': {" docs/data/grammar_knowledge.js` 列出各 section key。名从讲解已按引导词（`nounclause-connective/what/appositive`）——保持；谓语 `predicate-tense/voice/agreement` 对应新 `pred-tense/passive/agreement`。把 decision_map 父节点 `kd` 指到这些 section key。

- [ ] **Step 2: 验证"看讲解"跳转仍精准**

Run:
```bash
npx playwright test tests/smoke.spec.js --project=chromium -g "grammar-fill core path" 2>&1 | tail -3
```
Expected: PASS（需求3 的 openKnowledgePoint section 展开断言仍过；如 section key 改名需同步该断言）。

- [ ] **Step 3: Commit**
```bash
git add docs/data/grammar_knowledge.js docs/data/decision_map.js tests/smoke.spec.js && git commit -m "feat(knowledge): 讲解section与决策地图kd锚点对齐新tag"
```

---

## Task 6: 迁移统一为纯 fine_category

**Files:**
- Modify: `docs/grammar-fill/modules/migration-training.js`（`buildMigrationData` / `buildDisplayPools`）
- Test: `tests/smoke.spec.js`

- [ ] **Step 1: 写失败测试（非 nonp 池只含同 fine_category）**

在 "grammar-fill core path" test 追加：
```js
  // 迁移统一：某 fine tag 的迁移池只含同 fine_category（无粗类别兜底）
  expect(await page.evaluate(() => {
    var mt = window.GrammarMigrationTraining;
    var ALLQ = window.GrammarQuestionModel.buildAllQuestions(window.GRAMMAR_BANK, window.CATEGORY_MAP || {});
    var q = ALLQ.find(function(x){ return x.fine_category === 'pred-passive'; });
    if (!q) return 'no-sample';
    var data = mt.buildMigrationData(q, {
      source: 'bank', bankQuestions: ALLQ, errorQuestions: [], categoryMap: window.CATEGORY_MAP || {},
      safeQuestionFocus: window.safeQuestionFocus, safeQuestionFocusKey: window.safeQuestionFocusKey,
      safeQuestionTrap: window.safeQuestionTrap, safeQuestionTrapId: window.safeQuestionTrapId,
      getFineTagInfo: window.getFineTagInfo, getNonpAxis: window.getNonpAxis,
      getQuestionPracticalGuide: window.getQuestionPracticalGuide, limit: 99
    });
    return data.migration.every(function(e){ return e.item.fine_category === 'pred-passive'; }) ? 'ok' : 'mixed';
  })).toBe('ok');
```

- [ ] **Step 2: 运行确认失败**（当前 mixed，因粗类别兜底）

Run: `npx playwright test tests/smoke.spec.js --project=chromium -g "grammar-fill core path"`
Expected: FAIL（mixed）。

- [ ] **Step 3: 改 `buildDisplayPools` 为纯 fineBankPool**

`modules/migration-training.js` 的 `buildDisplayPools`：非 nonpAxis 分支只用 `fineBankPool`/`fineErrorPool`：
```js
  function buildDisplayPools(options) {
    options = options || {};
    var nonpAxis = !!options.nonpAxis;
    var bankDisplayPool = dedupe(options.fineBankPool || []);
    var errorDisplayPool = dedupe(options.fineErrorPool || []);
    return {
      bankDisplayPool: bankDisplayPool,
      errorDisplayPool: errorDisplayPool,
      allDisplayPool: dedupe(bankDisplayPool.concat(errorDisplayPool))
    };
  }
```
（新体系下非谓语形式已是 fine tag，故 nonpAxis 特殊分支不再需要——统一走 fineBankPool。`focusFirst` 入参一并废弃。）

- [ ] **Step 4: 清理 `buildMigrationData` 中废弃池的计算与空态 fallback**

`buildMigrationData` 里删除 `teachingBankPool/teachingErrorPool/nonp*Pool/trapBankPool/trapErrorPool/bankPool/errorPool/fallbackBankPool/fallbackErrorPool` 的计算（只保留 `fineBankPool/fineErrorPool`）。`emptyState` 改为不带 fallbackCount；空态文案在 `buildMigrationEmptyHintModel` 改为"暂无同考点迁移题"，去掉"可切回粗分类"那句。保留 `headerLabel` 用 fineInfo。

- [ ] **Step 5: 运行确认通过 + 无回归**

Run: `npx playwright test tests/smoke.spec.js --project=chromium -g "grammar-fill core path"`
Expected: PASS。

- [ ] **Step 6: Commit**
```bash
git add docs/grammar-fill/modules/migration-training.js tests/smoke.spec.js && git commit -m "feat(migration): 迁移统一为纯fine_category, 删粗类别兜底与nonpAxis分支"
```

---

## Task 7: A3 迁移取句残缺修复

**Files:**
- Modify: `docs/grammar-fill/index.html`（`getMigrationData` 取句 / `renderSentenceWithBlank`）或 `modules/*` 取句逻辑

- [ ] **Step 1: 定位根因**

复现"深圳卷迁移句变 bridges/残缺"。`grep -n "renderSentenceWithBlank\|registerTeachingMigrationItem" docs/grammar-fill/index.html`，读 `getMigrationData` 里 `entry.sentenceHtml = renderSentenceWithBlank(entry.item, false)`，确认取的是该 item 的哪个句子/空格。判断是"取错空格"还是"句子切分截断"。用 systematic-debugging：先写一个能复现的最小断言（找到那道题的 item，断言其 sentenceHtml 含完整句子而非单词）。

- [ ] **Step 2: 写复现测试**

在 smoke 加断言：对一道已知迁移项，`renderSentenceWithBlank(item,false)` 输出长度/结构合理（含 >3 个词、含空格占位），不是孤立单词。（具体题用 Step 1 定位到的。）

- [ ] **Step 3: 修取句逻辑**

按 Step 1 根因修：若是取错空格 index → 修正传入的 blank index；若是句子字段截断 → 修切分。给出最小改动。

- [ ] **Step 4: 运行确认通过**

Run: `npx playwright test tests/smoke.spec.js --project=chromium -g "grammar-fill core path"`
Expected: PASS。

- [ ] **Step 5: Commit**
```bash
git add docs/grammar-fill/index.html tests/smoke.spec.js && git commit -m "fix(migration): 修复迁移卡片取句残缺"
```

---

## Task 8: 全量回归 + 工程校验

**Files:** 无（运行检查）

- [ ] **Step 1: 全套工程检查**

Run: `npm run check`
Expected: `OK: all engineering checks passed`。

- [ ] **Step 2: 完整 smoke**

Run: `npm run test:smoke`
Expected: 全绿。

- [ ] **Step 3: 失败则按 systematic-debugging 修到全绿。**

---

## 自检（Self-Review）记录

- **Spec 覆盖**：§I 体系→Task1；§II 映射→Task2/3；§2.4 准则→Task2 Step2 判定依据；§3.1 tags→Task1；§3.2 decision_map→Task4；§3.3 讲解→Task5；§3.4 教材 maps_to→Task1 Step3；§IV 迁移统一→Task6；§四之二 筛选→已在 f016965 实现（保留，不回退）；§V 取句→Task7；§VI 测试→Task6/8。全覆盖。
- **占位符**：重标逐题判定无法预先列出 190 题代码，故 Task2 用"AI 读题判定 + 对照表 + 用户确认门"的可执行流程替代——这是数据任务的正确形态，非占位符。
- **类型一致**：新 tag id 全程一致（如 `pred-passive` 不写成 `pred-passive-form`）；测试中旧 tag 引用在 Task4 Step5 统一改新。
- **风险**：Task2/3 重标是主要人工/AI 工作量（~114 题逐题 + 用户确认 ambiguous）；Task6 删池子要确认下游（headerLabel/emptyState/countAnalysisMigrationCandidates）不引用已删变量——Step4 须一并清理。
