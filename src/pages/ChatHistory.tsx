import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { ArrowLeft, MessageCircle, ChevronDown, ChevronUp, Trash2 } from "lucide-react";
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
import StarField from "@/components/StarField";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

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
  messages?: ChatMessage[];
}

const ChatHistory = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [expandedSessions, setExpandedSessions] = useState<Set<string>>(new Set());
  const [loadingMessages, setLoadingMessages] = useState<Set<string>>(new Set());

  const { data: sessions, isLoading, refetch } = useQuery({
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

  const [sessionMessages, setSessionMessages] = useState<Record<string, ChatMessage[]>>({});

  const loadMessages = async (sessionId: string) => {
    if (sessionMessages[sessionId]) return;
    
    setLoadingMessages(prev => new Set(prev).add(sessionId));
    
    try {
      const { data, error } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("session_id", sessionId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      
      const mappedMessages: ChatMessage[] = (data || []).map(msg => ({
        id: msg.id,
        role: msg.role as "user" | "assistant",
        content: msg.content,
        created_at: msg.created_at,
      }));
      
      setSessionMessages(prev => ({
        ...prev,
        [sessionId]: mappedMessages,
      }));
    } catch (error) {
      console.error("Failed to load messages:", error);
      toast.error("メッセージの読み込みに失敗しました");
    } finally {
      setLoadingMessages(prev => {
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

  const deleteSession = async (sessionId: string) => {
    try {
      const { error } = await supabase
        .from("chat_sessions")
        .delete()
        .eq("id", sessionId);

      if (error) throw error;
      
      toast.success("チャット履歴を削除しました");
      refetch();
    } catch (error) {
      console.error("Failed to delete session:", error);
      toast.error("削除に失敗しました");
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!user) {
    navigate("/auth");
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
          <h1 className="text-2xl font-bold">チャット履歴</h1>
        </div>

        {(!sessions || sessions.length === 0) ? (
          <div className="text-center py-12">
            <MessageCircle className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground mb-4">チャット履歴がありません</p>
            <Button onClick={() => navigate("/")}>
              占いを始める
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {sessions.map((session) => {
              const isExpanded = expandedSessions.has(session.id);
              const isLoadingMsgs = loadingMessages.has(session.id);
              const messages = sessionMessages[session.id] || [];

              return (
                <Collapsible
                  key={session.id}
                  open={isExpanded}
                  onOpenChange={() => toggleSession(session.id)}
                >
                  <div className="glass-surface rounded-xl overflow-hidden">
                    <CollapsibleTrigger asChild>
                      <button className="w-full p-4 flex items-center gap-4 hover:bg-muted/20 transition-colors text-left">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center text-2xl shrink-0">
                          {session.agent_emoji || "🔮"}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium truncate">{session.agent_name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(session.started_at), "yyyy年M月d日 HH:mm", { locale: ja })}
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">
                            {session.rally_count} ラリー
                          </Badge>
                          {isExpanded ? (
                            <ChevronUp className="w-5 h-5 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-muted-foreground" />
                          )}
                        </div>
                      </button>
                    </CollapsibleTrigger>

                    <CollapsibleContent>
                      <div className="border-t border-border/30">
                        {isLoadingMsgs ? (
                          <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
                          </div>
                        ) : messages.length === 0 ? (
                          <div className="text-center py-8 text-muted-foreground text-sm">
                            メッセージがありません
                          </div>
                        ) : (
                          <ScrollArea className="max-h-[400px]">
                            <div className="p-4 space-y-3">
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
                                      "max-w-[85%] rounded-2xl px-4 py-2 text-sm",
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
                              <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                                <Trash2 className="w-4 h-4 mr-1" />
                                削除
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>チャット履歴を削除</AlertDialogTitle>
                                <AlertDialogDescription>
                                  この操作は取り消せません。このチャット履歴を完全に削除してもよろしいですか？
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>キャンセル</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteSession(session.id)}
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
      </div>
    </div>
  );
};

export default ChatHistory;
