import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Authorization required' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get user profile for personalized fortune
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('display_name, zodiac_sign, blood_type')
      .eq('user_id', user.id)
      .maybeSingle();

    // Check if fortune already exists for today
    const today = new Date().toISOString().split('T')[0];
    const { data: existingFortune } = await supabaseClient
      .from('daily_fortunes')
      .select('*')
      .eq('user_id', user.id)
      .eq('fortune_date', today)
      .maybeSingle();

    if (existingFortune) {
      console.log('Returning existing fortune for today');
      return new Response(JSON.stringify(existingFortune), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Generate new fortune using Lovable AI
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const zodiacInfo = profile?.zodiac_sign ? `星座: ${profile.zodiac_sign}` : '';
    const bloodInfo = profile?.blood_type ? `血液型: ${profile.blood_type}` : '';
    const nameInfo = profile?.display_name ? `名前: ${profile.display_name}さん` : '';

    const systemPrompt = `あなたは神秘的で優しい占い師です。毎日の運勢を占います。
ユーザーの情報を元に、パーソナライズされた今日の運勢を日本語で提供してください。

以下のJSON形式で回答してください（JSONのみ、他のテキストは不要）：
{
  "content": "今日の運勢のメッセージ（100-150文字程度）",
  "lucky_color": "ラッキーカラー（日本語で）",
  "lucky_item": "ラッキーアイテム（日本語で）",
  "lucky_number": ラッキーナンバー（1-99の整数）,
  "overall_luck": 総合運（1-5の整数、5が最高）
}`;

    const userPrompt = `${nameInfo}
${zodiacInfo}
${bloodInfo}
今日（${today}）の運勢を占ってください。`;

    console.log('Generating fortune with AI...');

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', aiResponse.status, errorText);
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const aiContent = aiData.choices?.[0]?.message?.content;

    if (!aiContent) {
      throw new Error('No content from AI');
    }

    console.log('AI response:', aiContent);

    // Parse JSON from AI response
    let fortuneData;
    try {
      // Extract JSON from response (might be wrapped in markdown code blocks)
      const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        fortuneData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      // Fallback fortune
      fortuneData = {
        content: '今日は穏やかな一日になりそうです。心を落ち着けて過ごしましょう。',
        lucky_color: '青',
        lucky_number: Math.floor(Math.random() * 99) + 1,
        lucky_item: 'ハンカチ',
        overall_luck: 3,
      };
    }

    // Save fortune to database
    const { data: newFortune, error: insertError } = await supabaseClient
      .from('daily_fortunes')
      .insert({
        user_id: user.id,
        fortune_date: today,
        content: fortuneData.content,
        lucky_color: fortuneData.lucky_color,
        lucky_number: fortuneData.lucky_number,
        lucky_item: fortuneData.lucky_item,
        overall_luck: fortuneData.overall_luck,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Failed to save fortune:', insertError);
      throw insertError;
    }

    console.log('Fortune saved successfully');
    return new Response(JSON.stringify(newFortune), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in daily-fortune function:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
