import { memo } from "react";
import { Agent } from "./AgentSelector";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface FortuneSessionViewProps {
  agent: Agent;
  displayName?: string | null;
  isConnecting?: boolean;
  children: React.ReactNode;
  rallyCount?: number;
  maxRallies?: number;
  showRallyCounter?: boolean;
  elapsedSeconds?: number;
  maxSeconds?: number;
}

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const FortuneSessionView = memo(({
  agent,
  displayName,
  isConnecting = false,
  children,
  rallyCount,
  maxRallies,
  showRallyCounter = false,
  elapsedSeconds,
  maxSeconds,
}: FortuneSessionViewProps) => {
  const showTimer = elapsedSeconds !== undefined && maxSeconds !== undefined;
  const timeRemaining = showTimer ? maxSeconds - elapsedSeconds : 0;
  const isTimeWarning = showTimer && timeRemaining <= 30;

  return (
    <div className="w-full animate-fade-in">
      {/* Fortune teller header with large image */}
      <div className="relative mb-6">
        {/* Background glow effect */}
        <div 
          className="absolute inset-0 -z-10 opacity-30"
          style={{
            background: `radial-gradient(circle at 50% 0%, hsl(280 70% 50% / 0.4), transparent 70%)`,
          }}
        />
        
        <div className="flex flex-col items-center">
          {/* Large fortune teller avatar */}
          <div className="relative">
            {/* Outer glow ring */}
            <div 
              className="absolute -inset-4 rounded-full animate-glow-pulse"
              style={{
                background: `radial-gradient(circle, hsl(280 70% 50% / 0.3), transparent 70%)`,
              }}
            />
            
            <Avatar className="w-24 h-24 md:w-32 md:h-32 border-2 border-accent/30 shadow-glow">
              {agent.imageUrl ? (
                <AvatarImage
                  src={agent.imageUrl}
                  alt={agent.name}
                  className="object-cover"
                />
              ) : (
                <AvatarFallback
                  className="text-4xl md:text-5xl"
                  style={{
                    background: agent.gradient || "linear-gradient(135deg, hsl(280 70% 50%), hsl(260 60% 40%))",
                  }}
                >
                  {agent.emoji}
                </AvatarFallback>
              )}
            </Avatar>
          </div>
          
          {/* Agent name and description */}
          <h2 className="mt-4 text-xl md:text-2xl font-display font-bold text-gradient tracking-wide">
            {agent.name}
          </h2>
          <p className="text-xs md:text-sm text-muted-foreground mt-1 tracking-wide max-w-xs text-center">
            {agent.description}
          </p>
          
          {/* Status badges */}
          <div className="flex items-center gap-2 mt-3">
            {isConnecting && (
              <Badge variant="secondary" className="animate-pulse">
                接続中...
              </Badge>
            )}
            {!isConnecting && displayName && (
              <Badge variant="outline" className="text-accent border-accent/30">
                ✧ {displayName}さんの鑑定中 ✧
              </Badge>
            )}
            {showRallyCounter && rallyCount !== undefined && maxRallies !== undefined && (
              <Badge variant={rallyCount >= maxRallies - 2 ? "destructive" : "secondary"}>
                {rallyCount} / {maxRallies} ラリー
              </Badge>
            )}
            {showTimer && (
              <Badge variant={isTimeWarning ? "destructive" : "secondary"}>
                残り {formatTime(timeRemaining)}
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Session content (chat messages, audio visualizer, etc.) */}
      <div className="w-full">
        {children}
      </div>
    </div>
  );
});

FortuneSessionView.displayName = "FortuneSessionView";

export default FortuneSessionView;
