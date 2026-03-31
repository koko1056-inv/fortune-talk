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
    <Link
      to="/settings"
      className="p-2 rounded-lg text-foreground/60 hover:text-accent hover:bg-white/5 transition-colors"
      aria-label="設定"
    >
      <Settings className="w-4 h-4" />
    </Link>
  );
};

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [chatMode, setChatMode] = useState<ChatMode>("voice");
  const [isInSession, setIsInSession] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);
  const {
    profile,
    loading: profileLoading
  } = useProfile();

  // Redirect to onboarding if not completed
  // onboarding_completed is explicitly false only when the column exists and is false
  // If undefined (column not in DB yet), skip redirect to avoid loops
  useEffect(() => {
    if (user && !profileLoading && profile && profile.onboarding_completed === false) {
      navigate("/onboarding");
    }
  }, [user, profile, profileLoading, navigate]);

  const handleNavigate = (path: string) => {
    console.log(`Navigating to: ${path}`);
    navigate(path);
  };

  const handleSessionChange = (inSession: boolean) => {
    console.log("[Index] handleSessionChange called with:", inSession);
    setIsInSession(inSession);
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

  // Single unified render - chat components are NEVER unmounted/remounted
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden">
      {/* Background Music */}
      <BackgroundMusic />

      {/* Animated star field background */}
      <StarField />

      {/* Top navigation bar - hidden during session */}
      {!isInSession && (
        <nav className="fixed top-0 left-0 right-0 z-30" style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
          <div className="flex items-center justify-between px-4 py-2.5 bg-background/60 backdrop-blur-md border-b border-white/5">
            {/* Left: App name */}
            <span className="text-xs text-accent/70 tracking-[0.2em] uppercase font-display">
              Fortune Talk
            </span>

            {/* Right: Nav icons */}
            <div className="flex items-center gap-1">
              {user && (
                <>
                  <button
                    onClick={() => handleNavigate("/tickets")}
                    className="p-2 rounded-lg text-foreground/60 hover:text-accent hover:bg-white/5 transition-colors"
                    aria-label="チケット"
                  >
                    <Ticket className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleNavigate("/chat-history")}
                    className="p-2 rounded-lg text-foreground/60 hover:text-accent hover:bg-white/5 transition-colors"
                    aria-label="チャット履歴"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleNavigate("/history")}
                    className="p-2 rounded-lg text-foreground/60 hover:text-accent hover:bg-white/5 transition-colors"
                    aria-label="トーク履歴"
                  >
                    <ScrollText className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleNavigate("/profile")}
                    className="p-2 rounded-lg text-foreground/60 hover:text-accent hover:bg-white/5 transition-colors"
                    aria-label="プロフィール"
                  >
                    <User className="w-4 h-4" />
                  </button>
                  <SettingsLink />
                </>
              )}
              {!user && (
                <button
                  onClick={() => handleNavigate("/auth")}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full glass-surface text-xs text-foreground/80 hover:text-accent transition-colors"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>ログイン</span>
                </button>
              )}
            </div>
          </div>
        </nav>
      )}

      {/* Content - layout changes based on session state but components stay mounted */}
      <div className={`relative z-10 flex flex-col items-center w-full px-4 md:px-6 animate-fade-in ${
        isInSession
          ? "justify-center min-h-screen py-8"
          : "max-w-2xl pt-14 pb-6 md:pt-16 md:pb-12"
      }`}>
        {/* Header - hidden during session */}
        {!isInSession && (
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

            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-display font-bold tracking-wide text-foreground">
              <span className="text-gradient drop-shadow-[0_0_30px_hsl(45_80%_55%/0.5)]">フォーチュントーク</span>
            </h1>

            <p className="mt-3 md:mt-5 text-base md:text-lg text-muted-foreground font-light tracking-wider">
              話しかけて、<span className="text-accent">未来</span>を聴く
            </p>

            {/* User greeting */}
            {user && profile?.display_name && (
              <p className="mt-3 md:mt-4 text-xs md:text-sm text-accent/80">
                ようこそ、{profile.display_name}さん ✨
              </p>
            )}
          </header>
        )}

        {/* Daily Fortune Card moved below chat interface */}

        {/* Chat Interface - ALWAYS mounted, never unmounted */}
        <main ref={chatRef} className={`w-full ${isInSession ? "max-w-xl" : ""}`}>
          {chatMode === "voice" ? (
            <VoiceChat onSessionChange={handleSessionChange} />
          ) : (
            <TextChat onSessionChange={handleSessionChange} />
          )}
        </main>

        {/* Daily Fortune Card - below chat, hidden during session */}
        {!isInSession && (
          <div className="w-full mt-6 md:mt-8 flex justify-center">
            <DailyFortuneCard />
          </div>
        )}

        {/* Mode Toggle - hidden during session */}
        {!isInSession && (
          <div className="mt-6 md:mt-8">
            <ChatModeToggle mode={chatMode} onChange={setChatMode} />
          </div>
        )}
      </div>
    </div>
  );
};
export default Index;
