import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RequestBody {
  query: string;
  matchThreshold?: number;
  matchCount?: number;
}

// Generate embedding using Lovable AI gateway
async function generateEmbedding(text: string, apiKey: string): Promise<number[] | null> {
  try {
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `あなたはテキストを384次元の数値ベクトルに変換するエキスパートです。
入力されたテキストの意味的特徴を捉えた384個の浮動小数点数（-1から1の範囲）をJSON配列として返してください。
同様のトピックや感情を持つテキストは類似したベクトルになるようにしてください。
必ず384個の数値を含むJSON配列のみを返してください。他のテキストは含めないでください。`
          },
          {
            role: "user",
            content: `以下のテキストを384次元のベクトルに変換してください:\n\n${text}`
          }
        ],
        stream: false,
      }),
    });

    if (!response.ok) {
      console.error("Embedding generation failed:", response.status);
      return null;
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    // Parse the JSON array from response
    const arrayMatch = content.match(/\[[\s\S]*\]/);
    if (arrayMatch) {
      const embedding = JSON.parse(arrayMatch[0]);
      if (Array.isArray(embedding) && embedding.length === 384) {
        // Normalize the embedding
        const magnitude = Math.sqrt(embedding.reduce((sum: number, val: number) => sum + val * val, 0));
        return embedding.map((val: number) => val / magnitude);
      }
    }
    
    console.error("Invalid embedding format");
    return null;
  } catch (error) {
    console.error("Error generating embedding:", error);
    return null;
  }
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

    const { query, matchThreshold = 0.5, matchCount = 5 }: RequestBody = await req.json();

    if (!query || query.trim().length === 0) {
      return new Response(JSON.stringify({ 
        success: true, 
        context: "",
        matches: [] 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Generate embedding for the query
    const queryEmbedding = await generateEmbedding(query, LOVABLE_API_KEY);

    if (!queryEmbedding) {
      // Fallback to recent insights if embedding fails
      const { data: recentInsights } = await supabaseClient
        .from("conversation_insights")
        .select("*")
        .eq("user_id", user.id)
        .order("session_date", { ascending: false })
        .limit(matchCount);

      const fallbackContext = formatInsightsAsContext(recentInsights || []);
      
      return new Response(JSON.stringify({ 
        success: true, 
        context: fallbackContext,
        matches: recentInsights || [],
        fallback: true
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Use service role to call the match function
    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Call the vector similarity search function
    const { data: matches, error: matchError } = await serviceClient.rpc(
      "match_conversation_insights",
      {
        query_embedding: queryEmbedding,
        match_threshold: matchThreshold,
        match_count: matchCount,
        p_user_id: user.id,
      }
    );

    if (matchError) {
      console.error("Match error:", matchError);
      throw new Error("Failed to search insights");
    }

    // Format matches as context string
    const context = formatInsightsAsContext(matches || []);

    return new Response(JSON.stringify({ 
      success: true, 
      context,
      matches: matches || [],
      matchCount: matches?.length || 0
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("search-relevant-insights error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

interface InsightMatch {
  id: string;
  summary: string;
  topics: string[];
  key_concerns: string[];
  advice_given: string[];
  agent_name: string;
  session_date: string;
  similarity?: number;
}

function formatInsightsAsContext(insights: InsightMatch[]): string {
  if (!insights || insights.length === 0) return "";

  const contextParts: string[] = [];
  
  insights.forEach((insight, index) => {
    const date = new Date(insight.session_date).toLocaleDateString('ja-JP');
    const similarityInfo = insight.similarity 
      ? `（関連度: ${Math.round(insight.similarity * 100)}%）` 
      : "";
    
    contextParts.push(`【過去の相談 ${index + 1}${similarityInfo}】`);
    contextParts.push(`日付: ${date}・担当: ${insight.agent_name}`);
    contextParts.push(`要約: ${insight.summary}`);
    
    if (insight.topics && insight.topics.length > 0) {
      contextParts.push(`テーマ: ${insight.topics.join('、')}`);
    }
    
    if (insight.key_concerns && insight.key_concerns.length > 0) {
      contextParts.push(`悩み: ${insight.key_concerns.join('、')}`);
    }
    
    if (insight.advice_given && insight.advice_given.length > 0) {
      contextParts.push(`アドバイス: ${insight.advice_given.join('、')}`);
    }
    
    contextParts.push('');
  });

  return contextParts.join('\n');
}
