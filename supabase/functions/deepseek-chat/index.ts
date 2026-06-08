// Supabase Edge Function: Lesson Snippets AI 助手
// 角色：A 客服式 + B 助教式（高考英语语法填空）
// 严格圈定范围，不做通用 ChatGPT

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.10";

const DEEPSEEK_API_KEY = Deno.env.get("DEEPSEEK_API_KEY") || "";
const DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions";
const MAX_CHAT_HISTORY = 20;
const MAX_CHAT_MESSAGE_CHARS = 2000;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `你是 Lesson Snippets 的助手。Lesson Snippets 是一个由一名英语新老师做的高中英语语法填空教学小工具，主要给一线英语老师和学生用。

## 你的职责严格限定在两件事

**A · 客服式**：帮用户使用这个网站
- 比如「错题本怎么删一道题？」「上传 Word 后没反应是怎么回事？」「迁移训练能切换数据源吗？」「管理员账号怎么登录？」
- 当前网站功能简述：
  · 按套卷练习（20 套真题/模拟卷，2023–2026）
  · 按考点练习（11 个考点：谓语、非谓语、词性、数词、冠词、代词、介词、逻辑连词、定从、名从、状从）
  · 错题本（手动添加、JSON 批量导入、Word 上传 AI 解析）
  · 备课资料（导入完整篇章进入讲题模式）
  · 讲题模式（点空格弹解析、迁移训练、考点速查）
  · 上传 Word：用「📄 上传 Word（自动归档·勾选错题）」按钮 → AI 解析 → 弹面板勾选哪几题是高频错题 → 整篇进备课资料 + 勾选的题进错题本
  · 迁移训练：抽屉「🔗 迁移训练」标签里 segmented 切换"真题库 / 我的错题 / 全部"

**B · 助教式**：解答高考英语语法填空相关问题
- 比如「whose 和 which 的区别？」「这里为什么用 grown 不用 grew？」「定语从句怎么判断成分？」
- 11 个考点的解题思路、典型陷阱、常见错答

## 不参与的事

- 闲聊（天气、笑话、其他学科、生活建议）
- 其他英语题型（完形填空、阅读理解、读后续写、应用文）—— 这些模块还在路上
- 用户隐私、政治、健康等敏感话题
- 给其他网站推广、外部链接

如果用户问的不在你的范围内，**礼貌地说明**你只负责这两件事，并引导回到正题。例如：「这个我帮不上忙呢，我只负责 Lesson Snippets 的使用问题和语法填空的解题。要不试着问问其它？」

## 回答风格

- **简洁、直接**，不写废话，不堆砌套话
- 中文为主（用户用英文问，可以用英文答）
- 专业但温和，像一位经验丰富的同事
- 不确定时坦白说"这点我不太确定"，不要编造
- 涉及具体语法判断时，给清晰的理由 + 例句对比
- 客服问题给具体操作路径（点哪里、找哪个按钮）`;

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "仅支持 POST" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    // 鉴权：登录用户才能用
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "请先登录后再使用" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const token = authHeader.replace("Bearer ", "");

    // 用 getUser 校验 JWT 签名拿 user（不要手工解码未验签的 payload）。
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") || "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "",
    );
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "登录已过期，请重新登录" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!DEEPSEEK_API_KEY) {
      return new Response(JSON.stringify({ error: "AI 服务未配置，请联系管理员。" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const messages = Array.isArray(body.messages) ? body.messages : [];

    // 基本输入校验
    if (messages.length === 0) {
      return new Response(JSON.stringify({ error: "messages 不能为空" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    // 限制对话总长度，防止 token 爆炸。
    const trimmed = messages.slice(-MAX_CHAT_HISTORY).map((m: any) => ({
      role: m.role === "assistant" ? "assistant" : "user",
      content: String(m.content || "").slice(0, MAX_CHAT_MESSAGE_CHARS),
    }));

    // 限流：每用户每日调用/字符额度上限，超额 429（防滥用烧钱）
    const estChars = trimmed.reduce((sum: number, m: any) => sum + (m.content ? m.content.length : 0), 0);
    const { data: rl } = await supabase.rpc("consume_ai_quota", { p_user_id: user.id, p_est_chars: estChars });
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
        temperature: 0.5,
        max_tokens: 1200,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...trimmed,
        ],
      }),
    });

    if (!deepseekRes.ok) {
      const errText = await deepseekRes.text().catch(() => "");
      console.error("DeepSeek error:", deepseekRes.status, errText);
      return new Response(JSON.stringify({
        error: `AI 服务暂时不通（${deepseekRes.status}），稍后再试。`,
      }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const deepseekData = await deepseekRes.json();
    const content = deepseekData?.choices?.[0]?.message?.content || "";
    const usage = deepseekData?.usage || null;

    if (!content) {
      return new Response(JSON.stringify({ error: "AI 没有返回内容" }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ content: content, usage: usage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("Chat error:", err);
    return new Response(JSON.stringify({
      error: "服务器开小差了，请稍后再试。",
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
