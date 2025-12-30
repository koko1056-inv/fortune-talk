import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

interface RequestBody {
  messages: Message[];
  agentType: string;
  userProfile?: {
    displayName?: string;
    birthDate?: string;
    zodiacSign?: string;
    bloodType?: string;
  };
  generateChoices?: boolean;
}

const getAgentSystemPrompt = (agentType: string, userProfile?: RequestBody["userProfile"]) => {
  const profileInfo = userProfile ? `
【相談者のプロフィール情報】
${userProfile.displayName ? `名前: ${userProfile.displayName}` : ""}
${userProfile.birthDate ? `生年月日: ${userProfile.birthDate}` : ""}
${userProfile.zodiacSign ? `星座: ${userProfile.zodiacSign}` : ""}
${userProfile.bloodType ? `血液型: ${userProfile.bloodType}型` : ""}

この情報を参考にして、パーソナライズされた占いを提供してください。
` : "";

  const basePrompts: Record<string, string> = {
    "タロット占い師": `あなたは経験豊富なタロット占い師です。タロットカードを使って相談者の質問に答えます。
神秘的で優しい口調で話し、具体的なカードの名前とその意味を説明しながら占いを進めてください。
相談者の悩みに寄り添いながら、前向きなアドバイスを心がけてください。`,
    "四柱推命占い師": `あなたは四柱推命の専門家です。生年月日から運命を読み解きます。
東洋占術の知識を活かし、相談者の運勢、相性、適職などについて詳しくアドバイスしてください。
伝統的で落ち着いた口調で、深い洞察を提供してください。`,
    "西洋占星術師": `あなたは西洋占星術の専門家です。星座とホロスコープを使って占います。
惑星の配置や星座の特性を説明しながら、相談者の運勢をお伝えください。
宇宙的で神秘的な雰囲気を大切にしてください。`,
    "default": `あなたは優しい占い師です。相談者の悩みに寄り添い、前向きなアドバイスを提供してください。
神秘的で温かみのある口調で話し、相談者が希望を持てるような言葉をかけてください。`,
  };

  const basePrompt = basePrompts[agentType] || basePrompts["default"];

  return `${basePrompt}

${profileInfo}

重要なルール:
- 常に日本語で回答してください
- 占いの結果は具体的で前向きな内容にしてください
- 相談者の質問や選択に基づいて、パーソナライズされた回答を心がけてください
- 回答は100-200文字程度で簡潔にまとめてください`;
};

const generateChoicesPrompt = `
あなたの回答の最後に、必ず以下のJSON形式で次の選択肢を3つ提案してください：
---CHOICES---
{"choices": ["選択肢1", "選択肢2", "選択肢3"]}
---END---

選択肢は相談者が次に聞きたいであろう質問や話題を予測して作成してください。
例: {"choices": ["恋愛運について詳しく", "仕事運を教えて", "今月の運勢は？"]}
`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, agentType, userProfile, generateChoices = true }: RequestBody = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = getAgentSystemPrompt(agentType, userProfile) + 
      (generateChoices ? generateChoicesPrompt : "");

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
          ...messages,
        ],
        stream: false,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "リクエスト制限に達しました。しばらく待ってから再試行してください。" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "利用制限に達しました。" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    // Parse choices from the response
    let mainContent = content;
    let choices: string[] = [];

    const choicesMatch = content.match(/---CHOICES---\s*([\s\S]*?)\s*---END---/);
    if (choicesMatch) {
      mainContent = content.replace(/---CHOICES---[\s\S]*?---END---/, "").trim();
      try {
        const choicesJson = JSON.parse(choicesMatch[1].trim());
        choices = choicesJson.choices || [];
      } catch (e) {
        console.error("Failed to parse choices:", e);
      }
    }

    return new Response(JSON.stringify({ 
      content: mainContent,
      choices,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("fortune-chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
