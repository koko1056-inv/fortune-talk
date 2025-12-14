import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Ticket, Check } from 'lucide-react';
import { TICKET_PACKAGES } from '@/hooks/useBillingStatus';
import { toast } from 'sonner';

interface TicketPurchaseProps {
  currentBalance: number;
  onPurchaseRequest?: (packageIndex: number) => void;
}

export const TicketPurchase = ({ currentBalance, onPurchaseRequest }: TicketPurchaseProps) => {
  const [selectedPackage, setSelectedPackage] = useState<number | null>(null);

  const handlePurchase = (index: number) => {
    setSelectedPackage(index);
    if (onPurchaseRequest) {
      onPurchaseRequest(index);
    } else {
      toast.info('決済機能は準備中です。後日Stripe連携で有効になります。');
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Ticket className="h-6 w-6 text-primary" />
          <span className="text-2xl font-bold">{currentBalance}</span>
          <span className="text-muted-foreground">枚</span>
        </div>
        <p className="text-sm text-muted-foreground">現在のチケット残高</p>
        <p className="text-xs text-muted-foreground mt-1">1枚 = 3分の占い</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {TICKET_PACKAGES.map((pkg, index) => (
          <Card 
            key={pkg.amount}
            className={`relative cursor-pointer transition-all hover:border-primary ${
              selectedPackage === index ? 'border-primary ring-2 ring-primary/20' : ''
            } ${pkg.discount >= 20 ? 'border-primary/50' : ''}`}
            onClick={() => handlePurchase(index)}
          >
            {pkg.discount > 0 && (
              <Badge 
                className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground"
              >
                {pkg.discount}% OFF
              </Badge>
            )}
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <Ticket className="h-5 w-5" />
                {pkg.amount}枚
              </CardTitle>
              <CardDescription>
                {pkg.amount * 3}分の占いが可能
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold">¥{pkg.totalPrice.toLocaleString()}</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  1枚あたり ¥{pkg.pricePerTicket.toLocaleString()}
                </p>
              </div>
              <Button 
                className="w-full mt-4" 
                variant={pkg.discount >= 20 ? 'default' : 'outline'}
              >
                <Check className="h-4 w-4 mr-2" />
                購入する
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
