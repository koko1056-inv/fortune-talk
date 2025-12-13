import { Link } from "react-router-dom";
import VoiceChat from "@/components/VoiceChat";
import StarField from "@/components/StarField";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { User, LogIn, ScrollText } from "lucide-react";
const Index = () => {
  const {
    user
  } = useAuth();
  const {
    profile
  } = useProfile();
  return <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden">
      {/* Animated star field background */}
      <StarField />
      
      {/* Auth/Profile button */}
      <div className="absolute top-4 right-4 md:top-6 md:right-6 z-20 flex items-center gap-2 md:gap-3">
        {user && <Link to="/history" className="flex items-center gap-1.5 md:gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full glass-surface text-xs md:text-sm text-foreground/80 hover:text-accent transition-colors">
            <ScrollText className="w-3.5 h-3.5 md:w-4 md:h-4" />
            <span className="hidden sm:inline">履歴</span>
          </Link>}
        {user ? <Link to="/profile" className="flex items-center gap-1.5 md:gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full glass-surface text-xs md:text-sm text-foreground/80 hover:text-accent transition-colors">
            <User className="w-3.5 h-3.5 md:w-4 md:h-4" />
            <span className="hidden sm:inline">{profile?.display_name || "プロフィール"}</span>
          </Link> : <Link to="/auth" className="flex items-center gap-1.5 md:gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full glass-surface text-xs md:text-sm text-foreground/80 hover:text-accent transition-colors">
            <LogIn className="w-3.5 h-3.5 md:w-4 md:h-4" />
            <span>ログイン</span>
          </Link>}
      </div>
      
      {/* Content */}
      <div className="relative z-10 flex flex-col items-center w-full max-w-2xl px-4 md:px-6 py-6 md:py-12 animate-fade-in">
        {/* Header - Compact on mobile */}
        <header className="text-center mb-6 md:mb-12">
          {/* Decorative sparkles - smaller on mobile */}
          <div className="relative inline-block mb-2 md:mb-4">
            <span className="absolute -top-3 -left-6 text-lg md:text-2xl animate-twinkle" style={{
            animationDelay: '0s'
          }}>✦</span>
            <span className="absolute -top-1 -right-4 md:-right-6 text-base md:text-xl animate-twinkle" style={{
            animationDelay: '0.5s'
          }}>✧</span>
            <span className="absolute top-4 -left-8 md:-left-10 text-sm md:text-lg animate-twinkle" style={{
            animationDelay: '1s'
          }}>⋆</span>
            <span className="absolute top-6 -right-6 md:-right-8 text-lg md:text-2xl animate-twinkle" style={{
            animationDelay: '1.5s'
          }}>✦</span>
            
            {/* Main crystal emoji with glow - smaller on mobile */}
            <div className="relative">
              <div className="absolute inset-0 text-5xl md:text-7xl blur-lg opacity-50 animate-pulse">🔮</div>
              
            </div>
          </div>
          
          <p className="text-xs md:text-sm text-accent tracking-[0.3em] md:tracking-[0.4em] uppercase mb-2 md:mb-3 font-display animate-shimmer inline-block">
            ✧ Fortune Voice ✧
          </p>
          
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-bold tracking-wide text-foreground">
            <span className="text-gradient drop-shadow-[0_0_30px_hsl(45_80%_55%/0.5)]">フォーチュンボイス</span>
          </h1>
          
          <p className="mt-3 md:mt-5 text-base md:text-lg text-muted-foreground font-light tracking-wider">
            話しかけて、<span className="text-accent">未来</span>を聴く
          </p>
          
          {/* User greeting */}
          {user && profile?.display_name && <p className="mt-3 md:mt-4 text-xs md:text-sm text-accent/80">
              ようこそ、{profile.display_name}さん ✨
            </p>}
        </header>

        {/* Voice Chat Interface */}
        <main className="w-full">
          <VoiceChat />
        </main>

        {/* Footer - smaller on mobile */}
        <footer className="mt-10 md:mt-16 text-center">
          <div className="inline-flex items-center gap-2 md:gap-3 text-accent/60 text-sm">
            <span className="w-8 md:w-12 h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" />
            <span className="text-base md:text-lg">✧</span>
            <span className="w-8 md:w-12 h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" />
          </div>
          <p className="mt-3 md:mt-4 text-xs md:text-sm text-muted-foreground/60 leading-relaxed">
            水晶玉に触れて占い師と繋がり、
            <br />
            あなたの運命を紐解いていきましょう。
          </p>
        </footer>
      </div>
    </div>;
};
export default Index;