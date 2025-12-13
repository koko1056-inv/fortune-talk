import { cn } from "@/lib/utils";
import { Mic, MicOff, Loader2 } from "lucide-react";

interface VoiceButtonProps {
  isConnected: boolean;
  isConnecting: boolean;
  isSpeaking: boolean;
  onClick: () => void;
}

const VoiceButton = ({ isConnected, isConnecting, isSpeaking, onClick }: VoiceButtonProps) => {
  return (
    <div className="relative flex items-center justify-center">
      {/* Pulse rings when speaking */}
      {isSpeaking && (
        <>
          <div className="absolute h-32 w-32 rounded-full bg-primary/20 animate-pulse-ring" />
          <div className="absolute h-32 w-32 rounded-full bg-primary/20 animate-pulse-ring" style={{ animationDelay: '0.5s' }} />
          <div className="absolute h-32 w-32 rounded-full bg-primary/20 animate-pulse-ring" style={{ animationDelay: '1s' }} />
        </>
      )}
      
      {/* Glow effect when connected */}
      {isConnected && (
        <div className="absolute h-28 w-28 rounded-full bg-primary/30 blur-2xl" />
      )}
      
      {/* Main button */}
      <button
        onClick={onClick}
        disabled={isConnecting}
        className={cn(
          "relative z-10 flex h-24 w-24 items-center justify-center rounded-full transition-all duration-300",
          "focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/50",
          isConnected
            ? "bg-gradient-to-br from-primary to-primary/80 shadow-button hover:scale-105 active:scale-95"
            : "bg-secondary hover:bg-secondary/80 hover:shadow-soft active:scale-95",
          isConnecting && "opacity-70 cursor-not-allowed"
        )}
      >
        {isConnecting ? (
          <Loader2 className="h-10 w-10 text-muted-foreground animate-spin" />
        ) : isConnected ? (
          <Mic className="h-10 w-10 text-primary-foreground" />
        ) : (
          <MicOff className="h-10 w-10 text-muted-foreground" />
        )}
      </button>
    </div>
  );
};

export default VoiceButton;
