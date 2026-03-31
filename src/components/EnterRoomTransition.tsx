import { useEffect, useState, useMemo } from "react";
import { Agent } from "./AgentSelector";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

// Convert Tailwind gradient class to CSS gradient value
const gradientToCss = (gradient: string): string => {
  const colorMap: Record<string, string> = {
    "violet-600": "hsl(271 91% 65%)", "purple-600": "hsl(271 81% 56%)",
    "indigo-700": "hsl(225 76% 52%)", "amber-500": "hsl(38 92% 50%)",
    "yellow-500": "hsl(48 96% 53%)", "orange-500": "hsl(25 95% 53%)",
    "rose-600": "hsl(347 77% 50%)", "red-600": "hsl(0 72% 51%)",
    "pink-600": "hsl(333 71% 51%)", "cyan-500": "hsl(189 94% 43%)",
    "teal-500": "hsl(168 76% 42%)", "emerald-500": "hsl(160 84% 39%)",
  };
  const parts = gradient.split(" ");
  const colors: string[] = [];
  for (const part of parts) {
    const colorName = part.replace(/^(from-|via-|to-)/, "");
    if (colorMap[colorName]) colors.push(colorMap[colorName]);
  }
  if (colors.length >= 3) return `linear-gradient(135deg, ${colors[0]}, ${colors[1]}, ${colors[2]})`;
  if (colors.length === 2) return `linear-gradient(135deg, ${colors[0]}, ${colors[1]})`;
  if (colors.length === 1) return colors[0];
  return "linear-gradient(135deg, hsl(280 70% 50%), hsl(260 60% 40%))";
};

interface EnterRoomTransitionProps {
  agent: Agent;
  isVisible: boolean;
  onComplete: () => void;
  displayName?: string;
}

const EnterRoomTransition = ({
  agent,
  isVisible,
  onComplete,
  displayName,
}: EnterRoomTransitionProps) => {
  const [phase, setPhase] = useState<"fade-in" | "zoom" | "glow" | "message" | "fade-out" | "hidden">("hidden");

  // Generate random particles once
  const particles = useMemo(() => 
    Array.from({ length: 20 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      delay: Math.random() * 2,
      duration: 2 + Math.random() * 2,
      size: Math.random() > 0.7 ? "large" : "small",
    })), []
  );

  useEffect(() => {
    if (!isVisible) {
      setPhase("hidden");
      return;
    }

    setPhase("fade-in");

    const timers = [
      setTimeout(() => setPhase("zoom"), 300),
      setTimeout(() => setPhase("glow"), 1000),
      setTimeout(() => setPhase("message"), 1500),
      setTimeout(() => setPhase("fade-out"), 2500),
      setTimeout(() => {
        setPhase("hidden");
        onComplete();
      }, 3000),
    ];

    return () => timers.forEach(clearTimeout);
  }, [isVisible, onComplete]);

  if (phase === "hidden") return null;

  const welcomeMessage = displayName
    ? `${displayName}さん、${agent.name}の間へようこそ...`
    : `${agent.name}の間へようこそ...`;

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center transition-opacity duration-300 ${
        phase === "fade-out" ? "opacity-0" : "opacity-100"
      }`}
      style={{
        background: `linear-gradient(135deg, hsl(260 30% 4% / 0.98), hsl(280 40% 8% / 0.98), hsl(260 30% 4% / 0.98))`,
      }}
    >
      {/* Mystical particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className={`absolute rounded-full ${
              particle.size === "large"
                ? "w-2 h-2 bg-accent/60"
                : "w-1 h-1 bg-accent/40"
            } animate-particle-float`}
            style={{
              left: `${particle.left}%`,
              top: `${particle.top}%`,
              animationDelay: `${particle.delay}s`,
              animationDuration: `${particle.duration}s`,
            }}
          />
        ))}
      </div>

      {/* Radial glow background */}
      <div
        className={`absolute inset-0 transition-opacity duration-500 ${
          phase === "glow" || phase === "message" || phase === "fade-out"
            ? "opacity-100"
            : "opacity-0"
        }`}
        style={{
          background: `radial-gradient(circle at 50% 40%, hsl(280 70% 50% / 0.3), transparent 50%)`,
        }}
      />

      {/* Fortune teller image */}
      <div
        className={`relative transition-all duration-700 ease-out ${
          phase === "fade-in"
            ? "scale-50 opacity-0"
            : phase === "zoom" || phase === "glow" || phase === "message" || phase === "fade-out"
            ? "scale-100 opacity-100"
            : "scale-50 opacity-0"
        }`}
      >
        {/* Outer glow ring */}
        <div
          className={`absolute -inset-8 rounded-full transition-opacity duration-500 ${
            phase === "glow" || phase === "message" || phase === "fade-out"
              ? "opacity-100 animate-glow-pulse"
              : "opacity-0"
          }`}
          style={{
            background: `radial-gradient(circle, hsl(280 70% 50% / 0.4), transparent 70%)`,
          }}
        />

        {/* Inner glow ring */}
        <div
          className={`absolute -inset-4 rounded-full transition-opacity duration-500 ${
            phase === "glow" || phase === "message" || phase === "fade-out"
              ? "opacity-100"
              : "opacity-0"
          }`}
          style={{
            background: `radial-gradient(circle, hsl(45 80% 55% / 0.2), transparent 70%)`,
          }}
        />

        {/* Avatar container */}
        <Avatar className="w-48 h-48 md:w-64 md:h-64 lg:w-80 lg:h-80 border-4 border-accent/30 shadow-glow">
          {agent.imageUrl ? (
            <AvatarImage
              src={agent.imageUrl}
              alt={agent.name}
              className="object-cover"
            />
          ) : (
            <AvatarFallback
              className="text-6xl md:text-7xl lg:text-8xl"
              style={{
                background: gradientToCss(agent.gradient),
              }}
            >
              {agent.emoji}
            </AvatarFallback>
          )}
        </Avatar>
      </div>

      {/* Agent name */}
      <h2
        className={`mt-8 text-2xl md:text-3xl lg:text-4xl font-display text-gradient transition-all duration-500 ${
          phase === "zoom" || phase === "glow" || phase === "message" || phase === "fade-out"
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-4"
        }`}
      >
        {agent.name}
      </h2>

      {/* Welcome message */}
      <p
        className={`mt-6 text-lg md:text-xl text-foreground/80 text-center px-4 transition-all duration-500 ${
          phase === "message" || phase === "fade-out"
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-4"
        }`}
      >
        {welcomeMessage}
      </p>

      {/* Mystical border decoration */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-accent/50 to-transparent" />
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
    </div>
  );
};

export default EnterRoomTransition;
