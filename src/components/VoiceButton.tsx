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
    <div className="relative flex flex-col items-center justify-center">
      {/* Pulsing ring animation to draw attention when disconnected */}
      {!isConnected && !isConnecting && (
        <>
          <div className="absolute h-36 w-36 rounded-full border-2 border-accent/40 animate-ping-slow" />
          <div className="absolute h-40 w-40 rounded-full border border-accent/20 animate-ping-slow" style={{ animationDelay: '0.5s' }} />
        </>
      )}
      
      {/* Mystical aura rings when speaking */}
      {isSpeaking && (
        <>
          <div className="absolute h-44 w-44 rounded-full bg-primary/30 animate-pulse-ring" />
          <div className="absolute h-44 w-44 rounded-full bg-accent/20 animate-pulse-ring" style={{ animationDelay: '0.5s' }} />
          <div className="absolute h-44 w-44 rounded-full bg-primary/20 animate-pulse-ring" style={{ animationDelay: '1s' }} />
        </>
      )}
      
      {/* Outer glow effect when connected */}
      {isConnected && (
        <div className="absolute h-40 w-40 rounded-full bg-gradient-to-br from-primary/40 via-accent/20 to-primary/40 blur-2xl" />
      )}
      
      {/* Crystal ball base glow */}
      <div className={cn(
        "absolute h-36 w-36 rounded-full transition-all duration-500",
        isConnected 
          ? "bg-gradient-radial from-primary/30 via-primary/10 to-transparent blur-xl" 
          : "bg-gradient-radial from-accent/20 via-primary/10 to-transparent blur-lg animate-pulse"
      )} />
      
      {/* Main crystal ball button */}
      <button
        onClick={onClick}
        disabled={isConnecting}
        aria-label={isConnected ? "占いを終了する" : "占いを始める"}
        className={cn(
          "relative z-10 flex h-32 w-32 items-center justify-center rounded-full transition-all duration-500",
          "focus:outline-none focus-visible:ring-4 focus-visible:ring-accent/50",
          isConnected
            ? "animate-crystal-glow hover:scale-105 active:scale-95"
            : "hover:scale-110 active:scale-95 cursor-pointer",
          isConnecting && "opacity-70 cursor-not-allowed",
          !isConnected && !isConnecting && "animate-float-slow"
        )}
        style={{
          background: isConnected 
            ? 'radial-gradient(ellipse at 30% 30%, hsl(200 80% 85% / 0.5), hsl(280 60% 50% / 0.6), hsl(260 50% 30% / 0.8))'
            : 'radial-gradient(ellipse at 30% 30%, hsl(280 60% 70% / 0.4), hsl(260 50% 45% / 0.6), hsl(260 40% 25% / 0.8))',
          boxShadow: isConnected
            ? '0 0 50px hsl(280 70% 50% / 0.6), inset 0 0 40px hsl(200 60% 80% / 0.2), 0 20px 40px -10px hsl(260 50% 10% / 0.5)'
            : '0 0 40px hsl(280 60% 50% / 0.4), inset 0 0 30px hsl(280 40% 60% / 0.2), 0 15px 30px -10px hsl(260 50% 5% / 0.5)',
        }}
      >
        {/* Crystal ball shine */}
        <div className="absolute top-4 left-6 w-7 h-7 rounded-full bg-white/30 blur-sm" />
        <div className="absolute top-6 left-9 w-2.5 h-2.5 rounded-full bg-white/60" />
        
        {/* Inner content */}
        {isConnecting ? (
          <Loader2 className="h-12 w-12 text-accent animate-spin" />
        ) : (
          <span className={cn(
            "text-6xl transition-all duration-500 drop-shadow-[0_0_20px_hsl(280_60%_60%/0.5)]",
            isConnected ? "animate-float" : ""
          )}>
            🔮
          </span>
        )}
        
        {/* Bottom reflection */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-18 h-4 rounded-full bg-gradient-to-t from-white/15 to-transparent blur-sm" />
      </button>
      
      {/* Crystal ball stand */}
      <div className="absolute -bottom-5 w-24 h-7 rounded-full bg-gradient-to-b from-amber-900/60 via-amber-800/40 to-amber-900/60 blur-[1px]"
        style={{
          boxShadow: '0 4px 15px -5px hsl(30 50% 20% / 0.5), inset 0 2px 4px hsl(45 50% 40% / 0.2)'
        }}
      />
      
      {/* Call to action text when not connected */}
      {!isConnected && !isConnecting && (
        <div className="absolute -bottom-16 flex flex-col items-center animate-fade-in">
          <span className="text-xs text-accent/70 tracking-widest uppercase mb-1">タップして開始</span>
          <div className="flex items-center gap-1">
            <span className="w-1 h-1 rounded-full bg-accent/50 animate-bounce" style={{ animationDelay: '0s' }} />
            <span className="w-1 h-1 rounded-full bg-accent/50 animate-bounce" style={{ animationDelay: '0.2s' }} />
            <span className="w-1 h-1 rounded-full bg-accent/50 animate-bounce" style={{ animationDelay: '0.4s' }} />
          </div>
        </div>
      )}
    </div>
  );
};

export default VoiceButton;