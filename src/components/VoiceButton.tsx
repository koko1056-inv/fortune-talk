import { cn } from "@/lib/utils";
import { Loader2, Sparkles, Phone, PhoneOff } from "lucide-react";
interface VoiceButtonProps {
  isConnected: boolean;
  isConnecting: boolean;
  isSpeaking: boolean;
  onClick: () => void;
}
const VoiceButton = ({
  isConnected,
  isConnecting,
  isSpeaking,
  onClick
}: VoiceButtonProps) => {
  return <div className="relative flex flex-col items-center justify-center">
      {/* Mystical aura rings when speaking */}
      {isSpeaking && <>
          <div className="absolute h-32 w-64 md:h-40 md:w-80 rounded-full bg-primary/20 animate-pulse-ring" />
          <div className="absolute h-32 w-64 md:h-40 md:w-80 rounded-full bg-accent/15 animate-pulse-ring" style={{
        animationDelay: '0.5s'
      }} />
        </>}
      
      {/* Outer glow effect */}
      <div className={cn("absolute h-16 w-56 md:h-20 md:w-72 rounded-full blur-2xl transition-all duration-500", isConnected ? "bg-gradient-to-r from-primary/40 via-accent/30 to-primary/40" : "bg-gradient-to-r from-primary/20 via-accent/15 to-primary/20")} />
      
      {/* Main button */}
      <button onClick={onClick} disabled={isConnecting} aria-label={isConnected ? "占いを終了する" : "占いを始める"} className={cn("relative z-10 flex items-center justify-center gap-2 md:gap-3 px-8 py-4 md:px-12 md:py-5 rounded-full transition-all duration-500", "focus:outline-none focus-visible:ring-4 focus-visible:ring-accent/50", "border", isConnected ? "hover:scale-105 active:scale-95 border-destructive/50" : "hover:scale-105 active:scale-95 cursor-pointer border-accent/30", isConnecting && "opacity-70 cursor-not-allowed", !isConnected && !isConnecting && "animate-pulse-subtle")} style={{
      background: isConnected ? 'linear-gradient(135deg, hsl(0 60% 30% / 0.8), hsl(0 50% 25% / 0.9))' : 'linear-gradient(135deg, hsl(280 50% 25% / 0.8), hsl(260 40% 20% / 0.9))',
      boxShadow: isConnected ? '0 0 30px hsl(0 60% 40% / 0.4), inset 0 1px 0 hsl(0 50% 50% / 0.2), 0 10px 30px -10px hsl(0 50% 10% / 0.5)' : '0 0 40px hsl(280 60% 50% / 0.3), inset 0 1px 0 hsl(280 50% 60% / 0.2), 0 10px 30px -10px hsl(260 50% 5% / 0.5)'
    }}>
        {/* Decorative sparkle */}
        {!isConnected && !isConnecting && <span className="absolute -top-2 -right-2 text-accent animate-twinkle">✦</span>}
        
        {/* Icon */}
        {isConnecting ? <Loader2 className="h-5 w-5 md:h-6 md:w-6 text-accent animate-spin" /> : isConnected ? <PhoneOff className="h-5 w-5 md:h-6 md:w-6 text-red-300" /> : <Sparkles className="h-5 w-5 md:h-6 md:w-6 text-accent" />}
        
        {/* Text */}
        <span className={cn("font-display font-semibold tracking-wider text-sm md:text-base", isConnected ? "text-red-200" : "text-foreground")}>
          {isConnecting ? "接続中..." : isConnected ? "鑑定を終了" : "占いを始める"}
        </span>
        
        {/* Decorative sparkle */}
        {!isConnected && !isConnecting && <span className="absolute -bottom-2 -left-2 text-accent/60 animate-twinkle" style={{
        animationDelay: '1s'
      }}>✧</span>}
      </button>
      
      {/* Hint text when not connected */}
      {!isConnected && !isConnecting && <p className="mt-4 md:mt-6 text-[10px] md:text-xs text-muted-foreground/50 tracking-wider">
          ✧ マイクを使用します ✧
        </p>}
      
      {/* Speaking indicator when connected */}
      {isConnected && <div className="mt-4 md:mt-6 flex items-center gap-2">
          <div className={cn("w-2 h-2 rounded-full transition-all duration-300", isSpeaking ? "bg-accent animate-pulse" : "bg-primary")} />
          <span className="text-[10px] md:text-xs text-muted-foreground tracking-wider">
            {isSpeaking ? "占い師が語りかけています" : "あなたの声を聴いています"}
          </span>
          <div className={cn("w-2 h-2 rounded-full transition-all duration-300", isSpeaking ? "bg-accent animate-pulse" : "bg-primary")} />
        </div>}
    </div>;
};
export default VoiceButton;