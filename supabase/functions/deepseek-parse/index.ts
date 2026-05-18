// Supabase Edge Function: DeepSeek AI 智能解析语法填空 Word 文档
// 前端上传 .docx → mammoth.js 提取纯文本 → 此函数调 DeepSeek API → 返回结构化 JSON
//
// v2 改动：
//   1. 支持一份文档里多篇语法填空 —— 返回 { passages: [...] }
//   2. 旧版单篇返回也兼容（自动包装成 passages 单元素数组）
//   3. 字段缺失时尝试自愈（title 缺失给默认，passage 缺标记尝试从 blanks 重建）
//   4. JSON 解析失败时回传 rawContent 给前端看

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const DEEPSEEK_API_KEY = Deno.env.get("DEEPSEEK_API_KEY") || "";
const DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `你是一名专业的英语语法填空出题助手。你的唯一任务是从用户提供的文本中提取一篇或多篇英语语法填空题，并输出严格合法的 JSON。不要输出任何其他文字、注释或 Markdown 标记。

## 输出 JSON 结构（严格遵循，不得增删字段）

{
  "passages": [
    {
      "title": "文章标题",
      "passage": "完整英文原文（每个空格用 ___{题号}___ 替换，如 ___36___）",
      "blanks": [
        {
          "no": 数字题号,
          "answer": "正确英文单词或短语",
          "category": "粗考点分类代码（11 类之一）",
          "fine_category": "精细考点 tag id（从下方 ~100 个里选最匹配的 1 个）",
          "analysis": "中文解析，30-60字"
        }
      ]
    }
  ]
}

**重要：即使只有一篇也要用 passages 数组包裹。**

## 多篇识别规则

文本中以下情况说明有多篇语法填空：
- 出现多个标题（如「Passage 1」「Passage 2」、多个中文章名、多个 Article、多个 Text 等）
- 空格编号在中间重置回 1（如 1-10 后又出现 1-10）
- 出现分隔符（=====、━━━━、---、Passage、Text、第 X 篇等）

若识别为多篇，请把每篇拆成 passages 数组的一个元素。每篇内部空格编号独立。

## 粗考点分类代码（category 字段，11 类必选 1 个）

predicate     = 谓语动词（时态、语态、主谓一致）
nonpredicate  = 非谓语动词（to do / doing / done / 独立主格）
word          = 词性转换（名/形/副/动转换、比较级、短语动词）
number        = 名词/数词（可数/复数/所有格/数词）
article       = 冠词（a / an / the）
pronoun       = 代词（人称/物主/反身/不定/指示）
preposition   = 介词（固定搭配 / 时间地点方式）
logic         = 逻辑连词（并列/转折/因果/递进）
attrib        = 定语从句连词（关系代词/关系副词）
nounclause    = 名词性从句连词（主/宾/表/同位语从句）
advclause     = 状语从句连词（时间/原因/条件/让步/目的/结果）
modal         = 情态动词（推测/能力/义务/虚拟）
special       = 其他特殊句式（虚拟语气/强调/倒装/反意疑问/省略）

## 精细考点 tag（fine_category 字段，必选 1 个）

【predicate 谓语动词】
pred-tense-present：一般现在时（客观事实/规律）
pred-tense-past-future：一般过去时 / 将来时 / 过去将来时
pred-tense-continuous：现在/过去/将来进行时
pred-tense-perfect：现在完成时 / 现在完成进行时（since / so far / over the past）
pred-tense-past-perfect：过去完成 / 过去完成进行 / 将来完成时
pred-tense-other：时态其他
pred-passive-form：被动语态构成（be + done）
pred-passive-implicit：主动形式表被动意义
pred-sva-form：主谓一致 · 语法形式
pred-sva-meaning：主谓一致 · 意义 / 就近一致
pred-sva-collective：主谓一致 · 集合 / 复数 / -s 结尾名词作主语
pred-sva-quantity：主谓一致 · 表数量的短语

【nonpredicate 非谓语动词】
nonp-basic：非谓语 · 基础知识
nonp-subject-predicative：作主语 / 表语
nonp-object：作宾语
nonp-attribute：作定语
nonp-adverbial-1：作状语（时间/原因/目的/结果）
nonp-adverbial-2：作状语（方式/伴随/条件）
nonp-conj-elision：连词 + 非谓语 / 省略
nonp-complement：作宾补 / 主补
nonp-perfect-passive-neg：完成式 / 进行式 / 被动式 / 否定式
nonp-said-to-do：somebody is said to do 句式
nonp-compound-structure：动词不定式 / 动名词的复合结构
nonp-absolute-with：独立主格 / with 复合结构
nonp-therebe：there be 句型 + 非谓语
nonp-other：非谓语其他

【word 词性转换】
word-adj-adv-choice：形容词 / 副词的选用（含 -ly 副词派生）
word-ed-ing：-ed 形容词 vs -ing 形容词（含 done / doing 作形容词）
word-adj-adv-other：形 / 副其他相关 + 名词派生（动→名 等）
word-common-adj-adv：几个常用形 / 副的用法
word-adj-adv-distinguish：常考形 / 副的区别
word-adj-adv-phrase：常考形 / 副词组的区别
word-cmp-rules：比较级 / 最高级构成规则及 than/as 词性
word-cmp-comparative：比较级
word-cmp-superlative：最高级
word-cmp-multiple：倍数表达 / 类比
word-phrasal-1：常用短语动词（一）
word-phrasal-2：常用短语动词（二）
word-phrasal-other：其他常考短语动词和惯用表达
word-verb-usage：常考动词的用法
word-noun-derivation：名词派生（动→名如 arrive→arrival、形→名如 happy→happiness）

【number 名词/数词】
num-countable：可数 vs 不可数
num-plural：名词复数形式
num-quantity：名词的量 / 数词
num-possessive：名词所有格

【article 冠词】
art-specific-indefinite：特指 / 独指 / 类指
art-a-an：不定冠词 a / an
art-the：定冠词 the
art-zero：不用冠词
art-other：冠词其他

【pronoun 代词】
pron-personal-possessive：人称 / 物主 / 反身 / 指示代词
pron-indefinite-1：不定代词（一）
pron-indefinite-2：不定代词（二）
pron-it：代词 it 的常考点

【preposition 介词】
prep-overview：介词概述
prep-common：常见介词常见用法
prep-time：介词辨析 · 时间
prep-location：介词辨析 · 地点位置
prep-verb：介词辨析 · 动介搭配
prep-other：介词辨析 · 其他

【logic 逻辑连词】
logic-conj-phrase：连接词或短语的并列连词
logic-compound：并列句

【attrib 定语从句】
attrib-choice：关系词选择技巧
attrib-adverb：关系副词（where / when / why）
attrib-prep-relative：介词 + 关系代词
attrib-only-that：只能用 that 不能用 which
attrib-other-rules：其他关系代词规则
attrib-as-but-than：as / but / than 作关系代词
attrib-restrictive-non：限制性 vs 非限制性
attrib-vs-appositive：同位语从句 vs 定语从句
attrib-confusing：定语从句与易混句型
attrib-other：定语从句其他

【nounclause 名词性从句】
nounc-connectors：引导词
nounc-vs-appositive：与同位语区别
nounc-wh-words：what / when / where / how / why
nounc-ever-words：whatever / whoever 等
nounc-reported：间直引语

【advclause 状语从句】
advc-time：时间状语
advc-reason-place：原因 / 地点
advc-condition-manner：条件 / 方式
advc-purpose-result：目的 / 结果
advc-concession-comparison：让步 / 比较

【modal 情态动词】
modal-features：情态动词的语法特征
modal-speculation-overview：推测性用法概述
modal-bare-infinitive：情态 + 原形（推测现在/将来）
modal-have-done：情态 + have done（推测过去）
modal-subjunctive：情态用于虚拟
modal-can-other：can 其他用法
modal-may-must：may / must 其他用法
modal-will-shall-would-should：will / shall / would / should / used to

【special 其他特殊句式】
special-subj-wish：虚拟 · 过去时态表愿望
special-subj-if：虚拟 · 条件句
special-subj-implicit：虚拟 · 含蓄条件
special-subj-should-bare：虚拟 · should + 原形
special-subj-should-surprise：虚拟 · should 表意外
special-emph-basic：强调句基础
special-emph-common：强调句常见考点
special-inv-full：完全倒装
special-inv-partial：部分倒装
special-tag-question：反意疑问句
special-negation-exclam：否定转移 / 感叹句
special-substitution-ellipsis：替代 / 省略

## 处理规则

1. 【标题识别】从原文中尽量提取**完整、可追溯**的标题，按以下格式组装（缺哪部分跳哪部分）：
   "[年份] [地区/学校] [卷次类型]"
   - 年份：识别 "2024"、"2025" 等数字，或 "高三上学期"、"高二下学期" 等。
   - 地区/学校：如 "深圳"、"广州"、"长郡中学"、"湖南师大附中"、"全国甲卷"、"新高考一卷" 等。
   - 卷次类型：如 "一模"、"二模"、"月考"、"期中考"、"周测"、"模拟卷"、"高考真题" 等。
   - 例子：
     * 原文有 "2024年广州一模" → title: "2024广州一模"
     * 原文有 "长郡中学2025届高三月考" → title: "2025长郡中学高三月考"
     * 原文有 "新高考一卷·真题" → title: "新高考一卷真题"
   - 如果原文完全没有上述信息，**根据文章主题起一个 4-10 字的中文描述性标题**（如"大熊猫与生态旅游"、"气候变化对农业的影响"、"人工智能推动医疗进步"）。禁止用"未命名"。
   - **不要照搬试卷封面的口号或宣传语**（如 "决战高考2025" 这种），只保留考点信息。
2. 【空格识别】空白处可能表现为：下划线___、方框□、括号中提示词如 (give)、题号标注如 56.______、或直接空白。识别所有空格，按在文中出现的先后顺序从 1 开始连续编号（每篇独立）。如果原题已有序号，优先使用原序号。
3. 【答案推断】如果原文本在题号后附有答案（如"56. dating"），直接使用。如果给出了括号中的提示词原形（如 (date)），根据语法语境变形后作为答案。如果无任何提示，根据语法知识推断最合理的答案。
4. 【passage 字段】将原文中所有识别出的空格替换为 ___{题号}___ 格式（如 ___36___）。保持原文其余部分不变（包括大小写、标点、换行）。
5. 【category 字段】从 13 个粗类里必选 1 个。
6. 【fine_category 字段】必填。从 ~100 个精细 tag 中选与本题最匹配的 1 个。例如：
   - "since 1990 ... has done" → pred-tense-perfect
   - "to do 作宾语" → nonp-object
   - "by hand" 固定搭配 → prep-common
   - "in 1990" 时间介词 → prep-time
   - 答案是副词派生（-ly）→ word-adj-adv-choice
   - 关系副词 where/when → attrib-adverb
7. 【answer 字段】必须是确切的英文单词或短语，不含序号、中文、多余空格或标点。
8. 【analysis 字段】用中文写 30-60 字的解析，说明：①空格在句中的成分 ②语法判断依据 ③为什么是这个答案。

## 重要：只输出 JSON，不输出任何其他内容`;

function extractJSON(text: string): string {
  // 剥离 markdown 代码围栏 ```json ... ``` 或 ``` ... ```
  const fenceMatch = text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/);
  if (fenceMatch) return fenceMatch[1].trim();

  // 尝试找到第一个 { 和最后一个 }
  const first = text.indexOf("{");
  const last = text.lastIndexOf("}");
  if (first !== -1 && last !== -1 && last > first) {
    return text.slice(first, last + 1).trim();
  }

  return text.trim();
}

const VALID_CATEGORIES = new Set([
  "predicate", "nonpredicate", "word", "number", "article",
  "pronoun", "preposition", "logic", "attrib", "nounclause", "advclause",
  "modal", "special",  // Sprint 1 新增扩展类
]);

// 精细 tag 白名单（101 个，来自 docs/data/grammar_fine_tags.js）
const VALID_FINE_CATEGORIES = new Set([
  // predicate (12)
  "pred-tense-present", "pred-tense-past-future", "pred-tense-continuous",
  "pred-tense-perfect", "pred-tense-past-perfect", "pred-tense-other",
  "pred-passive-form", "pred-passive-implicit",
  "pred-sva-form", "pred-sva-meaning", "pred-sva-collective", "pred-sva-quantity",
  // nonpredicate (14)
  "nonp-basic", "nonp-subject-predicative", "nonp-object", "nonp-attribute",
  "nonp-adverbial-1", "nonp-adverbial-2", "nonp-conj-elision", "nonp-complement",
  "nonp-perfect-passive-neg", "nonp-said-to-do", "nonp-compound-structure",
  "nonp-absolute-with", "nonp-therebe", "nonp-other",
  // word (15) — 含名词派生
  "word-adj-adv-choice", "word-ed-ing", "word-adj-adv-other",
  "word-common-adj-adv", "word-adj-adv-distinguish", "word-adj-adv-phrase",
  "word-cmp-rules", "word-cmp-comparative", "word-cmp-superlative", "word-cmp-multiple",
  "word-phrasal-1", "word-phrasal-2", "word-phrasal-other", "word-verb-usage",
  "word-noun-derivation",
  // number (4)
  "num-countable", "num-plural", "num-quantity", "num-possessive",
  // article (5)
  "art-specific-indefinite", "art-a-an", "art-the", "art-zero", "art-other",
  // pronoun (4)
  "pron-personal-possessive", "pron-indefinite-1", "pron-indefinite-2", "pron-it",
  // preposition (6)
  "prep-overview", "prep-common", "prep-time", "prep-location", "prep-verb", "prep-other",
  // logic (2)
  "logic-conj-phrase", "logic-compound",
  // attrib (10)
  "attrib-choice", "attrib-adverb", "attrib-prep-relative", "attrib-only-that",
  "attrib-other-rules", "attrib-as-but-than", "attrib-restrictive-non",
  "attrib-vs-appositive", "attrib-confusing", "attrib-other",
  // nounclause (5)
  "nounc-connectors", "nounc-vs-appositive", "nounc-wh-words", "nounc-ever-words", "nounc-reported",
  // advclause (5)
  "advc-time", "advc-reason-place", "advc-condition-manner",
  "advc-purpose-result", "advc-concession-comparison",
  // modal (8)
  "modal-features", "modal-speculation-overview", "modal-bare-infinitive",
  "modal-have-done", "modal-subjunctive", "modal-can-other", "modal-may-must",
  "modal-will-shall-would-should",
  // special (12)
  "special-subj-wish", "special-subj-if", "special-subj-implicit",
  "special-subj-should-bare", "special-subj-should-surprise",
  "special-emph-basic", "special-emph-common",
  "special-inv-full", "special-inv-partial",
  "special-tag-question", "special-negation-exclam", "special-substitution-ellipsis",
]);

interface RawPassage {
  title?: string;
  passage?: string;
  blanks?: Array<{ no?: number; answer?: string; category?: string; fine_category?: string; analysis?: string }>;
}

function normalizePassage(p: RawPassage, idx: number) {
  const title = (p.title && String(p.title).trim()) || `未命名 ${idx + 1}`;
  let passage = p.passage || "";
  const blanks = (Array.isArray(p.blanks) ? p.blanks : []).map((b, i) => ({
    no: typeof b.no === "number" ? b.no : i + 1,
    answer: (b.answer || "?").toString().trim(),
    category: VALID_CATEGORIES.has(b.category as string) ? (b.category as string) : (b.category || "word"),
    // fine_category：AI 选错或没选时静默丢弃（前端 Task #8 已 fallback 到 trap/focus）
    fine_category: VALID_FINE_CATEGORIES.has(b.fine_category as string) ? (b.fine_category as string) : undefined,
    analysis: (b.analysis || "").toString().trim(),
  }));

  // 兜底：如果 passage 没有任何 ___N___ 标记，但有 blanks，按顺序在末尾追加占位
  if (passage && !passage.match(/___\d+___/) && blanks.length > 0) {
    passage += "\n\n[空格位置标记缺失，请手动核对]";
  }

  return { title, passage, blanks };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "仅支持 POST 请求" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "未登录，请先登录" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(JSON.stringify({ error: "登录已过期，请重新登录" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { text } = body;

    if (!text || typeof text !== "string" || text.trim().length < 20) {
      return new Response(JSON.stringify({ error: "文本内容太短，无法解析。" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const deepseekRes = await fetch(DEEPSEEK_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${DEEPSEEK_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        temperature: 0.1,
        max_tokens: 8192,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: `请解析以下英语语法填空文本：\n\n---\n${text}\n---` },
        ],
      }),
    });

    if (!deepseekRes.ok) {
      const errText = await deepseekRes.text().catch(() => "");
      console.error("DeepSeek API error:", deepseekRes.status, errText);
      return new Response(JSON.stringify({
        error: `DeepSeek API 错误 (${deepseekRes.status})。请稍后重试。`,
      }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const deepseekData = await deepseekRes.json();
    const content = deepseekData?.choices?.[0]?.message?.content || "";

    if (!content) {
      return new Response(JSON.stringify({
        error: "AI 未返回有效内容，请尝试用更清晰的格式重新提供文档。",
      }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let parsed: any;
    try {
      const jsonStr = extractJSON(content);
      parsed = JSON.parse(jsonStr);
    } catch (e) {
      console.error("Failed to parse DeepSeek response:", content.substring(0, 500));
      return new Response(JSON.stringify({
        error: "AI 返回的内容无法解析为 JSON。",
        rawContent: content.substring(0, 600),
      }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 统一成 passages 数组
    let passages: RawPassage[] = [];
    if (Array.isArray(parsed)) {
      passages = parsed;
    } else if (parsed && Array.isArray(parsed.passages)) {
      passages = parsed.passages;
    } else if (parsed && (parsed.passage || Array.isArray(parsed.blanks))) {
      // 旧版单篇返回
      passages = [parsed];
    } else {
      return new Response(JSON.stringify({
        error: "AI 返回数据格式不正确（缺少 passages / passage 字段）。",
        rawResult: JSON.stringify(parsed).substring(0, 600),
      }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 过滤明显残缺的
    passages = passages.filter(p => p && (p.passage || (Array.isArray(p.blanks) && p.blanks.length)));

    if (passages.length === 0) {
      return new Response(JSON.stringify({
        error: "未识别到任何题目，请检查 Word 文档内容。",
      }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const normalized = passages.map((p, i) => normalizePassage(p, i));

    return new Response(JSON.stringify({ passages: normalized }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("Unexpected error:", err);
    return new Response(JSON.stringify({
      error: "服务器内部错误：" + (err instanceof Error ? err.message : String(err)),
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
