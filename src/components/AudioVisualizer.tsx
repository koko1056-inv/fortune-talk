import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface AudioVisualizerProps {
  isActive: boolean;
  isSpeaking: boolean;
}

const AudioVisualizer = ({ isActive, isSpeaking }: AudioVisualizerProps) => {
  const [bars, setBars] = useState<number[]>(Array(5).fill(0.3));

  useEffect(() => {
    if (!isActive) {
      setBars(Array(5).fill(0.3));
      return;
    }

    const interval = setInterval(() => {
      if (isSpeaking) {
        setBars(Array(5).fill(0).map(() => 0.3 + Math.random() * 0.7));
      } else {
        setBars(Array(5).fill(0).map(() => 0.2 + Math.random() * 0.3));
      }
    }, 100);

    return () => clearInterval(interval);
  }, [isActive, isSpeaking]);

  return (
    <div className="flex h-16 items-end justify-center gap-1.5">
      {bars.map((height, index) => (
        <div
          key={index}
          className={cn(
            "w-1.5 rounded-full transition-all duration-100",
            isActive
              ? isSpeaking
                ? "bg-primary"
                : "bg-primary/50"
              : "bg-muted-foreground/30"
          )}
          style={{
            height: `${height * 100}%`,
            transitionDelay: `${index * 30}ms`,
          }}
        />
      ))}
    </div>
  );
};

export default AudioVisualizer;
