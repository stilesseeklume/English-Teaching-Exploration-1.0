// Supabase Edge Function: DeepSeek 翻译英文短文为中文
// 保留段落结构，保留 ___N___ 空格标记不动

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const DEEPSEEK_API_KEY = Deno.env.get("DEEPSEEK_API_KEY") || "";
const DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `你是一名专业的英中翻译助手。你的唯一任务是将英文短文翻译为流畅的中文。

## 翻译规则

1. 保留原文的段落结构（段落数一致）
2. 保留所有 ___数字___ 格式的空格标记，原样不动
3. 人名、地名、专有名词保留原文或使用通用译名
4. 翻译通顺自然，符合中文表达习惯
5. 不要添加任何解释、注释或额外文字

## 输出格式

只输出中文译文，不要加任何前缀、后缀或 Markdown 标记。每个段落之间用空行分隔。`;

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
      return new Response(JSON.stringify({ error: "文本内容太短，无法翻译" }), {
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
        temperature: 0.3,
        max_tokens: 4096,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: `请翻译以下英文短文：\n\n---\n${text}\n---` },
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
    const chinese = deepseekData?.choices?.[0]?.message?.content || "";

    if (!chinese) {
      console.error("DeepSeek returned empty content:", JSON.stringify(deepseekData));
      return new Response(JSON.stringify({
        error: "AI 未返回翻译内容，请稍后重试。",
      }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ chinese: chinese.trim() }), {
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
