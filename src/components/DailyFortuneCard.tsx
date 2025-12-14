import { useState } from 'react';
import { useDailyFortune } from '@/hooks/useDailyFortune';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles, Star, Palette, Hash, Loader2, ChevronDown } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

const LuckStars = ({ luck }: { luck: number }) => {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={cn(
            'w-3 h-3 transition-all duration-300',
            i <= luck
              ? 'fill-accent text-accent drop-shadow-[0_0_4px_hsl(45_80%_55%/0.8)]'
              : 'text-muted-foreground/30'
          )}
        />
      ))}
    </div>
  );
};

export const DailyFortuneCard = () => {
  const { user } = useAuth();
  const { fortune, isLoading, error } = useDailyFortune();
  const [isExpanded, setIsExpanded] = useState(false);

  if (!user) return null;

  if (isLoading) {
    return (
      <Card className="w-full max-w-md bg-card/40 backdrop-blur-sm border-border/30 animate-pulse">
        <CardContent className="flex items-center justify-center py-6">
          <div className="relative">
            <div className="absolute inset-0 animate-ping-slow">
              <Sparkles className="w-5 h-5 text-accent/50" />
            </div>
            <Loader2 className="w-5 h-5 animate-spin text-accent" />
          </div>
          <span className="ml-3 text-sm text-muted-foreground">今日の運勢を占っています...</span>
        </CardContent>
      </Card>
    );
  }

  if (error || !fortune) {
    return null;
  }

  return (
    <Card
      onClick={() => setIsExpanded(!isExpanded)}
      className={cn(
        'w-full max-w-md cursor-pointer transition-all duration-500 ease-out',
        'bg-gradient-to-br from-card/60 via-card/40 to-primary/5',
        'backdrop-blur-sm border-border/30',
        'hover:border-accent/40 hover:shadow-[0_0_30px_hsl(45_80%_55%/0.15)]',
        isExpanded && 'border-accent/30 shadow-[0_0_40px_hsl(280_70%_50%/0.2)]'
      )}
    >
      <CardContent className="p-0">
        {/* Header - Always visible */}
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              {/* Glow effect behind icon */}
              <div className="absolute inset-0 blur-md bg-accent/30 rounded-full animate-pulse" />
              <Sparkles className={cn(
                'w-5 h-5 text-accent relative z-10 transition-transform duration-500',
                isExpanded && 'rotate-12'
              )} />
            </div>
            <span className="text-sm font-medium text-foreground/90">今日の運勢</span>
          </div>
          
          <div className="flex items-center gap-3">
            {fortune.overall_luck && <LuckStars luck={fortune.overall_luck} />}
            <ChevronDown className={cn(
              'w-4 h-4 text-muted-foreground transition-transform duration-300',
              isExpanded && 'rotate-180'
            )} />
          </div>
        </div>

        {/* Expandable content */}
        <div className={cn(
          'overflow-hidden transition-all duration-500 ease-out',
          isExpanded ? 'max-h-[300px] opacity-100' : 'max-h-0 opacity-0'
        )}>
          <div className="px-4 pb-4 space-y-4">
            {/* Divider with mystical effect */}
            <div className="relative h-px w-full overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-accent/50 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-accent/80 to-transparent animate-shimmer" />
            </div>

            {/* Fortune message */}
            <p className="text-sm text-foreground/85 leading-relaxed animate-fade-in">
              {fortune.content}
            </p>
            
            {/* Lucky items */}
            <div className="flex flex-wrap gap-3 pt-2">
              {fortune.lucky_color && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 animate-scale-in">
                  <Palette className="w-3.5 h-3.5 text-accent/80" />
                  <span className="text-xs text-foreground/80">{fortune.lucky_color}</span>
                </div>
              )}
              {fortune.lucky_number && (
                <div 
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/20 animate-scale-in"
                  style={{ animationDelay: '0.1s' }}
                >
                  <Hash className="w-3.5 h-3.5 text-accent/80" />
                  <span className="text-xs text-foreground/80">{fortune.lucky_number}</span>
                </div>
              )}
            </div>

            {/* Decorative sparkles */}
            <div className="flex justify-center gap-2 pt-2 text-accent/40">
              <span className="text-xs animate-twinkle" style={{ animationDelay: '0s' }}>✧</span>
              <span className="text-sm animate-twinkle" style={{ animationDelay: '0.3s' }}>✦</span>
              <span className="text-xs animate-twinkle" style={{ animationDelay: '0.6s' }}>✧</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
