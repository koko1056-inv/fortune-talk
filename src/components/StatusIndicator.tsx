import { cn } from "@/lib/utils";

interface StatusIndicatorProps {
  status: "disconnected" | "connecting" | "connected" | "disconnecting";
  isSpeaking: boolean;
}

const StatusIndicator = ({ status, isSpeaking }: StatusIndicatorProps) => {
  const getStatusText = () => {
    switch (status) {
      case "connecting":
        return "接続中...";
      case "connected":
        return isSpeaking ? "AIが話しています" : "聞いています";
      default:
        return "タップして開始";
    }
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex items-center gap-2">
        <div
          className={cn(
            "h-2 w-2 rounded-full transition-colors duration-300",
            status === "connected"
              ? isSpeaking
                ? "bg-primary animate-pulse"
                : "bg-green-500"
              : status === "connecting"
              ? "bg-amber-500 animate-pulse"
              : "bg-muted-foreground/50"
          )}
        />
        <span className="text-sm font-medium text-muted-foreground">
          {getStatusText()}
        </span>
      </div>
    </div>
  );
};

export default StatusIndicator;
