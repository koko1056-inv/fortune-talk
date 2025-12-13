import { useFortuneHistory } from "@/hooks/useFortuneHistory";
import { useAuth } from "@/hooks/useAuth";
import { useAgentConfig } from "@/hooks/useAgentConfig";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Trash2, Clock, Calendar } from "lucide-react";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { toast } from "sonner";

const History = () => {
  const { user, loading: authLoading } = useAuth();
  const { readings, loading, deleteReading } = useFortuneHistory();
  const { agents } = useAgentConfig();
  const navigate = useNavigate();

  const getAgentImage = (agentName: string) => {
    const agent = agents.find((a) => a.name === agentName);
    return agent?.imageUrl;
  };

  const getAgentGradient = (agentName: string) => {
    const agent = agents.find((a) => a.name === agentName);
    return agent?.gradient || "from-violet-600 via-purple-600 to-indigo-700";
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return "不明";
    if (seconds < 60) return `${seconds}秒`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return remainingSeconds > 0 ? `${minutes}分${remainingSeconds}秒` : `${minutes}分`;
  };

  const handleDelete = async (id: string) => {
    const success = await deleteReading(id);
    if (success) {
      toast.success("履歴を削除しました");
    } else {
      toast.error("削除に失敗しました");
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-accent text-xl">✧ 読み込み中... ✧</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-6 p-8">
        <div className="text-6xl">🔮</div>
        <h1 className="text-2xl font-bold text-foreground">ログインが必要です</h1>
        <p className="text-muted-foreground text-center">
          占い履歴を表示するにはログインしてください
        </p>
        <Button onClick={() => navigate("/auth")} className="bg-accent hover:bg-accent/80">
          ログイン
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border/30">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
            className="text-foreground hover:bg-accent/20"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
            <span className="text-2xl">📜</span>
            占い履歴
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        {readings.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🌙</div>
            <h2 className="text-xl font-medium text-foreground mb-2">
              まだ履歴がありません
            </h2>
            <p className="text-muted-foreground mb-6">
              占いを受けると、ここに記録されます
            </p>
            <Button onClick={() => navigate("/")} className="bg-accent hover:bg-accent/80">
              占いを始める
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {readings.map((reading) => (
              <div
                key={reading.id}
                className="bg-card/50 backdrop-blur-sm border border-border/30 rounded-xl p-4 hover:border-accent/40 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center overflow-hidden bg-gradient-to-br ${getAgentGradient(reading.agent_name)}`}>
                      {getAgentImage(reading.agent_name) ? (
                        <img 
                          src={getAgentImage(reading.agent_name)} 
                          alt={reading.agent_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-2xl">{reading.agent_emoji || "🔮"}</span>
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground">
                        {reading.agent_name}
                      </h3>
                      <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {format(new Date(reading.created_at), "M月d日 (E)", { locale: ja })}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {formatDuration(reading.duration_seconds)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(reading.id)}
                    className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
