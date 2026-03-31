import { useState, useEffect } from "react";
import { CrystalBallIcon } from "./OnboardingIcons";

interface Props {
  onNext: () => void;
}

const OnboardingWelcome = ({ onNext }: Props) => {
  const [show, setShow] = useState(false);
  const [showSubtext, setShowSubtext] = useState(false);
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setShow(true), 300);
    const t2 = setTimeout(() => setShowSubtext(true), 1200);
    const t3 = setTimeout(() => setShowButton(true), 2000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  return (
    <div className="flex flex-col items-center text-center min-h-[60vh] justify-center">
      {/* Crystal ball */}
      <div
        className={`relative mb-8 transition-all duration-1000 ${
          show ? "opacity-100 scale-100" : "opacity-0 scale-50"
        }`}
      >
        <div className="absolute inset-0 blur-xl opacity-40 animate-pulse">
          <CrystalBallIcon className="w-28 h-28" />
        </div>
        <CrystalBallIcon className="relative w-28 h-28" />
      </div>

      {/* Title */}
      <h1
        className={`text-3xl md:text-4xl font-display font-bold tracking-wide text-foreground mb-4 transition-all duration-1000 ${
          show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        <span className="text-gradient drop-shadow-[0_0_30px_hsl(45_80%_55%/0.5)]">
          ようこそ、
        </span>
        <br />
        <span className="text-gradient drop-shadow-[0_0_30px_hsl(45_80%_55%/0.5)]">
          運命の扉の前へ
        </span>
      </h1>

      {/* Subtext */}
      <p
        className={`text-muted-foreground text-base leading-relaxed max-w-xs mb-12 transition-all duration-800 ${
          showSubtext ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        あなただけの物語を
        <br />
        紐解いていきましょう
      </p>

      {/* CTA */}
      <button
        onClick={onNext}
        className={`px-10 py-4 rounded-full bg-gradient-to-r from-accent/90 to-accent text-accent-foreground font-semibold text-lg tracking-wider shadow-[0_0_30px_hsl(45_80%_55%/0.4)] hover:shadow-[0_0_40px_hsl(45_80%_55%/0.6)] transition-all duration-500 active:scale-95 ${
          showButton ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
        }`}
      >
        始める
      </button>
    </div>
  );
};

export default OnboardingWelcome;
