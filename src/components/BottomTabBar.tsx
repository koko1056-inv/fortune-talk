import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Sparkles, ScrollText, MessageSquare, Ticket, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

interface TabItem {
  path: string;
  label: string;
  icon: typeof Sparkles;
}

const tabs: TabItem[] = [
  { path: "/", label: "ホーム", icon: Sparkles },
  { path: "/history", label: "履歴", icon: ScrollText },
  { path: "/chat-history", label: "チャット", icon: MessageSquare },
  { path: "/tickets", label: "プラン", icon: Ticket },
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

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="glass-elevated border-t border-white/[0.06] shadow-[0_-4px_20px_rgba(0,0,0,0.3)]">
        <div className="flex items-stretch justify-around max-w-lg mx-auto">
          {tabs.map((tab) => {
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
                  {/* Active indicator dot */}
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
          })}
        </div>
      </div>
    </nav>
  );
};

export default BottomTabBar;
