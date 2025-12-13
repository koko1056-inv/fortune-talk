import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface VoiceButtonProps {
  isConnected: boolean;
  isConnecting: boolean;
  isSpeaking: boolean;
  onClick: () => void;
}

const VoiceButton = ({ isConnected, isConnecting, isSpeaking, onClick }: VoiceButtonProps) => {
  return (
    <div className="relative flex items-center justify-center">
      {/* Mystical aura rings when speaking */}
      {isSpeaking && (
        <>
          <div className="absolute h-40 w-40 rounded-full bg-primary/30 animate-pulse-ring" />
          <div className="absolute h-40 w-40 rounded-full bg-accent/20 animate-pulse-ring" style={{ animationDelay: '0.5s' }} />
          <div className="absolute h-40 w-40 rounded-full bg-primary/20 animate-pulse-ring" style={{ animationDelay: '1s' }} />
        </>
      )}
      
      {/* Outer glow effect when connected */}
      {isConnected && (
        <div className="absolute h-36 w-36 rounded-full bg-gradient-to-br from-primary/40 via-accent/20 to-primary/40 blur-2xl" />
      )}
      
      {/* Crystal ball base glow */}
      <div className={cn(
        "absolute h-32 w-32 rounded-full transition-all duration-500",
        isConnected 
          ? "bg-gradient-radial from-primary/30 via-primary/10 to-transparent blur-xl" 
          : "bg-gradient-radial from-muted/20 to-transparent blur-lg"
      )} />
      
      {/* Main crystal ball button */}
      <button
        onClick={onClick}
        disabled={isConnecting}
        className={cn(
          "relative z-10 flex h-28 w-28 items-center justify-center rounded-full transition-all duration-500",
          "focus:outline-none focus-visible:ring-4 focus-visible:ring-accent/50",
          isConnected
            ? "animate-crystal-glow hover:scale-105 active:scale-95"
            : "hover:scale-105 active:scale-95",
          isConnecting && "opacity-70 cursor-not-allowed"
        )}
        style={{
          background: isConnected 
            ? 'radial-gradient(ellipse at 30% 30%, hsl(200 80% 85% / 0.5), hsl(280 60% 50% / 0.6), hsl(260 50% 30% / 0.8))'
            : 'radial-gradient(ellipse at 30% 30%, hsl(260 20% 40% / 0.4), hsl(260 30% 20% / 0.6), hsl(260 30% 15% / 0.8))',
          boxShadow: isConnected
            ? '0 0 40px hsl(280 70% 50% / 0.5), inset 0 0 40px hsl(200 60% 80% / 0.2), 0 20px 40px -10px hsl(260 50% 10% / 0.5)'
            : '0 0 20px hsl(260 30% 30% / 0.3), inset 0 0 30px hsl(260 20% 10% / 0.3), 0 15px 30px -10px hsl(260 50% 5% / 0.5)',
        }}
      >
        {/* Crystal ball shine */}
        <div className="absolute top-3 left-5 w-6 h-6 rounded-full bg-white/30 blur-sm" />
        <div className="absolute top-5 left-8 w-2 h-2 rounded-full bg-white/50" />
        
        {/* Inner content */}
        {isConnecting ? (
          <Loader2 className="h-10 w-10 text-accent animate-spin" />
        ) : (
          <span className={cn(
            "text-5xl transition-all duration-500",
            isConnected ? "animate-float" : "opacity-60"
          )}>
            🔮
          </span>
        )}
        
        {/* Bottom reflection */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-16 h-3 rounded-full bg-gradient-to-t from-white/10 to-transparent blur-sm" />
      </button>
      
      {/* Crystal ball stand */}
      <div className="absolute -bottom-4 w-20 h-6 rounded-full bg-gradient-to-b from-amber-900/60 via-amber-800/40 to-amber-900/60 blur-[1px]"
        style={{
          boxShadow: '0 4px 15px -5px hsl(30 50% 20% / 0.5), inset 0 2px 4px hsl(45 50% 40% / 0.2)'
        }}
      />
    </div>
  );
};

export default VoiceButton;