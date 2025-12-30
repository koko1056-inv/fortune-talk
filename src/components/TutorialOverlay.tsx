import { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Sparkles, MessageCircle, Ticket, User, ChevronRight, ChevronLeft, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { supabase } from '@/integrations/supabase/client';

interface TutorialStep {
  title: string;
  description: string;
  icon: React.ReactNode;
}

const tutorialSteps: TutorialStep[] = [
  {
    title: 'Fortune Talkへようこそ！',
    description: 'AIを使った占いサービスです。タロット、四柱推命など様々な占い師と対話できます。',
    icon: <Sparkles className="w-12 h-12 text-accent" />,
  },
  {
    title: '今日の運勢',
    description: '毎日あなただけの運勢を占います。ラッキーカラーやラッキーアイテムもチェックできます。',
    icon: <Sparkles className="w-12 h-12 text-accent" />,
  },
  {
    title: '占い師と対話',
    description: 'テキストチャットまたは音声で占い師と対話できます。質問を投げかけてみましょう。',
    icon: <MessageCircle className="w-12 h-12 text-accent" />,
  },
  {
    title: 'チケットシステム',
    description: '初回は無料でお試しいただけます。その後はチケットを使って占いを続けられます。',
    icon: <Ticket className="w-12 h-12 text-accent" />,
  },
  {
    title: 'プロフィール設定',
    description: '生年月日や血液型を設定すると、よりパーソナライズされた占いを受けられます。',
    icon: <User className="w-12 h-12 text-accent" />,
  },
];

export const TutorialOverlay = () => {
  const { user } = useAuth();
  const { profile, updateProfile } = useProfile();
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Show tutorial only for logged-in users who haven't completed it
    if (user && profile && profile.tutorial_completed === false) {
      setIsOpen(true);
    }
  }, [user, profile]);

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(prev => prev + 1);
        setIsAnimating(false);
      }, 200);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(prev => prev - 1);
        setIsAnimating(false);
      }, 200);
    }
  };

  const handleComplete = async () => {
    if (user) {
      try {
        await supabase
          .from('profiles')
          .update({ tutorial_completed: true })
          .eq('user_id', user.id);
      } catch (error) {
        console.error('Failed to update tutorial status:', error);
      }
    }
    setIsOpen(false);
  };

  const handleSkip = async () => {
    await handleComplete();
  };

  if (!user || !profile) return null;

  const step = tutorialSteps[currentStep];
  const isLastStep = currentStep === tutorialSteps.length - 1;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleSkip()}>
      <DialogContent className="max-w-md p-0 bg-transparent border-none shadow-none overflow-visible">
        <div className={cn(
          'relative bg-gradient-to-b from-card via-card to-primary/10',
          'border border-accent/30 rounded-2xl overflow-hidden',
          'shadow-[0_0_60px_hsl(280_70%_50%/0.3)]'
        )}>
          {/* Skip button */}
          <button
            onClick={handleSkip}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted/50 transition-colors z-10"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>

          {/* Decorative top */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-accent/50 to-transparent" />

          {/* Content */}
          <div className="p-8 pt-12 space-y-6">
            {/* Icon */}
            <div className={cn(
              'flex justify-center transition-all duration-300',
              isAnimating ? 'opacity-0 scale-75' : 'opacity-100 scale-100'
            )}>
              <div className="relative">
                <div className="absolute inset-0 blur-xl bg-accent/30 rounded-full animate-pulse" />
                <div className="relative z-10">{step.icon}</div>
              </div>
            </div>

            {/* Title */}
            <h2 className={cn(
              'text-xl font-bold text-center text-foreground transition-all duration-300',
              isAnimating ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'
            )}>
              {step.title}
            </h2>

            {/* Description */}
            <p className={cn(
              'text-center text-muted-foreground leading-relaxed transition-all duration-300',
              isAnimating ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'
            )}>
              {step.description}
            </p>

            {/* Step indicators */}
            <div className="flex justify-center gap-2 py-2">
              {tutorialSteps.map((_, index) => (
                <div
                  key={index}
                  className={cn(
                    'w-2 h-2 rounded-full transition-all duration-300',
                    index === currentStep
                      ? 'w-6 bg-accent'
                      : index < currentStep
                        ? 'bg-accent/50'
                        : 'bg-muted-foreground/30'
                  )}
                />
              ))}
            </div>

            {/* Navigation buttons */}
            <div className="flex gap-3 pt-2">
              {currentStep > 0 && (
                <Button
                  variant="outline"
                  onClick={handlePrev}
                  className="flex-1"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  戻る
                </Button>
              )}
              <Button
                onClick={isLastStep ? handleComplete : handleNext}
                className={cn(
                  'flex-1 bg-accent hover:bg-accent/90 text-accent-foreground',
                  currentStep === 0 && 'w-full'
                )}
              >
                {isLastStep ? '始める' : '次へ'}
                {!isLastStep && <ChevronRight className="w-4 h-4 ml-1" />}
              </Button>
            </div>
          </div>

          {/* Decorative bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-accent/30 to-transparent" />
        </div>
      </DialogContent>
    </Dialog>
  );
};
