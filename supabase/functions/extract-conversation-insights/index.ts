import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Message {
  role: string;
  content: string;
}

interface RequestBody {
  sessionId: string;
  messages: Message[];
  agentName: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { sessionId, messages, agentName }: RequestBody = await req.json();

    if (!messages || messages.length < 2) {
      return new Response(JSON.stringify({ success: true, message: "Not enough messages to extract insights" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Format conversation for analysis
    const conversationText = messages
      .map(m => `${m.role === "user" ? "相談者" : "占い師"}: ${m.content}`)
      .join("\n");

    const extractionPrompt = `以下の占い相談の会話を分析し、JSON形式で情報を抽出してください。

会話内容:
${conversationText}

以下のJSON形式で回答してください（日本語で）:
{
  "summary": "会話の要約（100文字以内）",
  "keywords": ["キーワード1", "キーワード2", ...],
  "topics": ["恋愛", "仕事", "健康", "金運", "人間関係", "将来", "家族", "その他"],
  "key_concerns": ["相談者の主な悩みや関心事"],
  "advice_given": ["占い師が与えた主なアドバイス"]
}

topicsは該当するもののみを配列に含めてください。`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "あなたは会話分析の専門家です。与えられた会話から重要な情報を抽出し、指定されたJSON形式で返してください。必ず有効なJSONのみを返してください。" },
          { role: "user", content: extractionPrompt },
        ],
        stream: false,
      }),
    });

    if (!response.ok) {
      console.error("AI gateway error:", response.status);
      throw new Error("Failed to extract insights");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    // Parse the JSON from the response
    let insights;
    try {
      // Try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        insights = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.error("Failed to parse insights:", parseError, content);
      // Use default values if parsing fails
      insights = {
        summary: "会話の内容を分析できませんでした",
        keywords: [],
        topics: [],
        key_concerns: [],
        advice_given: [],
      };
    }

    // Save insights to database
    const { error: insertError } = await supabaseClient
      .from("conversation_insights")
      .insert({
        user_id: user.id,
        session_id: sessionId,
        summary: insights.summary || "",
        keywords: insights.keywords || [],
        topics: insights.topics || [],
        key_concerns: insights.key_concerns || [],
        advice_given: insights.advice_given || [],
        agent_name: agentName,
      });

    if (insertError) {
      console.error("Failed to save insights:", insertError);
      throw new Error("Failed to save insights");
    }

    return new Response(JSON.stringify({ success: true, insights }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("extract-conversation-insights error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
