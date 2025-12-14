import { memo } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Agent } from "./AgentSelector";

interface ConnectedAgentDisplayProps {
  agent: Agent;
  displayName?: string | null;
  variant?: "large" | "small";
  rallyCount?: number;
  maxRallies?: number;
  showRallyCounter?: boolean;
}

const ConnectedAgentDisplay = memo(({
  agent,
  displayName,
  variant = "large",
  rallyCount,
  maxRallies,
  showRallyCounter = false,
}: ConnectedAgentDisplayProps) => {
  const isLarge = variant === "large";
  const sizeClasses = isLarge 
    ? "w-20 h-20 md:w-24 md:h-24" 
    : "w-16 h-16";
  const textSizeClasses = isLarge 
    ? "text-4xl md:text-5xl" 
    : "text-3xl";
  const titleClasses = isLarge 
    ? "text-xl md:text-2xl" 
    : "text-lg";

  return (
    <div className="text-center animate-fade-in">
      <div
        className={cn(
          "rounded-full mx-auto flex items-center justify-center overflow-hidden",
          "bg-gradient-to-br shadow-crystal",
          isLarge && "mb-3 md:mb-4 animate-float-slow",
          !isLarge && "mb-2",
          !agent.imageUrl && textSizeClasses,
          agent.gradient,
          sizeClasses
        )}
        style={isLarge ? {
          boxShadow: '0 0 40px hsl(280 70% 50% / 0.4), inset 0 0 30px hsl(200 60% 80% / 0.15)'
        } : undefined}
      >
        {agent.imageUrl ? (
          <img
            src={agent.imageUrl}
            alt={agent.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="drop-shadow-lg">{agent.emoji}</span>
        )}
      </div>
      <h2 className={cn("font-display font-bold text-gradient tracking-wide", titleClasses)}>
        {agent.name}
      </h2>
      {isLarge && (
        <p className="text-xs md:text-sm text-muted-foreground mt-1 md:mt-2 tracking-wide">
          {agent.description}
        </p>
      )}
      {displayName && isLarge && (
        <p className="text-[10px] md:text-xs text-accent/70 mt-2 md:mt-3">
          ✧ {displayName}さんの鑑定中 ✧
        </p>
      )}
      {showRallyCounter && rallyCount !== undefined && maxRallies !== undefined && (
        <Badge
          variant={rallyCount >= maxRallies - 2 ? "destructive" : "secondary"}
          className="mt-2"
        >
          {rallyCount} / {maxRallies} ラリー
        </Badge>
      )}
    </div>
  );
});

ConnectedAgentDisplay.displayName = "ConnectedAgentDisplay";

export default ConnectedAgentDisplay;
