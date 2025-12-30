import { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { 
  Sparkles, MessageCircle, Ticket, User, ChevronRight, ChevronLeft, X,
  Sun, Mic, MessageSquare, Gift, Calendar, Heart
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { supabase } from '@/integrations/supabase/client';

interface TutorialStep {
  title: string;
  description: string;
  icon: React.ReactNode;
  tips?: string[];
  highlight?: string;
}

const tutorialSteps: TutorialStep[] = [
  {
    title: 'Fortune Talkへようこそ！',
    description: 'AIを活用した本格的な占いサービスです。タロット、四柱推命、西洋占星術など、様々な占術の専門家と対話できます。',
    icon: <Sparkles className="w-12 h-12 text-accent" />,
    tips: [
      '24時間いつでも占いを受けられます',
      'プライバシーは完全に保護されています',
    ],
    highlight: '今すぐ始められます！',
  },
  {
    title: '今日の運勢をチェック',
    description: '毎日あなた専用の運勢を占います。ラッキーカラー、ラッキーナンバー、ラッキーアイテムで1日をより良くしましょう。',
    icon: <Sun className="w-12 h-12 text-accent" />,
    tips: [
      'トップページの「今日の運勢」をタップ',
      '毎日0時に新しい運勢が届きます',
      'SNSでシェアして運気アップ！',
    ],
  },
  {
    title: '占い師を選ぶ',
    description: '個性豊かな占い師たちがあなたをお待ちしています。気になる占術や相談内容に合わせてお選びください。',
    icon: <Heart className="w-12 h-12 text-accent" />,
    tips: [
      'タロット占い師 - 恋愛・人間関係に強い',
      '四柱推命師 - 運勢・転機の時期を読む',
      '西洋占星術師 - 性格・相性を詳しく分析',
    ],
  },
  {
    title: '対話方法を選ぶ',
    description: 'テキストチャットと音声チャットの2つのモードをご用意。その時の気分や状況に合わせてお選びください。',
    icon: (
      <div className="flex gap-2">
        <MessageSquare className="w-10 h-10 text-accent" />
        <Mic className="w-10 h-10 text-accent" />
      </div>
    ),
    tips: [
      'テキスト - じっくり考えながら相談',
      '音声 - より自然な会話体験',
      'モード切替はいつでも可能です',
    ],
  },
  {
    title: 'チケットについて',
    description: '初回は無料でお試しいただけます。その後はチケットを使って占いを続けられます。',
    icon: <Ticket className="w-12 h-12 text-accent" />,
    tips: [
      '初回は完全無料で体験できます',
      '1チケットで10回のやり取りが可能',
      'チケットは右上メニューから購入できます',
    ],
    highlight: '今なら初回無料！',
  },
  {
    title: 'プロフィール設定のすすめ',
    description: '生年月日や血液型を設定すると、星座や四柱推命に基づいた、よりパーソナライズされた占いを受けられます。',
    icon: <User className="w-12 h-12 text-accent" />,
    tips: [
      '生年月日で星座が自動計算されます',
      '血液型占いにも対応',
      '設定は右上のプロフィールから',
    ],
  },
  {
    title: '準備完了！',
    description: 'これであなたも占いを始められます。気になることがあれば、占い師に気軽に相談してみましょう。',
    icon: <Gift className="w-12 h-12 text-accent" />,
    tips: [
      '恋愛、仕事、人間関係…何でもOK',
      '質問は具体的なほど良い結果に',
      'リラックスして楽しんでください',
    ],
    highlight: 'さあ、始めましょう！',
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
              'text-center text-muted-foreground leading-relaxed text-sm transition-all duration-300',
              isAnimating ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'
            )}>
              {step.description}
            </p>

            {/* Tips */}
            {step.tips && step.tips.length > 0 && (
              <div className={cn(
                'space-y-2 transition-all duration-300',
                isAnimating ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'
              )}>
                {step.tips.map((tip, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-2 text-xs text-foreground/70 bg-muted/30 rounded-lg px-3 py-2"
                  >
                    <span className="text-accent mt-0.5">✦</span>
                    <span>{tip}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Highlight */}
            {step.highlight && (
              <div className={cn(
                'text-center transition-all duration-300',
                isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
              )}>
                <span className="inline-block px-4 py-1.5 rounded-full bg-accent/20 text-accent text-sm font-medium">
                  {step.highlight}
                </span>
              </div>
            )}

            {/* Step indicators */}
            <div className="flex justify-center gap-1.5 py-2">
              {tutorialSteps.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    if (index !== currentStep) {
                      setIsAnimating(true);
                      setTimeout(() => {
                        setCurrentStep(index);
                        setIsAnimating(false);
                      }, 200);
                    }
                  }}
                  className={cn(
                    'h-2 rounded-full transition-all duration-300 hover:opacity-80',
                    index === currentStep
                      ? 'w-6 bg-accent'
                      : index < currentStep
                        ? 'w-2 bg-accent/50'
                        : 'w-2 bg-muted-foreground/30'
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
