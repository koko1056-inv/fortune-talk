import { useDailyFortune } from '@/hooks/useDailyFortune';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Star, Palette, Hash, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const LuckStars = ({ luck }: { luck: number }) => {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`w-3.5 h-3.5 ${
            i <= luck
              ? 'fill-accent text-accent'
              : 'text-muted-foreground/30'
          }`}
        />
      ))}
    </div>
  );
};

export const DailyFortuneCard = () => {
  const { user } = useAuth();
  const { fortune, isLoading, error } = useDailyFortune();

  if (!user) return null;

  if (isLoading) {
    return (
      <Card className="w-full max-w-md bg-card/50 backdrop-blur-sm border-border/50">
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-accent" />
          <span className="ml-2 text-sm text-muted-foreground">今日の運勢を占っています...</span>
        </CardContent>
      </Card>
    );
  }

  if (error || !fortune) {
    return null;
  }

  return (
    <Card className="w-full max-w-md bg-card/50 backdrop-blur-sm border-border/50 hover:border-accent/30 transition-colors">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base font-medium">
          <Sparkles className="w-4 h-4 text-accent" />
          <span>今日の運勢</span>
          {fortune.overall_luck && (
            <div className="ml-auto">
              <LuckStars luck={fortune.overall_luck} />
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-foreground/90 leading-relaxed">
          {fortune.content}
        </p>
        
        <div className="flex gap-4 text-xs text-muted-foreground pt-2 border-t border-border/30">
          {fortune.lucky_color && (
            <div className="flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-accent/70" />
              <span>{fortune.lucky_color}</span>
            </div>
          )}
          {fortune.lucky_number && (
            <div className="flex items-center gap-1.5">
              <Hash className="w-3.5 h-3.5 text-accent/70" />
              <span>{fortune.lucky_number}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
