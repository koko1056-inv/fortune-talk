import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useBillingStatus } from '@/hooks/useBillingStatus';
import { TicketPurchase } from '@/components/TicketPurchase';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Sparkles } from 'lucide-react';
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
          <Button variant="ghost" size="icon" onClick={() => navigate('/')} className="hover-scale">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-display font-bold text-gradient">占いチケット</h1>
            <p className="text-xs text-muted-foreground">あなたの運命を紐解く鍵</p>
          </div>
        </div>

        <TicketPurchase currentBalance={billingStatus.ticketBalance} />

        <div className="mt-8 glass-surface rounded-xl p-5 border border-border/50 animate-fade-in">
          <h3 className="font-medium mb-3 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-accent" />
            チケットについて
          </h3>
          <ul className="text-sm text-muted-foreground space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-primary">✦</span>
              チャット占いでは1チケットで10回のやり取りが可能です
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">✦</span>
              音声占いでは1チケットで3分間のセッションが可能です
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">✦</span>
              まとめ買いで最大30%お得になります
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">✦</span>
              購入したチケットに有効期限はありません
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Tickets;
