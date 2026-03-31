import { useState, useEffect } from "react";
import { ConstellationIcon, MoonStarIcon, SparkleIcon } from "./OnboardingIcons";

interface Props {
  isGenerating: boolean;
  hasError: boolean;
  onRetry: () => void;
  displayName: string;
}

const phases = [
  { text: "星の配置を読み取っています", Icon: ConstellationIcon },
  { text: "運命の糸を紐解いています", Icon: MoonStarIcon },
  { text: "あなたの物語を見つけています", Icon: SparkleIcon },
];

const OnboardingGenerating = ({ isGenerating, hasError, onRetry, displayName }: Props) => {
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [dots, setDots] = useState("");

  useEffect(() => {
    if (!isGenerating) return;
    const interval = setInterval(() => {
      setPhaseIndex((prev) => (prev + 1) % phases.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [isGenerating]);

  useEffect(() => {
    if (!isGenerating) return;
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 500);
    return () => clearInterval(interval);
  }, [isGenerating]);

  const phase = phases[phaseIndex];

  if (hasError) {
    return (
      <div className="flex flex-col items-center text-center min-h-[50vh] justify-center">
        <svg className="w-14 h-14 mb-6 text-muted-foreground" viewBox="0 0 48 48" fill="none">
          <circle cx="24" cy="24" r="18" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
          <path d="M16 28C18 26 20 25 24 25C28 25 30 26 32 28" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
          <circle cx="17" cy="19" r="2" fill="currentColor" opacity="0.4" />
          <circle cx="31" cy="19" r="2" fill="currentColor" opacity="0.4" />
        </svg>
        <h2 className="text-xl font-display font-semibold text-foreground mb-3">
          接続に問題が発生しました
        </h2>
        <p className="text-sm text-muted-foreground mb-8">
          もう一度お試しください
        </p>
        <button
          onClick={onRetry}
          className="px-8 py-3 rounded-full bg-accent text-accent-foreground font-semibold tracking-wider shadow-[0_0_20px_hsl(45_80%_55%/0.3)] transition-all active:scale-95"
        >
          再試行
        </button>
      </div>
    );
  }

  const PhaseIcon = phase.Icon;

  return (
    <div className="flex flex-col items-center text-center min-h-[60vh] justify-center">
      {/* Animated orb */}
      <div className="relative mb-10">
        <div className="absolute inset-0 w-32 h-32 rounded-full bg-primary/20 blur-2xl animate-pulse" />
        <div className="relative w-32 h-32 rounded-full bg-gradient-to-br from-primary/30 via-card to-primary/10 border border-accent/20 flex items-center justify-center shadow-[0_0_40px_hsl(280_70%_50%/0.3)]">
          <PhaseIcon className="w-14 h-14 transition-all duration-500" />
        </div>

        {/* Orbiting particles */}
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-accent/60"
            style={{
              animation: `orbit ${3 + i}s linear infinite`,
              animationDelay: `${i * 1}s`,
              top: "50%",
              left: "50%",
            }}
          />
        ))}
      </div>

      <p className="text-lg text-foreground/80 font-display mb-2 transition-all duration-500">
        {phase.text}{dots}
      </p>
      <p className="text-sm text-muted-foreground">
        {displayName}さんの星を深く読んでいます
      </p>

      <style>{`
        @keyframes orbit {
          0% { transform: rotate(0deg) translateX(80px) rotate(0deg) scale(1); opacity: 0.6; }
          50% { opacity: 1; transform: rotate(180deg) translateX(80px) rotate(-180deg) scale(1.3); }
          100% { transform: rotate(360deg) translateX(80px) rotate(-360deg) scale(1); opacity: 0.6; }
        }
      `}</style>
    </div>
  );
};

export default OnboardingGenerating;
