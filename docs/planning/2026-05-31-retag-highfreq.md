# 高频类重标对照表（词性/介词/冠词/连词）

> 生成日期：2026-05-31  
> 目标题库：`docs/data/grammar_bank.js`  
> 映射文件：`docs/planning/retag-highfreq-mapping.json`  

## 统计摘要

- 处理旧 fine_category：10 类（word-\*, prep-\*, art-\*, logic-\*）
- 扫描题目总数：91 道（已去重）
- 有把握映射：**88 道**
- ⚠️ 待确认（ambiguous）：**3 道**

### 旧 fine_category 分布

| 旧标签 | 题数 |
|--------|------|
| `art-a-an` | 2 |
| `art-the` | 12 |
| `logic-conj-phrase` | 12 |
| `prep-common` | 12 |
| `prep-verb` | 5 |
| `word-adj` | 1 |
| `word-adj-adv-choice` | 27 |
| `word-cmp-comparative` | 3 |
| `word-noun` | 4 |
| `word-noun-derivation` | 13 |

### 新 fine_category 分布（已映射 88 道）

| 新标签 | 题数 |
|--------|------|
| `art-a-an` | 8 |
| `art-the` | 6 |
| `logic-coordinating` | 8 |
| `logic-correlative` | 4 |
| `prep-collocation` | 14 |
| `word-adj` | 15 |
| `word-adv` | 13 |
| `word-comparative` | 3 |
| `word-noun` | 17 |

---

## 分类对照表

### `word-adj-adv-choice` → （见下表）

| key | 答案 | 新 fine_category | facets |
|-----|------|-----------------|--------|
| `2023全国一卷-56` | tasty | `word-adj` | `{"subtype": "derivation"}` |
| `2023全国一卷-64` | rarely | `word-adv` | `{"subtype": "derivation"}` |
| `2023全国二卷-57` | confident | `word-adj` | `{"subtype": "derivation"}` |
| `2023全国二卷-60` | visiting | `word-adj` | `{"subtype": "derivation"}` |
| `2023全国二卷-63` | Basically | `word-adv` | `{"subtype": "derivation"}` |
| `2023浙江首考-57` | originally | `word-adv` | `{"subtype": "derivation"}` |
| `2023浙江首考-61` | spacious | `word-adj` | `{"subtype": "derivation"}` |
| `2024全国一卷-57` | functional | `word-adj` | `{"subtype": "derivation"}` |
| `2024全国一卷-59` | closed | `word-adj` | `{"subtype": "derivation"}` |
| `2024广州一模-43` | comfortable | `word-adj` | `{"subtype": "derivation"}` |
| `2024广州二模-37` | existing | `word-adj` | `{"subtype": "derivation"}` |
| `2024广州二模-42` | Fortunately | `word-adv` | `{"subtype": "derivation"}` |
| `2024广州二模-45` | lost | `word-adj` | `{"subtype": "derivation"}` |
| `2024深圳一模-36` | gently | `word-adv` | `{"subtype": "derivation"}` |
| `2024深圳二模-38` | eventually | `word-adv` | `{"subtype": "derivation"}` |
| `2024深圳二模-42` | interactive | `word-adj` | `{"subtype": "derivation"}` |
| `2025全国一卷-63` | strategic | `word-adj` | `{"subtype": "derivation"}` |
| `2025全国一卷-65` | digitally | `word-adv` | `{"subtype": "derivation"}` |
| `2025全国二卷-37` | central | `word-adj` | `{"subtype": "derivation"}` |
| `2025广州一模-40` | noticeably | `word-adv` | `{"subtype": "derivation"}` |
| `2025广州二模-60` | impressively | `word-adv` | `{"subtype": "derivation"}` |
| `2025深圳一模-41` | visibly | `word-adv` | `{"subtype": "derivation"}` |
| `2025深圳一模-43` | emotional | `word-adj` | `{"subtype": "derivation"}` |
| `2025深圳二模-43` | firmly | `word-adv` | `{"subtype": "derivation"}` |
| `2026广州一模-38` | instantly | `word-adv` | `{"subtype": "derivation"}` |
| `2026广州一模-39` | expressive | `word-adj` | `{"subtype": "derivation"}` |
| `2026深圳一模-40` | genuinely | `word-adv` | `{"subtype": "derivation"}` |

### `word-noun-derivation` → （见下表）

| key | 答案 | 新 fine_category | facets |
|-----|------|-----------------|--------|
| `2023全国二卷-56` | arrival | `word-noun` | `{"subtype": "derivation"}` |
| `2024全国一卷-56` | engineering | `word-noun` | `{"subtype": "derivation"}` |
| `2024全国一卷-65` | richness | `word-noun` | `{"subtype": "derivation"}` |
| `2024全国二卷-42` | visibility | `word-noun` | `{"subtype": "derivation"}` |
| `2024浙江首考-60` | criticism | `word-noun` | `{"subtype": "derivation"}` |
| `2024深圳一模-41` | popularity | `word-noun` | `{"subtype": "derivation"}` |
| `2025全国一卷-59` | guidance | `word-noun` | `{"subtype": "derivation"}` |
| `2025全国二卷-43` | absence | `word-noun` | `{"subtype": "derivation"}` |
| `2025广州一模-41` | diversity | `word-noun` | `{"subtype": "derivation"}` |
| `2025浙江首考-61` | solution | `word-noun` | `{"subtype": "derivation"}` |
| `2025深圳一模-39` | recovery | `word-noun` | `{"subtype": "derivation"}` |
| `2025深圳二模-44` | relief | `word-noun` | `{"subtype": "derivation"}` |
| `2026深圳一模-38` | depth | `word-noun` | `{"subtype": "derivation"}` |

### `word-noun` → （见下表）

| key | 答案 | 新 fine_category | facets |
|-----|------|-----------------|--------|
| `2024深圳二模-41` | exhibiting | `word-noun` | `{"subtype": "derivation"}` |
| `2025浙江首考-65` | returning | `word-noun` | `{"subtype": "derivation"}` |
| `2026广州一模-40` | valuing | `word-noun` | `{"subtype": "derivation"}` |
| `2026深圳一模-44` | Reading | `word-noun` | `{"subtype": "derivation"}` |

### `word-adj` → （见下表）

| key | 答案 | 新 fine_category | facets |
|-----|------|-----------------|--------|
| `2023全国一卷-59` | recognized | `word-adj` | `{"subtype": "derivation"}` |

### `word-cmp-comparative` → （见下表）

| key | 答案 | 新 fine_category | facets |
|-----|------|-----------------|--------|
| `2023浙江首考-62` | simpler | `word-comparative` | `{"subtype": "comparative"}` |
| `2025广州一模-44` | broader | `word-comparative` | `{"subtype": "comparative"}` |
| `2025深圳二模-45` | tougher | `word-comparative` | `{"subtype": "comparative"}` |

### `prep-verb` → （见下表）

| key | 答案 | 新 fine_category | facets |
|-----|------|-----------------|--------|
| `2023全国一卷-60` | by | `prep-collocation` | `{"word": "by"}` |
| `2023全国二卷-58` | with | `prep-collocation` | `{"word": "with"}` |
| `2024广州二模-41` | for | `prep-collocation` | `{"word": "for"}` |
| `2024深圳二模-40` | to | `prep-collocation` | `{"word": "to"}` |
| `2025全国二卷-38` | for | `prep-collocation` | `{"word": "for"}` |

### `prep-common` → （见下表）

| key | 答案 | 新 fine_category | facets |
|-----|------|-----------------|--------|
| `2024全国一卷-63` | as | `prep-collocation` | `{"word": "as"}` |
| `2024全国二卷-39` | to | `prep-collocation` | `{"word": "to"}` |
| `2025广州一模-43` | for | `prep-collocation` | `{"word": "for"}` |
| `2025广州二模-59` | before | `prep-collocation` | `{"word": "before"}` |
| `2025浙江首考-58` | on | `prep-collocation` | `{"word": "on"}` |
| `2025深圳一模-42` | for | `prep-collocation` | `{"word": "for"}` |
| `2025深圳二模-38` | from | `prep-collocation` | `{"word": "from"}` |
| `2026广州一模-36` | from | `prep-collocation` | `{"word": "from"}` |
| `2026深圳一模-43` | into | `prep-collocation` | `{"word": "into"}` |

### `art-a-an` → （见下表）

| key | 答案 | 新 fine_category | facets |
|-----|------|-----------------|--------|
| `2023全国一卷-63` | a | `art-a-an` | `{"word": "a-an"}` |
| `2025浙江首考-56` | a | `art-a-an` | `{"word": "a-an"}` |

### `art-the` → （见下表）

| key | 答案 | 新 fine_category | facets |
|-----|------|-----------------|--------|
| `2023全国二卷-59` | the | `art-the` | `{"word": "the"}` |
| `2023浙江首考-65` | the | `art-the` | `{"word": "the"}` |
| `2024全国一卷-61` | the | `art-the` | `{"word": "the"}` |
| `2024广州一模-38` | the | `art-the` | `{"word": "the"}` |
| `2024浙江首考-64` | the | `art-the` | `{"word": "the"}` |
| `2024深圳一模-37` | a | `art-a-an` | `{"word": "a-an"}` |
| `2025全国一卷-57` | the | `art-the` | `{"word": "the"}` |
| `2025广州一模-36` | an | `art-a-an` | `{"word": "a-an"}` |
| `2025深圳一模-44` | a | `art-a-an` | `{"word": "a-an"}` |
| `2025深圳二模-36` | a | `art-a-an` | `{"word": "a-an"}` |
| `2026广州一模-45` | an | `art-a-an` | `{"word": "a-an"}` |
| `2026深圳一模-45` | a | `art-a-an` | `{"word": "a-an"}` |

### `logic-conj-phrase` → （见下表）

| key | 答案 | 新 fine_category | facets |
|-----|------|-----------------|--------|
| `2023全国一卷-58` | or | `logic-correlative` | `{"word": "or", "kind": "correlative"}` |
| `2023全国二卷-64` | and | `logic-coordinating` | `{"word": "and", "kind": "coordinating"}` |
| `2023浙江首考-56` | and | `logic-coordinating` | `{"word": "and", "kind": "coordinating"}` |
| `2024全国二卷-45` | and | `logic-coordinating` | `{"word": "and", "kind": "coordinating"}` |
| `2024广州二模-40` | so | `logic-coordinating` | `{"word": "so", "kind": "coordinating"}` |
| `2024浙江首考-57` | or | `logic-correlative` | `{"word": "or", "kind": "correlative"}` |
| `2024深圳一模-45` | and | `logic-coordinating` | `{"word": "and", "kind": "coordinating"}` |
| `2024深圳二模-45` | but | `logic-correlative` | `{"word": "but", "kind": "correlative"}` |
| `2025全国一卷-64` | and | `logic-coordinating` | `{"word": "and", "kind": "coordinating"}` |
| `2025全国二卷-39` | and | `logic-coordinating` | `{"word": "and", "kind": "coordinating"}` |
| `2025浙江首考-59` | and | `logic-coordinating` | `{"word": "and", "kind": "coordinating"}` |
| `2025深圳二模-42` | or | `logic-correlative` | `{"word": "or", "kind": "correlative"}` |

---

## ⚠️ 待用户确认（Ambiguous）

以下 **3 道**题无法确定分类，请人工决策后手动更新映射文件。

### `2023浙江首考-63` — 答案：`as`

**旧标签**：`prep-common`

**解析摘要**：考查介词。history as capital of China 表示“作为中国首都的历史”，应用介词 as。

**方案 A**：`prep-collocation` + facets `{"word": "as"}`
> as作为角色介词，近似固定用法N as N

**方案 B**：`prep-manner` + facets `{"word": "as", "sense": "manner"}`
> as表示角色/方式，可视为manner

**倾向**：prep-collocation（role介词 as 在高考语法填空中几乎是固定用法）

---

### `2024广州一模-40` — 答案：`for`

**旧标签**：`prep-common`

**解析摘要**：考查介词。句意：人们对中国传统建筑的兴趣日益浓厚，这导致了对带有天井的历史建筑进行修复，以供现代使用。短语for/in modern use表示“供……使用”。故填for/in。

**方案 A**：`prep-reason` + facets `{"word": "for", "sense": "reason"}`
> for表目的，归入reason

**方案 B**：`prep-collocation` + facets `{"word": "for"}`
> for modern use接近固定搭配

**倾向**：prep-collocation（for use 是惯用搭配，语义较虚）

---

### `2025全国一卷-62` — 答案：`by`

**旧标签**：`prep-common`

**解析摘要**：考查介词。句意同上。"by+具体数值"表示"以（某一差值）"，此处指"以一到两分的优势"，符合语境。故填by。

**方案 A**：`prep-manner` + facets `{"word": "by", "sense": "manner"}`
> by+数值表示差额，manner类

**方案 B**：`prep-collocation` + facets `{"word": "by"}`
> by+数值是固定的比较表达

**倾向**：prep-manner（by + margin 是语义选择，非固定动词搭配）

---

## 备注

- `art-the` 中有 6 道旧标签为 `art-the` 但实际答案为 `a`/`an` 的题，已自动修正为 `art-a-an`。
- 所有 `word-noun`（动名词作宾语/主语）均映射为 `word-noun + subtype:derivation`，视为动词派生为名词形式。
- `prep-verb` 全部映射为 `prep-collocation`，动词+介词搭配固定性强。
- `word-adj-adv-choice` 全部为派生题（无真正的 adj-vs-adv 选择题），已分拆为 `word-adj` 或 `word-adv`。
