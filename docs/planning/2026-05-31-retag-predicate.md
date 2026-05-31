# 谓语动词重标对照表（2026-05-31）

> 来源：`docs/data/grammar_bank.js`，处理所有 `fine_category` 以 `pred-` 开头的题。
> 输出：`docs/planning/retag-predicate-mapping.json`（26 条已确认 + 2 条待用户确认）。
> **纪律**：本文件仅供核查，不修改题库，不运行 apply_retag.py。

---

## 摘要

| 项目 | 数量 |
|------|------|
| 谓语动词题总数 | 28 |
| 已确认归类 | 26 |
| ⚠️ 待用户确认（ambiguous） | 2 |

**fine_category 分布**

| fine_category | 题数 |
|---------------|------|
| pred-passive | 12 |
| pred-agreement | 8 |
| pred-tense | 6 |

**voice 分布（26 已确认题）**

| voice | 题数 |
|-------|------|
| passive | 12 |
| active | 14 |

**tense 分布（26 已确认题）**

| tense | 题数 |
|-------|------|
| past | 13 |
| present | 10 |
| perfect | 1 |
| perfect-progressive | 1 |
| past-future | 1 |

---

## 对照表（已确认，26 题）

| key | 答案 | 解析摘要 | 主考点 | tense | voice | agreement | 依据 |
|-----|------|----------|--------|-------|-------|-----------|------|
| 2023全国二卷-65 | wished | 根据后文grew可知一般过去时，主动关系 | pred-tense | past | active | false | 时态由上下文时间线定（grew→past） |
| 2023浙江首考-59 | were permitted | Citizens与permit为被动关系，历史语境过去时 | pred-passive | past | passive | false | 解析主讲被动关系 + be done构成 |
| 2023浙江首考-60 | featured | 主动关系；历史语境（Ming Dynasty等）→过去时 | pred-tense | past | active | false | 时态由历史语境定，主动是辅助判断 |
| 2024全国一卷-60 | walks | 一般现在时；主语the Silk Route Garden为第三人称单数 | pred-agreement | present | active | true | 解析末句"主语表示第三人称单数"点明-s后缀是关键 |
| 2024全国二卷-38 | were | 主语Some of the things（复数），过去描述 | pred-agreement | past | active | true | were vs was 由主语复数决定 |
| 2024全国二卷-41 | was built | 主语pavilion与build被动关系，过去时 | pred-passive | past | passive | false | 解析主讲被动关系与be+done |
| 2024广州一模-37 | were designed | 定语从句主语homes与design被动关系，Ming/Qing→过去时 | pred-passive | past | passive | false | 解析主讲被动，复数was→were只是一致性延伸 |
| 2024广州一模-39 | has been advocating | Since decades ago常与现在完成（进行）时连用 | pred-tense | perfect-progressive | active | false | 时间状语since decades ago直接定时态 |
| 2024广州二模-39 | requires | 客观事实→现在时；主语动名词短语Visiting为单数 | pred-agreement | present | active | true | 解析末句"谓语应用单数"是关键考点 |
| 2024广州二模-44 | was released | In 2023→过去时；主语与release动宾（被动）关系 | pred-passive | past | passive | false | 解析主讲被动关系，时态由In 2023辅助 |
| 2024浙江首考-61 | be offered | they与offer被动关系，位于could后 | pred-passive | past-future | passive | false | 解析专注于被动构成（could be offered）；tense=past-future因modal could |
| 2024浙江首考-62 | have started | Over the last two years常与现在完成时连用 | pred-tense | perfect | active | false | 时间状语直接定现在完成时；agreement仅提供辅助（have非has） |
| 2024深圳一模-39 | requires | 客观事实→现在时；主语不定式to master为单数 | pred-agreement | present | active | true | 解析末句"第三人称单数"是核心 |
| 2024深圳一模-40 | is described | 毽子被形容（被动），客观事实现在时；Jianzi单数→is | pred-passive | present | passive | false | 解析主讲被动关系；is vs are由passive单数主语决定（非独立agreement考点） |
| 2024深圳二模-39 | houses | 客观事实→现在时；主语The museum为单数 | pred-agreement | present | active | true | 解析明确"主语为单数，谓语应用单数" |
| 2024深圳二模-43 | was recognized | in 2021→过去时；主语与recognize被动关系，单数→was | pred-passive | past | passive | false | 解析主讲被动，时态由in 2021定 |
| 2025全国一卷-60 | are revealed | 一般事实→现在时；personalities与reveal被动关系 | pred-passive | present | passive | false | 解析主讲语态（考查动词语态） |
| 2025全国一卷-61 | tries | always→一般现在时；a decent winner为单数 | pred-agreement | present | active | true | 解析明确"主语a decent winner为第三人称单数" |
| 2025全国二卷-41 | is | 一般事实→现在时；主语the "sunshine scent"为单数→is | pred-agreement | present | active | true | be动词单复数（is vs are）是典型agreement考点 |
| 2025广州一模-37 | were selected | 图片被选（被动），attracted→过去时，which先行词复数 | pred-passive | past | passive | false | 解析第一句"被选择"点明被动 |
| 2025深圳一模-38 | retired/had retired | 根据句中was→一般过去时（或过去的过去用past perfect） | pred-tense | past | active | false | 时态由上下文动词was定；双答选项本身说明tense是唯一考点 |
| 2025深圳一模-40 | was forced | 根据performed→过去时；Marin与force被动关系 | pred-passive | past | passive | false | 解析主讲被动关系 |
| 2025深圳二模-39 | were caught | 过去事件；they与catch被动关系 | pred-passive | past | passive | false | 解析主讲被动关系 |
| 2026广州一模-43 | goes | 先行词beauty（不可数名词）→定语从句谓语用单数，现在时 | pred-agreement | present | active | true | 解析明确"先行词不可数名词→第三人称单数形式" |
| 2026深圳一模-39 | is divided | 客观事实→现在时；book与divide被动关系，单数→is | pred-passive | present | passive | false | 解析主讲被动关系 |
| 2026深圳一模-41 | sensed | 根据I was→一般过去时 | pred-tense | past | active | false | 时态由上下文I was直接定 |

---

## ⚠️ 待用户确认（ambiguous，2 题）

### 2025广州二模-64

| 项目 | 内容 |
|------|------|
| 答案 | bridges |
| 旧 fine_category | pred-tense-present |
| 解析摘要 | 主语sharing food为单数概念，陈述客观事实，一般现在时，故填bridges |

**分歧**：解析同时涉及"时态（客观事实→现在时）"和"单数概念→bridges（非bridge，带-s后缀）"。

| 方案 | fine_category | tense | voice | agreement | 理由 |
|------|---------------|-------|-------|-----------|------|
| A（倾向） | pred-tense | present | active | false | 旧 category 为 pred-tense-present；"陈述客观事实→现在时"是解析主句；-s后缀是派生结果 |
| B | pred-agreement | present | active | true | 解析显式提到"单数概念"；bridges 的-s来源于主谓一致，与 requires/houses 等同类 |

**建议选 A**，理由：旧 category 标注者已判定为 tense；解析框架是"客观事实→现在时"，单数提示只是辅助说明语法形式，并非题目的核心陷阱。但如果希望与 2024广州二模-39（requires）保持一致（同样是动名词主语单数），则选 B。

---

### 2025浙江首考-62

| 项目 | 内容 |
|------|------|
| 答案 | is |
| 旧 fine_category | pred-tense-present |
| 解析摘要 | 主语The concept为单数，句子陈述一般事实，应用一般现在时is |

**分歧**："is"既体现"一般现在时"（tense），也体现"单数主语→is而非are"（agreement）。解析两点并举。

| 方案 | fine_category | tense | voice | agreement | 理由 |
|------|---------------|-------|-------|-----------|------|
| A（倾向） | pred-tense | present | active | false | 旧 category pred-tense-present；解析以"陈述一般事实"领起，is 在此更多标记现在时而非单复数选择 |
| B | pred-agreement | present | active | true | be 动词的 is/are 选择是最典型的 agreement 考点；The concept 单数→is 是不可绕过的判断步骤 |

**建议选 A**，理由：与 2025全国二卷-41（answer=is，pred-agreement）形成对比——后者解析完全以单数为核心，本题解析则以"陈述一般事实"为主线，单数是辅助确认。若用户认为 is/are 的任何出现都应归 agreement，则选 B（并将 2025浙江首考-62 与 2025全国二卷-41 对齐）。

---

*生成时间：2026-05-31*
