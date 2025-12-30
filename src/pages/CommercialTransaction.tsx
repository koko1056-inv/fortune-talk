import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Building2 } from 'lucide-react';
import StarField from '@/components/StarField';

const CommercialTransaction = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <StarField />

      <div className="relative z-10 container mx-auto px-4 pt-20 pb-8 max-w-2xl">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate('/tickets')} className="hover-scale">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-display font-bold text-gradient">特定商取引法に基づく表記</h1>
            <p className="text-xs text-muted-foreground">ビジネス情報</p>
          </div>
        </div>

        <div className="glass-surface rounded-xl p-6 border border-border/50 animate-fade-in space-y-6">
          <div className="flex items-center gap-3 mb-4">
            <Building2 className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-medium">事業者情報</h2>
          </div>

          <div className="space-y-4 text-sm">
            <div className="border-b border-border/30 pb-3">
              <p className="text-muted-foreground mb-1">販売事業者名</p>
              <p className="font-medium">MGC株式会社</p>
            </div>

            <div className="border-b border-border/30 pb-3">
              <p className="text-muted-foreground mb-1">運営責任者</p>
              <p className="font-medium">松尾心夢</p>
            </div>

            <div className="border-b border-border/30 pb-3">
              <p className="text-muted-foreground mb-1">所在地</p>
              <p className="font-medium">京都市上京区西辰巳町111 106</p>
            </div>

            <div className="border-b border-border/30 pb-3">
              <p className="text-muted-foreground mb-1">電話番号</p>
              <p className="font-medium">090-8353-1056</p>
            </div>

            <div className="border-b border-border/30 pb-3">
              <p className="text-muted-foreground mb-1">メールアドレス</p>
              <p className="font-medium">support@fortune-voice.com</p>
            </div>

            <div className="border-b border-border/30 pb-3">
              <p className="text-muted-foreground mb-1">販売価格</p>
              <p className="font-medium">商品ページに記載</p>
            </div>

            <div className="border-b border-border/30 pb-3">
              <p className="text-muted-foreground mb-1">商品代金以外の必要料金</p>
              <p className="font-medium">なし</p>
            </div>

            <div className="border-b border-border/30 pb-3">
              <p className="text-muted-foreground mb-1">支払方法</p>
              <p className="font-medium">クレジットカード決済</p>
            </div>

            <div className="border-b border-border/30 pb-3">
              <p className="text-muted-foreground mb-1">支払時期</p>
              <p className="font-medium">ご注文確定時</p>
            </div>

            <div className="border-b border-border/30 pb-3">
              <p className="text-muted-foreground mb-1">商品の引渡し時期</p>
              <p className="font-medium">決済完了後、即時</p>
            </div>

            <div className="border-b border-border/30 pb-3">
              <p className="text-muted-foreground mb-1">返品・キャンセルについて</p>
              <p className="font-medium">デジタルコンテンツの性質上、購入後の返品・キャンセルはお受けできません。</p>
            </div>

            <div>
              <p className="text-muted-foreground mb-1">動作環境</p>
              <p className="font-medium">インターネット接続環境が必要です。推奨ブラウザ：Chrome、Safari、Firefox、Edge の最新版</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommercialTransaction;
