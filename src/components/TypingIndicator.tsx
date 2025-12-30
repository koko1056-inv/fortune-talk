import { cn } from '@/lib/utils';

interface TypingIndicatorProps {
  className?: string;
}

export const TypingIndicator = ({ className }: TypingIndicatorProps) => {
  return (
    <div className={cn(
      'flex items-center gap-1.5 px-4 py-3',
      className
    )}>
      <div className="flex items-center gap-1">
        <span className="text-sm text-muted-foreground mr-2">考え中</span>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={cn(
              'w-2 h-2 rounded-full bg-accent/70',
              'animate-bounce'
            )}
            style={{
              animationDelay: `${i * 0.15}s`,
              animationDuration: '0.6s',
            }}
          />
        ))}
      </div>
    </div>
  );
};
