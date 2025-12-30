import { Twitter, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface FortuneShareButtonsProps {
  content: string;
  luckyColor?: string | null;
  luckyNumber?: number | null;
  luckyItem?: string | null;
  overallLuck?: number | null;
}

export const FortuneShareButtons = ({
  content,
  luckyColor,
  luckyNumber,
  luckyItem,
  overallLuck,
}: FortuneShareButtonsProps) => {
  const generateShareText = () => {
    const stars = overallLuck ? '⭐'.repeat(overallLuck) : '';
    let text = `【今日の運勢】${stars}\n\n${content}\n\n`;
    
    const luckyItems: string[] = [];
    if (luckyColor) luckyItems.push(`🎨 ${luckyColor}`);
    if (luckyNumber) luckyItems.push(`🔢 ${luckyNumber}`);
    if (luckyItem) luckyItems.push(`🎁 ${luckyItem}`);
    
    if (luckyItems.length > 0) {
      text += luckyItems.join(' ');
    }
    
    text += '\n\n#FortuneTalk #今日の運勢';
    return text;
  };

  const shareToTwitter = () => {
    const text = generateShareText();
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const shareToLine = () => {
    const text = generateShareText();
    const url = `https://social-plugins.line.me/lineit/share?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const copyToClipboard = async () => {
    const text = generateShareText();
    try {
      await navigator.clipboard.writeText(text);
      toast.success('クリップボードにコピーしました');
    } catch {
      toast.error('コピーに失敗しました');
    }
  };

  return (
    <div className="flex justify-center gap-2 pt-4">
      <Button
        variant="outline"
        size="sm"
        onClick={shareToTwitter}
        className="gap-2 border-border/50 hover:border-accent/50 hover:bg-accent/10"
      >
        <Twitter className="w-4 h-4" />
        <span className="text-xs">X</span>
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={shareToLine}
        className="gap-2 border-border/50 hover:border-[#00B900]/50 hover:bg-[#00B900]/10"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.064-.023.132-.033.199-.033.211 0 .391.09.51.25l2.438 3.317V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.349 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
        </svg>
        <span className="text-xs">LINE</span>
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={copyToClipboard}
        className="gap-2 border-border/50 hover:border-accent/50 hover:bg-accent/10"
      >
        <Share2 className="w-4 h-4" />
        <span className="text-xs">コピー</span>
      </Button>
    </div>
  );
};
