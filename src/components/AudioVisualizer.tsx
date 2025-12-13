import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface AudioVisualizerProps {
  isActive: boolean;
  isSpeaking: boolean;
}

const AudioVisualizer = ({ isActive, isSpeaking }: AudioVisualizerProps) => {
  const [bars, setBars] = useState<number[]>(Array(7).fill(0.3));

  useEffect(() => {
    if (!isActive) {
      setBars(Array(7).fill(0.3));
      return;
    }

    const interval = setInterval(() => {
      if (isSpeaking) {
        setBars(Array(7).fill(0).map(() => 0.3 + Math.random() * 0.7));
      } else {
        setBars(Array(7).fill(0).map(() => 0.2 + Math.random() * 0.3));
      }
    }, 100);

    return () => clearInterval(interval);
  }, [isActive, isSpeaking]);

  return (
    <div className="flex h-16 items-end justify-center gap-2">
      {bars.map((height, index) => (
        <div
          key={index}
          className={cn(
            "w-1 rounded-full transition-all duration-150",
            isActive
              ? isSpeaking
                ? "bg-gradient-to-t from-primary via-accent to-accent"
                : "bg-gradient-to-t from-primary/60 to-primary/40"
              : "bg-muted-foreground/20"
          )}
          style={{
            height: `${height * 100}%`,
            transitionDelay: `${index * 25}ms`,
            boxShadow: isActive && isSpeaking 
              ? `0 0 10px hsl(45 80% 55% / ${height * 0.5})` 
              : 'none',
          }}
        />
      ))}
    </div>
  );
};

export default AudioVisualizer;