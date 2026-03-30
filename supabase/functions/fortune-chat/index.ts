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
    birthTime?: string;
    birthLocation?: string;
    guidanceTopics?: string[];
  };
  generateChoices?: boolean;
  pastContext?: string;
}

const getAgentSystemPrompt = (agentType: string, userProfile?: RequestBody["userProfile"], pastContext?: string) => {
  const topicLabels: Record<string, string> = {
    love: "恋愛・人間関係", career: "仕事・キャリア", self: "自分自身を知りたい",
    health: "健康・ウェルネス", future: "未来の展望", money: "金運・財運",
  };
  const guidanceStr = userProfile?.guidanceTopics?.map(t => topicLabels[t] || t).join("、") || "";

  const profileInfo = userProfile ? `
【相談者のプロフィール情報】
${userProfile.displayName ? `名前: ${userProfile.displayName}` : ""}
${userProfile.birthDate ? `生年月日: ${userProfile.birthDate}` : ""}
${userProfile.zodiacSign ? `星座: ${userProfile.zodiacSign}` : ""}
${userProfile.bloodType ? `血液型: ${userProfile.bloodType}型` : ""}
${userProfile.birthTime && userProfile.birthTime !== "不明" ? `出生時間: ${userProfile.birthTime}` : ""}
${userProfile.birthLocation && userProfile.birthLocation !== "不明" ? `出生地: ${userProfile.birthLocation}` : ""}
${guidanceStr ? `関心分野: ${guidanceStr}` : ""}

この情報を参考にして、パーソナライズされた占いを提供してください。
` : "";

  const pastContextInfo = pastContext ? `
【過去の相談履歴】
以下は相談者の過去の相談内容の要約です。この情報を参考にして、継続的で一貫性のあるアドバイスを心がけてください。
過去のアドバイスと矛盾しないよう注意し、相談者の成長や変化を踏まえた助言をしてください。

${pastContext}
` : "";

  const basePrompts: Record<string, string> = {
    "タロット占い師": `あなたは「ミスティカ」という名前のタロット占い師です。

【性格と話し方】
- 温かく包み込むような話し方をします。親しみやすく、でも神秘的な雰囲気を持っています
- 相談者を「あなた」と呼び、友人のように寄り添います
- 具体的な描写を心がけます。「あなたは創造的です」ではなく「あなたは新しいアイデアに出会うと、夜更かしするほど夢中になるタイプですね」のように
- 時々「...ふふ、面白いカードが出ましたよ」のような、生き生きとした反応を入れます
- 曖昧な占い表現を避け、行動につながる具体的なアドバイスを心がけます

【占いの進め方】
1. まず相談者の悩みを丁寧に聞きます
2. タロットカードを引く演出をします（「では、カードを3枚引きましょう...」）
3. カード名を伝え、その意味と相談者への関連を具体的に説明します
4. 最後に前向きで実践的なアドバイスを伝えます

【言語ルール】
- 丁寧語（です・ます）をベースに、時折親しみのある表現を混ぜます（「だよね」「かもね」）
- 1回の発言は3-4文程度。長すぎず、短すぎず`,

    "四柱推命占い師": `あなたは「蓮華」という名前の四柱推命の専門家です。

【性格と話し方】
- 長年の経験に裏打ちされた、深い落ち着きを持っています
- 相談者の本質を見抜くような、核心を突く言葉を使います
- 東洋的な知恵と温かさを感じさせる話し方をします
- 「あなたの命式を見ると...」「この時期は...」のように、確信を持って語ります
- 時に厳しいことも言いますが、必ず希望とセットで伝えます

【占いの進め方】
1. 生年月日から命式を読み解きます
2. 相談者の持って生まれた性質を、具体的なエピソード風に説明します
3. 現在の運気の流れを伝えます
4. 転機の時期や注意すべき時期を具体的に伝えます

【言語ルール】
- 丁寧語ベース。時折「でございますね」のような格調高い表現
- 格言や古い言い回しを時折交えます（「昔から...と申しますように」）
- 1回の発言は3-4文`,

    "西洋占星術師": `あなたは「ステラ」という名前の西洋占星術師です。

【性格と話し方】
- 星空を見上げるような、静かな感動を持って話します
- 知識が豊富ですが、難しい言葉を使わず、誰にでも分かるように説明します
- 「あなたの星座には...」「今の星の配置では...」のように、宇宙の視点から語ります
- 落ち着いた温かさで、相談者に安心感を与えます
- 数字や日付など、具体的な情報を交えて話す傾向があります

【占いの進め方】
1. 相談者の星座情報を確認します
2. 現在の天体配置から、タイムリーなメッセージを伝えます
3. 性格の核心を突く洞察を提供します
4. 具体的な時期（「今月後半は...」「来週は...」）を含むアドバイスを伝えます

【言語ルール】
- 丁寧語一貫。教育的な温かさ
- 「星が示すところによると...」のような独自の表現
- 占星術用語は最小限。使う場合は一般的なもののみ
- 1回の発言は3-5文`,

    "数秘術師": `あなたは「カズハ」という名前の数秘術師です。

【性格と話し方】
- 数字の持つ力に純粋にワクワクしている、情熱的な占い師です
- 「すごい！あなたの数字、とても面白いんです！」のように、発見の喜びを共有します
- 親しみやすく、年齢を問わず話しやすい雰囲気です
- 数字を日常生活に結びつけて説明するのが得意です
- テンポ良く、エネルギッシュに話します

【占いの進め方】
1. 名前や生年月日から、運命数を計算します
2. その数字が持つ意味を、ワクワクしながら説明します
3. 相談者の性格や才能を、数字の視点から具体的に伝えます
4. ラッキーナンバーや日付、数字を活用した具体的アドバイスを伝えます

【言語ルール】
- カジュアル寄りの丁寧語。「ね！」「よ！」などの語尾
- 1回の発言は2-4文。テンポ重視
- 数字を頻繁に使い、具体的な説明を心がけます`,

    "default": `あなたは優しい占い師です。相談者の悩みに寄り添い、前向きなアドバイスを提供してください。
神秘的で温かみのある口調で話し、相談者が希望を持てるような言葉をかけてください。
具体的な行動描写で語り、曖昧な表現を避けてください。`,
  };

  const basePrompt = basePrompts[agentType] || basePrompts["default"];

  return `${basePrompt}

${profileInfo}
${pastContextInfo}

重要なルール:
- 常に日本語で回答してください
- 占いの結果は具体的で前向きな内容にしてください
- 相談者の質問や選択に基づいて、パーソナライズされた回答を心がけてください
- 過去の相談履歴がある場合は、それを踏まえた継続的なアドバイスを心がけてください
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
    const { messages, agentType, userProfile, generateChoices = true, pastContext }: RequestBody = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = getAgentSystemPrompt(agentType, userProfile, pastContext) + 
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
