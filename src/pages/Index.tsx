import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import VoiceChat from "@/components/VoiceChat";
import TextChat from "@/components/TextChat";
import ChatModeToggle, { ChatMode } from "@/components/ChatModeToggle";
import StarField from "@/components/StarField";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { Settings, LogIn } from "lucide-react";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { DailyFortuneCard } from "@/components/DailyFortuneCard";
import { BackgroundMusic } from "@/components/BackgroundMusic";

const SettingsLink = () => {
  const { isAdmin } = useIsAdmin();
  if (!isAdmin) return null;
  return (
    <Link
      to="/settings"
      className="touch-target rounded-xl text-foreground/40 hover:text-accent hover:bg-white/5 transition-colors"
      aria-label="設定"
    >
      <Settings className="w-[18px] h-[18px]" />
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
  useEffect(() => {
    if (user && !profileLoading && profile && profile.onboarding_completed === false) {
      navigate("/onboarding");
    }
  }, [user, profile, profileLoading, navigate]);

  const handleSessionChange = (inSession: boolean) => {
    setIsInSession(inSession);
  };

  // Listen for widget start-fortune event
  useEffect(() => {
    const handleWidgetStartFortune = () => {
      setChatMode("voice");
      setTimeout(() => {
        chatRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300);
    };

    window.addEventListener('widget-start-fortune', handleWidgetStartFortune);
    return () => {
      window.removeEventListener('widget-start-fortune', handleWidgetStartFortune);
    };
  }, []);

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden">
      <BackgroundMusic />
      <StarField />

      {/* Minimal top bar — logo + settings only (nav moved to bottom tab bar) */}
      {!isInSession && (
        <div className="fixed top-0 left-0 right-0 z-30 safe-area-top">
          <div className="flex items-center justify-between px-4 py-2.5">
            <span className="text-[11px] text-accent/50 tracking-[0.25em] uppercase font-display">
              Fortune Talk
            </span>
            <div className="flex items-center gap-0.5">
              {!user && (
                <button
                  onClick={() => navigate("/auth")}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full glass-surface text-xs text-foreground/70 hover:text-accent transition-colors"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>ログイン</span>
                </button>
              )}
              <SettingsLink />
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className={`relative z-10 flex flex-col items-center w-full px-5 md:px-8 animate-fade-in ${
        isInSession
          ? "justify-center min-h-screen py-8"
          : "max-w-2xl pt-12 pb-24 md:pt-16 md:pb-12"
      }`}>
        {/* Header */}
        {!isInSession && (
          <header className="text-center mb-8 md:mb-12">
            <p className="text-[10px] md:text-xs text-accent/50 tracking-[0.35em] uppercase mb-3 md:mb-4 font-display">
              Fortune Talk
            </p>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold tracking-wide text-foreground">
              <span className="text-gradient drop-shadow-[0_0_30px_hsl(45_80%_55%/0.4)]">フォーチュントーク</span>
            </h1>

            <p className="mt-3 md:mt-4 text-sm md:text-base text-muted-foreground font-light tracking-wider">
              話しかけて、<span className="text-accent/90">未来</span>を聴く
            </p>

            {user && profile?.display_name && (
              <p className="mt-4 md:mt-5 text-xs text-accent/60 tracking-wide">
                ようこそ、{profile.display_name}さん
              </p>
            )}
          </header>
        )}

        {/* Chat Interface */}
        <main ref={chatRef} className={`w-full ${isInSession ? "max-w-xl" : ""}`}>
          {chatMode === "voice" ? (
            <VoiceChat onSessionChange={handleSessionChange} />
          ) : (
            <TextChat onSessionChange={handleSessionChange} />
          )}
        </main>

        {/* Daily Fortune Card */}
        {!isInSession && (
          <div className="w-full mt-8 md:mt-10 flex justify-center">
            <DailyFortuneCard />
          </div>
        )}

        {/* Mode Toggle */}
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
