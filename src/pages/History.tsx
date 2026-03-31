import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useFortuneHistory } from "@/hooks/useFortuneHistory";
import { useAuth } from "@/hooks/useAuth";
import { useAgentConfig } from "@/hooks/useAgentConfig";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Trash2, Clock, Calendar, Mic, MessageSquare, ChevronDown, ChevronUp, Sparkles } from "lucide-react";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import StarField from "@/components/StarField";
import { cn } from "@/lib/utils";

type HistoryTab = "voice" | "chat";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

interface ChatSession {
  id: string;
  agent_name: string;
  agent_emoji: string | null;
  started_at: string;
  ended_at: string | null;
  rally_count: number;
  created_at: string;
}

const History = () => {
  const { user, loading: authLoading } = useAuth();
  const { readings, loading: voiceLoading, deleteReading } = useFortuneHistory();
  const { agents } = useAgentConfig();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<HistoryTab>("voice");

  // Chat sessions query
  const { data: chatSessions, isLoading: chatLoading, refetch: refetchChat } = useQuery({
    queryKey: ["chat-sessions", user?.id],
    queryFn: async (): Promise<ChatSession[]> => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("chat_sessions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  // Chat message expansion
  const [expandedSessions, setExpandedSessions] = useState<Set<string>>(new Set());
  const [loadingMessages, setLoadingMessages] = useState<Set<string>>(new Set());
  const [sessionMessages, setSessionMessages] = useState<Record<string, ChatMessage[]>>({});

  const getAgentImage = (agentName: string) => {
    return agents.find((a) => a.name === agentName)?.imageUrl;
  };

  const getAgentGradient = (agentName: string) => {
    return agents.find((a) => a.name === agentName)?.gradient || "from-violet-600 via-purple-600 to-indigo-700";
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return "不明";
    if (seconds < 60) return `${seconds}秒`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return remainingSeconds > 0 ? `${minutes}分${remainingSeconds}秒` : `${minutes}分`;
  };

  const handleDeleteVoice = async (id: string) => {
    const success = await deleteReading(id);
    if (success) {
      toast.success("履歴を削除しました");
    } else {
      toast.error("削除に失敗しました");
    }
  };

  const loadMessages = async (sessionId: string) => {
    if (sessionMessages[sessionId]) return;
    setLoadingMessages((prev) => new Set(prev).add(sessionId));
    try {
      const { data, error } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("session_id", sessionId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      setSessionMessages((prev) => ({
        ...prev,
        [sessionId]: (data || []).map((msg) => ({
          id: msg.id,
          role: msg.role as "user" | "assistant",
          content: msg.content,
          created_at: msg.created_at,
        })),
      }));
    } catch {
      toast.error("メッセージの読み込みに失敗しました");
    } finally {
      setLoadingMessages((prev) => {
        const next = new Set(prev);
        next.delete(sessionId);
        return next;
      });
    }
  };

  const toggleSession = async (sessionId: string) => {
    const newExpanded = new Set(expandedSessions);
    if (newExpanded.has(sessionId)) {
      newExpanded.delete(sessionId);
    } else {
      newExpanded.add(sessionId);
      await loadMessages(sessionId);
    }
    setExpandedSessions(newExpanded);
  };

  const deleteChatSession = async (sessionId: string) => {
    try {
      const { error } = await supabase.from("chat_sessions").delete().eq("id", sessionId);
      if (error) throw error;
      toast.success("チャット履歴を削除しました");
      refetchChat();
    } catch {
      toast.error("削除に失敗しました");
    }
  };

  const loading = authLoading || voiceLoading || chatLoading;

  if (loading) {
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
        <p className="text-muted-foreground text-center text-sm">
          占い履歴を表示するにはログインしてください
        </p>
        <Button onClick={() => navigate("/auth")} className="bg-accent hover:bg-accent/80 text-accent-foreground">
          ログイン
        </Button>
      </div>
    );
  }

  const voiceCount = readings.length;
  const chatCount = chatSessions?.length || 0;

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <StarField />

      <div className="relative z-10 max-w-2xl mx-auto px-4 pt-6 pb-28">
        {/* Header */}
        <div className="mb-5">
          <h1 className="text-2xl font-display font-bold text-foreground">
            鑑定履歴
          </h1>
          <p className="text-xs text-muted-foreground mt-1">過去の鑑定記録</p>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-2 mb-5">
          <button
            onClick={() => setActiveTab("voice")}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
              activeTab === "voice"
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                : "glass-surface text-muted-foreground hover:text-foreground"
            )}
          >
            <Mic className="w-4 h-4" />
            音声 ({voiceCount})
          </button>
          <button
            onClick={() => setActiveTab("chat")}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
              activeTab === "chat"
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                : "glass-surface text-muted-foreground hover:text-foreground"
            )}
          >
            <MessageSquare className="w-4 h-4" />
            テキスト ({chatCount})
          </button>
        </div>

        {/* Voice History Tab */}
        {activeTab === "voice" && (
          <>
            {readings.length === 0 ? (
              <EmptyState
                emoji="🌙"
                title="音声鑑定の履歴がありません"
                description="音声で占いを受けると、ここに記録されます"
                onAction={() => navigate("/")}
              />
            ) : (
              <div className="space-y-3">
                {readings.map((reading) => (
                  <div
                    key={reading.id}
                    className="glass-surface rounded-xl p-4 hover:border-accent/40 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-11 h-11 rounded-full flex items-center justify-center overflow-hidden bg-gradient-to-br ${getAgentGradient(reading.agent_name)}`}>
                          {getAgentImage(reading.agent_name) ? (
                            <img
                              src={getAgentImage(reading.agent_name)}
                              alt={reading.agent_name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-xl">{reading.agent_emoji || "🔮"}</span>
                          )}
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-foreground">
                            {reading.agent_name}
                          </h3>
                          <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {format(new Date(reading.created_at), "M/d (E)", { locale: ja })}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatDuration(reading.duration_seconds)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteVoice(reading.id)}
                        className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 w-9 h-9"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Chat History Tab */}
        {activeTab === "chat" && (
          <>
            {(!chatSessions || chatSessions.length === 0) ? (
              <EmptyState
                emoji="💬"
                title="テキスト鑑定の履歴がありません"
                description="テキストで占いを受けると、ここに記録されます"
                onAction={() => navigate("/")}
              />
            ) : (
              <div className="space-y-3">
                {chatSessions.map((session) => {
                  const isExpanded = expandedSessions.has(session.id);
                  const isLoadingMsgs = loadingMessages.has(session.id);
                  const messages = sessionMessages[session.id] || [];
                  const agentConfig = agents.find((a) => a.name === session.agent_name);

                  return (
                    <Collapsible
                      key={session.id}
                      open={isExpanded}
                      onOpenChange={() => toggleSession(session.id)}
                    >
                      <div className="glass-surface rounded-xl overflow-hidden">
                        <CollapsibleTrigger asChild>
                          <button className="w-full p-4 flex items-center gap-3 hover:bg-muted/20 transition-colors text-left">
                            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center text-xl shrink-0 overflow-hidden">
                              {agentConfig?.imageUrl ? (
                                <img src={agentConfig.imageUrl} alt={session.agent_name} className="w-full h-full object-cover" />
                              ) : (
                                session.agent_emoji || "🔮"
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="text-sm font-medium truncate">{session.agent_name}</h3>
                              <p className="text-xs text-muted-foreground">
                                {format(new Date(session.started_at), "M/d (E) HH:mm", { locale: ja })}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" className="text-[10px]">
                                {session.rally_count}往復
                              </Badge>
                              {isExpanded ? (
                                <ChevronUp className="w-4 h-4 text-muted-foreground" />
                              ) : (
                                <ChevronDown className="w-4 h-4 text-muted-foreground" />
                              )}
                            </div>
                          </button>
                        </CollapsibleTrigger>

                        <CollapsibleContent>
                          <div className="border-t border-border/30">
                            {isLoadingMsgs ? (
                              <div className="flex items-center justify-center py-8">
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary" />
                              </div>
                            ) : messages.length === 0 ? (
                              <div className="text-center py-8 text-muted-foreground text-sm">
                                メッセージがありません
                              </div>
                            ) : (
                              <ScrollArea className="max-h-[360px]">
                                <div className="p-4 space-y-2.5">
                                  {messages.map((message) => (
                                    <div
                                      key={message.id}
                                      className={cn(
                                        "flex",
                                        message.role === "user" ? "justify-end" : "justify-start"
                                      )}
                                    >
                                      <div
                                        className={cn(
                                          "max-w-[85%] rounded-2xl px-3.5 py-2 text-sm",
                                          message.role === "user"
                                            ? "bg-primary text-primary-foreground"
                                            : "bg-muted/50 text-foreground"
                                        )}
                                      >
                                        {message.content}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </ScrollArea>
                            )}

                            <div className="p-3 border-t border-border/30 flex justify-end">
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive text-xs h-8">
                                    <Trash2 className="w-3.5 h-3.5 mr-1" />
                                    削除
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>チャット履歴を削除</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      この操作は取り消せません。削除してもよろしいですか？
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>キャンセル</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => deleteChatSession(session.id)}
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                      削除
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </div>
                        </CollapsibleContent>
                      </div>
                    </Collapsible>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

// Shared empty state component
const EmptyState = ({
  emoji,
  title,
  description,
  onAction,
}: {
  emoji: string;
  title: string;
  description: string;
  onAction: () => void;
}) => (
  <div className="text-center py-16">
    <div className="text-5xl mb-4">{emoji}</div>
    <h2 className="text-lg font-medium text-foreground mb-2">{title}</h2>
    <p className="text-muted-foreground text-sm mb-6">{description}</p>
    <button
      onClick={onAction}
      className={cn(
        "inline-flex items-center gap-2 px-6 py-3 rounded-full",
        "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground",
        "text-sm font-medium shadow-lg shadow-primary/20",
        "active:scale-95 transition-all"
      )}
    >
      <Sparkles className="w-4 h-4" />
      占いを始める
    </button>
  </div>
);

export default History;
