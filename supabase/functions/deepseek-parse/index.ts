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
          "category": "考点分类代码",
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

## 考点分类代码（11 类，必须从中选择）

predicate     = 谓语动词（时态、语态、主谓一致）
nonpredicate  = 非谓语动词（to do / doing / done / 独立主格）
word          = 词性转换（名/形/副/动转换）
number        = 数词（基数/序数/分数）
article       = 冠词（a / an / the）
pronoun       = 代词（人称/物主/反身/不定/指示）
preposition   = 介词（固定搭配 / 时间地点方式）
logic         = 逻辑连词（并列/转折/因果/递进）
attrib        = 定语从句连词（关系代词/关系副词）
nounclause    = 名词性从句连词（主/宾/表/同位语从句）
advclause     = 状语从句连词（时间/原因/条件/让步/目的/结果）

## 处理规则

1. 【标题识别】每篇开头的中文短句或英文标题为该篇 title。如无明显标题，用 "未命名"。
2. 【空格识别】空白处可能表现为：下划线___、方框□、括号中提示词如 (give)、题号标注如 56.______、或直接空白。识别所有空格，按在文中出现的先后顺序从 1 开始连续编号（每篇独立）。如果原题已有序号，优先使用原序号。
3. 【答案推断】如果原文本在题号后附有答案（如"56. dating"），直接使用。如果给出了括号中的提示词原形（如 (date)），根据语法语境变形后作为答案。如果无任何提示，根据语法知识推断最合理的答案。
4. 【passage 字段】将原文中所有识别出的空格替换为 ___{题号}___ 格式（如 ___36___）。保持原文其余部分不变（包括大小写、标点、换行）。
5. 【分类判断】每个空格必须仔细分析其考查的语法点，选择最匹配的分类代码。如果无法确定，根据以下优先级判断：
   - 考查动词形态变化 → predicate 或 nonpredicate
   - 考查给词根变形（加前缀/后缀）→ word
   - 考查填写冠词/介词/代词/连词 → 对应 article/preposition/pronoun/logic
   - 考查从句引导词 → attrib/nounclause/advclause
6. 【answer 字段】必须是确切的英文单词或短语，不含序号、中文、多余空格或标点。
7. 【analysis 字段】用中文写 30-60 字的解析，说明：①空格在句中的成分 ②语法判断依据 ③为什么是这个答案。

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
]);

interface RawPassage {
  title?: string;
  passage?: string;
  blanks?: Array<{ no?: number; answer?: string; category?: string; analysis?: string }>;
}

function normalizePassage(p: RawPassage, idx: number) {
  const title = (p.title && String(p.title).trim()) || `未命名 ${idx + 1}`;
  let passage = p.passage || "";
  const blanks = (Array.isArray(p.blanks) ? p.blanks : []).map((b, i) => ({
    no: typeof b.no === "number" ? b.no : i + 1,
    answer: (b.answer || "?").toString().trim(),
    category: VALID_CATEGORIES.has(b.category as string) ? (b.category as string) : (b.category || "word"),
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
        max_tokens: 8000,
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
