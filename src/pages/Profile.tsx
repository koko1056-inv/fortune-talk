import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useProfile, calculateZodiacSign } from "@/hooks/useProfile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import StarField from "@/components/StarField";
import { Loader2, User, Calendar, Droplets, Star, ArrowLeft, Save } from "lucide-react";

const BLOOD_TYPES = ["A", "B", "O", "AB"];

const ZODIAC_EMOJIS: Record<string, string> = {
  "牡羊座": "♈",
  "牡牛座": "♉",
  "双子座": "♊",
  "蟹座": "♋",
  "獅子座": "♌",
  "乙女座": "♍",
  "天秤座": "♎",
  "蠍座": "♏",
  "射手座": "♐",
  "山羊座": "♑",
  "水瓶座": "♒",
  "魚座": "♓",
};

const Profile = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, signOut } = useAuth();
  const { profile, loading: profileLoading, updateProfile } = useProfile();
  
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
        toast.success("プロフィールを保存しました ✨");
      }
    } catch (error) {
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

  return (
    <div className="relative min-h-screen overflow-hidden">
      <StarField />
      
      <div className="relative z-10 w-full max-w-lg mx-auto px-5 pt-16 pb-8 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/")}
              className="touch-target rounded-xl text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-display font-bold text-foreground">プロフィール</h1>
          </div>
          <button
            onClick={handleSignOut}
            className="text-sm text-muted-foreground hover:text-destructive transition-colors"
          >
            ログアウト
          </button>
        </div>

        {/* Avatar & subtitle */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary/30 via-accent/15 to-primary/30 mb-4 animate-crystal-glow">
            <User className="w-8 h-8 text-accent" />
          </div>
          <p className="text-muted-foreground text-sm">
            占い師があなたをより深く理解するために
          </p>
        </div>

        {/* Zodiac Display */}
        {zodiacSign && (
          <div className="glass-surface rounded-2xl p-6 mb-6 text-center">
            <div className="text-5xl mb-2">{ZODIAC_EMOJIS[zodiacSign]}</div>
            <p className="text-accent font-display text-xl">{zodiacSign}</p>
            <p className="text-muted-foreground text-xs mt-1">あなたの星座</p>
          </div>
        )}

        {/* Form */}
        <div className="glass-surface rounded-2xl p-6 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="displayName" className="text-foreground/80 flex items-center gap-2">
              <User className="w-4 h-4 text-accent" />
              お名前（ニックネーム）
            </Label>
            <Input
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="例：タロウ"
              className="bg-background/50 border-border/50 focus:border-accent"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="birthDate" className="text-foreground/80 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-accent" />
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
              <p className="text-xs text-accent flex items-center gap-1 mt-1">
                <Star className="w-3 h-3" />
                自動計算: {zodiacSign}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-foreground/80 flex items-center gap-2">
              <Droplets className="w-4 h-4 text-accent" />
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
            className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground shadow-glow"
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

        {/* Info */}
        <p className="text-center text-xs text-muted-foreground/60 mt-6">
          ✧ 占い師はあなたの情報を参照して、<br />
          より的確なアドバイスをお届けします ✧
        </p>
      </div>
    </div>
  );
};

export default Profile;