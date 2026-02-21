import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Ticket, Sparkles, Star, Zap, Crown, MessageCircle, Mic } from 'lucide-react';
import { TICKET_PACKAGES } from '@/hooks/useBillingStatus';
import { useInAppPurchase } from '@/hooks/useInAppPurchase';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface TicketPurchaseProps {
  currentBalance: number;
  onPurchaseRequest?: (packageIndex: number) => void;
}

const packageIcons = [Ticket, Star, Zap, Crown];
const packageGradients = [
  'from-slate-500/20 to-slate-600/20',
  'from-blue-500/20 to-indigo-600/20',
  'from-purple-500/20 to-pink-600/20',
  'from-amber-400/20 to-orange-500/20',
];
const packageBorderColors = [
  'hover:border-slate-400',
  'hover:border-blue-400',
  'hover:border-purple-400',
  'hover:border-amber-400',
];
const packageGlows = [
  '',
  'hover:shadow-[0_0_20px_hsl(220_70%_50%/0.3)]',
  'hover:shadow-[0_0_25px_hsl(280_70%_50%/0.4)]',
  'hover:shadow-[0_0_30px_hsl(40_90%_50%/0.5)]',
];

export const TicketPurchase = ({ currentBalance, onPurchaseRequest }: TicketPurchaseProps) => {
  const { packages, purchasePackage, loading, isReady } = useInAppPurchase();
  const [selectedPackageIndex, setSelectedPackageIndex] = useState<number | null>(null);
  const [hoveredPackage, setHoveredPackage] = useState<number | null>(null);

  const handlePurchase = async (index: number) => {
    setSelectedPackageIndex(index);

    // Web or native implementation
    if (onPurchaseRequest) {
      onPurchaseRequest(index);
      return;
    }

    // Match IAP package by product identifier (not by index)
    const productIds = [
      'com.fortunetalk.app.ticket_01',
      'com.fortunetalk.app.ticket_10',
      'com.fortunetalk.app.ticket_50',
      'com.fortunetalk.app.ticket_100',
    ];
    const shortIds = ['ticket_01', 'ticket_10', 'ticket_50', 'ticket_100'];
    const targetProductId = productIds[index];
    const targetShortId = shortIds[index];

    console.log('[IAP] Purchase attempt:', { index, targetProductId, packagesCount: packages.length });
    packages.forEach(p => console.log('[IAP] Available:', p.identifier, p.product.productIdentifier));

    const pkg = packages.find(p =>
      p.product.productIdentifier === targetProductId ||
      p.product.productIdentifier === targetShortId ||
      p.identifier === targetShortId ||
      p.identifier === `package_${targetShortId}`
    );
    if (pkg) {
      await purchasePackage(pkg);
    } else if (packages.length === 0) {
      toast.error('商品情報を読み込み中です。アプリを再起動して再試行してください。');
    } else {
      toast.error(`商品が見つかりません (${targetProductId})`);
    }
  };

  return (
    <div className="space-y-8">
      {/* Current Balance Display */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 blur-xl rounded-full" />
        <div className="relative glass-surface rounded-2xl p-6 text-center border border-primary/20">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="relative">
              <div className="absolute inset-0 blur-md bg-primary/40 rounded-full animate-pulse" />
              <Ticket className="h-8 w-8 text-primary relative z-10" />
            </div>
            <span className="text-4xl font-display font-bold text-gradient">{currentBalance}</span>
            <span className="text-lg text-muted-foreground">枚</span>
          </div>
          <p className="text-sm text-muted-foreground mb-4">現在のチケット残高</p>

          <div className="flex flex-wrap justify-center gap-4 text-xs">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary/50 border border-border/50">
              <MessageCircle className="h-3.5 w-3.5 text-accent" />
              <span className="text-foreground/80">チャット: 1枚 = 10ラリー</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary/50 border border-border/50">
              <Mic className="h-3.5 w-3.5 text-accent" />
              <span className="text-foreground/80">音声通話: 1枚 = 3分</span>
            </div>
          </div>
        </div>
      </div>

      {/* Package Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {TICKET_PACKAGES.map((pkg, index) => {
          const Icon = packageIcons[index];
          const isSelected = selectedPackageIndex === index;
          const isHovered = hoveredPackage === index;
          const isPopular = pkg.discount >= 20;
          const isBest = pkg.discount >= 30;

          return (
            <Card
              key={pkg.amount}
              className={cn(
                "relative cursor-pointer transition-all duration-300 overflow-hidden group",
                "border-2 bg-gradient-to-br",
                packageGradients[index],
                packageBorderColors[index],
                packageGlows[index],
                isSelected && "ring-2 ring-primary/50 border-primary",
                isBest && "sm:col-span-2"
              )}
              onClick={() => handlePurchase(index)}
              onMouseEnter={() => setHoveredPackage(index)}
              onMouseLeave={() => setHoveredPackage(null)}
            >
              {/* Background decoration */}
              <div className="absolute top-0 right-0 w-32 h-32 opacity-10 transform translate-x-8 -translate-y-8">
                <Icon className="w-full h-full" />
              </div>

              {/* Discount badge */}
              {pkg.discount > 0 && (
                <Badge
                  className={cn(
                    "absolute -top-0 -right-0 rounded-none rounded-bl-lg px-3 py-1 text-xs font-bold",
                    isBest
                      ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0"
                      : isPopular
                        ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0"
                        : "bg-destructive text-destructive-foreground"
                  )}
                >
                  {isBest && <Crown className="h-3 w-3 mr-1" />}
                  {pkg.discount}% OFF
                </Badge>
              )}

              {/* Popular label */}
              {isPopular && !isBest && (
                <div className="absolute top-3 left-3">
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    人気
                  </span>
                </div>
              )}
              {isBest && (
                <div className="absolute top-3 left-3">
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                    <Sparkles className="h-2.5 w-2.5" />
                    最もお得
                  </span>
                </div>
              )}

              <CardContent className={cn("p-5", isBest && "sm:flex sm:items-center sm:justify-between sm:gap-6")}>
                <div className={cn("flex items-start gap-4", isBest && "sm:flex-1")}>
                  {/* Icon */}
                  <div className={cn(
                    "flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-transform duration-300",
                    "bg-gradient-to-br from-background/80 to-background/40 border border-border/50",
                    isHovered && "scale-110"
                  )}>
                    <Icon className={cn(
                      "h-6 w-6 transition-colors",
                      index === 0 && "text-slate-400",
                      index === 1 && "text-blue-400",
                      index === 2 && "text-purple-400",
                      index === 3 && "text-amber-400"
                    )} />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="text-2xl font-display font-bold">{pkg.amount}</span>
                      <span className="text-sm text-muted-foreground">枚</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      チャット{pkg.amount * 10}ラリー / 音声{pkg.amount * 3}分
                    </p>
                  </div>
                </div>

                <div className={cn("mt-4 flex items-end justify-between gap-4", isBest && "sm:mt-0 sm:flex-col sm:items-end")}>
                  {/* Price */}
                  <div className={cn(isBest && "text-right")}>
                    <div className="flex items-baseline gap-1">
                      <span className="text-xs text-muted-foreground">¥</span>
                      <span className="text-2xl font-bold">{pkg.totalPrice.toLocaleString()}</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground">
                      (1枚 ¥{pkg.pricePerTicket.toLocaleString()})
                    </p>
                  </div>

                  {/* Button */}
                  <Button
                    size="sm"
                    className={cn(
                      "transition-all duration-300",
                      isBest
                        ? "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg shadow-amber-500/25"
                        : isPopular
                          ? "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg shadow-purple-500/25"
                          : ""
                    )}
                    variant={!isPopular && !isBest ? "outline" : "default"}
                  >
                    購入
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};