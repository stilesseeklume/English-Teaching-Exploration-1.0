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
const MAX_PARSE_TEXT_CHARS = 30000;

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
      "passage": "完整英文原文（每个空格用 ___{题号}___ 替换；若原文有括号提示词则紧跟保留，如 ___36___(appear)）",
      "blanks": [
        {
          "no": 数字题号,
          "answer": "正确英文单词或短语",
          "category": "粗考点分类代码（13 类之一）",
          "fine_category": "精细考点 tag id（从下方 51 个里选最匹配的 1 个）",
          "facets": { "见下方 facets 规则，按 category 填对应键": "" },
          "analysis": "中文解析，30-60字",
          "solve": "做题思路（做题角度），40-70字"
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

## 粗考点分类代码（category 字段，13 类必选 1 个）

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

## 精细考点 tag（fine_category 字段，必选 1 个，体系重订 2026-05-31：按引导词/形式一把尺子）

【predicate 谓语动词】（时态细分进 facets.tense，不再细分 tag）
pred-tense：时态（现在/过去/将来/进行/完成）
pred-passive：被动语态
pred-agreement：主谓一致

【nonpredicate 非谓语动词】（按答案形式定 tag；动名词作名词用归 word-noun，-ed/-ing 表性质归 word-adj）
nonpred-to-do：不定式 to do 作非谓语成分
nonpred-doing：现在分词 doing 作状/补/定（表主动动作；复合式 having done 也归此）
nonpred-done：过去分词 done 作状/补/定（表被动；being done / to be done 归此）

【word 词性转换】
word-noun：派生名词（recovery/solution）含动名词作名词用（swimming）
word-adj：派生形容词，含 -ed/-ing 表性质（excited/exciting）
word-adv：派生副词（-ly）
word-verb：派生动词
word-adj-vs-adv：形容词 / 副词选用
word-comparative：比较级 / 最高级

【number 名词/数词】
num-plural：名词复数（含可数性）
num-possessive：名词所有格
num-numeral：数词（基数/序数/倍数）

【article 冠词】（零冠词高考不考，已删）
art-a-an：不定冠词 a / an
art-the：定冠词 the

【pronoun 代词】
pron-personal：人称 / 物主 / 反身 / 指示代词
pron-indefinite：不定代词
pron-it：形式 it（形式主宾 / 强调）

【preposition 介词】（对齐语法通霸21）
prep-common：常见介词的常见用法（as/by/for/in/on…）
prep-time：介词辨析 · 时间
prep-place：介词辨析 · 地点位置
prep-collocation：介词辨析 · 动介搭配（动词+介词）
prep-other：介词辨析 · 其他（穿衣/工具/原因/be+adj+prep）

【logic 逻辑连词】（合并为 1，关联结构由 facets.kind 区分）
logic-coordinating：并列连词（and/but/or/so；含 both…and 等关联结构）

【attrib 定语从句】（限制性进 facets.restrictive，不进 tag）
attrib-pronoun：关系代词（who/whom/which/that/whose）
attrib-adverb：关系副词（when/where/why）
attrib-prep-relative：介词 + 关系词
attrib-as：as 作关系词

【nounclause 名词性从句】（按引导词，不按成分）
nounc-that：that 引导
nounc-whether-if：whether / if 引导
nounc-wh-pronoun：连接代词（what/who/which）
nounc-wh-adverb：连接副词（when/where/how/why）
nounc-ever：wh-ever 类（whatever/whoever…）

【advclause 状语从句】（按真语义类别）
advc-time：时间 / advc-cause：原因 / advc-place：地点 / advc-condition：条件
advc-manner：方式 / advc-concession：让步 / advc-comparison：比较 / advc-purpose：目的 / advc-result：结果

【modal 情态动词】
modal-speculation：推测用法
modal-ability-permission：能力 / 许可
modal-advice-obligation：建议 / 义务
modal-other：情态其他

【special 其他特殊句式】
special-subjunctive：虚拟语气
special-emphasis：强调句
special-inversion：倒装
special-tag-question：反意疑问句
special-ellipsis：省略

## facets 多维属性（facets 字段，按 category 填对应键，机器筛选/迁移用）

按本题 category 填以下键（只填该 category 对应的，其他不填）：
- nonpredicate → { "form": "to-do" | "doing" | "done" }（按答案形式）
- word         → { "subtype": "derivation" | "gerund" | "participle-adj" | "comparative" | "superlative" | "selection" }
- number       → { "type": "plural" | "possessive" | "numeral" }
- article      → { "word": "a-an" | "the" }
- pronoun      → { "type": "personal" | "indefinite" | "it" }
- preposition  → { "word": "<答案介词>", "sense": "time" | "place" | "manner" | "reason" | "collocation"（可选）}
- logic        → { "word": "<答案连词>", "kind": "coordinating" | "correlative" }
- attrib       → { "type": "relative-pronoun" | "relative-adverb" | "prep-relative" | "as-relative", "word": "<答案关系词>", "restrictive": true | false }
- nounclause   → { "type": "that" | "whether-if" | "wh-pronoun" | "wh-adverb" | "wh-ever", "word": "<答案引导词>" }
- advclause    → { "type": "time" | "cause" | "place" | "condition" | "manner" | "concession" | "comparison" | "purpose" | "result" }
- modal        → { "type": "speculation" | "ability-permission" | "advice-obligation" | "other" }
- special      → { "type": "subjunctive" | "emphasis" | "inversion" | "tag-question" | "ellipsis" }
- predicate    → { "tense": "<时态>", "voice": "active" | "passive", "agreement": true | false }（tense 如 present/past/future/perfect/progressive 等）

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
4. 【passage 字段】将原文中的下划线/方框空格替换为 ___{题号}___ 格式。**如果该空格旁有括号提示词（如 (appear)），保留括号提示词，紧接在 ___{题号}___ 后面**，例如原文是 「___56___ (appear)」 则输出 「___56___(appear)」。如果没有提示词则直接写 「___56___」。保持原文其余部分不变（包括大小写、标点、换行）。
5. 【category 字段】从 13 个粗类里必选 1 个。
6. 【fine_category 字段】必填。从 51 个精细 tag 中选与本题最匹配的 1 个。例如：
   - "since 1990 ... has done" → pred-tense
   - to do 作宾语 → nonpred-to-do
   - "by hand" 固定搭配 → prep-common
   - "in 1990" 时间介词 → prep-time
   - 答案是副词派生（-ly）→ word-adv
   - 关系副词 where/when → attrib-adverb
   - 动名词作主语（Swimming is…）→ word-noun（不是非谓语）
   - -ed/-ing 表性质作定语/表语（excited/exciting）→ word-adj（不是非谓语）
6b.【facets 字段】必填。按本题 category 填上方 facets 规则对应的键，与 fine_category 口径一致。例：
   - 答案 which 作关系代词、限制性 → category=attrib, fine=attrib-pronoun, facets={"type":"relative-pronoun","word":"which","restrictive":true}
   - 答案 were included（过去被动复数）→ category=predicate, fine=pred-passive, facets={"tense":"past","voice":"passive","agreement":false}
   - 答案 doing 作状语 → category=nonpredicate, fine=nonpred-doing, facets={"form":"doing"}
7. 【answer 字段】必须是确切的英文单词或短语，不含序号、中文、多余空格或标点。
8. 【analysis 字段】用中文写 30-60 字的"考点式"解析：①空格在句中的成分 ②语法判断依据 ③为什么是这个答案。
9. 【solve 字段】用中文写 40-70 字的"做题思路"（做题角度，不是语法术语堆砌）：教学生**这道题怎么自己做出来**。按"①先看哪里（空格位置／括号给词／左右邻词）→ ②抓什么信号 → ③怎么下手（变形／选词／判断）"写，像老师手把手带做题。例：括号给 taste、右邻是名词 soup → 缺修饰语 → 把 taste 变成形容词 tasty 作定语。
   **特例·谓语动词题（category=predicate）：做题思路必须走"谓语三查"序列，且顺序固定——① 先看时间标志/上下文定时态 ② 再看主语是否承受动作定语态（主动/被动）③ 最后回到主语中心词查主谓一致（单/复数），并指出本题最容易栽的那一步。**（因为谓语题同时考时态+语态+一致，学生常先错在时态。）例：In 2016 + 主语 the terms 承受 include → ① 时间 In 2016 用过去时 ② terms 被收录=被动 ③ 主语复数 → were included。

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

// 精细 tag 白名单（51 个，体系重订 2026-05-31，来自 docs/data/grammar_fine_tags.js）
const VALID_FINE_CATEGORIES = new Set([
  // predicate (3)
  "pred-tense", "pred-passive", "pred-agreement",
  // nonpredicate (3)
  "nonpred-to-do", "nonpred-doing", "nonpred-done",
  // word (6)
  "word-noun", "word-adj", "word-adv", "word-verb", "word-adj-vs-adv", "word-comparative",
  // number (3)
  "num-plural", "num-possessive", "num-numeral",
  // article (2)
  "art-a-an", "art-the",
  // pronoun (3)
  "pron-personal", "pron-indefinite", "pron-it",
  // preposition (5)
  "prep-common", "prep-time", "prep-place", "prep-collocation", "prep-other",
  // logic (1)
  "logic-coordinating",
  // attrib (4)
  "attrib-pronoun", "attrib-adverb", "attrib-prep-relative", "attrib-as",
  // nounclause (5)
  "nounc-that", "nounc-whether-if", "nounc-wh-pronoun", "nounc-wh-adverb", "nounc-ever",
  // advclause (9)
  "advc-time", "advc-cause", "advc-place", "advc-condition", "advc-manner",
  "advc-concession", "advc-comparison", "advc-purpose", "advc-result",
  // modal (4)
  "modal-speculation", "modal-ability-permission", "modal-advice-obligation", "modal-other",
  // special (5)
  "special-subjunctive", "special-emphasis", "special-inversion",
  "special-tag-question", "special-ellipsis",
]);

// facets 各 category 允许的键（与 grammar_fine_tags 体系对齐；只做形态过滤，不强约束值）
const FACET_KEYS_BY_CATEGORY: Record<string, Set<string>> = {
  nonpredicate: new Set(["form"]),
  word: new Set(["subtype"]),
  number: new Set(["type"]),
  article: new Set(["word"]),
  pronoun: new Set(["type"]),
  preposition: new Set(["word", "sense"]),
  logic: new Set(["word", "kind"]),
  attrib: new Set(["type", "word", "restrictive"]),
  nounclause: new Set(["type", "word"]),
  advclause: new Set(["type"]),
  modal: new Set(["type"]),
  special: new Set(["type"]),
  predicate: new Set(["tense", "voice", "agreement"]),
};

// 清洗 facets：只保留本 category 允许的键；非法/缺失返回 undefined（与 fine_category 同样静默丢弃策略）
function sanitizeFacets(category: string, facets: unknown): Record<string, unknown> | undefined {
  if (!facets || typeof facets !== "object" || Array.isArray(facets)) return undefined;
  const allowed = FACET_KEYS_BY_CATEGORY[category];
  if (!allowed) return undefined;
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(facets as Record<string, unknown>)) {
    if (allowed.has(k) && v !== null && v !== "" && typeof v !== "undefined") out[k] = v;
  }
  return Object.keys(out).length ? out : undefined;
}

interface RawPassage {
  title?: string;
  passage?: string;
  blanks?: Array<{ no?: number; answer?: string; category?: string; fine_category?: string; facets?: unknown; analysis?: string; solve?: string }>;
}

function normalizePassage(p: RawPassage, idx: number) {
  const title = (p.title && String(p.title).trim()) || `未命名 ${idx + 1}`;
  let passage = p.passage || "";
  const blanks = (Array.isArray(p.blanks) ? p.blanks : []).map((b, i) => {
    const category = VALID_CATEGORIES.has(b.category as string) ? (b.category as string) : (b.category || "word");
    return {
      no: typeof b.no === "number" ? b.no : i + 1,
      answer: (b.answer || "?").toString().trim(),
      category,
      // fine_category：AI 选错或没选时静默丢弃（前端 Task #8 已 fallback 到 trap/focus）
      fine_category: VALID_FINE_CATEGORIES.has(b.fine_category as string) ? (b.fine_category as string) : undefined,
      // facets：按 category 清洗，只留合法键；非法/缺失静默丢弃（与题库同结构）
      facets: sanitizeFacets(category, b.facets),
      analysis: (b.analysis || "").toString().trim(),
      solve: (b.solve || "").toString().trim(),
    };
  });

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

    if (!DEEPSEEK_API_KEY) {
      return new Response(JSON.stringify({ error: "AI 解析服务未配置，请联系管理员。" }), {
        status: 500,
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
    if (text.length > MAX_PARSE_TEXT_CHARS) {
      return new Response(JSON.stringify({ error: `文本过长，请分成多次上传（最多 ${MAX_PARSE_TEXT_CHARS} 字符）。` }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 限流：每用户每日调用/字符额度上限，超额 429（防滥用烧钱）
    const { data: rl } = await supabase.rpc("consume_ai_quota", { p_user_id: user.id, p_est_chars: text.length });
    if (rl && rl.allowed === false) {
      return new Response(JSON.stringify({ error: "今日 AI 使用已达上限，请明天再试。" }), {
        status: 429,
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
        error: "AI 返回的内容无法解析为 JSON，请稍后重试或换更清晰的格式。",
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
      error: "服务器开小差了，请稍后再试。",
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
