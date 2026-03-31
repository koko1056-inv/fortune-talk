import { useState, useEffect } from "react";
import { SunburstIcon } from "./OnboardingIcons";
import { Mic, Calendar, Layers, MessageSquare } from "lucide-react";

interface Props {
  displayName: string;
  onStart: () => void;
  onSubscribe: () => void;
}

const features = [
  { icon: Mic, label: "AI占い師との音声対話" },
  { icon: Calendar, label: "毎日のパーソナル運勢" },
  { icon: Layers, label: "4種の占術（タロット・占星術・四柱推命・数秘術）" },
  { icon: MessageSquare, label: "テキスト＆音声の2モード" },
];

const OnboardingComplete = ({ displayName, onStart, onSubscribe }: Props) => {
  const [show, setShow] = useState(false);
  useEffect(() => { setShow(true); }, []);

  return (
    <div
      className={`flex flex-col items-center text-center min-h-[60vh] justify-center transition-all duration-700 ${
        show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
    >
      <SunburstIcon className="w-16 h-16 mb-6" />

      <h2 className="text-2xl font-display font-semibold text-foreground mb-2">
        {displayName}さんの物語は
        <br />
        ここから始まります
      </h2>
      <p className="text-sm text-muted-foreground mb-8">
        あなた専用の占い体験をお楽しみください
      </p>

      {/* Feature list */}
      <div className="w-full max-w-xs space-y-3 mb-10">
        {features.map((f, i) => {
          const Icon = f.icon;
          return (
            <div
              key={i}
              className="flex items-center gap-3 text-left px-4 py-3 rounded-xl bg-card/40 border border-muted-foreground/10"
            >
              <Icon className="w-5 h-5 text-accent shrink-0" />
              <span className="text-sm text-foreground/80">{f.label}</span>
            </div>
          );
        })}
      </div>

      {/* Primary CTA - Subscribe */}
      <button
        onClick={onSubscribe}
        className="w-full max-w-xs px-8 py-4 rounded-full bg-gradient-to-r from-accent/90 to-accent text-accent-foreground font-semibold text-base tracking-wider shadow-[0_0_30px_hsl(45_80%_55%/0.4)] hover:shadow-[0_0_40px_hsl(45_80%_55%/0.6)] transition-all active:scale-95 mb-3"
      >
        3日間無料で始める
      </button>

      {/* Secondary - skip */}
      <button
        onClick={onStart}
        className="text-sm text-muted-foreground hover:text-foreground/60 transition-colors py-2"
      >
        まずは無料で試す
      </button>
    </div>
  );
};

export default OnboardingComplete;
