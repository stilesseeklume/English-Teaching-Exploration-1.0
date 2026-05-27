# 公开题库分类总审计表

> 目标：先守住老师信任红线，只审计 190 道公开题库的大类分类，不新增页面功能。

## 审计范围

- 数据源：`docs/data/grammar_bank.js`（公开页面 canonical）
- 对照源：`data/grammar_bank.js`、`data/grammar_bank.json`
- 题量：19 套，共 190 题
- 红线：谓语/非谓语互判、非谓语/词性转换互判、旧数据与公开数据大类不一致

## 当前大类分布

| 大类 | 题数 |
|---|---:|
| 词性转换 | 57 |
| 非谓语动词 | 36 |
| 谓语动词 | 27 |
| 介词 | 17 |
| 定语从句 | 14 |
| 冠词 | 14 |
| 逻辑连词 | 12 |
| 代词 | 7 |
| 名词性从句 | 6 |

## 红线错误清单

| 状态 | 套卷 | 题号 | 答案 | 原问题 | 处理 |
|---|---|---:|---|---|---|
| 已修复 | 2023浙江首考 | 60 | featured | 旧数据 `data/grammar_bank.js/json` 因答案 `featured` 以 -ed 结尾且源 Markdown 无解析，被兜底误判为非谓语动词；公开 `docs/data` 已是谓语，但数据源之间不一致。 | 已同步为“谓语动词”，并在生成脚本加入人工校正，防止重建时回退。 |

## 细标签 / 页面展示低级误判清单

> 这些不一定改变 11 大类，但会直接影响老师看到的“知识路径”和迁移训练，因此也按信任红线处理。

| 状态 | 套卷 | 题号 | 答案 | 原问题 | 根因 | 处理 |
|---|---|---:|---|---|---|---|
| 已修复 | 2024深圳一模 | 39 | requires | 页面显示成“被动语态”，实际应为“谓语 · 主谓一致”。 | 短词正则裸匹配：`is ` 会命中 `this game` 中的 `is ` 子串；同时谓语判断扫描范围过宽。 | 页面判断改为先看 fine tag / 明确主谓一致证据，再看真正的 `be + done` 被动形态；短词匹配加词边界。 |
| 已修复 | 2024广州二模 | 39 | requires | 同类风险：动名词短语作主语，谓语单数，不应被同篇其他被动线索带偏。 | 同篇 passage 中其他题含被动信息，旧规则可能串扰当前题。 | 同步纳入谓语主谓一致校验；当前页面输出“谓语 · 主谓一致”。 |
| 已修复 | 2024广州二模 | 44 | was released | 细标签误挂 `pred-sva-form`，实际是谓语被动语态。 | 细标签脚本把“主谓一致”优先于“被动语态”，解析同时出现二者时抢错标签。 | 改为 `pred-passive-form`；生成脚本改为被动形态/被动解析优先。 |
| 已修复 | 2024深圳一模 | 40 | is described | 细标签误挂 `pred-sva-form`，实际是谓语被动语态。 | 同上。 | 改为 `pred-passive-form`。 |
| 已修复 | 2024深圳二模 | 43 | was recognized | 细标签误挂 `pred-sva-form`，实际是谓语被动语态。 | 同上。 | 改为 `pred-passive-form`。 |
| 已修复 | 2025广州一模 | 37 | were selected | 细标签误挂 `pred-sva-collective`，实际是谓语被动语态。 | 同上。 | 改为 `pred-passive-form`。 |
| 已修复 | 2024浙江首考 | 61 | be offered | 细标签误挂 `pred-tense-other`，实际是情态动词后谓语被动。 | 源题解析为空，旧细标签兜底只看时态。 | 改为 `pred-passive-form`；被动答案形态进入脚本规则。 |
| 已修复 | 2024浙江首考 | 62 | have started | 细标签误挂 `pred-tense-other`，实际为完成时。 | 源题解析为空，旧细标签兜底没有从答案形态识别 `have/has/had + done`。 | 改为 `pred-tense-perfect`；脚本增加完成时答案形态识别。 |
| 已修复 | 2025深圳一模 | 38 | retired | 细标签误挂 `pred-tense-past-perfect`，但主答案为一般过去式 `retired`，解析只补充 `had retired` 也可。 | 旧脚本看到“过去完成”即优先打过去完成，未结合主答案形态。 | 改为 `pred-tense-past-future`。 |
| 已修复 | 2024广州二模 | 37 | existing | 页面曾显示“词性转换 · 副词”，实际应为形容词。 | 词性判断把 `technique` 等宽文本也纳入 blob，`/ly/` 命中 unrelated text（如 `Dissatisfied` 一类上下文）导致误判。 | 移除 `technique` 的展示层判定参与；显式 `grammar_point=形容词/副词` 优先。 |

## 同类低级规则风险扫描

| 风险 | 例子 | 处理 |
|---|---|---|
| 短词无词边界导致子串误命中 | `this game` 命中 `is `；`nearby` 可能命中 `by`；`also` 可能命中 `so`。 | 参与分类/展示判断的短词统一改成词边界或答案精确匹配。 |
| 整篇 passage 串扰当前题 | 当前题 `requires` 被同篇后文 `is described` 等被动信息影响。 | `getQuestionTextBlob` 不再纳入非必要宽文本；谓语被动必须有当前题答案形态、fine tag 或本题解析证据。 |
| 细标签优先级不符合课堂判断顺序 | `was released` 同时有“语态 + 主谓一致”，旧脚本先打主谓一致。 | `scripts/tag_bank_with_fine_category.js` 改为被动优先于主谓一致，再进入时态/完成时判断。 |
| 词性转换用宽泛后缀猜测 | `existing` 这种形容词化定语被副词规则带偏。 | `grammar_point` 显式形容词/副词优先；迁移训练对 `word-adj-adv-choice` 先按运行时 focus（形容词/副词）排序。 |

## 脚本报警但人工判定通过

| 套卷 | 题号 | 答案 | 当前大类 | 报警原因 | 人工判定 | 句子 |
|---|---:|---|---|---|---|---|
| 2023全国一卷 | 61 | to be lifted | 非谓语动词 | 非谓语答案含 be/助动词，需要确认是否是不定式被动或完成式 | to be lifted 是不定式被动，属于非谓语；含 be 不是谓语 be。 | Nanxiang aside, the best Xiao long bao have a fine skin, allowing them ___61___ (lift) out of the steamer basket without tearing or spilling any of ___62___ (they) contents. |
| 2023全国二卷 | 60 | visiting | 词性转换 | 词性类但答案像动词变形 | visiting 在此为形容词化用法，修饰 Chinese zookeepers；归入词性转换可接受。 | They talk to the flood of international tourists and to ___60___ (visit) Chinese zookeepers who often come to check on the pandas, which are on loan from China. |
| 2024全国一卷 | 59 | closed | 词性转换 | 词性类但答案像动词变形 | closed 作系表结构中的形容词表语，归入词性转换可接受。 | In cold weather, the structure stays ___59___ (close) to protect the plants. |
| 2024全国二卷 | 44 | Recalling | 非谓语动词 | 非谓语分类但解析只指向谓语 | 解析写“此句已有谓语动词 said”，是在证明 Recalling 为现在分词作状语；非谓语分类正确。 | ___44___ (recall)watching a Chinese opera version of Shakespeare's play Richard III in Shanghai and meeting Chinese actors who came to Stratford a few years ago to perform parts of The Peony Pavilion, Edmondson said, "It was very exciting to hear the Chinese language ___45___ see how Tang's play was being performed. |
| 2024广州二模 | 37 | existing | 词性转换 | 词性类但答案像动词变形 | existing 为形容词化定语，归入词性转换可接受。 | Dissatisfied with the ___37___ (exist) options, Wu decided to create his own. |
| 2024深圳一模 | 39 | requires | 谓语动词 | 谓语分类但解析出现非谓语关键词 | 主语是不定式 to master this game，requires 是句子谓语；报警来自解析关键词“不定式”。 | However, to master this game___39___ (require) a lot of practice. |
| 2025深圳一模 | 40 | was forced | 谓语动词 | 谓语分类但解析出现非谓语关键词 | was forced 是一般过去时被动语态，谓语分类正确；报警来自解析里的“受伤后”。 | During their semifinal match, Marin performed well but ___40___ (force) to stop after getting injured. |

## 审计结论

- 公开 canonical 题库 `docs/data/grammar_bank.js` 当前未发现仍存在的“大类红线错误”。
- 已确认并修复 1 个数据一致性/生成链路问题：`2023浙江首考#60 featured`。
- `docs/data/grammar_bank.js`、`data/grammar_bank.js`、`data/grammar_bank.json` 的 190 题大类现已完全一致。
- 页面展示层已修复同类低级误判：短词正则无边界、整篇 passage 串扰、谓语细标签优先级错误。
- 谓语题复核结果：27 道谓语中，所有 `be + done` 形态均已归入被动细标签；非被动谓语未再误挂被动。
- 词性转换复核结果：显式“形容词 / 副词 / 名词复数”题未发现相互误挂。
- 下一步建议：回到 36 道非谓语做功能轴和形式轴精修，尤其是 surrounded / inspired / drawn / covered / to be lifted 等代表题。

## 分类口径补充

- 动词括号题都要判断主动/被动，但第一层分类先看“是否承担句子谓语”。
- `to be lifted` 这类答案含 `be`，但整体是不定式被动 `to be done`，不是谓语被动；大类仍归“非谓语动词”。
- 讲题和迁移训练应再细分为形式轴 + 功能轴，例如：`to be lifted` = `to be done` + 作补语。
