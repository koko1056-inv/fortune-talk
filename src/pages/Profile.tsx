import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useProfile, calculateZodiacSign } from "@/hooks/useProfile";
import { useBillingStatus } from "@/hooks/useBillingStatus";
import { useSubscription } from "@/hooks/useSubscription";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import StarField from "@/components/StarField";
import { Loader2, User, Calendar, Droplets, Star, Save, Settings, Ticket, Crown, ChevronRight, FileText } from "lucide-react";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { cn } from "@/lib/utils";

const BLOOD_TYPES = ["A", "B", "O", "AB"];

const ZODIAC_EMOJIS: Record<string, string> = {
  "牡羊座": "♈", "牡牛座": "♉", "双子座": "♊", "蟹座": "♋",
  "獅子座": "♌", "乙女座": "♍", "天秤座": "♎", "蠍座": "♏",
  "射手座": "♐", "山羊座": "♑", "水瓶座": "♒", "魚座": "♓",
};

const Profile = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, signOut } = useAuth();
  const { isAdmin } = useIsAdmin();
  const { profile, loading: profileLoading, updateProfile } = useProfile();
  const { billingStatus } = useBillingStatus();
  const { isPremium, subscription } = useSubscription();

  const [displayName, setDisplayName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [bloodType, setBloodType] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || "");
      setBirthDate(profile.birth_date || "");
      setBloodType(profile.blood_type || "");
    }
  }, [profile]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await updateProfile({
        display_name: displayName || null,
        birth_date: birthDate || null,
        blood_type: bloodType || null,
      });
      if (error) {
        toast.error("保存に失敗しました");
      } else {
        toast.success("プロフィールを保存しました");
      }
    } catch {
      toast.error("エラーが発生しました");
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const zodiacSign = birthDate ? calculateZodiacSign(birthDate) : null;

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  const planLabel = isPremium
    ? subscription?.planType === "yearly" ? "年間プレミアム"
      : subscription?.planType === "monthly" ? "月間プレミアム"
      : subscription?.planType === "weekly" ? "週間プレミアム"
      : "プレミアム"
    : "フリー";

  return (
    <div className="relative min-h-screen overflow-hidden">
      <StarField />

      <div className="relative z-10 w-full max-w-lg mx-auto px-5 pt-6 pb-28 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-display font-bold text-foreground">マイページ</h1>
          <button
            onClick={handleSignOut}
            className="text-xs text-muted-foreground hover:text-destructive transition-colors px-3 py-1.5 rounded-full glass-surface"
          >
            ログアウト
          </button>
        </div>

        {/* Plan & Tickets Card */}
        <div className="glass-surface rounded-2xl p-5 mb-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              {isPremium ? (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent to-amber-600 flex items-center justify-center">
                  <Crown className="w-5 h-5 text-accent-foreground" />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center">
                  <Ticket className="w-5 h-5 text-primary" />
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-foreground">{planLabel}</p>
                <p className="text-[10px] text-muted-foreground">
                  {isPremium ? "無制限で鑑定可能" : `チケット残り ${billingStatus.ticketBalance} 枚`}
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() => navigate("/tickets")}
            className="w-full flex items-center justify-between py-3 px-4 rounded-xl bg-primary/10 hover:bg-primary/20 transition-colors group"
          >
            <span className="text-sm text-primary font-medium">
              {isPremium ? "プランを管理" : "チケット購入・プラン変更"}
            </span>
            <ChevronRight className="w-4 h-4 text-primary group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {/* Zodiac Display */}
        {zodiacSign && (
          <div className="glass-surface rounded-2xl p-5 mb-5 flex items-center gap-4">
            <div className="text-4xl">{ZODIAC_EMOJIS[zodiacSign]}</div>
            <div>
              <p className="text-accent font-display text-lg">{zodiacSign}</p>
              <p className="text-muted-foreground text-xs">あなたの星座</p>
            </div>
          </div>
        )}

        {/* Profile Form */}
        <div className="glass-surface rounded-2xl p-5 space-y-5">
          <p className="text-xs text-muted-foreground">
            占い師がより的確にアドバイスできるよう情報を入力してください
          </p>

          <div className="space-y-2">
            <Label htmlFor="displayName" className="text-foreground/80 flex items-center gap-2 text-sm">
              <User className="w-3.5 h-3.5 text-accent" />
              お名前
            </Label>
            <Input
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="ニックネーム"
              className="bg-background/50 border-border/50 focus:border-accent"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="birthDate" className="text-foreground/80 flex items-center gap-2 text-sm">
              <Calendar className="w-3.5 h-3.5 text-accent" />
              生年月日
            </Label>
            <Input
              id="birthDate"
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="bg-background/50 border-border/50 focus:border-accent"
            />
            {zodiacSign && (
              <p className="text-xs text-accent flex items-center gap-1">
                <Star className="w-3 h-3" />
                {zodiacSign}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-foreground/80 flex items-center gap-2 text-sm">
              <Droplets className="w-3.5 h-3.5 text-accent" />
              血液型
            </Label>
            <Select value={bloodType} onValueChange={setBloodType}>
              <SelectTrigger className="bg-background/50 border-border/50 focus:border-accent">
                <SelectValue placeholder="選択してください" />
              </SelectTrigger>
              <SelectContent>
                {BLOOD_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}型
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground"
          >
            {saving ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                保存する
              </>
            )}
          </Button>
        </div>

        {/* Links Section */}
        <div className="mt-5 space-y-2">
          {/* Admin Settings */}
          {isAdmin && (
            <button
              onClick={() => navigate("/settings")}
              className="w-full flex items-center justify-between py-3.5 px-4 rounded-xl glass-surface text-sm text-muted-foreground hover:text-accent transition-colors"
            >
              <span className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                管理者設定
              </span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}

          {/* Commercial Transaction */}
          <Link
            to="/commercial-transaction"
            className="w-full flex items-center justify-between py-3.5 px-4 rounded-xl glass-surface text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <span className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              特定商取引法に基づく表記
            </span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Profile;
