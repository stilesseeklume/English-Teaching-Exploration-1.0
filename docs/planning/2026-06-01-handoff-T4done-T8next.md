# 工作交接 · 2026-06-01（睡前整理）

> 给明天的自己 / cursor。今天收工状态 + 明天怎么接。

---

## 一句话现状

地基重订进行到 **T4 完成**，下一个是 **T8**。剩余顺序：**T8 → T10 → T11**。

- 分支：`main`，工作区干净。
- **本地领先 origin/main 3 个提交（T4 的三个 commit，还没 push）** ← 明天可以先 push，也可以等 T8 一起。

---

## 今天做完了什么：T4（迁移 facets 可缩放筛选）

**目标**：讲一道题时，迁移区能"既筛 which、也筛关系代词、也筛整个定语从句"——三档缩放。

**三个 commit**（都在本地，已过 `npm run check` 全绿）：
1. `0b22349` 纯函数 `buildMigrationScopes` / `migrationMatchesScope`
2. `10c2bd2` `buildMigrationData` 按 facets 缩放（同大类底座 + 三档，默认最细）
3. `59c9299` 范围选择器渲染 + `setMigrationScope` 接线

**改了哪些文件**：
- `docs/grammar-fill/modules/migration-training.js`（核心逻辑 + 视图模型）
- `docs/grammar-fill/modules/teaching-render.js`（`migrationScopeSelectorHtml` 渲染）
- `docs/grammar-fill/index.html`（`_migrationScope` 状态 + `setMigrationScope` + 切题/切源/切来源复位）
- `tests/smoke.spec.js`（两条 T4 断言：纯函数 + 数据流）

**口径（已定，别再改）**：
- word 级 ← `facets.word || facets.form`（最细，如 which / doing）
- type 级 ← `facets.type || facets.subtype`（中，如 relative-pronoun）
- category 级 ← `item.category`（最粗，13 大类）
- 谓语题 facets 只有 tense/voice/agreement → 只有 1 档 → 选择器自动隐藏（`scopes < 2 不显示`），符合预期。

**没做的**：没在真浏览器肉眼看过选择器样式（只验证了数据层 + 视图模型层，smoke 全绿）。你信任了 smoke 直接进 T8。如果明天发现样式丑，调 `teaching-render.js` 的 `migrationScopeSelectorHtml`。

---

## 明天的任务：T8（决策地图按新体系重构导航）

**目标**：决策地图叶子的 `fineTag` 对齐新 51-tag 体系；父节点 `kd` 对齐讲解 section；smoke 里旧 tag 引用更新。

**文件**：`docs/data/decision_map.js`、`docs/data/grammar_knowledge.js`（按需）、`tests/smoke.spec.js`

### ⚠️ 关键：这不是纯机械替换，有逐节点判断

决策地图里 fineTag 绝大多数还是**旧 tag**。映射分两种：

**A. 直接换名（简单）**：
| 旧 | 新 |
|----|----|
| `pred-passive-form` / `pred-passive-implicit` | `pred-passive` |
| `word-derivation` / `word-derivation-noun` | `word-noun` / `word-adj` / `word-adv`（按词性，看节点语境）|
| `nonp-basic` / `nonp-attribute` / `nonp-adverbial-*` / `nonp-complement` / `nonp-object` / `nonp-subject-predicative` | `nonpred-to-do` / `nonpred-doing` / `nonpred-done`（**按形式，不按功能**）|
| `nonp-tense-voice*` / `nonp-perfect-passive-neg` | 按答案形式归 `nonpred-doing` / `nonpred-done` |
| `attrib-restrictive` / `attrib-restrictive-that` / `attrib-other` | `attrib-pronoun` / `attrib-adverb`（按关系词类型；restrictive 进 facets 不进 tag）|
| `attrib-prep-relative` | 已合法，保留 |
| `pred-tense` / `word-comparative` / `advc-time` | 已合法，保留 |

**B. 从"按功能"改成"按引导词"（需判断，最容易错）**：
- 名词性从句旧 tag：`nounc-subject` / `nounc-object` / `nounc-predicative`（按从句在句中作什么成分）
- 新体系按**引导词**：`nounc-that` / `nounc-whether-if` / `nounc-wh-pronoun` / `nounc-wh-adverb` / `nounc-ever`
- **不能直接对应**——要看那个决策地图节点讲的是哪个引导词的例子，重新归类。可能一个旧节点要拆成多个，或合并。

**`word-phrasal-1` / `word-phrasal-2`**：新体系没有"短语"tag，判断它实际考什么（多半是 `word-*` 派生或介词搭配），归过去或删节点。

### 新体系合法 tag 全集（对照白名单）

权威来源：`docs/data/grammar_fine_tags.js` 的 `tags` 数组（51 个）。13 大类：
predicate(pred-tense/passive/agreement)、nonpredicate(nonpred-to-do/doing/done)、word(word-noun/adj/adv/verb/adj-vs-adv/comparative)、number(num-plural/possessive/numeral)、article(art-a-an/the)、pronoun(pron-personal/indefinite/it)、preposition(prep-common/time/place/collocation/other)、logic(logic-coordinating)、attrib(attrib-pronoun/adverb/prep-relative/as)、nounclause(nounc-that/whether-if/wh-pronoun/wh-adverb/ever)、advclause(advc-time/cause/place/condition/manner/concession/comparison/purpose/result)、modal(modal-*)、special(special-*)。

### T8 操作步骤（来自计划文档）

1. decision_map 叶子 `fineTag` 全量对齐新 tag（按上面 A/B 规则，B 类逐节点判断引导词）。
2. 父节点 `kd` 对齐讲解 section（`grammar_knowledge.js`），按需微调。
3. smoke 里旧 tag 引用改新 tag（搜 `pred-passive-form` 等旧值）。
4. `npm run check` 全绿（含 smoke）。
5. commit：`feat(graph/knowledge): 决策地图+讲解对齐新tag体系`

**字段名是 `fine:`（不是 fineTag）**。决策地图叶子形如：
`{ id: 'l_tense_present', parent: 'pred_tense', title: '一般现在时', cat: 'predicate', fine: 'pred-tense-present' }`
- `cat` = 13 大类（已对齐，基本不用动）
- `fine` = 细 tag（**几乎全是旧 tag，需重映射**）

**怎么找旧 tag 引用**：
```bash
# 决策地图当前所有 fine 分布
grep -oE "fine: '[a-z0-9-]+'" docs/data/decision_map.js | sed -E "s/fine: '//; s/'//" | sort
# 对照新白名单（grammar_fine_tags.js 的 51 tag）；不在白名单 = 旧 tag 需改
```

**实测：决策地图约 58 个叶子，绝大多数是旧 tag**。典型旧→新映射（明天逐个判）：
- `pred-tense-present/past-future/continuous/perfect/past-perfect/other` → 全归 `pred-tense`（新体系时态不细分，时态轴进 facets）
- `pred-passive-form/implicit` → `pred-passive`
- `pred-sva-form/meaning/quantity/collective` → `pred-agreement`
- `nonp-basic/attribute/perfect-passive-neg` → `nonpred-to-do/doing/done`（按形式）
- `word-noun-derivation`→`word-noun`；`word-ed-ing`→`word-adj`；`word-cmp-*`→`word-comparative`；`word-adj-adv-*`→`word-adj-vs-adv`（`word-adj-adv-phrase` 判实际考点）
- `num-quantity/countable`→`num-plural` 或 `num-numeral`（判）
- `pron-personal-possessive`→`pron-personal`；`pron-indefinite-1/2`→`pron-indefinite`
- `prep-verb`→`prep-collocation`；`prep-location`→`prep-place`
- `art-zero`→**新体系删了零冠词**！这个叶子要删或并入 `art-the`/`art-a-an`（判）；`art-specific-indefinite`→判 a-an/the
- `attrib-restrictive-non/only-that/choice`→`attrib-pronoun`（restrictive 进 facets 不进 tag）
- `nounc-reported/connectors/wh-words/vs-appositive`→**按引导词**重归 `nounc-that/whether-if/wh-pronoun/wh-adverb/ever`（B 类，最难，看节点讲哪个引导词）
- `logic-conj-phrase/compound`→`logic-coordinating`
- `advc-reason-place`→拆 `advc-cause`+`advc-place`；`advc-purpose-result`→拆 `advc-purpose`+`advc-result`；`advc-condition-manner`→拆；`advc-concession-comparison`→拆（新体系状从拆成 9 个真类别，旧的是配对的，**要拆节点**）

**验证方式**：`npm run check`（= `bash scripts/check_all.sh`，跑 Edge Function 契约 + 静态发布检查 + 12 个 playwright smoke）。

---

## 后面还有（T8 之后）

- **T10**：导入解析吐 facets（`supabase/functions/deepseek-parse/*` + `docs/shared/word-import.js`）。独立任务，不碰决策地图。
- **T11**：A3 迁移取句残缺修复（`index.html` 的 `renderSentenceWithBlank`）+ 全量回归。
- 非本批：D 跳转交互 3 bug、E 导入慢、F 增强想法。

---

## ⚠️ 用 cursor 时注意（今天踩的坑）

1. **这个仓库的 git push 需要解除沙箱**（见全局记忆 deploy-push-workflow）。
2. **index.html 是 9727 行的巨型单文件**——cursor 编辑时给足上下文，别让它整文件重写。
3. **题库 3 处镜像必须一致**：`data/grammar_bank.json`、`docs/data/grammar_bank.js`（内含 `exams[].questions` + flat `questions[]` 两份）。改题库用 `scripts/apply_retag.py`，别手改。（T8 不碰题库，但万一动到记着这条。）
4. 改完一定 `npm run check`，绿了再说"做完"。

---

*T4 done. 明天从 T8 起步。晚安。*
