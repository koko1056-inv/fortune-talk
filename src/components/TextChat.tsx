import { useState, useCallback, useRef, useEffect } from "react";
import { toast } from "sonner";
import { Send, Loader2, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import AgentSelector, { Agent } from "./AgentSelector";
import TextChatButton from "./TextChatButton";
import { useAgentConfig } from "@/hooks/useAgentConfig";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/hooks/useAuth";
import { useFortuneHistory } from "@/hooks/useFortuneHistory";
import { useBillingStatus } from "@/hooks/useBillingStatus";
import { supabase } from "@/integrations/supabase/client";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  choices?: string[];
}

const TextChat = () => {
  const { agents, loading: agentsLoading } = useAgentConfig();
  const { user } = useAuth();
  const { profile } = useProfile();
  const { saveReading } = useFortuneHistory();
  const { billingStatus, isFirstFreeReading, refetch: refetchBilling } = useBillingStatus();
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [showTextInput, setShowTextInput] = useState(false);
  const sessionStartRef = useRef<Date | null>(null);
  const currentAgentRef = useRef<Agent | null>(null);
  const isFreeReadingRef = useRef(false);
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

  const sendMessageToAI = useCallback(async (userMessage: string) => {
    if (!selectedAgent) return;
    
    setIsSending(true);

    // Add user message to chat
    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: userMessage,
    };
    setMessages(prev => [...prev, userMsg]);
    setShowTextInput(false);

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
    } catch (error) {
      console.error("Failed to send message:", error);
      toast.error("メッセージの送信に失敗しました");
    } finally {
      setIsSending(false);
    }
  }, [messages, selectedAgent, profile]);

  const startChat = useCallback(async () => {
    if (!selectedAgent) return;
    
    // Check billing status before starting
    if (user && !billingStatus.canStartReading) {
      toast.error("チケットが不足しています", {
        description: "チケットを購入してください",
      });
      return;
    }

    // Track if this is a free reading
    isFreeReadingRef.current = isFirstFreeReading;
    
    setIsConnecting(true);
    
    try {
      sessionStartRef.current = new Date();
      currentAgentRef.current = selectedAgent;
      setIsConnected(true);
      setIsConnecting(false);
      
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
  }, [selectedAgent, user, billingStatus, isFirstFreeReading, profile, sendMessageToAI]);

  const endChat = useCallback(async () => {
    if (user && sessionStartRef.current && currentAgentRef.current) {
      const endTime = new Date();
      await saveReading(
        currentAgentRef.current.name,
        currentAgentRef.current.emoji,
        sessionStartRef.current,
        endTime,
        isFreeReadingRef.current
      );
      sessionStartRef.current = null;
      currentAgentRef.current = null;
      isFreeReadingRef.current = false;
      refetchBilling();
    }
    
    setIsConnected(false);
    setMessages([]);
    setShowTextInput(false);
    toast.info("チャットを終了しました");
  }, [user, saveReading, refetchBilling]);

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

          {/* Choice Buttons */}
          {currentChoices && currentChoices.length > 0 && !isSending && (
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
          {(!currentChoices || currentChoices.length === 0) && !isSending && messages.length > 0 && (
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
