import { useState, useRef, useEffect } from "react";
import { ChevronLeft } from "lucide-react";

interface Props {
  value: string;
  onChange: (v: string) => void;
  onNext: () => void;
  onBack: () => void;
}

const OnboardingName = ({ value, onChange, onNext, onBack }: Props) => {
  const [show, setShow] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setShow(true);
    setTimeout(() => inputRef.current?.focus(), 600);
  }, []);

  const handleSubmit = () => {
    if (value.trim().length > 0) onNext();
  };

  return (
    <div
      className={`flex flex-col items-center text-center min-h-[50vh] justify-center transition-all duration-700 ${
        show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
    >
      <button onClick={onBack} className="absolute top-8 left-6 p-2 text-muted-foreground hover:text-foreground transition-colors">
        <ChevronLeft className="w-5 h-5" />
      </button>

      <div className="text-5xl mb-6">✨</div>

      <h2 className="text-2xl font-display font-semibold text-foreground mb-3">
        なんとお呼びすれば
        <br />
        良いですか？
      </h2>
      <p className="text-sm text-muted-foreground mb-10">
        占い師があなたに語りかけるときの名前です
      </p>

      <div className="w-full max-w-xs mb-10">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          placeholder="お名前"
          className="w-full bg-transparent border-b-2 border-accent/40 focus:border-accent text-center text-xl text-foreground placeholder:text-muted-foreground/40 py-3 outline-none transition-colors"
          maxLength={20}
        />
      </div>

      <button
        onClick={handleSubmit}
        disabled={value.trim().length === 0}
        className="px-10 py-3.5 rounded-full bg-accent text-accent-foreground font-semibold tracking-wider shadow-[0_0_20px_hsl(45_80%_55%/0.3)] hover:shadow-[0_0_30px_hsl(45_80%_55%/0.5)] disabled:opacity-30 disabled:shadow-none transition-all active:scale-95"
      >
        次へ
      </button>
    </div>
  );
};

export default OnboardingName;
