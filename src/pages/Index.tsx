import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import VoiceChat from "@/components/VoiceChat";
import TextChat from "@/components/TextChat";
import ChatModeToggle, { ChatMode } from "@/components/ChatModeToggle";
import StarField from "@/components/StarField";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { User, LogIn, ScrollText, Ticket, MessageSquare, Settings } from "lucide-react";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { DailyFortuneCard } from "@/components/DailyFortuneCard";
import { BackgroundMusic } from "@/components/BackgroundMusic";

const SettingsLink = () => {
  const { isAdmin } = useIsAdmin();
  if (!isAdmin) return null;
  return (
    <Link to="/settings" className="flex items-center gap-1 text-xs text-muted-foreground hover:text-accent transition-colors">
      <Settings className="w-3 h-3" />
      <span className="hidden sm:inline">設定</span>
    </Link>
  );
};

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [chatMode, setChatMode] = useState<ChatMode>("voice");
  const chatRef = useRef<HTMLDivElement>(null);
  const {
    profile
  } = useProfile();

  const handleNavigate = (path: string) => {
    console.log(`Navigating to: ${path}`);
    navigate(path);
  };

  // Listen for widget start-fortune event
  useEffect(() => {
    const handleWidgetStartFortune = () => {
      // Switch to voice mode
      setChatMode("voice");
      // Scroll to chat interface
      setTimeout(() => {
        chatRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300);
    };

    window.addEventListener('widget-start-fortune', handleWidgetStartFortune);
    return () => {
      window.removeEventListener('widget-start-fortune', handleWidgetStartFortune);
    };
  }, []);
  return <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden">
    {/* Background Music */}
    <BackgroundMusic />

    {/* Animated star field background */}
    <StarField />

    {/* Auth/Profile button */}
    <div className="absolute top-20 right-4 md:top-6 md:right-6 z-30 flex items-center gap-2 md:gap-3">
      {user && <button onClick={() => handleNavigate("/tickets")} className="flex items-center gap-1.5 md:gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full glass-surface text-xs md:text-sm text-foreground/80 hover:text-accent transition-colors">
        <Ticket className="w-3.5 h-3.5 md:w-4 md:h-4" />
        <span className="hidden sm:inline">チケット</span>
      </button>}
      {user && <button onClick={() => handleNavigate("/chat-history")} className="flex items-center gap-1.5 md:gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full glass-surface text-xs md:text-sm text-foreground/80 hover:text-accent transition-colors">
        <MessageSquare className="w-3.5 h-3.5 md:w-4 md:h-4" />
        <span className="hidden sm:inline">チャット履歴</span>
      </button>}
      {user && <button onClick={() => handleNavigate("/history")} className="flex items-center gap-1.5 md:gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full glass-surface text-xs md:text-sm text-foreground/80 hover:text-accent transition-colors">
        <ScrollText className="w-3.5 h-3.5 md:w-4 md:h-4" />
        <span className="hidden sm:inline">トーク履歴</span>
      </button>}
      {user ? <button onClick={() => handleNavigate("/profile")} className="flex items-center gap-1.5 md:gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full glass-surface text-xs md:text-sm text-foreground/80 hover:text-accent transition-colors">
        <User className="w-3.5 h-3.5 md:w-4 md:h-4" />
        <span className="hidden sm:inline">{profile?.display_name || "プロフィール"}</span>
      </button> : <button onClick={() => handleNavigate("/auth")} className="flex items-center gap-1.5 md:gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full glass-surface text-xs md:text-sm text-foreground/80 hover:text-accent transition-colors">
        <LogIn className="w-3.5 h-3.5 md:w-4 md:h-4" />
        <span>ログイン</span>
      </button>}
    </div>

    {/* Content */}
    <div className="relative z-10 flex flex-col items-center w-full max-w-2xl px-4 md:px-6 pt-16 pb-6 md:py-12 animate-fade-in">
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
          ✧ Fortune Talk ✧
        </p>

        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-bold tracking-wide text-foreground">
          <span className="text-gradient drop-shadow-[0_0_30px_hsl(45_80%_55%/0.5)]">フォーチュントーク</span>
        </h1>

        <p className="mt-3 md:mt-5 text-base md:text-lg text-muted-foreground font-light tracking-wider">
          話しかけて、<span className="text-accent">未来</span>を聴く
        </p>

        {/* User greeting with settings link */}
        {user && profile?.display_name && (
          <div className="mt-3 md:mt-4 flex items-center justify-center gap-2">
            <p className="text-xs md:text-sm text-accent/80">
              ようこそ、{profile.display_name}さん ✨
            </p>
            <SettingsLink />
          </div>
        )}
      </header>

      {/* Daily Fortune Card */}
      <div className="w-full mb-6 md:mb-8 flex justify-center">
        <DailyFortuneCard />
      </div>

      {/* Chat Interface */}
      <main ref={chatRef} className="w-full">
        {chatMode === "voice" ? <VoiceChat /> : <TextChat />}
      </main>

      {/* Mode Toggle - below the start button */}
      <div className="mt-6 md:mt-8">
        <ChatModeToggle mode={chatMode} onChange={setChatMode} />
      </div>

      {/* Footer - smaller on mobile */}

    </div>
  </div>;
};
export default Index;