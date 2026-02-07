import { memo } from "react";
import { Agent } from "./AgentSelector";
import { Button } from "@/components/ui/button";
import { X, MoreHorizontal, Mic, MessageSquare, Volume2, Sparkles, Star } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FortuneSessionViewProps {
  agent: Agent;
  displayName?: string | null;
  isConnecting?: boolean;
  children?: React.ReactNode;
  rallyCount?: number;
  maxRallies?: number;
  showRallyCounter?: boolean;
  elapsedSeconds?: number;
  maxSeconds?: number;
  onLeave?: () => void;
  isSpeaking?: boolean;
  ticketBalance?: number;
  isExempt?: boolean;
  onMicClick?: () => void;
  onChatClick?: () => void;
  isConnected?: boolean;
  statusText?: string;
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
  onLeave,
  isSpeaking = false,
  ticketBalance,
  isExempt = false,
  onMicClick,
  onChatClick,
  isConnected = false,
  statusText,
}: FortuneSessionViewProps) => {
  const showTimer = elapsedSeconds !== undefined && maxSeconds !== undefined;
  const timeRemaining = showTimer ? maxSeconds - elapsedSeconds : 0;
  const isTimeWarning = showTimer && timeRemaining <= 30;

  // Generate a mystical message based on state
  const getAgentMessage = () => {
    if (isConnecting) {
      return "「運命の扉を開いています... しばらくお待ちください。」";
    }
    if (isSpeaking) {
      return "「あなたの運命の糸が見えます... 今、あなたが心に抱いている不安を、一つずつ紐解いていきましょう。」";
    }
    return "「心を開いて、あなたの声を聴かせてください...」";
  };

  // Status text for the bottom
  const getStatusText = () => {
    if (statusText) return statusText;
    if (isConnecting) return "CONNECTING...";
    if (isSpeaking) return "SPEAKING...";
    if (isConnected) return "LISTENING...";
    return "READY";
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-gradient-to-b from-[hsl(260_30%_12%)] via-[hsl(260_25%_8%)] to-[hsl(260_20%_5%)]">
      {/* Top header */}
      <div className="relative z-10 flex items-center justify-between px-4 pt-4 pb-2">
        {/* Close button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onLeave}
          className="h-12 w-12 rounded-full bg-muted/20 backdrop-blur-sm hover:bg-muted/30"
        >
          <X className="h-5 w-5 text-muted-foreground" />
        </Button>

        {/* Live session badge */}
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted/20 backdrop-blur-sm border border-muted/10">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-xs font-medium tracking-wider text-foreground">
            LIVE SESSION
          </span>
        </div>

        {/* Menu button */}
        <Button
          variant="ghost"
          size="icon"
          className="h-12 w-12 rounded-full bg-muted/20 backdrop-blur-sm hover:bg-muted/30"
        >
          <MoreHorizontal className="h-5 w-5 text-muted-foreground" />
        </Button>
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 overflow-hidden">
        {/* Message bubble */}
        <div className="w-full max-w-sm mb-4 animate-fade-in">
          <div className="relative px-5 py-4 rounded-2xl bg-muted/20 backdrop-blur-md border border-muted/10">
            <p className="text-sm md:text-base text-center text-foreground/90 leading-relaxed">
              {getAgentMessage()}
            </p>
            {/* Bubble pointer */}
            <div className="absolute left-1/2 -translate-x-1/2 -bottom-2 w-4 h-4 rotate-45 bg-muted/20 border-r border-b border-muted/10" />
          </div>
        </div>

        {/* Fortune teller image */}
        <div className="relative w-full max-w-md aspect-[3/4] flex items-center justify-center">
          {/* Glow effect behind image */}
          <div 
            className="absolute inset-0 opacity-40"
            style={{
              background: `radial-gradient(ellipse at center, hsl(280 60% 40% / 0.5), transparent 70%)`,
            }}
          />
          
          {agent.imageUrl ? (
            <img
              src={agent.imageUrl}
              alt={agent.name}
              className="relative z-10 w-full h-full object-contain object-center drop-shadow-2xl"
            />
          ) : (
            <div 
              className="relative z-10 w-48 h-48 rounded-full flex items-center justify-center text-8xl"
              style={{
                background: agent.gradient || "linear-gradient(135deg, hsl(280 70% 50%), hsl(260 60% 40%))",
              }}
            >
              {agent.emoji}
            </div>
          )}
        </div>
      </div>

      {/* Bottom control area */}
      <div className="relative z-10 pb-8 pt-4">
        {/* Golden arc decoration */}
        <div className="absolute left-1/2 -translate-x-1/2 bottom-32 w-80 h-40 pointer-events-none">
          <svg viewBox="0 0 320 160" className="w-full h-full">
            <path
              d="M 20 140 Q 160 20 300 140"
              fill="none"
              stroke="url(#goldGradient)"
              strokeWidth="1.5"
              strokeLinecap="round"
              opacity="0.6"
            />
            <defs>
              <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="hsl(45 80% 50%)" stopOpacity="0.3" />
                <stop offset="50%" stopColor="hsl(45 90% 60%)" stopOpacity="0.8" />
                <stop offset="100%" stopColor="hsl(45 80% 50%)" stopOpacity="0.3" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Side icons */}
        <div className="absolute left-8 bottom-36 flex items-center justify-center w-10 h-10 rounded-full bg-muted/10 border border-muted/20">
          <Star className="w-4 h-4 text-amber-400/60" />
        </div>
        <div className="absolute right-8 bottom-36 flex items-center justify-center w-10 h-10 rounded-full bg-muted/10 border border-muted/20">
          <Sparkles className="w-4 h-4 text-purple-400/60" />
        </div>

        {/* Main controls row */}
        <div className="flex items-end justify-center gap-6 px-4">
          {/* Volume button */}
          <Button
            variant="ghost"
            size="icon"
            className="h-14 w-14 rounded-full bg-muted/20 backdrop-blur-sm hover:bg-muted/30 mb-4"
          >
            <Volume2 className="h-5 w-5 text-muted-foreground" />
          </Button>

          {/* Central microphone button */}
          <div className="relative flex flex-col items-center">
            {/* Outer glow rings */}
            {isConnected && (
              <>
                <div className={cn(
                  "absolute w-28 h-28 rounded-full transition-all duration-500",
                  isSpeaking ? "bg-accent/20 animate-pulse" : "bg-primary/10"
                )} />
                <div className={cn(
                  "absolute w-24 h-24 rounded-full transition-all duration-300",
                  isSpeaking ? "bg-accent/30" : "bg-primary/20"
                )} />
              </>
            )}
            
            {/* Main mic button */}
            <button
              onClick={onMicClick}
              disabled={isConnecting}
              className={cn(
                "relative z-10 w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300",
                "focus:outline-none focus-visible:ring-4 focus-visible:ring-accent/50",
                isConnecting && "opacity-70 cursor-not-allowed",
                !isConnecting && "hover:scale-105 active:scale-95"
              )}
              style={{
                background: 'linear-gradient(135deg, hsl(280 60% 55%), hsl(260 50% 45%))',
                boxShadow: '0 0 40px hsl(280 60% 50% / 0.4), inset 0 2px 0 hsl(280 50% 70% / 0.3), 0 10px 30px -10px hsl(260 50% 20% / 0.8)',
              }}
            >
              <Mic className={cn(
                "w-8 h-8 transition-colors",
                isConnected ? "text-white" : "text-white/90"
              )} />
            </button>

            {/* Ticket info */}
            {!isExempt && ticketBalance !== undefined && (
              <div className="mt-3 flex items-center gap-1 text-[10px] text-amber-400/80">
                <span>🎫</span>
                <span className="tracking-wider">REMAINING TICKETS: {ticketBalance}</span>
              </div>
            )}

            {/* Time remaining */}
            {showTimer && (
              <div className={cn(
                "mt-1 text-[10px] tracking-wider",
                isTimeWarning ? "text-red-400" : "text-muted-foreground"
              )}>
                残り {formatTime(timeRemaining)}
              </div>
            )}

            {/* Status text */}
            <p className="mt-2 text-xs tracking-[0.2em] text-accent font-medium">
              {getStatusText()}
            </p>
          </div>

          {/* Chat button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onChatClick}
            className="h-14 w-14 rounded-full bg-muted/20 backdrop-blur-sm hover:bg-muted/30 mb-4"
          >
            <MessageSquare className="h-5 w-5 text-muted-foreground" />
          </Button>
        </div>

        {/* Rally counter for text chat */}
        {showRallyCounter && rallyCount !== undefined && maxRallies !== undefined && (
          <div className="mt-4 text-center text-xs text-muted-foreground">
            {rallyCount} / {maxRallies} ラリー
          </div>
        )}

        {/* Children (audio visualizer, etc.) - hidden for now as mic button handles it */}
        {children && (
          <div className="hidden">
            {children}
          </div>
        )}
      </div>
    </div>
  );
});

FortuneSessionView.displayName = "FortuneSessionView";

export default FortuneSessionView;
