import { memo, useState } from "react";
import { Agent } from "./AgentSelector";
import { Button } from "@/components/ui/button";
import { X, Mic, Loader2, RefreshCw, PhoneOff, VolumeX, Volume2 } from "lucide-react";
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
  connectionError?: string | null;
  onMuteToggle?: (muted: boolean) => void;
}

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
  connectionError,
  onMuteToggle,
}: FortuneSessionViewProps) => {
  const [isMuted, setIsMuted] = useState(false);

  const handleMuteToggle = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    onMuteToggle?.(newMuted);
  };
  const showTimer = elapsedSeconds !== undefined && maxSeconds !== undefined;
  const timeRemaining = showTimer ? maxSeconds - elapsedSeconds : 0;
  const isTimeWarning = showTimer && timeRemaining <= 30;

  // Generate a mystical message based on state
  const getAgentMessage = () => {
    if (connectionError) {
      return connectionError;
    }
    if (isConnecting) {
      return "運命の扉を開いています...";
    }
    if (isSpeaking) {
      return "占い師が語りかけています...";
    }
    if (isConnected) {
      return "心を開いて、あなたの声を聴かせてください...";
    }
    return "マイクボタンをタップして占いを始めましょう";
  };

  // Status text for the bottom
  const getStatusText = () => {
    if (statusText) return statusText;
    if (connectionError) return "接続エラー";
    if (isConnecting) return "接続中...";
    if (isSpeaking) return "占い師が話しています";
    if (isConnected) return "聴いています...";
    return "タップして開始";
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-gradient-to-b from-[hsl(260_30%_12%)] via-[hsl(260_25%_8%)] to-[hsl(260_20%_5%)]">
      {/* Top header */}
      <div className="relative z-10 flex items-center justify-between px-4 pt-4 pb-2 shrink-0">
        {/* Live session badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/20 backdrop-blur-sm border border-muted/10">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-[10px] font-medium tracking-wider text-foreground/80">
            LIVE
          </span>
        </div>

        {/* Agent name */}
        <div className="flex items-center gap-2">
          <span className="text-lg">{agent.emoji}</span>
          <span className="text-sm font-medium text-foreground">{agent.name}</span>
        </div>

        {/* End session button - more prominent */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onLeave}
          className="h-9 px-3 rounded-full bg-destructive/20 hover:bg-destructive/30 text-destructive border border-destructive/30"
        >
          <PhoneOff className="h-4 w-4 mr-1.5" />
          <span className="text-xs font-medium">終了</span>
        </Button>
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 overflow-hidden min-h-0">
        {/* Fortune teller image */}
        <div className="relative w-full max-w-sm flex-1 flex items-center justify-center min-h-0">
          {/* Glow effect behind image */}
          <div 
            className="absolute inset-0 opacity-40 pointer-events-none"
            style={{
              background: `radial-gradient(ellipse at center, hsl(280 60% 40% / 0.5), transparent 70%)`,
            }}
          />
          
          {agent.imageUrl ? (
            <img
              src={agent.imageUrl}
              alt={agent.name}
              className="relative z-10 max-w-full max-h-full object-contain drop-shadow-2xl"
            />
          ) : (
            <div
              className="relative z-10 w-40 h-40 rounded-full flex items-center justify-center text-7xl shrink-0"
              style={{
                background: gradientToCss(agent.gradient),
              }}
            >
              {agent.emoji}
            </div>
          )}
        </div>

        {/* Message bubble - positioned below image */}
        <div className="w-full max-w-sm px-2 py-3 shrink-0">
          <div className={cn(
            "relative px-4 py-3 rounded-2xl backdrop-blur-md border transition-colors",
            connectionError 
              ? "bg-destructive/10 border-destructive/20" 
              : "bg-muted/20 border-muted/10"
          )}>
            <p className={cn(
              "text-sm text-center leading-relaxed",
              connectionError ? "text-destructive" : "text-foreground/90"
            )}>
              {getAgentMessage()}
            </p>
          </div>
        </div>
      </div>

      {/* Bottom control area */}
      <div className="relative z-10 pb-6 pt-2 shrink-0">
        {/* Timer and ticket info */}
        <div className="flex items-center justify-center gap-4 mb-4">
          {showTimer && (
            <div className={cn(
              "px-3 py-1 rounded-full text-xs font-medium",
              isTimeWarning 
                ? "bg-destructive/20 text-destructive" 
                : "bg-muted/20 text-muted-foreground"
            )}>
              残り {formatTime(timeRemaining)}
            </div>
          )}
          {!isExempt && ticketBalance !== undefined && (
            <div className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs">
              🎫 {ticketBalance}枚
            </div>
          )}
        </div>

        {/* Main controls row */}
        <div className="flex items-center justify-center gap-4 px-4">
          {/* Mute button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleMuteToggle}
            className={cn(
              "h-12 w-12 rounded-full backdrop-blur-sm transition-colors",
              isMuted 
                ? "bg-muted/40 text-muted-foreground" 
                : "bg-muted/20 hover:bg-muted/30 text-foreground"
            )}
          >
            {isMuted ? (
              <VolumeX className="h-5 w-5" />
            ) : (
              <Volume2 className="h-5 w-5" />
            )}
          </Button>

          {/* Central microphone button */}
          <div className="relative flex flex-col items-center">
            {/* Outer glow rings */}
            {isConnected && !connectionError && (
              <>
                <div className={cn(
                  "absolute w-24 h-24 rounded-full transition-all duration-500",
                  isSpeaking ? "bg-accent/20 animate-pulse" : "bg-primary/10"
                )} />
                <div className={cn(
                  "absolute w-20 h-20 rounded-full transition-all duration-300",
                  isSpeaking ? "bg-accent/30" : "bg-primary/20"
                )} />
              </>
            )}

            {/* Error indicator ring */}
            {connectionError && !isConnecting && (
              <div className="absolute w-20 h-20 rounded-full bg-destructive/20 animate-pulse" />
            )}
            
            {/* Main mic button */}
            <button
              onClick={onMicClick}
              disabled={isConnecting}
              className={cn(
                "relative z-10 w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300",
                "focus:outline-none focus-visible:ring-4 focus-visible:ring-accent/50",
                isConnecting && "opacity-70 cursor-not-allowed",
                !isConnecting && "hover:scale-105 active:scale-95",
                connectionError && !isConnecting && "ring-2 ring-destructive/50"
              )}
              style={{
                background: connectionError && !isConnecting
                  ? 'linear-gradient(135deg, hsl(0 60% 45%), hsl(0 50% 35%))'
                  : isConnected
                  ? 'linear-gradient(135deg, hsl(280 60% 55%), hsl(260 50% 45%))'
                  : 'linear-gradient(135deg, hsl(280 50% 45%), hsl(260 40% 35%))',
                boxShadow: connectionError && !isConnecting
                  ? '0 0 30px hsl(0 60% 50% / 0.4)'
                  : isConnected
                  ? '0 0 30px hsl(280 60% 50% / 0.4)'
                  : '0 0 20px hsl(280 50% 40% / 0.3)',
              }}
            >
              {isConnecting ? (
                <Loader2 className="w-7 h-7 text-white animate-spin" />
              ) : connectionError ? (
                <RefreshCw className="w-7 h-7 text-white" />
              ) : (
                <Mic className={cn(
                  "w-7 h-7 transition-colors",
                  isConnected ? "text-white" : "text-white/80"
                )} />
              )}
            </button>
          </div>

          {/* End call button (secondary) */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onLeave}
            className="h-12 w-12 rounded-full bg-destructive/20 hover:bg-destructive/30 text-destructive"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Status text */}
        <p className={cn(
          "mt-3 text-center text-xs font-medium",
          connectionError ? "text-destructive" : isSpeaking ? "text-accent" : "text-muted-foreground"
        )}>
          {getStatusText()}
        </p>

        {/* Rally counter for text chat */}
        {showRallyCounter && rallyCount !== undefined && maxRallies !== undefined && (
          <div className="mt-2 text-center text-xs text-muted-foreground">
            {rallyCount} / {maxRallies} ラリー
          </div>
        )}
      </div>
    </div>
  );
});

FortuneSessionView.displayName = "FortuneSessionView";

export default FortuneSessionView;
