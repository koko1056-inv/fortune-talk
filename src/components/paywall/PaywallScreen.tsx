import { useState } from "react";
import { X, Check, Sparkles } from "lucide-react";
import StarField from "@/components/StarField";
import { useProfile } from "@/hooks/useProfile";

interface Props {
  open: boolean;
  onClose: () => void;
  onSubscribe: (plan: "weekly" | "monthly" | "yearly") => void;
  zodiacSign?: string;
}

const plans = [
  {
    id: "weekly" as const,
    label: "お試し",
    price: "¥480",
    period: "週",
    trial: false,
    badge: null,
  },
  {
    id: "monthly" as const,
    label: "人気",
    price: "¥1,480",
    period: "月",
    trial: true,
    badge: "人気",
  },
  {
    id: "yearly" as const,
    label: "最もお得",
    price: "¥9,800",
    period: "年",
    trial: true,
    badge: "45%OFF",
    monthlyEquivalent: "¥817/月",
  },
];

const freeFeatures = ["日替わり運勢", "初回無料鑑定（1回）"];
const premiumFeatures = [
  "無制限の音声鑑定",
  "無制限のテキスト鑑定",
  "全4占術アクセス",
  "詳細パーソナリティ分析",
  "過去の相談を記憶",
  "広告なし",
];

const zodiacEmoji: Record<string, string> = {
  "牡羊座": "♈", "牡牛座": "♉", "双子座": "♊", "蟹座": "♋",
  "獅子座": "♌", "乙女座": "♍", "天秤座": "♎", "蠍座": "♏",
  "射手座": "♐", "山羊座": "♑", "水瓶座": "♒", "魚座": "♓",
};

const PaywallScreen = ({ open, onClose, onSubscribe, zodiacSign }: Props) => {
  const [selectedPlan, setSelectedPlan] = useState<"weekly" | "monthly" | "yearly">("monthly");
  const { profile } = useProfile();

  if (!open) return null;

  const displayZodiac = zodiacSign || (profile as any)?.zodiac_sign;
  const selected = plans.find((p) => p.id === selectedPlan)!;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      <StarField />

      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-6 right-6 z-20 p-2 text-muted-foreground hover:text-foreground transition-colors"
      >
        <X className="w-5 h-5" />
      </button>

      <div className="relative z-10 flex-1 overflow-y-auto px-6 py-12 flex flex-col items-center">
        {/* Header */}
        <div className="text-center mb-8">
          {displayZodiac && (
            <span className="text-4xl mb-3 block">
              {zodiacEmoji[displayZodiac] || "⭐"}
            </span>
          )}
          <h1 className="text-2xl font-display font-bold text-foreground mb-2">
            {displayZodiac ? `${displayZodiac}が示す特別な物語を` : "あなたの物語を"}
            <br />
            <span className="text-accent">もっと深く</span>知りませんか？
          </h1>
        </div>

        {/* Feature comparison */}
        <div className="w-full max-w-sm mb-8">
          <div className="grid grid-cols-2 gap-3">
            {/* Free */}
            <div className="p-4 rounded-2xl bg-card/40 border border-muted-foreground/10">
              <h3 className="text-xs text-muted-foreground font-medium mb-3 uppercase tracking-wider">
                無料
              </h3>
              {freeFeatures.map((f, i) => (
                <div key={i} className="flex items-start gap-2 mb-2">
                  <Check className="w-3.5 h-3.5 text-muted-foreground/50 mt-0.5 shrink-0" />
                  <span className="text-xs text-muted-foreground">{f}</span>
                </div>
              ))}
            </div>

            {/* Premium */}
            <div className="p-4 rounded-2xl bg-accent/5 border border-accent/30 shadow-[0_0_20px_hsl(45_80%_55%/0.1)]">
              <h3 className="text-xs text-accent font-medium mb-3 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> プレミアム
              </h3>
              {premiumFeatures.map((f, i) => (
                <div key={i} className="flex items-start gap-2 mb-2">
                  <Check className="w-3.5 h-3.5 text-accent mt-0.5 shrink-0" />
                  <span className="text-xs text-foreground/80">{f}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Plan selector */}
        <div className="w-full max-w-sm flex gap-2 mb-8">
          {plans.map((plan) => (
            <button
              key={plan.id}
              onClick={() => setSelectedPlan(plan.id)}
              className={`flex-1 relative p-3 rounded-2xl border transition-all ${
                selectedPlan === plan.id
                  ? "border-accent bg-accent/10 shadow-[0_0_20px_hsl(45_80%_55%/0.15)]"
                  : "border-muted-foreground/15 bg-card/30 hover:border-accent/30"
              }`}
            >
              {plan.badge && (
                <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-accent text-accent-foreground text-[10px] font-bold whitespace-nowrap">
                  {plan.badge}
                </span>
              )}
              <div className="text-center">
                <div className={`text-lg font-bold ${selectedPlan === plan.id ? "text-accent" : "text-foreground"}`}>
                  {plan.price}
                </div>
                <div className="text-[10px] text-muted-foreground">/{plan.period}</div>
                {plan.monthlyEquivalent && (
                  <div className="text-[10px] text-accent/70 mt-1">{plan.monthlyEquivalent}</div>
                )}
                {plan.trial && (
                  <div className="text-[10px] text-accent mt-1">3日間無料</div>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* CTA */}
        <button
          onClick={() => onSubscribe(selectedPlan)}
          className="w-full max-w-sm py-4 rounded-full bg-gradient-to-r from-accent/90 to-accent text-accent-foreground font-bold text-base tracking-wider shadow-[0_0_30px_hsl(45_80%_55%/0.4)] hover:shadow-[0_0_40px_hsl(45_80%_55%/0.6)] transition-all active:scale-[0.98] mb-4"
        >
          {selected.trial ? "3日間無料で始める" : `${selected.price}で始める`}
        </button>

        {/* Fine print */}
        <div className="text-center space-y-1 text-[10px] text-muted-foreground/50">
          <p>いつでもキャンセルできます。{selected.trial && "トライアル期間中は無料です。"}</p>
          <div className="flex items-center justify-center gap-3">
            <button className="underline hover:text-muted-foreground">利用規約</button>
            <button className="underline hover:text-muted-foreground">プライバシーポリシー</button>
            <button className="underline hover:text-muted-foreground">購入を復元</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaywallScreen;
