// Supabase Edge Function: DeepSeek AI 智能解析语法填空 Word 文档
// 前端上传 .docx → mammoth.js 提取纯文本 → 此函数调 DeepSeek API → 返回结构化 JSON

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const DEEPSEEK_API_KEY = Deno.env.get("DEEPSEEK_API_KEY") || "";
const DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `你是一名专业的英语语法填空出题助手。你的唯一任务是从用户提供的文本中提取一篇英语语法填空题，并输出严格合法的 JSON。不要输出任何其他文字、注释或 Markdown 标记。

## 输出 JSON 结构（严格遵循，不得增删字段）

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

1. 【标题识别】文本开头的第一行（或前几行中的中文短句）通常为标题。如无标题，用 "无标题"。
2. 【空格识别】空白处可能表现为：下划线___、方框□、括号中提示词如 (give)、题号标注如 56.______、或直接空白。识别所有空格，按在文中出现的先后顺序从 1 开始连续编号。如果原题已有序号，优先使用原序号。
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

Deno.serve(async (req: Request) => {
  // CORS 预检
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  // 仅接受 POST
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "仅支持 POST 请求" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    // 验证 JWT
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

    // 解析请求体
    const body = await req.json();
    const { text } = body;

    if (!text || typeof text !== "string" || text.trim().length < 20) {
      return new Response(JSON.stringify({ error: "文本内容太短，无法解析。请确保 Word 文档包含英文段落。" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 调用 DeepSeek API
    const deepseekRes = await fetch(DEEPSEEK_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${DEEPSEEK_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        temperature: 0.1,
        max_tokens: 4096,
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
      console.error("DeepSeek returned empty content:", JSON.stringify(deepseekData));
      return new Response(JSON.stringify({
        error: "AI 未返回有效内容，请尝试用更清晰的格式重新提供文档。",
      }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 提取 JSON
    let parsed;
    try {
      const jsonStr = extractJSON(content);
      parsed = JSON.parse(jsonStr);
    } catch (e) {
      console.error("Failed to parse DeepSeek response:", content.substring(0, 500));
      return new Response(JSON.stringify({
        error: "AI 返回的内容无法解析为 JSON。请检查 Word 文档格式是否清晰，或尝试手动整理。",
        rawContent: content.substring(0, 500),
      }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 验证结构
    if (!parsed.title || !parsed.passage || !Array.isArray(parsed.blanks)) {
      return new Response(JSON.stringify({
        error: "AI 返回的数据缺少必要字段（title/passage/blanks）。",
        rawResult: JSON.stringify(parsed),
      }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 整理 blanks，确保字段完整 + 分类代码合法
    parsed.blanks = parsed.blanks.map((b: any, i: number) => ({
      no: b.no ?? (i + 1),
      answer: (b.answer || "?").trim(),
      category: VALID_CATEGORIES.has(b.category) ? b.category : (b.category || "word"),
      analysis: (b.analysis || "").trim(),
    }));

    // 如果 passage 中没有 ___N___ 标记，尝试从 blanks 自动补标记（兜底）
    if (!parsed.passage.match(/___\d+___/)) {
      console.warn("Passage has no blank markers, returning as-is");
    }

    return new Response(JSON.stringify(parsed), {
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
