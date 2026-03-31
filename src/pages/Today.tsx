import { useDailyFortune } from "@/hooks/useDailyFortune";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useNavigate } from "react-router-dom";
import { Star, Palette, Hash, Gift, Loader2, Sparkles, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import StarField from "@/components/StarField";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

const LuckStars = ({ luck }: { luck: number }) => (
  <div className="flex gap-2 justify-center">
    {[1, 2, 3, 4, 5].map((i) => (
      <Star
        key={i}
        className={cn(
          "w-7 h-7 transition-all duration-700",
          i <= luck
            ? "fill-accent text-accent drop-shadow-[0_0_12px_hsl(45_80%_55%/0.8)]"
            : "text-muted-foreground/20"
        )}
        style={{ transitionDelay: `${i * 120}ms` }}
      />
    ))}
  </div>
);

const Today = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { profile } = useProfile();
  const { fortune, isLoading, error, refetch } = useDailyFortune();
  const [isRevealed, setIsRevealed] = useState(false);

  useEffect(() => {
    if (fortune) {
      const timer = setTimeout(() => setIsRevealed(true), 400);
      return () => clearTimeout(timer);
    }
  }, [fortune]);

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
        {/* Header */}
        <div className="text-center mb-8">
          <p className="text-[10px] text-accent/50 tracking-[0.3em] uppercase font-display mb-2">
            Daily Fortune
          </p>
          <h1 className="text-2xl font-display font-bold text-foreground">
            今日の運勢
          </h1>
          {profile?.display_name && (
            <p className="text-xs text-muted-foreground mt-2">
              {profile.display_name}さんの今日
            </p>
          )}
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="relative">
              <div className="absolute inset-0 animate-ping-slow">
                <Sparkles className="w-8 h-8 text-accent/30" />
              </div>
              <Sparkles className="w-8 h-8 text-accent animate-pulse" />
            </div>
            <p className="text-sm text-muted-foreground animate-pulse">
              星を読んでいます...
            </p>
          </div>
        ) : error || !fortune ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">✧</div>
            <p className="text-muted-foreground mb-4 text-sm">
              運勢の読み込みに失敗しました
            </p>
            <Button
              variant="outline"
              onClick={() => refetch()}
              className="gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              再読み込み
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Overall Luck — Large card */}
            <div
              className={cn(
                "glass-surface rounded-2xl p-8 text-center transition-all duration-700",
                isRevealed ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
              )}
            >
              <p className="text-xs text-muted-foreground mb-4 tracking-wider">
                総合運
              </p>
              {fortune.overall_luck && <LuckStars luck={fortune.overall_luck} />}
              <div className="mt-6 h-px w-20 mx-auto bg-gradient-to-r from-transparent via-accent/40 to-transparent" />
            </div>

            {/* Fortune Message */}
            <div
              className={cn(
                "glass-surface rounded-2xl p-6 transition-all duration-700 delay-200",
                isRevealed ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
              )}
            >
              <p className="text-foreground/90 leading-relaxed text-[15px]">
                {fortune.content}
              </p>
            </div>

            {/* Lucky Items Grid */}
            <div
              className={cn(
                "grid grid-cols-3 gap-3 transition-all duration-700 delay-400",
                isRevealed ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
              )}
            >
              {fortune.lucky_color && (
                <div className="glass-surface rounded-xl p-4 text-center">
                  <Palette className="w-5 h-5 text-accent/70 mx-auto mb-2" />
                  <p className="text-[10px] text-muted-foreground mb-1">ラッキーカラー</p>
                  <p className="text-sm font-medium text-foreground">{fortune.lucky_color}</p>
                </div>
              )}
              {fortune.lucky_number && (
                <div className="glass-surface rounded-xl p-4 text-center">
                  <Hash className="w-5 h-5 text-accent/70 mx-auto mb-2" />
                  <p className="text-[10px] text-muted-foreground mb-1">ラッキーナンバー</p>
                  <p className="text-sm font-medium text-foreground">{fortune.lucky_number}</p>
                </div>
              )}
              {fortune.lucky_item && (
                <div className="glass-surface rounded-xl p-4 text-center">
                  <Gift className="w-5 h-5 text-accent/70 mx-auto mb-2" />
                  <p className="text-[10px] text-muted-foreground mb-1">ラッキーアイテム</p>
                  <p className="text-sm font-medium text-foreground">{fortune.lucky_item}</p>
                </div>
              )}
            </div>

            {/* CTA to start fortune */}
            <div
              className={cn(
                "text-center pt-4 transition-all duration-700 delay-600",
                isRevealed ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
              )}
            >
              <button
                onClick={() => navigate("/")}
                className={cn(
                  "inline-flex items-center gap-2 px-8 py-4 rounded-full",
                  "bg-gradient-to-r from-primary via-purple-600 to-primary/80",
                  "text-primary-foreground font-medium text-sm tracking-wide",
                  "shadow-[0_4px_24px_hsl(280_70%_50%/0.4)]",
                  "hover:shadow-[0_4px_32px_hsl(280_70%_50%/0.6)]",
                  "active:scale-95 transition-all duration-300"
                )}
              >
                <Sparkles className="w-4 h-4" />
                もっと深く占う
              </button>
              <p className="text-[10px] text-muted-foreground/50 mt-3">
                音声またはテキストで占い師に相談
              </p>
            </div>

            {/* Decorative */}
            <div
              className={cn(
                "flex justify-center gap-3 pt-2 transition-all duration-500 delay-700",
                isRevealed ? "opacity-100" : "opacity-0"
              )}
            >
              <span className="text-accent/30 animate-twinkle text-xs">✧</span>
              <span className="text-accent/50 animate-twinkle text-xs" style={{ animationDelay: "0.3s" }}>✦</span>
              <span className="text-accent/30 animate-twinkle text-xs" style={{ animationDelay: "0.6s" }}>✧</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Today;
