# 非谓语动词重标对照表

**日期**：2026-05-31  
**总题数**：35（全部 `fine_category` 以 `nonp-` 开头的去重题目）  
**进入 mapping.json**：34 题  
**待用户确认（ambiguous）**：1 题  

---

## 一、分类规则速查（§2.4）

| 判定结果 | 适用情形 | 新 fine_category |
|---------|---------|-----------------|
| 非谓语成分（状语/补语/定语/宾语，仍起动词作用） | 不定式/分词表动作/被动 | `nonpred-to-do` / `nonpred-doing` / `nonpred-done` |
| 动名词作主/宾/介宾（名词作用） | -ing 名词用法 | `word-noun`（subtype: gerund） |
| -ed/-ing 形容词化（表性质） | 作定语/表语但表稳定属性 | `word-adj`（subtype: participle-adj） |

**复合式归并**：`to be done` / `being done` → `nonpred-done`；`having done` → `nonpred-doing`；独立主格 with…doing/done → 按分词形式归。

---

## 二、全量对照表（34 题有把握）

| key | answer | nonp_function（原始字段） | 旧 fine_category | 新 fine_category | facets | 分类依据 |
|-----|--------|--------------------------|-----------------|-----------------|--------|---------|
| 2023全国一卷-57 | to bite | object | nonp-object | nonpred-to-do | form: to-do | decide to do sth. 固定搭配，不定式作宾语，仍起动词作用 |
| 2023全国一卷-61 | to be lifted | complement | nonp-perfect-passive-neg | nonpred-done | form: done | allow sb. to be done，宾语补足语；`to be done` 复合式归入 done |
| 2023全国一卷-65 | wanting | complement | nonp-complement | nonpred-doing | form: doing | leave sb. doing，宾语补足语，I 与 want 主动关系，仍起动词作用 |
| 2023浙江首考-58 | surrounded | adverbial（字段）/ attribute（解析） | nonp-attribute | nonpred-done | form: done | Forbidden City 与 surround 动宾关系，表被动动作，非性质形容词；注：数据字段 nonp_function 与解析文字不一致（见备注） |
| 2024全国一卷-58 | to give | adverbial | nonp-adverbial-1 | nonpred-to-do | form: to-do | 目的状语不定式，表动作目的 |
| 2024全国二卷-40 | inspired | adverbial（字段）/ attribute（解析） | nonp-attribute | nonpred-done | form: done | "inspired by 《牡丹亭》" 过去分词定语短语，表被动动作，非静态形容词 |
| 2024全国二卷-43 | to find | object（字段） | nonp-object | nonpred-to-do | form: to-do | be amazed to find，不定式表情感结果/原因，仍起动词作用（sub-function 存疑见备注，不影响大类） |
| 2024全国二卷-44 | Recalling | adverbial | nonp-adverbial-1 | nonpred-doing | form: doing | 主语 Edmondson 与 recall 主谓关系，现在分词作状语 |
| 2024广州一模-36 | dating | attribute | nonp-attribute | nonpred-doing | form: doing | homes dating from Ming-Qing，现在分词后置定语，表持续动作（动词作用）|
| 2024广州一模-41 | to save | adverbial | nonp-adverbial-1 | nonpred-to-do | form: to-do | 目的状语不定式 |
| 2024浙江首考-56 | to benefit | adverbial（解析）/ object（fine_category 旧标） | nonp-object | nonpred-to-do | form: to-do | 解析明确"目的状语"，不定式表动作目的；旧 fine_category 字段与 nonp_function 字段均偏差 |
| 2024浙江首考-63 | designed | attribute | nonp-attribute | nonpred-done | form: done | packs designed for…，过去分词后置定语，表被动动作 |
| 2024深圳一模-38 | using | adverbial | nonp-adverbial-1 | nonpred-doing | form: doing | players 与 use 主动关系，现在分词伴随状语 |
| 2024深圳一模-42 | drawn | adverbial | nonp-adverbial-1 | nonpred-done | form: done | audience 与 draw 动宾关系，过去分词状语，表被动 |
| 2024深圳二模-36 | created | attribute | nonp-attribute | nonpred-done | form: done | a museum created by…，过去分词后置定语，表被动动作 |
| 2024深圳二模-41 | exhibiting | object | nonp-object | word-noun | subtype: gerund | 作介词 beyond 的宾语，动名词名词用法；解析明确"动名词，作介词宾语" |
| 2025全国一卷-58 | to present | object | nonp-object | nonpred-to-do | form: to-do | hope to do sth. 固定搭配，不定式作宾语，动词作用 |
| 2025全国二卷-42 | to discover | attribute | nonp-attribute | nonpred-to-do | form: to-do | chance to do sth.，不定式后置定语修饰 chance，动词作用 |
| 2025全国二卷-45 | left | attribute | nonp-attribute | nonpred-done | form: done | a sheet/shirt left in sun all day，过去分词后置定语，表被动动作 |
| 2025广州一模-38 | themed | attribute | nonp-attribute | nonpred-done | form: done | competition themed…，过去分词后置定语，表被动动作 |
| 2025广州一模-45 | to reconnect | complement | nonp-complement | nonpred-to-do | form: to-do | inspire sb. to do sth.，不定式宾语补足语，动词作用 |
| 2025广州二模-61 | cooked | attribute | nonp-attribute | nonpred-done | form: done | the soup cooked with bone and spices，过去分词后置定语，表被动动作 |
| 2025广州二模-63 | to suit | adverbial | nonp-adverbial-1 | nonpred-to-do | form: to-do | 目的状语不定式 |
| 2025广州二模-65 | telling | with_absolute | nonp-absolute-with | nonpred-doing | form: doing | with each bowl telling a story，独立主格，each bowl 与 tell 主动关系，按分词形式归 doing |
| 2025浙江首考-60 | to rent | attribute（字段）/ 后置定语（解析） | nonp-object | nonpred-to-do | form: to-do | clothes for women to rent，不定式后置定语，动词作用 |
| 2025浙江首考-65 | returning | object | nonp-object | word-noun | subtype: gerund | mean doing（"意味着"），动名词名词用法，解析明确"动名词作宾语" |
| 2025深圳一模-37 | featuring | attribute | nonp-attribute | nonpred-doing | form: doing | badge featuring…，现在分词后置定语，badge 与 feature 主动关系，动词作用 |
| 2025深圳一模-45 | paired | attribute | nonp-attribute | nonpred-done | form: done | competition, paired with…，过去分词后置定语，表被动动作 |
| 2025深圳二模-37 | battling | adverbial | nonp-adverbial-1 | nonpred-doing | form: doing | 与 crossing 并列作伴随状语，现在分词，主动关系 |
| 2025深圳二模-40 | covered | adverbial | nonp-adverbial-1 | nonpred-done | form: done | Li Xuyao 与 cover 动宾关系，过去分词状语，表被动 |
| 2026广州一模-40 | valuing | subject_predicative | nonp-subject-predicative | word-noun | subtype: gerund | 解析明确"同位语，用动名词形式"；valuing 充当 core message 的同位语，起名词作用，命名核心思想 |
| 2026广州一模-44 | rooted | attribute | nonp-attribute | nonpred-done | form: done | art rooted in a culture's finest traditions，过去分词后置定语（be rooted in 省略 be），动词短语作用而非形容词性质 |
| 2026深圳一模-37 | translated | attribute | nonp-attribute | nonpred-done | form: done | Tang poems, translated with master touch，过去分词后置定语，表被动动作 |
| 2026深圳一模-44 | Reading | subject_predicative | nonp-subject-predicative | word-noun | subtype: gerund | 解析明确"作主语，用动名词形式"；Reading this book is like…，动名词作主语，名词用法 |

---

## 三、⚠️ 待用户确认（ambiguous）

### Q1：2023全国一卷-59 — `recognized`

**句子**：Shanghai may be the ___ home of the soup dumplings  
**answer**：recognized  
**nonp_function**：attribute（前置定语）  
**旧 fine_category**：nonp-attribute  

**两种可能判法**：

| 判法 | 新 fine_category | 理由 |
|-----|-----------------|------|
| A：分词定语（动词作用，表被动） | `nonpred-done` | "被认可的"源自 recognize sb./sth.，home 与 recognize 是动宾关系，表被动动作 |
| B：形容词化（表稳定性质） | `word-adj`（subtype: participle-adj） | "recognized home" = "公认的发源地"，recognized 已词汇化为固定形容词，解析本身也注明"也可以看作是形容词作定语" |

**倾向与理由**：倾向 **B（word-adj）**。  
理由：(1) 解析原文明确写"recognized '被公认的' 也可以看作是形容词作定语"，说明命题方已意识到其形容词化程度；(2) "recognized expert / recognized home" 是固化短语，不带短语扩展（如 *recognized by people*），说明 recognized 已脱离动词短语语境，成为独立形容词；(3) 对比 2026深圳一模-37 的 translated（带介宾扩展 "with master touch"）→ 仍是分词短语。但此题争议性高，建议用户最终确定。

---

## 四、数据字段一致性备注

以下题目的原始数据字段（`nonp_function`）与 explanation 文字描述存在不一致，仅影响子功能字段，不影响新 fine_category 判断，建议后续数据修正时一并处理：

| key | nonp_function 字段 | explanation 所述功能 | 说明 |
|-----|--------------------|---------------------|------|
| 2023浙江首考-58 | adverbial | 作后置定语 | 字段写 adverbial，解析写 attribute |
| 2024全国二卷-40 | adverbial | 作定语 | 字段写 adverbial，解析写 attribute（"作定语"）|
| 2024全国二卷-43 | object | 情感结果/原因状语 | "be amazed to find" 语法上通常归 adverbial（结果/原因），字段写 object |
| 2024浙江首考-56 | adverbial（解析） | object（旧 fine_category） | fine_category 写 nonp-object，但 nonp_function 和解析均指向目的状语 |
| 2025浙江首考-60 | attribute（字段）| 后置定语（解析一致） | 旧 fine_category 写 nonp-object 与实际矛盾 |

---

## 五、新 fine_category 分布汇总

| 新 fine_category | 题数 |
|-----------------|------|
| nonpred-to-do | 10 |
| nonpred-doing | 7 |
| nonpred-done | 13 |
| word-noun（gerund） | 4 |
| word-adj | 0（ambiguous 题暂未计入） |
| **合计（进入 mapping.json）** | **34** |
| ambiguous（待确认） | 1 |
| **总计** | **35** |
