import { useState } from 'react';
import { useDailyFortune } from '@/hooks/useDailyFortune';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Sparkles, Star, Palette, Hash, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

const LuckStars = ({ luck }: { luck: number }) => {
  return (
    <div className="flex gap-1 justify-center">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={cn(
            'w-5 h-5 transition-all duration-500',
            i <= luck
              ? 'fill-accent text-accent drop-shadow-[0_0_8px_hsl(45_80%_55%/0.8)]'
              : 'text-muted-foreground/30'
          )}
          style={{ animationDelay: `${i * 0.1}s` }}
        />
      ))}
    </div>
  );
};

export const DailyFortuneCard = () => {
  const { user } = useAuth();
  const { fortune, isLoading, error } = useDailyFortune();
  const [isOpen, setIsOpen] = useState(false);
  const [isRevealing, setIsRevealing] = useState(false);

  const handleOpen = () => {
    setIsOpen(true);
    setIsRevealing(false);
    // Start reveal animation after dialog opens
    setTimeout(() => setIsRevealing(true), 300);
  };

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
    <>
      {/* Trigger Card */}
      <Card
        onClick={handleOpen}
        className={cn(
          'w-full max-w-md cursor-pointer transition-all duration-300',
          'bg-gradient-to-br from-card/60 via-card/40 to-primary/5',
          'backdrop-blur-sm border-border/30',
          'hover:border-accent/40 hover:shadow-[0_0_30px_hsl(45_80%_55%/0.2)]',
          'hover:scale-[1.02] active:scale-[0.98]'
        )}
      >
        <CardContent className="flex items-center justify-center gap-3 py-5">
          <div className="relative">
            <div className="absolute inset-0 blur-md bg-accent/30 rounded-full animate-pulse" />
            <Sparkles className="w-5 h-5 text-accent relative z-10" />
          </div>
          <span className="text-base font-medium text-foreground/90">今日の運勢</span>
          <div className="flex gap-0.5 ml-2">
            {[1, 2, 3].map((i) => (
              <span 
                key={i} 
                className="text-accent/60 animate-twinkle"
                style={{ animationDelay: `${i * 0.2}s` }}
              >
                ✧
              </span>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Omikuji Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-sm p-0 bg-transparent border-none shadow-none overflow-visible">
          <div className={cn(
            'relative bg-gradient-to-b from-card via-card to-primary/10',
            'border border-accent/30 rounded-2xl overflow-hidden',
            'shadow-[0_0_60px_hsl(280_70%_50%/0.3)]',
            'transition-all duration-700 ease-out',
            isRevealing ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          )}>
            {/* Decorative top */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-transparent via-accent/50 to-transparent" />
            
            {/* Content */}
            <div className="p-8 space-y-6">
              {/* Title */}
              <div className={cn(
                'text-center transition-all duration-500 delay-200',
                isRevealing ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              )}>
                <h2 className="text-2xl font-bold text-foreground mb-2">今日の運勢</h2>
                <div className="h-px w-16 mx-auto bg-gradient-to-r from-transparent via-accent to-transparent" />
              </div>

              {/* Stars */}
              <div className={cn(
                'transition-all duration-500 delay-400',
                isRevealing ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
              )}>
                {fortune.overall_luck && <LuckStars luck={fortune.overall_luck} />}
              </div>

              {/* Fortune Message */}
              <div className={cn(
                'transition-all duration-700 delay-600',
                isRevealing ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              )}>
                <p className="text-center text-foreground/90 leading-relaxed text-sm">
                  {fortune.content}
                </p>
              </div>

              {/* Lucky items */}
              <div className={cn(
                'flex justify-center gap-4 transition-all duration-500 delay-800',
                isRevealing ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              )}>
                {fortune.lucky_color && (
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
                    <Palette className="w-4 h-4 text-accent" />
                    <span className="text-sm text-foreground/80">{fortune.lucky_color}</span>
                  </div>
                )}
                {fortune.lucky_number && (
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20">
                    <Hash className="w-4 h-4 text-accent" />
                    <span className="text-sm text-foreground/80">{fortune.lucky_number}</span>
                  </div>
                )}
              </div>

              {/* Decorative sparkles */}
              <div className={cn(
                'flex justify-center gap-3 pt-2 transition-all duration-500 delay-1000',
                isRevealing ? 'opacity-100' : 'opacity-0'
              )}>
                <span className="text-accent/50 animate-twinkle">✧</span>
                <span className="text-accent/70 animate-twinkle" style={{ animationDelay: '0.2s' }}>✦</span>
                <span className="text-accent/50 animate-twinkle" style={{ animationDelay: '0.4s' }}>✧</span>
              </div>
            </div>

            {/* Decorative bottom */}
            <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-transparent via-accent/30 to-transparent" />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};