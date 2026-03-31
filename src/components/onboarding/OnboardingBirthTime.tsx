import { useState, useEffect } from "react";
import { ChevronLeft } from "lucide-react";
import { ClockIcon } from "./OnboardingIcons";

interface Props {
  value: string;
  onChange: (v: string) => void;
  onNext: () => void;
  onBack: () => void;
}

const OnboardingBirthTime = ({ value, onChange, onNext, onBack }: Props) => {
  const [show, setShow] = useState(false);
  const isUnknown = value === "不明";

  useEffect(() => { setShow(true); }, []);

  return (
    <div
      className={`flex flex-col items-center text-center min-h-[50vh] justify-center transition-all duration-700 ${
        show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
    >
      <button onClick={onBack} className="absolute top-8 left-6 p-2 text-muted-foreground hover:text-foreground transition-colors">
        <ChevronLeft className="w-5 h-5" />
      </button>

      <ClockIcon className="w-14 h-14 mb-6" />

      <h2 className="text-2xl font-display font-semibold text-foreground mb-3">
        生まれた時間を
        <br />
        覚えていますか？
      </h2>
      <p className="text-sm text-muted-foreground mb-8">
        月星座やアセンダントの計算に使います
      </p>

      <div className="w-full max-w-xs space-y-4 mb-8">
        {!isUnknown && (
          <input
            type="time"
            value={value === "不明" ? "" : value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full bg-card/60 backdrop-blur border border-accent/20 rounded-2xl text-center text-lg text-foreground py-4 px-6 outline-none focus:border-accent/60 transition-colors [color-scheme:dark]"
          />
        )}

        <button
          onClick={() => onChange(isUnknown ? "" : "不明")}
          className={`w-full py-3.5 rounded-2xl border text-sm font-medium transition-all ${
            isUnknown
              ? "border-accent bg-accent/15 text-accent"
              : "border-muted-foreground/20 text-muted-foreground hover:border-accent/40"
          }`}
        >
          {isUnknown ? "✓ " : ""}分からない・覚えていない
        </button>
      </div>

      <p className="text-xs text-muted-foreground/60 mb-6 max-w-xs">
        分からなくても大丈夫です。他の情報から充分に読み解くことができます。
      </p>

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

export default OnboardingBirthTime;
