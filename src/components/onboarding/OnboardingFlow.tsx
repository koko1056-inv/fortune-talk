import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import StarField from "@/components/StarField";
import { useAuth } from "@/hooks/useAuth";
import { useProfile, calculateZodiacSign } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import OnboardingWelcome from "./OnboardingWelcome";
import OnboardingName from "./OnboardingName";
import OnboardingBirthDate from "./OnboardingBirthDate";
import OnboardingBirthTime from "./OnboardingBirthTime";
import OnboardingBirthLocation from "./OnboardingBirthLocation";
import OnboardingGuidance from "./OnboardingGuidance";
import OnboardingGenerating from "./OnboardingGenerating";
import OnboardingReading from "./OnboardingReading";
import OnboardingComplete from "./OnboardingComplete";

export interface OnboardingData {
  displayName: string;
  birthDate: string;
  birthTime: string;
  birthLocation: string;
  guidanceTopics: string[];
  zodiacSign: string;
}

interface ReadingResult {
  summary: string;
  personalityTraits: string[];
  birthChartData: {
    sunSign: string;
    element: string;
    dominantTraits: string[];
  };
}

const TOTAL_STEPS = 9;

const OnboardingFlow = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { updateProfile } = useProfile();
  const [step, setStep] = useState(0);
  const [data, setData] = useState<OnboardingData>({
    displayName: "",
    birthDate: "",
    birthTime: "",
    birthLocation: "",
    guidanceTopics: [],
    zodiacSign: "",
  });
  const [readingResult, setReadingResult] = useState<ReadingResult | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState(false);

  const updateData = useCallback((updates: Partial<OnboardingData>) => {
    setData((prev) => {
      const next = { ...prev, ...updates };
      // Auto-calc zodiac when birth date changes
      if (updates.birthDate) {
        next.zodiacSign = calculateZodiacSign(updates.birthDate);
      }
      return next;
    });
  }, []);

  const nextStep = useCallback(() => {
    setStep((s) => Math.min(s + 1, TOTAL_STEPS - 1));
  }, []);

  const prevStep = useCallback(() => {
    setStep((s) => Math.max(s - 1, 0));
  }, []);

  const generateReading = useCallback(async () => {
    if (!user) return;
    setIsGenerating(true);
    setGenerateError(false);

    try {
      // Save basic profile first
      await updateProfile({
        display_name: data.displayName,
        birth_date: data.birthDate,
        zodiac_sign: data.zodiacSign,
      } as any);

      let result: ReadingResult | null = null;

      // Try dedicated edge function first
      try {
        const { data: edgeResult, error } = await supabase.functions.invoke(
          "generate-onboarding-reading",
          {
            body: {
              birthDate: data.birthDate,
              birthTime: data.birthTime || undefined,
              birthLocation: data.birthLocation || undefined,
              guidanceTopics: data.guidanceTopics,
              displayName: data.displayName,
              zodiacSign: data.zodiacSign,
            },
          }
        );
        if (!error && edgeResult?.summary) {
          result = edgeResult;
        }
      } catch (edgeErr) {
        console.warn("generate-onboarding-reading unavailable, using fallback:", edgeErr);
      }

      // Fallback: use fortune-chat edge function
      if (!result) {
        const topicLabels: Record<string, string> = {
          love: "恋愛", career: "仕事", self: "自己理解",
          health: "健康", future: "未来", money: "金運",
        };
        const topics = data.guidanceTopics.map((t) => topicLabels[t] || t).join("、");
        const prompt = `以下の人物のパーソナリティを、占い用語を一切使わず、具体的な行動パターンの描写で3-4段落で分析してください。曖昧な表現は禁止。

名前: ${data.displayName}
生年月日: ${data.birthDate}
星座: ${data.zodiacSign}
${data.birthTime && data.birthTime !== "不明" ? `出生時間: ${data.birthTime}` : ""}
${data.birthLocation && data.birthLocation !== "不明" ? `出生地: ${data.birthLocation}` : ""}
関心分野: ${topics}

回答形式: 「あなたは...」で始め、行動レベルの具体描写で語ってください。`;

        const { data: chatResult, error: chatError } = await supabase.functions.invoke(
          "fortune-chat",
          {
            body: {
              messages: [{ role: "user", content: prompt }],
              agentType: "default",
              generateChoices: false,
            },
          }
        );

        if (chatError) throw chatError;

        result = {
          summary: chatResult?.content || "",
          personalityTraits: [],
          birthChartData: {
            sunSign: data.zodiacSign,
            element: "",
            dominantTraits: [],
          },
        };
      }

      setReadingResult(result);
      setStep(7);
    } catch (err) {
      console.error("Failed to generate reading:", err);
      setGenerateError(true);
    } finally {
      setIsGenerating(false);
    }
  }, [user, data, updateProfile]);

  const handleComplete = useCallback(() => {
    navigate("/");
  }, [navigate]);

  const handleGoToPaywall = useCallback(() => {
    // Navigate to paywall (can be changed to show inline paywall)
    navigate("/?showPaywall=true");
  }, [navigate]);

  const progress = step / (TOTAL_STEPS - 1);

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      <StarField />

      {/* Progress indicator */}
      {step > 0 && step < 7 && (
        <div className="absolute top-8 left-0 right-0 z-20 flex justify-center">
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className={`transition-all duration-500 rounded-full ${
                  i <= step
                    ? "w-2.5 h-2.5 bg-accent shadow-[0_0_8px_hsl(45_80%_55%/0.6)]"
                    : i === step + 1
                    ? "w-2 h-2 bg-accent/40"
                    : "w-1.5 h-1.5 bg-muted-foreground/20"
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Step content */}
      <div className="relative z-10 w-full max-w-md px-6">
        {step === 0 && <OnboardingWelcome onNext={nextStep} />}
        {step === 1 && (
          <OnboardingName
            value={data.displayName}
            onChange={(v) => updateData({ displayName: v })}
            onNext={nextStep}
            onBack={prevStep}
          />
        )}
        {step === 2 && (
          <OnboardingBirthDate
            value={data.birthDate}
            zodiacSign={data.zodiacSign}
            onChange={(v) => updateData({ birthDate: v })}
            onNext={nextStep}
            onBack={prevStep}
          />
        )}
        {step === 3 && (
          <OnboardingBirthTime
            value={data.birthTime}
            onChange={(v) => updateData({ birthTime: v })}
            onNext={nextStep}
            onBack={prevStep}
          />
        )}
        {step === 4 && (
          <OnboardingBirthLocation
            value={data.birthLocation}
            onChange={(v) => updateData({ birthLocation: v })}
            onNext={nextStep}
            onBack={prevStep}
          />
        )}
        {step === 5 && (
          <OnboardingGuidance
            value={data.guidanceTopics}
            onChange={(v) => updateData({ guidanceTopics: v })}
            onNext={() => {
              nextStep();
              // Start generation when entering step 6
              setTimeout(generateReading, 500);
            }}
            onBack={prevStep}
          />
        )}
        {step === 6 && (
          <OnboardingGenerating
            isGenerating={isGenerating}
            hasError={generateError}
            onRetry={generateReading}
            displayName={data.displayName}
          />
        )}
        {step === 7 && readingResult && (
          <OnboardingReading
            result={readingResult}
            zodiacSign={data.zodiacSign}
            displayName={data.displayName}
            onNext={nextStep}
          />
        )}
        {step === 8 && (
          <OnboardingComplete
            displayName={data.displayName}
            onStart={handleComplete}
            onSubscribe={handleGoToPaywall}
          />
        )}
      </div>
    </div>
  );
};

export default OnboardingFlow;
