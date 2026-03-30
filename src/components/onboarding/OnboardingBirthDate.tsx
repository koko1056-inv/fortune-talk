import { useState, useEffect } from "react";
import { ChevronLeft } from "lucide-react";

interface Props {
  value: string;
  zodiacSign: string;
  onChange: (v: string) => void;
  onNext: () => void;
  onBack: () => void;
}

const zodiacEmoji: Record<string, string> = {
  "牡羊座": "♈", "牡牛座": "♉", "双子座": "♊", "蟹座": "♋",
  "獅子座": "♌", "乙女座": "♍", "天秤座": "♎", "蠍座": "♏",
  "射手座": "♐", "山羊座": "♑", "水瓶座": "♒", "魚座": "♓",
};

const OnboardingBirthDate = ({ value, zodiacSign, onChange, onNext, onBack }: Props) => {
  const [show, setShow] = useState(false);
  const [showZodiac, setShowZodiac] = useState(false);

  useEffect(() => { setShow(true); }, []);

  useEffect(() => {
    if (zodiacSign) {
      setShowZodiac(false);
      setTimeout(() => setShowZodiac(true), 300);
    }
  }, [zodiacSign]);

  return (
    <div
      className={`flex flex-col items-center text-center min-h-[50vh] justify-center transition-all duration-700 ${
        show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
    >
      <button onClick={onBack} className="absolute top-8 left-6 p-2 text-muted-foreground hover:text-foreground transition-colors">
        <ChevronLeft className="w-5 h-5" />
      </button>

      <div className="text-5xl mb-6">🎂</div>

      <h2 className="text-2xl font-display font-semibold text-foreground mb-3">
        あなたが生まれた日を
        <br />
        教えてください
      </h2>
      <p className="text-sm text-muted-foreground mb-8">
        星座と運命の軌道を計算します
      </p>

      <div className="w-full max-w-xs mb-6">
        <input
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          max={new Date().toISOString().split("T")[0]}
          min="1930-01-01"
          className="w-full bg-card/60 backdrop-blur border border-accent/20 rounded-2xl text-center text-lg text-foreground py-4 px-6 outline-none focus:border-accent/60 transition-colors [color-scheme:dark]"
        />
      </div>

      {/* Zodiac reveal */}
      {zodiacSign && (
        <div
          className={`flex items-center gap-3 mb-8 px-6 py-3 rounded-full bg-accent/10 border border-accent/20 transition-all duration-500 ${
            showZodiac ? "opacity-100 scale-100" : "opacity-0 scale-75"
          }`}
        >
          <span className="text-3xl">{zodiacEmoji[zodiacSign] || "⭐"}</span>
          <span className="text-accent font-medium">{zodiacSign}</span>
        </div>
      )}

      <button
        onClick={onNext}
        disabled={!value}
        className="px-10 py-3.5 rounded-full bg-accent text-accent-foreground font-semibold tracking-wider shadow-[0_0_20px_hsl(45_80%_55%/0.3)] hover:shadow-[0_0_30px_hsl(45_80%_55%/0.5)] disabled:opacity-30 disabled:shadow-none transition-all active:scale-95"
      >
        次へ
      </button>
    </div>
  );
};

export default OnboardingBirthDate;
