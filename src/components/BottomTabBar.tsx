import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

interface TabItem {
  path: string;
  label: string;
  icon: (props: { active: boolean }) => JSX.Element;
}

// Custom SVG icons — refined, mystical style
const MoonIcon = ({ active }: { active: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M21.752 15.002A9.718 9.718 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z"
      stroke="currentColor"
      strokeWidth={active ? 2 : 1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill={active ? "currentColor" : "none"}
      fillOpacity={active ? 0.15 : 0}
    />
    {active && (
      <>
        <circle cx="19" cy="5" r="0.8" fill="currentColor" opacity="0.6" />
        <circle cx="21" cy="9" r="0.5" fill="currentColor" opacity="0.4" />
      </>
    )}
  </svg>
);

const BookIcon = ({ active }: { active: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25"
      stroke="currentColor"
      strokeWidth={active ? 2 : 1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const CrystalIcon = ({ active }: { active: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M12 2L4.5 8.5L12 22L19.5 8.5L12 2Z"
      stroke="currentColor"
      strokeWidth={active ? 2 : 1.5}
      strokeLinejoin="round"
      fill={active ? "currentColor" : "none"}
      fillOpacity={active ? 0.1 : 0}
    />
    <path
      d="M4.5 8.5H19.5"
      stroke="currentColor"
      strokeWidth={active ? 2 : 1.5}
      strokeLinecap="round"
    />
    <path
      d="M8 8.5L12 2L16 8.5"
      stroke="currentColor"
      strokeWidth={active ? 1.5 : 1}
      strokeLinecap="round"
      strokeLinejoin="round"
      opacity={0.5}
    />
  </svg>
);

const PersonIcon = ({ active }: { active: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle
      cx="12" cy="8" r="4"
      stroke="currentColor"
      strokeWidth={active ? 2 : 1.5}
      fill={active ? "currentColor" : "none"}
      fillOpacity={active ? 0.1 : 0}
    />
    <path
      d="M5.338 18.634C6.21 15.968 8.86 14 12 14s5.79 1.968 6.662 4.634"
      stroke="currentColor"
      strokeWidth={active ? 2 : 1.5}
      strokeLinecap="round"
    />
  </svg>
);

const leftTabs: TabItem[] = [
  { path: "/today", label: "今日", icon: MoonIcon },
  { path: "/history", label: "履歴", icon: BookIcon },
];

const rightTabs: TabItem[] = [
  { path: "/agents", label: "占い師", icon: CrystalIcon },
  { path: "/profile", label: "マイページ", icon: PersonIcon },
];

// Pages where tab bar should be hidden
const HIDDEN_ROUTES = ["/auth", "/onboarding", "/settings", "/commercial-transaction"];

const BottomTabBar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSessionActive, setIsSessionActive] = useState(false);

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

  const currentPath = location.pathname;
  const shouldHide =
    isSessionActive ||
    HIDDEN_ROUTES.some((route) => currentPath.startsWith(route)) ||
    !user;

  if (shouldHide) return null;

  const isHomeActive = currentPath === "/";

  const renderTab = (tab: TabItem) => {
    const isActive = currentPath === tab.path;
    const IconComponent = tab.icon;

    return (
      <button
        key={tab.path}
        onClick={() => navigate(tab.path)}
        className={cn(
          "flex-1 flex flex-col items-center justify-center gap-1 py-2.5 transition-all duration-200",
          "active:scale-95",
          isActive
            ? "text-accent"
            : "text-muted-foreground/40 hover:text-muted-foreground/70"
        )}
        aria-label={tab.label}
        aria-current={isActive ? "page" : undefined}
      >
        <IconComponent active={isActive} />
        <span
          className={cn(
            "text-[10px] leading-none tracking-wide transition-all duration-200",
            isActive ? "font-semibold opacity-100" : "font-normal opacity-70"
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
      <div className="glass-elevated border-t border-white/[0.06] shadow-[0_-8px_32px_rgba(0,0,0,0.4)]">
        <div className="flex items-end justify-around max-w-md mx-auto relative">
          {/* Left tabs */}
          {leftTabs.map(renderTab)}

          {/* Center fortune button — raised with ring */}
          <div className="flex flex-col items-center -mt-6 px-2">
            <div className="relative">
              {/* Outer glow ring */}
              {isHomeActive && (
                <div className="absolute -inset-1.5 rounded-full bg-accent/20 animate-pulse" />
              )}
              <button
                onClick={() => navigate("/")}
                className={cn(
                  "relative w-[58px] h-[58px] rounded-full flex items-center justify-center",
                  "transition-all duration-300 active:scale-90",
                  "ring-2 ring-background",
                  isHomeActive
                    ? "bg-gradient-to-br from-accent via-amber-400 to-amber-600"
                    : "bg-gradient-to-br from-primary/90 via-purple-600 to-indigo-700"
                )}
                style={{
                  boxShadow: isHomeActive
                    ? "0 4px 24px hsl(45 80% 55% / 0.5), 0 0 0 3px hsl(260 25% 8% / 0.8)"
                    : "0 4px 20px hsl(280 70% 40% / 0.4), 0 0 0 3px hsl(260 25% 8% / 0.8)",
                }}
                aria-label="占い"
                aria-current={isHomeActive ? "page" : undefined}
              >
                <Sparkles
                  className={cn(
                    "w-[26px] h-[26px] relative z-10",
                    isHomeActive ? "text-accent-foreground" : "text-white"
                  )}
                  strokeWidth={2}
                />
              </button>
            </div>
            <span
              className={cn(
                "text-[10px] leading-none mt-1.5 tracking-wide transition-all duration-200",
                isHomeActive ? "text-accent font-semibold" : "text-muted-foreground/40"
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
