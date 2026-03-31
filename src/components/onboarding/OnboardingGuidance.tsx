import { useState, useEffect } from "react";
import { ChevronLeft, Heart, Briefcase, Search, Leaf, Eye, Coins } from "lucide-react";

interface Props {
  value: string[];
  onChange: (v: string[]) => void;
  onNext: () => void;
  onBack: () => void;
}

const topics = [
  { id: "love", icon: Heart, label: "恋愛・人間関係", desc: "出会い・パートナーとの未来" },
  { id: "career", icon: Briefcase, label: "仕事・キャリア", desc: "転職・才能の活かし方" },
  { id: "self", icon: Search, label: "自分自身を知りたい", desc: "性格・本質・強みと弱み" },
  { id: "health", icon: Leaf, label: "健康・ウェルネス", desc: "心と体のバランス" },
  { id: "future", icon: Eye, label: "未来の展望", desc: "運気の流れ・転機の時期" },
  { id: "money", icon: Coins, label: "金運・財運", desc: "お金の流れ・投資の時期" },
];

const OnboardingGuidance = ({ value, onChange, onNext, onBack }: Props) => {
  const [show, setShow] = useState(false);
  useEffect(() => { setShow(true); }, []);

  const toggle = (id: string) => {
    onChange(
      value.includes(id) ? value.filter((v) => v !== id) : [...value, id]
    );
  };

  return (
    <div
      className={`flex flex-col items-center text-center min-h-[60vh] justify-center transition-all duration-700 ${
        show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
    >
      <button onClick={onBack} className="absolute top-8 left-6 p-2 text-muted-foreground hover:text-foreground transition-colors">
        <ChevronLeft className="w-5 h-5" />
      </button>

      <h2 className="text-2xl font-display font-semibold text-foreground mb-2">
        今、何について
        <br />
        知りたいですか？
      </h2>
      <p className="text-sm text-muted-foreground mb-8">
        いくつでも選べます
      </p>

      <div className="grid grid-cols-2 gap-3 w-full max-w-sm mb-8">
        {topics.map((topic) => {
          const selected = value.includes(topic.id);
          const Icon = topic.icon;
          return (
            <button
              key={topic.id}
              onClick={() => toggle(topic.id)}
              className={`relative flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all duration-300 active:scale-95 ${
                selected
                  ? "border-accent bg-accent/10 shadow-[0_0_20px_hsl(45_80%_55%/0.15)]"
                  : "border-muted-foreground/15 bg-card/40 hover:border-accent/30"
              }`}
            >
              <Icon className={`w-7 h-7 ${selected ? "text-accent" : "text-foreground/50"}`} />
              <span className={`text-sm font-medium ${selected ? "text-accent" : "text-foreground/80"}`}>
                {topic.label}
              </span>
              <span className="text-[10px] text-muted-foreground/60 leading-tight">
                {topic.desc}
              </span>
              {selected && (
                <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-accent flex items-center justify-center">
                  <svg className="w-3 h-3 text-accent-foreground" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6L5 9L10 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </div>

      <button
        onClick={onNext}
        disabled={value.length === 0}
        className="px-10 py-3.5 rounded-full bg-accent text-accent-foreground font-semibold tracking-wider shadow-[0_0_20px_hsl(45_80%_55%/0.3)] hover:shadow-[0_0_30px_hsl(45_80%_55%/0.5)] disabled:opacity-30 disabled:shadow-none transition-all active:scale-95"
      >
        あなたの星を読む
      </button>
    </div>
  );
};

export default OnboardingGuidance;
