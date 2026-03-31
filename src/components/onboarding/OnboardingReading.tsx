import { useState, useEffect } from "react";

interface ReadingResult {
  summary: string;
  personalityTraits: string[];
  birthChartData: {
    sunSign: string;
    element: string;
    dominantTraits: string[];
  };
}

interface Props {
  result: ReadingResult;
  zodiacSign: string;
  displayName: string;
  onNext: () => void;
}

const zodiacSymbol: Record<string, string> = {
  "牡羊座": "♈", "牡牛座": "♉", "双子座": "♊", "蟹座": "♋",
  "獅子座": "♌", "乙女座": "♍", "天秤座": "♎", "蠍座": "♏",
  "射手座": "♐", "山羊座": "♑", "水瓶座": "♒", "魚座": "♓",
};

const elementColors: Record<string, string> = {
  "火": "text-orange-400", "地": "text-emerald-400",
  "風": "text-sky-400", "水": "text-blue-400",
};

const OnboardingReading = ({ result, zodiacSign, displayName, onNext }: Props) => {
  const [revealedParagraphs, setRevealedParagraphs] = useState(0);
  const [showTraits, setShowTraits] = useState(false);
  const [showButton, setShowButton] = useState(false);

  const paragraphs = result.summary
    .split(/\n\n|\n/)
    .filter((p) => p.trim().length > 0);

  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];
    paragraphs.forEach((_, i) => {
      timers.push(setTimeout(() => setRevealedParagraphs(i + 1), 800 + i * 1500));
    });
    timers.push(setTimeout(() => setShowTraits(true), 800 + paragraphs.length * 1500));
    timers.push(setTimeout(() => setShowButton(true), 1500 + paragraphs.length * 1500));
    return () => timers.forEach(clearTimeout);
  }, [paragraphs.length]);

  return (
    <div className="flex flex-col items-center py-8 min-h-screen">
      {/* Header badge */}
      <div className="flex items-center gap-2 mb-6 px-4 py-2 rounded-full bg-accent/10 border border-accent/20">
        <span className="text-2xl text-accent">{zodiacSymbol[zodiacSign] || "★"}</span>
        <span className="text-accent text-sm font-medium">{zodiacSign}</span>
        {result.birthChartData.element && (
          <>
            <span className="text-muted-foreground/40">|</span>
            <span className={`text-sm ${elementColors[result.birthChartData.element] || "text-accent"}`}>
              {result.birthChartData.element}の属性
            </span>
          </>
        )}
      </div>

      {/* Reading title */}
      <h2 className="text-xl font-display font-semibold text-foreground mb-8 text-center">
        {displayName}さんの
        <span className="text-accent"> パーソナリティ</span>
      </h2>

      {/* Reading content */}
      <div className="w-full max-w-sm space-y-5 mb-8">
        {paragraphs.map((paragraph, i) => (
          <p
            key={i}
            className={`text-sm leading-relaxed text-foreground/85 transition-all duration-1000 ${
              i < revealedParagraphs
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4"
            }`}
          >
            {paragraph}
          </p>
        ))}
      </div>

      {/* Personality traits */}
      {showTraits && result.personalityTraits.length > 0 && (
        <div className="flex flex-wrap gap-2 justify-center mb-10 max-w-sm">
          {result.personalityTraits.map((trait, i) => (
            <span
              key={i}
              className="px-3 py-1.5 rounded-full bg-primary/15 border border-primary/20 text-xs text-foreground/70 animate-fade-in"
              style={{ animationDelay: `${i * 150}ms` }}
            >
              {trait}
            </span>
          ))}
        </div>
      )}

      {/* CTA */}
      {showButton && (
        <button
          onClick={onNext}
          className="px-10 py-3.5 rounded-full bg-accent text-accent-foreground font-semibold tracking-wider shadow-[0_0_20px_hsl(45_80%_55%/0.3)] hover:shadow-[0_0_30px_hsl(45_80%_55%/0.5)] transition-all active:scale-95 animate-fade-in"
        >
          もっと深く知る
        </button>
      )}
    </div>
  );
};

export default OnboardingReading;
