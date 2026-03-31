import { useDailyFortune } from "@/hooks/useDailyFortune";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useNavigate } from "react-router-dom";
import { Star, Palette, Hash, Gift, Loader2, Sparkles, RefreshCw, Share2, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import StarField from "@/components/StarField";
import { cn } from "@/lib/utils";
import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";

const LuckStars = ({ luck }: { luck: number }) => (
  <div className="flex gap-2.5 justify-center">
    {[1, 2, 3, 4, 5].map((i) => (
      <Star
        key={i}
        className={cn(
          "w-8 h-8 transition-all duration-700",
          i <= luck
            ? "fill-accent text-accent drop-shadow-[0_0_12px_hsl(45_80%_55%/0.8)]"
            : "text-muted-foreground/15"
        )}
        style={{ transitionDelay: `${i * 120}ms` }}
      />
    ))}
  </div>
);

const LUCK_LABELS = ["", "波乱含み", "まずまず", "良い調子", "絶好調", "最高の一日"];

const Today = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { profile } = useProfile();
  const { fortune, isLoading, error, refetch } = useDailyFortune();
  const [isRevealed, setIsRevealed] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (fortune) {
      const timer = setTimeout(() => setIsRevealed(true), 400);
      return () => clearTimeout(timer);
    }
  }, [fortune]);

  // Check streak from localStorage
  const streak = useMemo(() => {
    if (typeof window === "undefined") return 0;
    const raw = localStorage.getItem("fortune-streak");
    if (!raw) return 0;
    try {
      const { count, lastDate } = JSON.parse(raw);
      const today = new Date().toISOString().slice(0, 10);
      const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
      if (lastDate === today) return count;
      if (lastDate === yesterday) return count; // will be updated when viewed
      return 0;
    } catch { return 0; }
  }, []);

  // Update streak when fortune is viewed
  useEffect(() => {
    if (!fortune) return;
    const today = new Date().toISOString().slice(0, 10);
    const raw = localStorage.getItem("fortune-streak");
    let count = 1;
    if (raw) {
      try {
        const data = JSON.parse(raw);
        const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
        if (data.lastDate === today) return; // already counted today
        if (data.lastDate === yesterday) count = data.count + 1;
      } catch { /* ignore */ }
    }
    localStorage.setItem("fortune-streak", JSON.stringify({ count, lastDate: today }));
  }, [fortune]);

  const handleShare = async () => {
    if (!fortune) return;
    const text = `今日の運勢: ${"★".repeat(fortune.overall_luck || 0)}${"☆".repeat(5 - (fortune.overall_luck || 0))}\n${fortune.content?.slice(0, 60)}...\n\n#フォーチュントーク`;
    if (navigator.share) {
      try {
        await navigator.share({ title: "今日の運勢", text });
      } catch { /* user cancelled */ }
    } else {
      await navigator.clipboard.writeText(text);
      toast.success("クリップボードにコピーしました");
    }
  };

  // Preview text (first 80 chars) vs full text
  const contentPreview = fortune?.content?.slice(0, 80);
  const hasMore = (fortune?.content?.length || 0) > 80;

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background relative overflow-hidden flex flex-col items-center justify-center gap-6 p-8">
        <StarField />
        <div className="relative z-10 text-center">
          <div className="text-6xl mb-4">🌙</div>
          <h1 className="text-2xl font-display font-bold text-foreground mb-2">
            今日の運勢
          </h1>
          <p className="text-muted-foreground text-sm mb-6">
            ログインすると毎日のパーソナル占いが届きます
          </p>
          <Button onClick={() => navigate("/auth")} className="bg-accent hover:bg-accent/80 text-accent-foreground">
            ログインして始める
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <StarField />

      <div className="relative z-10 w-full max-w-lg mx-auto px-5 pt-6 pb-28">
        {/* Header with streak */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">
              今日の運勢
            </h1>
            {profile?.display_name && (
              <p className="text-xs text-muted-foreground mt-1">
                {profile.display_name}さんの今日
              </p>
            )}
          </div>
          {streak > 1 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/20">
              <span className="text-accent text-xs">🔥</span>
              <span className="text-[11px] font-medium text-accent">{streak}日連続</span>
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-full bg-accent/10 animate-ping-slow" />
              <div className="absolute inset-2 rounded-full bg-accent/5 flex items-center justify-center">
                <Sparkles className="w-7 h-7 text-accent animate-pulse" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground animate-pulse">
              星を読んでいます...
            </p>
          </div>
        ) : error || !fortune ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">✧</div>
            <p className="text-muted-foreground mb-4 text-sm">
              運勢の読み込みに失敗しました
            </p>
            <Button variant="outline" onClick={() => refetch()} className="gap-2">
              <RefreshCw className="w-4 h-4" />
              再読み込み
            </Button>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Overall Luck Card */}
            <div
              className={cn(
                "glass-surface rounded-2xl p-7 text-center transition-all duration-700",
                isRevealed ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
              )}
            >
              {fortune.overall_luck && (
                <>
                  <LuckStars luck={fortune.overall_luck} />
                  <p className="text-accent/80 text-sm font-medium mt-3 tracking-wide">
                    {LUCK_LABELS[fortune.overall_luck] || ""}
                  </p>
                </>
              )}
            </div>

            {/* Fortune Message — Progressive Disclosure */}
            <div
              className={cn(
                "glass-surface rounded-2xl p-6 transition-all duration-700 delay-200",
                isRevealed ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
              )}
            >
              <p className="text-foreground/90 leading-relaxed text-[15px]">
                {isExpanded || !hasMore ? fortune.content : `${contentPreview}...`}
              </p>
              {hasMore && !isExpanded && (
                <button
                  onClick={() => setIsExpanded(true)}
                  className="flex items-center gap-1 mt-3 text-xs text-accent/70 hover:text-accent transition-colors mx-auto"
                >
                  <span>続きを読む</span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Lucky Items */}
            <div
              className={cn(
                "grid grid-cols-3 gap-3 transition-all duration-700 delay-400",
                isRevealed ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
              )}
            >
              {fortune.lucky_color && (
                <div className="glass-surface rounded-xl p-4 text-center">
                  <div className="w-9 h-9 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-2">
                    <Palette className="w-4 h-4 text-accent/80" />
                  </div>
                  <p className="text-[9px] text-muted-foreground/60 uppercase tracking-wider mb-0.5">Color</p>
                  <p className="text-sm font-medium text-foreground">{fortune.lucky_color}</p>
                </div>
              )}
              {fortune.lucky_number && (
                <div className="glass-surface rounded-xl p-4 text-center">
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                    <Hash className="w-4 h-4 text-primary/80" />
                  </div>
                  <p className="text-[9px] text-muted-foreground/60 uppercase tracking-wider mb-0.5">Number</p>
                  <p className="text-sm font-medium text-foreground">{fortune.lucky_number}</p>
                </div>
              )}
              {fortune.lucky_item && (
                <div className="glass-surface rounded-xl p-4 text-center">
                  <div className="w-9 h-9 rounded-full bg-pink-500/10 flex items-center justify-center mx-auto mb-2">
                    <Gift className="w-4 h-4 text-pink-400/80" />
                  </div>
                  <p className="text-[9px] text-muted-foreground/60 uppercase tracking-wider mb-0.5">Item</p>
                  <p className="text-sm font-medium text-foreground">{fortune.lucky_item}</p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div
              className={cn(
                "flex items-center justify-center gap-3 pt-2 transition-all duration-700 delay-600",
                isRevealed ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
              )}
            >
              {/* Share Button */}
              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-5 py-3 rounded-full glass-surface text-sm text-muted-foreground hover:text-accent transition-colors"
              >
                <Share2 className="w-4 h-4" />
                シェア
              </button>

              {/* CTA — deeper reading */}
              <button
                onClick={() => navigate("/")}
                className={cn(
                  "flex items-center gap-2 px-6 py-3 rounded-full",
                  "bg-gradient-to-r from-primary via-purple-600 to-primary/80",
                  "text-primary-foreground font-medium text-sm",
                  "shadow-[0_4px_20px_hsl(280_70%_50%/0.35)]",
                  "active:scale-95 transition-all duration-300"
                )}
              >
                <Sparkles className="w-4 h-4" />
                もっと深く占う
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Today;
