# Fine Tag 体系重订（按引导词/形式）· 设计文档

> 日期：2026-05-31
> 起因：用户反馈"迁移给的题不对、基础没打好"。根因定位：fine tag 体系、决策地图、讲解三套**口径不统一**——tag 按"功能/成分"定义，决策地图节点→tag 映射错位，导致迁移混乱。
> 决策：**全面重订**——用唯一口径"引导词/形式"重建 fine tag 体系，三套尺子对齐，迁移统一到纯 fine_category。

## 核心原则（一把尺子）

**一个 fine tag = 语法填空空格里要填/判断的那个"引导词或形式"**（学生填空面对的选择点），不是从句的句法角色/成分。fine tag、决策地图节点、讲解(KNOWLEDGE_DATA)、教材视图，全部用这同一把尺子。

## 一、定稿 fine tag 体系（13 类，约 50 tag）

> 以下为最终落地版本（用户审定）。tag id 即代码内 `fine_category` 值。

### 1. 谓语动词 predicate
- `pred-tense` 时态（现/过/将/过去将来/进行/完成）
- `pred-passive` 被动语态
- `pred-agreement` 主谓一致

### 2. 非谓语 nonpredicate
- `nonpred-to-do` 不定式（含 not to do）
- `nonpred-doing` 动名词/现在分词（含 not doing）
- `nonpred-done` 过去分词
- （复合式 having done/being done、特殊结构独立主格/be said to do 归为备注，按主形式并入上述三类，不设一级 tag）

### 3. 词性转换 word
- `word-noun` 派生名词
- `word-adj` 派生形容词（含 -ed/-ing）
- `word-adv` 派生副词
- `word-verb` 派生动词
- `word-adj-vs-adv` 形/副词选用
- `word-comparative` 比较级/最高级

### 4. 名词&数词 number
- `num-plural` 名词复数
- `num-possessive` 名词所有格
- `num-numeral` 数词（基数/序数/倍数）

### 5. 冠词 article
- `art-a-an` 不定冠词
- `art-the` 定冠词
- `art-zero` 零冠词

### 6. 代词 pronoun
- `pron-personal` 人称/物主/反身代词
- `pron-indefinite` 不定代词
- `pron-it` 形式 it（形式主宾/强调）

### 7. 介词 preposition
- `prep-time` 时间介词
- `prep-place` 地点介词
- `prep-manner` 方式介词
- `prep-reason` 原因介词
- `prep-collocation` 固定搭配（动介/形介/名介）

### 8. 逻辑连词 logic
- `logic-coordinating` 并列连词
- `logic-correlative` 关联连词

### 9. 定语从句 attrib
- `attrib-pronoun` 关系代词（who/whom/which/that/whose）
- `attrib-adverb` 关系副词（when/where/why）
- `attrib-prep-relative` 介词+关系词
- `attrib-as` as/but/than 作关系词

### 10. 名词性从句 nounclause
- `nounc-that` that 引导
- `nounc-whether-if` whether/if 引导
- `nounc-wh-pronoun` 连接代词（what/who/which）
- `nounc-wh-adverb` 连接副词（when/where/how/why）
- `nounc-ever` wh-ever 类引导词

### 11. 状语从句 advclause
- `advc-time` 时间
- `advc-cause` 原因
- `advc-condition` 条件
- `advc-concession` 让步
- `advc-purpose-result` 目的/结果
- `advc-manner-place` 方式/地点

### 12. 情态动词 modal
- `modal-speculation` 推测
- `modal-ability-permission` 能力/许可
- `modal-advice-obligation` 建议/义务
- `modal-other` 其他情态用法

### 13. 特殊句式 special
- `special-subjunctive` 虚拟语气
- `special-emphasis` 强调句
- `special-inversion` 倒装
- `special-tag-question` 反意疑问句
- `special-ellipsis` 省略与替代

## 二、旧→新 映射（重打 190 题标注）

### 2.1 干净映射（重命名/合并，无需逐题判断）

| 旧 fine_category | 题数 | 新 |
|---|---|---|
| pred-tense-present / pred-tense-past-future / pred-tense-perfect（及其余 pred-tense-*） | 4+8+4 | `pred-tense` |
| pred-passive-form（及 pred-passive-implicit） | 24 | `pred-passive` |
| pred-sva-form（及其余 pred-sva-*） | 16 | `pred-agreement` |
| word-adj-adv-choice（及 word-ed-ing 等选用类） | 54 | `word-adj-vs-adv` |
| word-noun-derivation | 26 | `word-noun` |
| word-cmp-comparative（及 superlative/multiple/rules） | 6 | `word-comparative` |
| num-plural | 28 | `num-plural` |
| num-possessive | 2 | `num-possessive` |
| num-countable / num-quantity | 0 | `num-numeral`（数词部分） |
| art-a-an | 4 | `art-a-an` |
| art-the | 24 | `art-the` |
| pron-personal-possessive | 10 | `pron-personal` |
| pron-it | 2 | `pron-it` |
| pron-indefinite-1/2 | 0 | `pron-indefinite` |
| prep-verb（动介搭配） | 10 | `prep-collocation` |
| logic-conj-phrase | 24 | `logic-coordinating` |
| logic-compound | 0 | (并列句 → 视情况 logic-coordinating) |
| attrib-choice（关系词选择） | 12 | `attrib-pronoun` |
| attrib-adverb | 8 | `attrib-adverb` |

### 2.2 需逐题判断的重标（读题目+答案定）

| 旧 fine_category | 题数 | 重标方法 |
|---|---|---|
| **所有 nonp-\*（按功能）** nonp-subject-predicative / nonp-object / nonp-attribute / nonp-adverbial-1 / nonp-complement / nonp-perfect-passive-neg / nonp-absolute-with | 4+14+28+16+4+2+2 = **70** | **先按 §2.4 判大类，再按形式定 tag**：① 作非谓语成分（状/补/定/宾的分词、不定式）→ `nonpred-to-do`/`nonpred-doing`/`nonpred-done`（按答案形式；复合式 having done→doing、being done/to be done→done；独立主格按分词形式）。② **动名词作主/宾/表/介宾（名词用法）→ `word-noun`**（移出非谓语）。③ **-ed/-ing 作定语/表语表词义性质（公认的/令人兴奋的）→ `word-adj`**（移出非谓语）。**不能只看答案形式一刀切，须逐题看功能/词义**。 |
| **prep-common** | 24 | 按介词**语义**拆：时间→`prep-time`；地点→`prep-place`；方式→`prep-manner`；原因→`prep-reason`；固定搭配→`prep-collocation`。 |
| **attrib-restrictive-non** | 8 | 按所填**关系词**重标：关系代词→`attrib-pronoun`；关系副词→`attrib-adverb`。 |
| **nounc-wh-words** | 12 | 按所填**引导词**拆：what/who/which→`nounc-wh-pronoun`；when/where/how/why→`nounc-wh-adverb`。 |

**重标执行**：由 AI 逐题读"句子 + 答案"判定新 tag，产出对照表（旧题/旧tag/新tag/依据/答案形式）；**ambiguous（拿不准）的逐条标记交用户确认**后再写入 `grammar_bank.js`。

### 2.3 校验
- 重标后每题恰好一个新 `fine_category`，且属于上面 13 类之一（写校验脚本断言：无空、无旧 tag 残留、无未知 tag）。
- 更新 `scripts/check_grammar_bank.py` 的合法 tag 白名单为新体系。

### 2.4 归类判定规则（word ↔ nonpredicate 边界）

> 用户审定。**两个层级**：大类边界（词转 vs 非谓语）看**功能/词义**；非谓语**内部** tag 才按形式（to-do/doing/done）。两者不矛盾。

| 词形 & 用法 | 归属 | tag |
|---|---|---|
| -ed/-ing 作定语/表语，**表词义性质**（a recognized expert / the news is exciting） | 词性转换 | `word-adj` |
| 过去分词 done 作状语/补语，**表动作/被动**（Recognized by all, he…） | 非谓语 | `nonpred-done` |
| 现在分词 doing 作状语/补语，**表主动动作**（Recognizing the danger, he stopped） | 非谓语 | `nonpred-doing` |
| 不定式 to do 作非谓语成分（主/宾/状/定/补） | 非谓语 | `nonpred-to-do` |
| **动名词 doing 作主/宾/表/介宾（名词用法）**（Swimming is good / enjoy doing） | 词性转换 | `word-noun` |

**判定准则（用户·"动词作用"）**：非谓语动词的共性是仍起**动词作用**（带动词性、表动作/被动）。看词在句中起什么作用：仍起**动词作用**（分词/不定式作状/补/定）→ **非谓语**；转起**名词作用**（动名词作主/宾）→ **词转 word-noun**；转起**形容词作用**（-ed/-ing 表性质）→ **词转 word-adj**。一旦从"动词作用"转为名词/形容词作用，就归词转。

**同形不同功能分两类**：同一词形按句中功能判不同 tag。例 `recognized`：表"公认的"→`word-adj`；表"被认出"（状语）→`nonpred-done`。

**重标含义**：-ed/-ing/动名词这类边界题**必须逐题读"表词义还是作句法成分"**，不能按答案形式自动判；这是重标需人工/AI 逐题 + 用户把关、不能一刀切的根本原因。

**注**：`word-noun` 将同时含**派生名词**（recovery/solution）与**动名词**（swimming）两种题；迁移时可用筛选键（动名词答案为 -ing、派生名词为 -tion/-ity 等后缀）自然区分，必要时后续再拆子 tag。

## 三、三套尺子对齐

### 3.1 `data/grammar_fine_tags.js`
重写 `tags` 数组为新体系（约 50 tag），`categories` 13 类不变（id 不变）。`tags_by_id` / `tags_by_category` 结构不变。

### 3.2 `data/decision_map.js`（决策地图节点→tag）
重做叶子节点，使每个节点的 `fine` 指向**口径一致**的新 tag。重点修复：
- 非谓语叶子：节点 to do/doing/done → `nonpred-to-do`/`nonpred-doing`/`nonpred-done`（节点标签=形式，tag=形式，一致）。
- 名词性从句叶子：从"主语/宾语/表语/同位语从句"（成分）改为"that / whether·if / 连接代词 / 连接副词 / ever类"（引导词），`fine` 指向 `nounc-*` 对应项。
- 谓语、介词、定从等同理对齐。
- 中间父节点 `kd`（讲解 section）一并对齐新讲解结构。

### 3.3 `data/grammar_knowledge.js`（讲解 KNOWLEDGE_DATA）
section key 与新 tag 口径对齐（讲解多数已按引导词，微调）。`selectKnowledgeCategory` 的 section 锚点（Task 4 的 kd 跳转）相应更新。

### 3.4 教材视图 `grammar_fine_tags.js` 的 textbook_units / buildTextbookViewModel
单元关联的 tagIds 用新 tag；教材视图分类随之同步（解决 C1/C2：非谓语 ing 混 ed/to do、被动归类错）。

## 四、迁移统一（A2，借新体系彻底简化）

新体系下"同形式"= "同 fine tag"，故迁移**统一为纯 fine_category**：
- `modules/migration-training.js` `buildMigrationData` / `buildDisplayPools`：迁移展示池**只用 `fineBankPool`（同 fine_category）**。删除 `teachingBankPool` / `trapBankPool` / `bankPool(同粗类别+focus)` / `fallbackBankPool` **以及非谓语专用的 nonpAxis 同形式分支**（不再需要——形式已是 tag）。
- 空态文案："暂无同考点迁移题"，删掉"可切回粗分类"回退建议。
- 图谱叶子、教材单元、讲题抽屉三处均以 fine_category 为唯一键——一把尺子。

## 四之二、迁移内筛选（保留 tag，tag 内下钻）

> 决策（用户）：**保留全部 ~50 tag，不删**；筛选是 **tag 内部的额外下钻**，让老师在同 tag 题里按"具体词/形式"收窄（如 `pred-tense` 内筛具体时态、`attrib-pronoun` 内筛 who/which、`logic-coordinating` 内筛 and/but/or）。

**筛选键来源（三档，按能否从答案读出）**：
1. **运行时从答案直接读（首选，零标注、零 schema 改动）**：连接词/关系词/并列连词/名从引导词等——筛选值=答案那个词（归一化小写）。
2. **从答案派生（非谓语形式）**：to do/doing/done 由答案串派生；边界情况（不规则分词、复合式、短语答案）可后续存一个轻量 `form` 字段保准（暂不强制）。
3. **答案读不出、必须靠 tag/标注（介词语义等）**：这类本就由 tag 区分，无需额外筛选键。

**UI**：迁移抽屉/讲题台在同 fine_category 池上方，按池内题的答案派生出筛选片 `[全部][word1][word2]…`；池内若只有一种值则不显示筛选片。默认 `全部`（默认行为可后续按需调）。

**原型先行**：先在**当前数据**上做最小筛选原型（纯 UI，不动 tag/数据），让用户先"试一下"手感，再随地基重订推进。

## 五、迁移取句修复（A3，随手带上）
深圳卷"迁移第6题句子残缺/变 bridges"：排查迁移卡片取句（`renderSentenceWithBlank` / 迁移 item 的 sentence 切分），定位根因后修。实现时具体定位。

## 六、测试与验收
- 校验脚本：题库所有 `fine_category` ∈ 新 50 tag 白名单，无残留旧 tag。
- 纯逻辑（smoke/page.evaluate）：`buildMigrationData` 对某 fine tag 只返回同 fine_category 的题；空 tag 返回空 + 正确空态；非谓语 doing 题迁移只出 doing（=同 tag）。
- 决策地图叶子点迁移 → 练习题全部同新 fine_category。
- `npm run check` + `npm run test:smoke` 全绿。

## 七、不做（YAGNI）/ 风险
- 不做 B（真题/模拟分开）、C 之外的、D（跳转交互）——本 spec 聚焦地基（体系+迁移），其余反馈单独排期。
- 风险：70 道非谓语 + 24 介词 + 8 定从 + 12 名从 = **约 114 题需逐题重标**，是主要人工/AI 工作量，ambiguous 项需用户确认，防止把错标换成另一种错标。
- 已完成的 Task 1-5（tab/图谱交互/书本跳转/显示全部）不回退；Task 2 的图谱叶子按 fine 迁移在新体系下继续成立。
