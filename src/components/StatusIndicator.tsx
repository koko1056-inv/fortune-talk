import { cn } from "@/lib/utils";

interface StatusIndicatorProps {
  status: "disconnected" | "connecting" | "connected" | "disconnecting";
  isSpeaking: boolean;
}

const StatusIndicator = ({ status }: StatusIndicatorProps) => {
  // Only show connecting status - other states are handled by VoiceButton
  if (status !== "connecting") {
    return null;
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex items-center gap-3">
        <span className="text-accent/40">✧</span>
        <div className="h-2 w-2 rounded-full bg-accent/70 animate-pulse" />
        <span className="text-xs md:text-sm font-medium text-muted-foreground tracking-wide">
          神秘の扉を開いています...
        </span>
        <div className="h-2 w-2 rounded-full bg-accent/70 animate-pulse" />
        <span className="text-accent/40">✧</span>
      </div>
    </div>
  );
};

export default StatusIndicator;