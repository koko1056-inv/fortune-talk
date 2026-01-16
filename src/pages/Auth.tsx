import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { toast } from "@/components/ui/sonner";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import StarField from "@/components/StarField";
import { Loader2, Mail, Lock } from "lucide-react";
import fortuneTellerImage from "@/assets/fortune-teller.png";

const authSchema = z.object({
  email: z.string().trim().email({ message: "有効なメールアドレスを入力してください" }),
  password: z.string().min(6, { message: "パスワードは6文字以上にしてください" }),
});

const Auth = () => {
  const navigate = useNavigate();
  const { user, signIn, signUp, loading: authLoading } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submit attempt started", { isLogin, email });
    setLoading(true);

    try {
      // Dismiss keyboard on mobile
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }

      const validation = authSchema.safeParse({ email, password });
      if (!validation.success) {
        toast.error(validation.error.errors[0].message);
        setLoading(false);
        return;
      }

      if (isLogin) {
        console.log("Calling signIn...");
        const { data, error } = await signIn(email, password);
        if (error) {
          console.error("Login error confirmed:", error);
          if (error.message.includes("Invalid login")) {
            toast.error("メールアドレスまたはパスワードが正しくありません");
          } else {
            toast.error(error.message);
          }
        } else if (data.user) {
          console.log("Login successful, user:", data.user.id);
          toast.success("ログインしました ✨");
          // Small delay for Capacitor to handle state storage transition
          setTimeout(() => navigate("/", { replace: true }), 100);
        } else {
          console.warn("No error but no user returned from signIn");
        }
      } else {
        console.log("Calling signUp...");
        const { data, error } = await signUp(email, password);
        if (error) {
          console.error("Signup error confirmed:", error);
          if (error.message.includes("already registered")) {
            toast.error("このメールアドレスは既に登録されています");
          } else {
            toast.error(error.message);
          }
        } else if (data.user) {
          console.log("Signup successful, user:", data.user.id);
          toast.success("アカウントを作成しました！ようこそ ✨");
          setTimeout(() => navigate("/", { replace: true }), 100);
        } else {
          console.warn("No error but no user returned from signUp");
        }
      }
    } catch (error) {
      console.error("Unexpected auth form error:", error);
      toast.error("エラーが発生しました。もう一度お試しください。");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <StarField />
      
      <div className="relative z-10 w-full max-w-md px-6 animate-fade-in">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-primary/30 to-accent/20 mb-6 animate-float overflow-hidden">
            <img src={fortuneTellerImage} alt="Fortune Teller" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-3xl font-bold text-gradient mb-2 tracking-tight">
            フォーチュントーク
          </h1>
          <p className="text-muted-foreground">
            {isLogin ? "あなたの運命への扉を開く" : "新しい旅を始める"}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="glass-surface rounded-2xl p-6 space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground/80 flex items-center gap-2">
                <Mail className="w-4 h-4 text-accent" />
                メールアドレス
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="bg-background/50 border-border/50 focus:border-accent"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground/80 flex items-center gap-2">
                <Lock className="w-4 h-4 text-accent" />
                パスワード
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="bg-background/50 border-border/50 focus:border-accent"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground shadow-glow"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : isLogin ? (
                "ログイン"
              ) : (
                "アカウント作成"
              )}
            </Button>
          </div>
        </form>

        {/* Toggle */}
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm text-muted-foreground hover:text-accent transition-colors"
          >
            {isLogin ? (
              <>
                アカウントをお持ちでない方は <span className="text-accent">新規登録</span>
              </>
            ) : (
              <>
                既にアカウントをお持ちの方は <span className="text-accent">ログイン</span>
              </>
            )}
          </button>
        </div>

        {/* Back to home */}
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors"
          >
            ← ホームに戻る
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;