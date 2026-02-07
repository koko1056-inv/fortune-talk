import { useState, useCallback, useRef, useEffect } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import AgentSelector, { Agent } from "./AgentSelector";
import TextChatButton from "./TextChatButton";
import FortuneSessionView from "./FortuneSessionView";
import ChatMessages, { Message } from "./ChatMessages";
import ChatInput from "./ChatInput";
import TicketRequiredDialog from "./TicketRequiredDialog";
import LoginRequiredDialog from "./LoginRequiredDialog";
import ProfileHint from "./ProfileHint";
import EnterRoomTransition from "./EnterRoomTransition";
import { useAgentConfig } from "@/hooks/useAgentConfig";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/hooks/useAuth";
import { useBillingStatus } from "@/hooks/useBillingStatus";
import { supabase } from "@/integrations/supabase/client";

const MAX_RALLIES_PER_TICKET = 10;

interface TextChatProps {
  onSessionChange?: (isInSession: boolean) => void;
}

const TextChat = ({ onSessionChange }: TextChatProps) => {
  const navigate = useNavigate();
  const { agents, loading: agentsLoading } = useAgentConfig();
  const { user } = useAuth();
  const { profile } = useProfile();
  const { billingStatus, isFirstFreeReading, useTicket, refetch: refetchBilling } = useBillingStatus();
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [rallyCount, setRallyCount] = useState(0);
  const [showTicketDialog, setShowTicketDialog] = useState(false);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [isUsingTicket, setIsUsingTicket] = useState(false);
  const [showEnterAnimation, setShowEnterAnimation] = useState(false);
  const sessionIdRef = useRef<string | null>(null);
  const currentAgentRef = useRef<Agent | null>(null);
  const isFreeReadingRef = useRef(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Notify parent of session state changes - stable "room mode" logic
  // We are in "room mode" when: connected OR connecting OR animation showing
  // This ensures we stay in fullscreen mode throughout the entire session
  useEffect(() => {
    const inRoomMode = isConnected || isConnecting || showEnterAnimation;
    console.log("[TextChat] Session state:", { isConnected, isConnecting, showEnterAnimation, inRoomMode });
    onSessionChange?.(inRoomMode);
  }, [isConnected, isConnecting, showEnterAnimation, onSessionChange]);

  useEffect(() => {
    if (agents.length > 0 && !selectedAgent) {
      const firstAvailable = agents.find(a => a.agentId.trim().length > 0) || agents[0];
      setSelectedAgent(firstAvailable);
    }
  }, [agents, selectedAgent]);

  useEffect(() => {
    if (selectedAgent) {
      const updated = agents.find((a) => a.id === selectedAgent.id);
      if (updated) setSelectedAgent(updated);
    }
  }, [agents, selectedAgent]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const saveMessageToDb = useCallback(async (sessionId: string, role: "user" | "assistant", content: string, choices?: string[]) => {
    if (!user) return;
    try {
      await supabase.from("chat_messages").insert({ session_id: sessionId, user_id: user.id, role, content, choices: choices || null });
    } catch (error) {
      console.error("Failed to save message:", error);
    }
  }, [user]);

  const updateSessionRallyCount = useCallback(async (sessionId: string, count: number) => {
    try {
      await supabase.from("chat_sessions").update({ rally_count: count }).eq("id", sessionId);
    } catch (error) {
      console.error("Failed to update rally count:", error);
    }
  }, []);

  const sendMessageToAI = useCallback(async (userMessage: string) => {
    if (!selectedAgent || !sessionIdRef.current) return;

    if (!billingStatus.isExempt && rallyCount >= MAX_RALLIES_PER_TICKET) {
      setShowTicketDialog(true);
      return;
    }

    setIsSending(true);
    const userMsg: Message = { id: Date.now().toString(), role: "user", content: userMessage };
    setMessages(prev => [...prev, userMsg]);
    await saveMessageToDb(sessionIdRef.current, "user", userMessage);

    try {
      const chatMessages = messages.map(m => ({ role: m.role, content: m.content }));
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
      await saveMessageToDb(sessionIdRef.current!, "assistant", data.content, data.choices);

      const newRallyCount = rallyCount + 1;
      setRallyCount(newRallyCount);
      await updateSessionRallyCount(sessionIdRef.current!, newRallyCount);

      if (!billingStatus.isExempt && newRallyCount === MAX_RALLIES_PER_TICKET - 2) {
        toast.warning("残り2回のやり取りでチケットが必要になります");
      }
      if (!billingStatus.isExempt && newRallyCount >= MAX_RALLIES_PER_TICKET) {
        setShowTicketDialog(true);
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      toast.error("メッセージの送信に失敗しました");
    } finally {
      setIsSending(false);
    }
  }, [messages, selectedAgent, profile, rallyCount, billingStatus.isExempt, saveMessageToDb, updateSessionRallyCount]);

  const handleUseTicketToContinue = useCallback(async () => {
    if (billingStatus.ticketBalance <= 0) {
      toast.error("チケットが不足しています");
      return;
    }
    setIsUsingTicket(true);
    try {
      await useTicket();
      setRallyCount(0);
      await refetchBilling();
      setShowTicketDialog(false);
      toast.success("チケットを使用しました。チャットを続けられます！");
    } catch (error) {
      console.error("Failed to use ticket:", error);
      toast.error("チケットの使用に失敗しました");
    } finally {
      setIsUsingTicket(false);
    }
  }, [billingStatus.ticketBalance, useTicket, refetchBilling]);

  const startChat = useCallback(async () => {
    if (!selectedAgent) return;

    // Note: ticket validation now happens in handleStartClick before animation starts

    isFreeReadingRef.current = isFirstFreeReading;
    setIsConnecting(true);

    try {
      currentAgentRef.current = selectedAgent;

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

        if (!billingStatus.isExempt && !isFirstFreeReading) {
          await useTicket();
        }
      }

      setIsConnected(true);
      setIsConnecting(false);
      setRallyCount(0);

      const profileInfo = profile?.display_name
        ? `${profile.display_name}さん、${selectedAgent.name}とのチャットを開始しました`
        : `${selectedAgent.name}とのチャットを開始しました`;
      toast.success(profileInfo);

      await sendMessageToAI("こんにちは、占いをお願いします。");
    } catch (error) {
      console.error("Failed to start chat:", error);
      setIsConnecting(false);
      toast.error("接続に失敗しました");
    }
  }, [selectedAgent, user, billingStatus, isFirstFreeReading, profile, sendMessageToAI, useTicket]);

  const endChat = useCallback(async () => {
    if (user && sessionIdRef.current) {
      await supabase.from("chat_sessions").update({ ended_at: new Date().toISOString(), rally_count: rallyCount }).eq("id", sessionIdRef.current);
      sessionIdRef.current = null;
      currentAgentRef.current = null;
      isFreeReadingRef.current = false;
      refetchBilling();
    }
    setIsConnected(false);
    setMessages([]);
    setRallyCount(0);
    setShowTicketDialog(false);
    toast.info("チャットを終了しました");
  }, [user, rallyCount, refetchBilling]);

  const handleEnterAnimationComplete = useCallback(() => {
    // Animation completed - startChat was already called during animation
    // Just hide the overlay now
    setShowEnterAnimation(false);
  }, []);

  const handleStartClick = useCallback(async () => {
    if (!user) {
      setShowLoginDialog(true);
      return;
    }
    
    // Validate ticket availability before starting
    if (!billingStatus.isExempt && !isFirstFreeReading && billingStatus.ticketBalance <= 0) {
      toast.error("チケットが不足しています", { description: "チケットを購入してください" });
      return;
    }
    
    // Show enter animation and start chat immediately
    setShowEnterAnimation(true);
    
    // Start the chat session during the animation
    await startChat();
  }, [user, billingStatus, isFirstFreeReading, startChat]);

  if (agentsLoading || !selectedAgent) {
    return (
      <div className="flex flex-col items-center gap-6 w-full">
        <div className="w-24 h-24 rounded-full bg-muted/30 animate-pulse" />
        <div className="h-4 w-32 bg-muted/30 rounded animate-pulse" />
      </div>
    );
  }

  const lastMessage = messages[messages.length - 1];
  const currentChoices = lastMessage?.role === "assistant" ? lastMessage.choices : undefined;
  const isRallyLimitReached = !billingStatus.isExempt && rallyCount >= MAX_RALLIES_PER_TICKET;

  return (
    <>
      {selectedAgent && (
        <EnterRoomTransition
          agent={selectedAgent}
          isVisible={showEnterAnimation}
          onComplete={handleEnterAnimationComplete}
          displayName={profile?.display_name}
        />
      )}
      <div className="flex flex-col items-center gap-4 w-full max-w-xl mx-auto">
      <TicketRequiredDialog
        open={showTicketDialog}
        onOpenChange={setShowTicketDialog}
        ticketBalance={billingStatus.ticketBalance}
        onUseTicket={handleUseTicketToContinue}
        onPurchase={() => {
          setShowTicketDialog(false);
          navigate("/tickets");
        }}
        onCancel={() => setShowTicketDialog(false)}
        isUsingTicket={isUsingTicket}
        title="チケットが必要です"
        description={`${MAX_RALLIES_PER_TICKET}回のやり取りが終了しました。続けるにはチケットが必要です。`}
        showEndOption
        onEnd={endChat}
      />

      <LoginRequiredDialog
        open={showLoginDialog}
        onOpenChange={setShowLoginDialog}
        onLogin={() => navigate("/auth")}
        onCancel={() => setShowLoginDialog(false)}
      />

        {!isConnected && !isConnecting && (
          <AgentSelector
            agents={agents}
            selectedAgent={selectedAgent}
            onSelect={setSelectedAgent}
            disabled={isConnecting}
          />
        )}

        {(isConnected || isConnecting) && (currentAgentRef.current || selectedAgent) && (
          <FortuneSessionView
            agent={(currentAgentRef.current || selectedAgent)!}
            displayName={profile?.display_name}
            isConnecting={isConnecting || (isSending && messages.length === 0)}
            rallyCount={rallyCount}
            maxRallies={MAX_RALLIES_PER_TICKET}
            showRallyCounter={!billingStatus.isExempt && isConnected}
          >
            <div className="w-full glass-surface rounded-xl overflow-hidden">
              <ChatMessages messages={messages} isSending={isSending} ref={scrollRef} />
              {!isRallyLimitReached && messages.length > 0 && !isSending && (
                <ChatInput
                  choices={currentChoices}
                  onChoiceSelect={sendMessageToAI}
                  onCustomInput={sendMessageToAI}
                  isSending={isSending}
                />
              )}
            </div>
          </FortuneSessionView>
        )}

        <TextChatButton
          isConnected={isConnected}
          isConnecting={isConnecting}
          onClick={isConnected ? endChat : handleStartClick}
        />

        {!isConnected && !user && <ProfileHint />}
      </div>
    </>
  );
};

export default TextChat;
