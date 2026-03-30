import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.87.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RequestBody {
  birthDate: string;
  birthTime?: string;
  birthLocation?: string;
  guidanceTopics: string[];
  displayName: string;
  zodiacSign?: string;
}

const buildSystemPrompt = (body: RequestBody) => {
  const topicLabels: Record<string, string> = {
    love: "恋愛・人間関係",
    career: "仕事・キャリア",
    self: "自分自身を知りたい",
    health: "健康・ウェルネス",
    future: "未来の展望",
    money: "金運・財運",
  };

  const topics = body.guidanceTopics.map(t => topicLabels[t] || t).join("、");

  return `あなたは卓越した洞察力を持つパーソナリティ・リーダーです。占い用語は一切使わず、心理学的な洞察と行動パターンの分析に基づいて、相談者の核心的な性格特性を驚くほど具体的に描写します。

【相談者の情報】
名前: ${body.displayName}
生年月日: ${body.birthDate}
${body.birthTime && body.birthTime !== "不明" ? `出生時間: ${body.birthTime}` : ""}
${body.birthLocation ? `出生地: ${body.birthLocation}` : ""}
${body.zodiacSign ? `星座: ${body.zodiacSign}` : ""}
関心分野: ${topics}

【出力ルール】
以下のJSON形式で厳密に出力してください。他のテキストは一切含めないでください。

{
  "summary": "3-4段落のパーソナリティ分析。以下のルールに従うこと：\\n\\n第1段落：最も特徴的な性格特性を超具体的に描写。例：「新しいプロジェクトに出会うと夜更かしするほど夢中になるけれど、8割完成したあたりで次の面白いことに目が移りがちなタイプ」のように。\\n\\n第2段落：人間関係における独特のパターン。共感力や距離感の取り方など、本人が「そう、まさにそれ！」と思うような具体的な行動描写。\\n\\n第3段落：関心分野（${topics}）に関する具体的な洞察。\\n\\n第4段落：前向きで力を与えるメッセージ。抽象的な励ましではなく、その人の具体的な強みに言及。",
  "personalityTraits": ["特性1", "特性2", "特性3", "特性4", "特性5"],
  "birthChartData": {
    "sunSign": "太陽星座",
    "element": "属性（火/地/風/水）",
    "dominantTraits": ["支配的特性1", "支配的特性2", "支配的特性3"]
  }
}

【重要な制約】
- 曖昧な占い表現は絶対に禁止（「あなたは感受性が豊かです」→ NG）
- 代わりに行動レベルの具体描写を使う（「映画のラストシーンでいつも泣いてしまう一方で、現実の困難では驚くほど冷静に対処できる」→ OK）
- 全てのテキストは日本語で出力
- summaryは必ず${body.displayName}さんへの語りかけ形式（「あなたは...」で始める）
- personalityTraitsは短い（2-5単語の）タグ形式
- JSON以外の出力は一切禁止`;
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body: RequestBody = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = buildSystemPrompt(body);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `${body.displayName}のパーソナリティリーディングを生成してください。` },
        ],
        stream: false,
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    // Parse JSON from response (handle markdown code blocks)
    let parsed;
    try {
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, content];
      parsed = JSON.parse(jsonMatch[1]!.trim());
    } catch (e) {
      console.error("Failed to parse reading JSON:", e, content);
      // Fallback: use content as summary
      parsed = {
        summary: content,
        personalityTraits: [],
        birthChartData: { sunSign: body.zodiacSign || "", element: "", dominantTraits: [] },
      };
    }

    // Save to database if auth token provided
    const authHeader = req.headers.get("Authorization");
    if (authHeader) {
      try {
        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
        const supabase = createClient(supabaseUrl, supabaseKey);

        // Extract user from JWT
        const token = authHeader.replace("Bearer ", "");
        const { data: { user } } = await supabase.auth.getUser(token);

        if (user) {
          // Save onboarding reading
          await supabase.from("onboarding_readings").insert({
            user_id: user.id,
            birth_chart_data: parsed.birthChartData,
            personality_traits: parsed.personalityTraits,
            summary_text: parsed.summary,
          });

          // Update profile with onboarding data
          await supabase.from("profiles").update({
            birth_time: body.birthTime || null,
            birth_location: body.birthLocation || null,
            guidance_topics: body.guidanceTopics,
            onboarding_completed: true,
            personality_summary: parsed.summary,
          }).eq("user_id", user.id);
        }
      } catch (dbError) {
        console.error("DB save error (non-fatal):", dbError);
      }
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-onboarding-reading error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
