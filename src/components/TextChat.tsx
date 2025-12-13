import { useConversation } from "@elevenlabs/react";
import { useState, useCallback, useRef, useEffect } from "react";
import { toast } from "sonner";
import { Send, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import AgentSelector, { Agent } from "./AgentSelector";
import { useAgentConfig } from "@/hooks/useAgentConfig";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/hooks/useAuth";
import { useFortuneHistory } from "@/hooks/useFortuneHistory";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const TextChat = () => {
  const { agents, loading: agentsLoading } = useAgentConfig();
  const { user } = useAuth();
  const { profile } = useProfile();
  const { saveReading } = useFortuneHistory();
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const sessionStartRef = useRef<Date | null>(null);
  const currentAgentRef = useRef<Agent | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

  // Build dynamic prompt with user profile
  const buildDynamicPrompt = useCallback(() => {
    if (!profile) return null;

    const parts: string[] = [];
    
    if (profile.display_name) {
      parts.push(`相談者の名前: ${profile.display_name}`);
    }
    
    if (profile.birth_date) {
      const birthDate = new Date(profile.birth_date);
      const formattedDate = `${birthDate.getFullYear()}年${birthDate.getMonth() + 1}月${birthDate.getDate()}日`;
      parts.push(`生年月日: ${formattedDate}`);
    }
    
    if (profile.zodiac_sign) {
      parts.push(`星座: ${profile.zodiac_sign}`);
    }
    
    if (profile.blood_type) {
      parts.push(`血液型: ${profile.blood_type}型`);
    }

    if (parts.length === 0) return null;

    return `【相談者のプロフィール情報】\n${parts.join('\n')}\n\nこの情報を参考にして、パーソナライズされた占いを提供してください。`;
  }, [profile]);

  const conversation = useConversation({
    // Text-only mode - no audio input/output
    onConnect: () => {
      console.log("Text chat connected to agent");
      sessionStartRef.current = new Date();
      currentAgentRef.current = selectedAgent;
      setIsConnected(true);
      setIsConnecting(false);
      
      const profileInfo = profile?.display_name 
        ? `${profile.display_name}さん、${selectedAgent?.name}とのチャットを開始しました`
        : `${selectedAgent?.name}とのチャットを開始しました`;
      toast.success(profileInfo);
    },
    onDisconnect: () => {
      console.log("Text chat disconnected from agent");
      setIsConnected(false);
      
      if (user && sessionStartRef.current && currentAgentRef.current) {
        const endTime = new Date();
        saveReading(
          currentAgentRef.current.name,
          currentAgentRef.current.emoji,
          sessionStartRef.current,
          endTime
        );
        sessionStartRef.current = null;
        currentAgentRef.current = null;
      }
      
      toast.info("チャットを終了しました");
    },
    onMessage: (message: any) => {
      console.log("Received message:", message);
      
      // Handle agent response
      if (message.type === "agent_response") {
        const agentResponse = message.agent_response_event?.agent_response;
        if (agentResponse) {
          setMessages(prev => [...prev, {
            id: Date.now().toString(),
            role: "assistant",
            content: agentResponse,
          }]);
          setIsSending(false);
        }
      }
    },
    onError: (error) => {
      console.error("Text chat error:", error);
      setIsSending(false);
      toast.error("エラーが発生しました", {
        description: "もう一度お試しください",
      });
    },
  });

  const startChat = useCallback(async () => {
    if (!selectedAgent) return;
    
    setIsConnecting(true);
    try {
      const dynamicPrompt = buildDynamicPrompt();
      
      // Use text-only mode - no microphone needed
      const sessionOptions: any = {
        agentId: selectedAgent.agentId,
        textOnly: true,
      };

      if (dynamicPrompt && profile) {
        sessionOptions.dynamicVariables = {
          user_profile: dynamicPrompt,
          user_name: profile.display_name || "お客様",
          user_zodiac: profile.zodiac_sign || "",
          user_blood_type: profile.blood_type ? `${profile.blood_type}型` : "",
          user_birth_date: profile.birth_date || "",
        };
      }

      await (conversation.startSession as any)(sessionOptions);
      console.log("Text chat session started with agent:", selectedAgent.name);
    } catch (error) {
      console.error("Failed to start text chat:", error);
      setIsConnecting(false);
      toast.error("接続に失敗しました", {
        description: "もう一度お試しください",
      });
    }
  }, [conversation, selectedAgent, buildDynamicPrompt, profile]);

  const endChat = useCallback(async () => {
    await conversation.endSession();
    setMessages([]);
  }, [conversation]);

  const sendMessage = useCallback(async () => {
    if (!inputValue.trim() || !isConnected || isSending) return;

    const userMessage = inputValue.trim();
    setInputValue("");
    setIsSending(true);

    // Add user message to chat
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      role: "user",
      content: userMessage,
    }]);

    try {
      // Send text message to the agent
      await (conversation as any).sendUserMessage(userMessage);
    } catch (error) {
      console.error("Failed to send message:", error);
      setIsSending(false);
      toast.error("メッセージの送信に失敗しました");
    }
  }, [inputValue, isConnected, isSending, conversation]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
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
          <ScrollArea className="h-[300px] md:h-[400px] p-4" ref={scrollRef}>
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                メッセージを入力して占いを始めましょう
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
                        "max-w-[80%] rounded-2xl px-4 py-2 text-sm",
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
                    <div className="bg-muted/50 rounded-2xl px-4 py-2">
                      <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                    </div>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>

          {/* Input Area */}
          <div className="border-t border-border/30 p-3">
            <div className="flex gap-2">
              <Textarea
                ref={textareaRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="質問を入力してください..."
                className="min-h-[44px] max-h-[120px] resize-none bg-background/50"
                disabled={isSending}
              />
              <Button
                onClick={sendMessage}
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
          </div>
        </div>
      )}

      {/* Start/End Chat Button */}
      {!isConnected ? (
        <Button
          onClick={startChat}
          disabled={isConnecting}
          className="w-full max-w-xs"
        >
          {isConnecting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              接続中...
            </>
          ) : (
            "チャットを開始"
          )}
        </Button>
      ) : (
        <Button
          onClick={endChat}
          variant="outline"
          className="w-full max-w-xs"
        >
          チャットを終了
        </Button>
      )}

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
