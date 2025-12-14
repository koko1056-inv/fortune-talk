import { useState, useCallback, useRef, useEffect } from "react";
import { toast } from "sonner";
import { Send, Loader2, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import AgentSelector, { Agent } from "./AgentSelector";
import TextChatButton from "./TextChatButton";
import { useAgentConfig } from "@/hooks/useAgentConfig";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/hooks/useAuth";
import { useBillingStatus } from "@/hooks/useBillingStatus";
import { supabase } from "@/integrations/supabase/client";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  choices?: string[];
}

const MAX_RALLIES_PER_TICKET = 10;

const TextChat = () => {
  const { agents, loading: agentsLoading } = useAgentConfig();
  const { user } = useAuth();
  const { profile } = useProfile();
  const { billingStatus, isFirstFreeReading, useTicket, refetch: refetchBilling } = useBillingStatus();
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [showTextInput, setShowTextInput] = useState(false);
  const [rallyCount, setRallyCount] = useState(0);
  const sessionIdRef = useRef<string | null>(null);
  const sessionStartRef = useRef<Date | null>(null);
  const currentAgentRef = useRef<Agent | null>(null);
  const isFreeReadingRef = useRef(false);
  const ticketUsedRef = useRef(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Set initial selected agent when agents are loaded
  useEffect(() => {
    if (agents.length > 0 && !selectedAgent) {
      const firstAvailable = agents.find(a => a.agentId.trim().length > 0) || agents[0];
      setSelectedAgent(firstAvailable);
    }
  }, [agents, selectedAgent]);

  // Update selected agent when agents change
  useEffect(() => {
    if (selectedAgent) {
      const updated = agents.find((a) => a.id === selectedAgent.id);
      if (updated) {
        setSelectedAgent(updated);
      }
    }
  }, [agents, selectedAgent]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const saveMessageToDb = useCallback(async (
    sessionId: string,
    role: "user" | "assistant",
    content: string,
    choices?: string[]
  ) => {
    if (!user) return;
    
    try {
      await supabase.from("chat_messages").insert({
        session_id: sessionId,
        user_id: user.id,
        role,
        content,
        choices: choices || null,
      });
    } catch (error) {
      console.error("Failed to save message:", error);
    }
  }, [user]);

  const updateSessionRallyCount = useCallback(async (sessionId: string, count: number) => {
    try {
      await supabase
        .from("chat_sessions")
        .update({ rally_count: count })
        .eq("id", sessionId);
    } catch (error) {
      console.error("Failed to update rally count:", error);
    }
  }, []);

  const sendMessageToAI = useCallback(async (userMessage: string) => {
    if (!selectedAgent || !sessionIdRef.current) return;
    
    // Check if user has exceeded rally limit (unless exempt)
    if (!billingStatus.isExempt && rallyCount >= MAX_RALLIES_PER_TICKET) {
      toast.error("このセッションの上限に達しました", {
        description: "新しいチャットを開始するにはチケットが必要です",
      });
      return;
    }
    
    setIsSending(true);

    // Add user message to chat
    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: userMessage,
    };
    setMessages(prev => [...prev, userMsg]);
    setShowTextInput(false);

    // Save user message to database
    await saveMessageToDb(sessionIdRef.current, "user", userMessage);

    try {
      const chatMessages = messages.map(m => ({
        role: m.role,
        content: m.content,
      }));
      chatMessages.push({ role: "user" as const, content: userMessage });

      const { data, error } = await supabase.functions.invoke("fortune-chat", {
        body: {
          messages: chatMessages,
          agentType: selectedAgent.name,
          userProfile: profile ? {
            displayName: profile.display_name,
            birthDate: profile.birth_date,
            zodiacSign: profile.zodiac_sign,
            bloodType: profile.blood_type,
          } : undefined,
          generateChoices: true,
        },
      });

      if (error) throw error;

      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.content,
        choices: data.choices?.length > 0 ? data.choices : undefined,
      };
      setMessages(prev => [...prev, assistantMsg]);

      // Save assistant message to database
      await saveMessageToDb(sessionIdRef.current!, "assistant", data.content, data.choices);

      // Increment rally count
      const newRallyCount = rallyCount + 1;
      setRallyCount(newRallyCount);
      await updateSessionRallyCount(sessionIdRef.current!, newRallyCount);

      // Show warning when approaching limit
      if (!billingStatus.isExempt && newRallyCount === MAX_RALLIES_PER_TICKET - 2) {
        toast.warning("残り2回のやり取りでこのセッションが終了します");
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      toast.error("メッセージの送信に失敗しました");
    } finally {
      setIsSending(false);
    }
  }, [messages, selectedAgent, profile, rallyCount, billingStatus.isExempt, saveMessageToDb, updateSessionRallyCount]);

  const startChat = useCallback(async () => {
    if (!selectedAgent) return;
    
    // Check billing status before starting (unless exempt or first free reading)
    if (user && !billingStatus.isExempt && !isFirstFreeReading && billingStatus.ticketBalance <= 0) {
      toast.error("チケットが不足しています", {
        description: "チケットを購入してください",
      });
      return;
    }

    // Track if this is a free reading
    isFreeReadingRef.current = isFirstFreeReading;
    ticketUsedRef.current = false;
    
    setIsConnecting(true);
    
    try {
      sessionStartRef.current = new Date();
      currentAgentRef.current = selectedAgent;
      
      // Create chat session in database
      if (user) {
        const { data: sessionData, error: sessionError } = await supabase
          .from("chat_sessions")
          .insert({
            user_id: user.id,
            agent_name: selectedAgent.name,
            agent_emoji: selectedAgent.emoji,
            started_at: new Date().toISOString(),
            ticket_used: !billingStatus.isExempt && !isFirstFreeReading,
          })
          .select()
          .single();

        if (sessionError) throw sessionError;
        sessionIdRef.current = sessionData.id;

        // Use a ticket if not exempt and not first free reading
        if (!billingStatus.isExempt && !isFirstFreeReading) {
          await useTicket();
          ticketUsedRef.current = true;
        }
      }
      
      setIsConnected(true);
      setIsConnecting(false);
      setRallyCount(0);
      
      const profileInfo = profile?.display_name 
        ? `${profile.display_name}さん、${selectedAgent.name}とのチャットを開始しました`
        : `${selectedAgent.name}とのチャットを開始しました`;
      toast.success(profileInfo);

      // Send initial greeting
      await sendMessageToAI("こんにちは、占いをお願いします。");
    } catch (error) {
      console.error("Failed to start chat:", error);
      setIsConnecting(false);
      toast.error("接続に失敗しました");
    }
  }, [selectedAgent, user, billingStatus, isFirstFreeReading, profile, sendMessageToAI, useTicket]);

  const endChat = useCallback(async () => {
    if (user && sessionIdRef.current) {
      // Update session end time
      await supabase
        .from("chat_sessions")
        .update({ 
          ended_at: new Date().toISOString(),
          rally_count: rallyCount,
        })
        .eq("id", sessionIdRef.current);
      
      sessionIdRef.current = null;
      sessionStartRef.current = null;
      currentAgentRef.current = null;
      isFreeReadingRef.current = false;
      ticketUsedRef.current = false;
      refetchBilling();
    }
    
    setIsConnected(false);
    setMessages([]);
    setShowTextInput(false);
    setRallyCount(0);
    toast.info("チャットを終了しました");
  }, [user, rallyCount, refetchBilling]);

  const handleChoiceSelect = useCallback((choice: string) => {
    sendMessageToAI(choice);
  }, [sendMessageToAI]);

  const handleCustomInput = useCallback(() => {
    if (!inputValue.trim()) return;
    sendMessageToAI(inputValue.trim());
    setInputValue("");
  }, [inputValue, sendMessageToAI]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleCustomInput();
    }
  };

  // Show loading skeleton while agents are being fetched
  if (agentsLoading || !selectedAgent) {
    return (
      <div className="flex flex-col items-center gap-6 w-full">
        <div className="w-24 h-24 rounded-full bg-muted/30 animate-pulse" />
        <div className="h-4 w-32 bg-muted/30 rounded animate-pulse" />
      </div>
    );
  }

  // Get the last message's choices
  const lastMessage = messages[messages.length - 1];
  const currentChoices = lastMessage?.role === "assistant" ? lastMessage.choices : undefined;
  const isRallyLimitReached = !billingStatus.isExempt && rallyCount >= MAX_RALLIES_PER_TICKET;

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-xl mx-auto">
      {/* Agent Selector - hide when connected */}
      {!isConnected && (
        <AgentSelector
          agents={agents}
          selectedAgent={selectedAgent}
          onSelect={setSelectedAgent}
          disabled={isConnecting}
        />
      )}

      {/* Connected Agent Display */}
      {isConnected && currentAgentRef.current && (
        <div className="text-center animate-fade-in">
          <div 
            className={cn(
              "w-16 h-16 rounded-full mx-auto mb-2 flex items-center justify-center overflow-hidden",
              "bg-gradient-to-br shadow-crystal",
              !currentAgentRef.current.imageUrl && "text-3xl",
              currentAgentRef.current.gradient
            )}
          >
            {currentAgentRef.current.imageUrl ? (
              <img 
                src={currentAgentRef.current.imageUrl} 
                alt={currentAgentRef.current.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="drop-shadow-lg">{currentAgentRef.current.emoji}</span>
            )}
          </div>
          <h3 className="text-lg font-display font-bold text-gradient">
            {currentAgentRef.current.name}
          </h3>
          {/* Rally counter */}
          {!billingStatus.isExempt && (
            <Badge variant="secondary" className="mt-2">
              {rallyCount} / {MAX_RALLIES_PER_TICKET} ラリー
            </Badge>
          )}
        </div>
      )}

      {/* Chat Messages */}
      {isConnected && (
        <div className="w-full glass-surface rounded-xl overflow-hidden">
          <ScrollArea className="h-[280px] md:h-[350px] p-4" ref={scrollRef}>
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                占い師と接続中...
              </div>
            ) : (
              <div className="space-y-4">
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
                        "max-w-[85%] rounded-2xl px-4 py-3 text-sm",
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted/50 text-foreground"
                      )}
                    >
                      {message.content}
                    </div>
                  </div>
                ))}
                {isSending && (
                  <div className="flex justify-start">
                    <div className="bg-muted/50 rounded-2xl px-4 py-3">
                      <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                    </div>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>

          {/* Rally limit reached message */}
          {isRallyLimitReached && (
            <div className="border-t border-border/30 p-4 text-center">
              <p className="text-sm text-muted-foreground mb-2">
                このセッションの上限（{MAX_RALLIES_PER_TICKET}ラリー）に達しました
              </p>
              <Button variant="outline" size="sm" onClick={endChat}>
                チャットを終了
              </Button>
            </div>
          )}

          {/* Choice Buttons */}
          {!isRallyLimitReached && currentChoices && currentChoices.length > 0 && !isSending && (
            <div className="border-t border-border/30 p-3 space-y-2">
              <p className="text-xs text-muted-foreground text-center mb-2">
                選択肢を選ぶか、自由に入力してください
              </p>
              <div className="space-y-2">
                {currentChoices.map((choice, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="w-full justify-start text-left h-auto py-3 px-4 whitespace-normal"
                    onClick={() => handleChoiceSelect(choice)}
                    disabled={isSending}
                  >
                    <MessageCircle className="w-4 h-4 mr-2 shrink-0" />
                    <span className="text-sm">{choice}</span>
                  </Button>
                ))}
              </div>
              
              {/* Toggle for custom input */}
              {!showTextInput ? (
                <Button
                  variant="ghost"
                  className="w-full text-muted-foreground text-xs"
                  onClick={() => setShowTextInput(true)}
                >
                  その他（自由入力）
                </Button>
              ) : (
                <div className="flex gap-2 mt-2">
                  <Textarea
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="質問を入力してください..."
                    className="min-h-[44px] max-h-[80px] resize-none bg-background/50 text-sm"
                    disabled={isSending}
                  />
                  <Button
                    onClick={handleCustomInput}
                    disabled={!inputValue.trim() || isSending}
                    size="icon"
                    className="shrink-0"
                  >
                    {isSending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Initial input when no choices yet */}
          {!isRallyLimitReached && (!currentChoices || currentChoices.length === 0) && !isSending && messages.length > 0 && (
            <div className="border-t border-border/30 p-3">
              <div className="flex gap-2">
                <Textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="質問を入力してください..."
                  className="min-h-[44px] max-h-[80px] resize-none bg-background/50 text-sm"
                  disabled={isSending}
                />
                <Button
                  onClick={handleCustomInput}
                  disabled={!inputValue.trim() || isSending}
                  size="icon"
                  className="shrink-0"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Start/End Chat Button */}
      <TextChatButton
        isConnected={isConnected}
        isConnecting={isConnecting}
        onClick={isConnected ? endChat : startChat}
      />

      {/* Profile hint when not logged in */}
      {!isConnected && !user && (
        <p className="text-[10px] md:text-xs text-muted-foreground/60 text-center px-4">
          💡 ログインしてプロフィールを登録すると、
          <br className="md:hidden" />
          パーソナライズされた占いを受けられます
        </p>
      )}
    </div>
  );
};

export default TextChat;
