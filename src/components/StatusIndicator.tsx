import { cn } from "@/lib/utils";

interface StatusIndicatorProps {
  status: "disconnected" | "connecting" | "connected" | "disconnecting";
  isSpeaking: boolean;
}

const StatusIndicator = ({ status, isSpeaking }: StatusIndicatorProps) => {
  const getStatusText = () => {
    switch (status) {
      case "connecting":
        return "神秘の扉を開いています...";
      case "connected":
        return isSpeaking ? "占い師が語りかけています" : "あなたの声を聴いています";
      default:
        return "水晶に触れて占いを始める";
    }
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex items-center gap-3">
        <span className="text-accent/40">✧</span>
        <div
          className={cn(
            "h-2 w-2 rounded-full transition-all duration-300",
            status === "connected"
              ? isSpeaking
                ? "bg-accent shadow-glow-gold animate-pulse"
                : "bg-primary shadow-glow"
              : status === "connecting"
              ? "bg-accent/70 animate-pulse"
              : "bg-muted-foreground/30"
          )}
        />
        <span className="text-sm font-medium text-muted-foreground tracking-wide">
          {getStatusText()}
        </span>
        <div
          className={cn(
            "h-2 w-2 rounded-full transition-all duration-300",
            status === "connected"
              ? isSpeaking
                ? "bg-accent shadow-glow-gold animate-pulse"
                : "bg-primary shadow-glow"
              : status === "connecting"
              ? "bg-accent/70 animate-pulse"
              : "bg-muted-foreground/30"
          )}
        />
        <span className="text-accent/40">✧</span>
      </div>
    </div>
  );
};

export default StatusIndicator;