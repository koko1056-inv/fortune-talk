import { Link } from "react-router-dom";
import VoiceChat from "@/components/VoiceChat";
import StarField from "@/components/StarField";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { User, LogIn } from "lucide-react";

const Index = () => {
  const { user } = useAuth();
  const { profile } = useProfile();

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden">
      {/* Animated star field background */}
      <StarField />
      
      {/* Auth/Profile button */}
      <div className="absolute top-6 right-6 z-20">
        {user ? (
          <Link
            to="/profile"
            className="flex items-center gap-2 px-4 py-2 rounded-full glass-surface text-sm text-foreground/80 hover:text-accent transition-colors"
          >
            <User className="w-4 h-4" />
            <span>{profile?.display_name || "プロフィール"}</span>
          </Link>
        ) : (
          <Link
            to="/auth"
            className="flex items-center gap-2 px-4 py-2 rounded-full glass-surface text-sm text-foreground/80 hover:text-accent transition-colors"
          >
            <LogIn className="w-4 h-4" />
            <span>ログイン</span>
          </Link>
        )}
      </div>
      
      {/* Content */}
      <div className="relative z-10 flex flex-col items-center w-full max-w-2xl px-6 py-12 animate-fade-in">
        {/* Header - More Pop! */}
        <header className="text-center mb-12">
          {/* Decorative sparkles */}
          <div className="relative inline-block mb-4">
            <span className="absolute -top-4 -left-8 text-2xl animate-twinkle" style={{ animationDelay: '0s' }}>✦</span>
            <span className="absolute -top-2 -right-6 text-xl animate-twinkle" style={{ animationDelay: '0.5s' }}>✧</span>
            <span className="absolute top-6 -left-10 text-lg animate-twinkle" style={{ animationDelay: '1s' }}>⋆</span>
            <span className="absolute top-8 -right-8 text-2xl animate-twinkle" style={{ animationDelay: '1.5s' }}>✦</span>
            
            {/* Main crystal emoji with glow */}
            <div className="relative">
              <div className="absolute inset-0 text-7xl blur-lg opacity-50 animate-pulse">🔮</div>
              <span className="text-7xl relative animate-float-slow">🔮</span>
            </div>
          </div>
          
          <p className="text-sm text-accent tracking-[0.4em] uppercase mb-3 font-display animate-shimmer inline-block">
            ✧ Fortune Telling AI ✧
          </p>
          
          <h1 className="text-5xl font-display font-bold tracking-wide text-foreground md:text-6xl lg:text-7xl">
            <span className="text-gradient drop-shadow-[0_0_30px_hsl(45_80%_55%/0.5)]">占いAI</span>
          </h1>
          
          <p className="mt-5 text-lg text-muted-foreground font-light tracking-wider">
            水晶に触れ、<span className="text-accent">運命</span>の扉を開く
          </p>
          
          {/* User greeting */}
          {user && profile?.display_name && (
            <p className="mt-4 text-sm text-accent/80">
              ようこそ、{profile.display_name}さん ✨
            </p>
          )}
        </header>

        {/* Voice Chat Interface */}
        <main className="w-full">
          <VoiceChat />
        </main>

        {/* Footer */}
        <footer className="mt-16 text-center">
          <div className="inline-flex items-center gap-3 text-accent/60 text-sm">
            <span className="w-12 h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" />
            <span className="text-lg">✧</span>
            <span className="w-12 h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" />
          </div>
          <p className="mt-4 text-sm text-muted-foreground/60 leading-relaxed">
            水晶玉に触れて占い師と繋がり、
            <br />
            あなたの運命を紐解いていきましょう。
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Index;