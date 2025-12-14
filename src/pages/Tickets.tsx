import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useBillingStatus } from '@/hooks/useBillingStatus';
import { TicketPurchase } from '@/components/TicketPurchase';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import StarField from '@/components/StarField';

const Tickets = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { billingStatus, loading: billingLoading } = useBillingStatus();

  if (authLoading || billingLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!user) {
    navigate('/auth');
    return null;
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <StarField />
      
      <div className="relative z-10 container mx-auto px-4 py-8 max-w-2xl">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">占いチケット購入</h1>
        </div>

        <TicketPurchase currentBalance={billingStatus.ticketBalance} />

        <div className="mt-8 p-4 bg-muted/50 rounded-lg">
          <h3 className="font-medium mb-2">チケットについて</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• 1枚のチケットで3分間の占いが可能です</li>
            <li>• チケットは占い開始時に1枚消費されます</li>
            <li>• まとめ買いでお得になります</li>
            <li>• 購入したチケットに有効期限はありません</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Tickets;
