import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Sun, ScrollText, Sparkles, Users, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

interface TabItem {
  path: string;
  label: string;
  icon: typeof Sparkles;
}

const leftTabs: TabItem[] = [
  { path: "/today", label: "今日", icon: Sun },
  { path: "/history", label: "履歴", icon: ScrollText },
];

const rightTabs: TabItem[] = [
  { path: "/agents", label: "占い師", icon: Users },
  { path: "/profile", label: "マイページ", icon: User },
];

// Pages where tab bar should be hidden
const HIDDEN_ROUTES = ["/auth", "/onboarding", "/settings", "/commercial-transaction"];

const BottomTabBar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSessionActive, setIsSessionActive] = useState(false);

  // Listen for voice/text session state changes
  useEffect(() => {
    const handleSessionStart = () => setIsSessionActive(true);
    const handleSessionEnd = () => setIsSessionActive(false);

    window.addEventListener("fortune-session-start", handleSessionStart);
    window.addEventListener("fortune-session-end", handleSessionEnd);
    return () => {
      window.removeEventListener("fortune-session-start", handleSessionStart);
      window.removeEventListener("fortune-session-end", handleSessionEnd);
    };
  }, []);

  // Hide tab bar on certain routes or during sessions
  const currentPath = location.pathname;
  const shouldHide =
    isSessionActive ||
    HIDDEN_ROUTES.some((route) => currentPath.startsWith(route)) ||
    !user;

  if (shouldHide) return null;

  const isHomeActive = currentPath === "/";

  const renderTab = (tab: TabItem) => {
    const isActive = currentPath === tab.path;
    const Icon = tab.icon;

    return (
      <button
        key={tab.path}
        onClick={() => navigate(tab.path)}
        className={cn(
          "flex-1 flex flex-col items-center justify-center gap-0.5 py-2 pt-2.5 transition-colors duration-200",
          "active:scale-95 active:opacity-80",
          isActive
            ? "text-accent"
            : "text-muted-foreground/50 hover:text-muted-foreground/80"
        )}
        aria-label={tab.label}
        aria-current={isActive ? "page" : undefined}
      >
        <div className="relative">
          <Icon
            className={cn(
              "w-[22px] h-[22px] transition-all duration-200",
              isActive && "drop-shadow-[0_0_6px_hsl(45_80%_55%/0.5)]"
            )}
            strokeWidth={isActive ? 2.2 : 1.8}
          />
          {isActive && (
            <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-accent" />
          )}
        </div>
        <span
          className={cn(
            "text-[10px] leading-tight transition-colors duration-200",
            isActive ? "font-medium" : "font-normal"
          )}
        >
          {tab.label}
        </span>
      </button>
    );
  };

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="glass-elevated border-t border-white/[0.06] shadow-[0_-4px_20px_rgba(0,0,0,0.3)]">
        <div className="flex items-end justify-around max-w-lg mx-auto relative">
          {/* Left tabs */}
          {leftTabs.map(renderTab)}

          {/* Center fortune button — raised */}
          <div className="flex flex-col items-center -mt-5 px-1">
            <button
              onClick={() => navigate("/")}
              className={cn(
                "relative w-[56px] h-[56px] rounded-full flex items-center justify-center",
                "transition-all duration-300 active:scale-90",
                isHomeActive
                  ? "bg-gradient-to-br from-accent via-amber-500 to-accent shadow-[0_0_24px_hsl(45_80%_55%/0.5)]"
                  : "bg-gradient-to-br from-primary via-purple-600 to-primary/80 shadow-[0_4px_20px_hsl(280_70%_50%/0.4)]"
              )}
              aria-label="占い"
              aria-current={isHomeActive ? "page" : undefined}
            >
              {/* Glow ring */}
              <div
                className={cn(
                  "absolute inset-0 rounded-full transition-opacity duration-300",
                  isHomeActive ? "opacity-100" : "opacity-0"
                )}
                style={{
                  boxShadow: "0 0 20px hsl(45 80% 55% / 0.4), inset 0 0 12px hsl(45 80% 80% / 0.2)",
                }}
              />
              <Sparkles
                className={cn(
                  "w-7 h-7 relative z-10 transition-all duration-200",
                  isHomeActive ? "text-accent-foreground" : "text-primary-foreground"
                )}
                strokeWidth={2}
              />
            </button>
            <span
              className={cn(
                "text-[10px] leading-tight mt-1 transition-colors duration-200",
                isHomeActive ? "text-accent font-medium" : "text-muted-foreground/50"
              )}
            >
              占い
            </span>
          </div>

          {/* Right tabs */}
          {rightTabs.map(renderTab)}
        </div>
      </div>
    </nav>
  );
};

export default BottomTabBar;
