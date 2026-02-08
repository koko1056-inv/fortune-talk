import { useConversation } from "@elevenlabs/react";
import { useState, useCallback, useEffect, useRef } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import VoiceButton from "./VoiceButton";
import AudioVisualizer from "./AudioVisualizer";
import StatusIndicator from "./StatusIndicator";
import AgentSelector, { Agent } from "./AgentSelector";
import FortuneSessionView from "./FortuneSessionView";
import TicketRequiredDialog from "./TicketRequiredDialog";
import LoginRequiredDialog from "./LoginRequiredDialog";
import TicketBalanceDisplay from "./TicketBalanceDisplay";
import ProfileHint from "./ProfileHint";
import EnterRoomTransition from "./EnterRoomTransition";
import { useAgentConfig } from "@/hooks/useAgentConfig";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/hooks/useAuth";
import { useFortuneHistory } from "@/hooks/useFortuneHistory";
import { useBillingStatus } from "@/hooks/useBillingStatus";
import { supabase } from "@/integrations/supabase/client";

const MAX_SECONDS_PER_TICKET = 180; // 3 minutes per ticket

interface VoiceChatProps {
  onSessionChange?: (isInSession: boolean) => void;
}

const VoiceChat = ({ onSessionChange }: VoiceChatProps) => {
  const navigate = useNavigate();
  const { agents, loading: agentsLoading } = useAgentConfig();
  const { user } = useAuth();
  const { profile } = useProfile();
  const { saveReading } = useFortuneHistory();
  const { billingStatus, isFirstFreeReading, useTicket, refetch: refetchBilling } = useBillingStatus();
  const [isConnecting, setIsConnecting] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [showTicketDialog, setShowTicketDialog] = useState(false);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isUsingTicket, setIsUsingTicket] = useState(false);
  const [showEnterAnimation, setShowEnterAnimation] = useState(false);
  const [isInSession, setIsInSession] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const sessionStartRef = useRef<Date | null>(null);
  const currentAgentRef = useRef<Agent | null>(null);
  const isFreeReadingRef = useRef(false);
  const reconnectAttemptRef = useRef(0);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const userRequestedEndRef = useRef(false);
  const hasEverConnectedRef = useRef(false);
  const maxReconnectAttempts = 3;

  // Notify parent of session state changes
  useEffect(() => {
    const inRoomMode = isInSession || showEnterAnimation || isConnecting;
    console.log("[VoiceChat] Session state:", { isInSession, showEnterAnimation, isConnecting, inRoomMode });
    onSessionChange?.(inRoomMode);
  }, [isInSession, showEnterAnimation, isConnecting, onSessionChange]);

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

  // Build dynamic prompt with user profile
  const buildDynamicPrompt = useCallback(() => {
    if (!profile) return null;

    const parts: string[] = [];
    if (profile.display_name) parts.push(`相談者の名前: ${profile.display_name}`);
    if (profile.birth_date) {
      const birthDate = new Date(profile.birth_date);
      parts.push(`生年月日: ${birthDate.getFullYear()}年${birthDate.getMonth() + 1}月${birthDate.getDate()}日`);
    }
    if (profile.zodiac_sign) parts.push(`星座: ${profile.zodiac_sign}`);
    if (profile.blood_type) parts.push(`血液型: ${profile.blood_type}型`);

    if (parts.length === 0) return null;
    return `【相談者のプロフィール情報】\n${parts.join('\n')}\n\nこの情報を参考にして、パーソナライズされた占いを提供してください。`;
  }, [profile]);

  // Start timer when connected
  const startTimer = useCallback(() => {
    setElapsedSeconds(0);
    timerIntervalRef.current = setInterval(() => {
      setElapsedSeconds(prev => {
        const newValue = prev + 1;
        if (!billingStatus.isExempt && newValue === MAX_SECONDS_PER_TICKET - 30) {
          toast.warning("残り30秒です");
        }
        return newValue;
      });
    }, 1000);
  }, [billingStatus.isExempt]);

  const stopTimer = useCallback(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  }, []);

  const [isConnected, setIsConnectedState] = useState(false);

  // Check if time limit reached
  useEffect(() => {
    if (!billingStatus.isExempt && elapsedSeconds >= MAX_SECONDS_PER_TICKET && isConnected) {
      setShowTicketDialog(true);
      stopTimer();
    }
  }, [elapsedSeconds, billingStatus.isExempt, isConnected, stopTimer]);

  const conversation = useConversation({
    onConnect: () => {
      console.log("[VoiceChat] Connected to agent");
      reconnectAttemptRef.current = 0;
      hasEverConnectedRef.current = true;
      sessionStartRef.current = new Date();
      currentAgentRef.current = selectedAgent;
      setIsConnectedState(true);
      setConnectionError(null);
      startTimer();

      // Connection successful - no toast notification needed as the UI already shows the connected state
    },
    onDisconnect: () => {
      console.log("[VoiceChat] Disconnected from agent, userRequestedEnd:", userRequestedEndRef.current);
      setIsConnectedState(false);
      stopTimer();
      setElapsedSeconds(0);
      
      // Save reading data if there was a session
      if (user && sessionStartRef.current && currentAgentRef.current) {
        saveReading(
          currentAgentRef.current.name,
          currentAgentRef.current.emoji,
          sessionStartRef.current,
          new Date(),
          isFreeReadingRef.current
        );
        sessionStartRef.current = null;
        currentAgentRef.current = null;
        isFreeReadingRef.current = false;
        refetchBilling();
      }
      
      // Only exit session if user explicitly requested it
      if (userRequestedEndRef.current) {
        setIsInSession(false);
        userRequestedEndRef.current = false;
        hasEverConnectedRef.current = false;
        // Session ended - no toast notification needed as user returns to home screen
      } else if (hasEverConnectedRef.current) {
        // Unexpected disconnect after successful connection
        setConnectionError("接続が切断されました。再接続するにはマイクボタンをタップしてください。");
        toast.error("接続が切断されました");
      }
    },
    onError: (error) => {
      console.error("[VoiceChat] Error:", error);
      setConnectionError(`接続エラー: ${error}`);
      
      if (reconnectAttemptRef.current < maxReconnectAttempts && selectedAgent) {
        reconnectAttemptRef.current += 1;
        toast.warning(`接続が不安定です (再試行 ${reconnectAttemptRef.current}/${maxReconnectAttempts})`, {
          description: "自動的に再接続を試みています...",
        });
        setTimeout(() => startConversationInternal(), 1000 * reconnectAttemptRef.current);
      } else {
        reconnectAttemptRef.current = 0;
        toast.error("接続エラーが発生しました", { 
          description: "マイクボタンをタップして再試行できます" 
        });
      }
    },
    onMessage: (message) => {
      console.log("[VoiceChat] Message from agent:", message);
    },
  });

  const startConversationInternal = useCallback(async () => {
    if (!selectedAgent) return;
    setIsConnecting(true);
    setConnectionError(null);
    
    try {
      await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true, sampleRate: 16000, channelCount: 1 },
      });

      // Debug: Log full selected agent details
      console.log("[VoiceChat] Selected agent details:", {
        id: selectedAgent.id,
        name: selectedAgent.name,
        agentId: selectedAgent.agentId,
        emoji: selectedAgent.emoji,
      });

      // Get signed URL from edge function for secure connection
      console.log("[VoiceChat] Getting signed URL for agent:", selectedAgent.agentId);
      const { data: tokenData, error: tokenError } = await supabase.functions.invoke(
        "elevenlabs-conversation-token",
        { body: { agentId: selectedAgent.agentId } }
      );

      if (tokenError || !tokenData?.signed_url) {
        console.error("[VoiceChat] Token error:", tokenError, tokenData);
        throw new Error(tokenData?.error || tokenError?.message || "トークンの取得に失敗しました");
      }

      console.log("[VoiceChat] Got signed URL, starting session...");

      const dynamicPrompt = buildDynamicPrompt();
      const sessionOptions: any = {
        signedUrl: tokenData.signed_url,
        microphone: { echoCancellation: true, noiseSuppression: true, autoGainControl: true, channelCount: 1 },
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
    } catch (error) {
      console.error("[VoiceChat] Failed to start conversation:", error);
      if (error instanceof Error && error.name === "NotAllowedError") {
        setConnectionError("マイクへのアクセスが拒否されました。ブラウザの設定を確認してください。");
        toast.error("マイクへのアクセスが必要です", { description: "ブラウザの設定を確認してください" });
      } else {
        const message = error instanceof Error ? error.message : "接続に失敗しました";
        setConnectionError(message);
        toast.error("接続に失敗しました", { description: message });
      }
    } finally {
      setIsConnecting(false);
    }
  }, [conversation, selectedAgent, buildDynamicPrompt, profile]);

  const startConversation = useCallback(async () => {
    if (billingStatus.isExempt) {
      isFreeReadingRef.current = false;
      await startConversationInternal();
      return;
    }

    if (isFirstFreeReading) {
      isFreeReadingRef.current = true;
      await startConversationInternal();
      return;
    }

    if (billingStatus.ticketBalance > 0) {
      try {
        const success = await useTicket();
        if (success) {
          isFreeReadingRef.current = false;
          toast.success("チケットを1枚使用しました", { description: `残り${billingStatus.ticketBalance - 1}枚` });
          await startConversationInternal();
        } else {
          toast.error("チケットの使用に失敗しました");
        }
      } catch (error) {
        console.error("Failed to use ticket:", error);
        toast.error("チケットの使用に失敗しました");
      }
      return;
    }

    setShowTicketDialog(true);
  }, [billingStatus, isFirstFreeReading, useTicket, startConversationInternal]);

  const stopConversation = useCallback(async () => {
    await conversation.endSession();
  }, [conversation]);

  const handleEnterAnimationComplete = useCallback(() => {
    // Animation completed - keep isInSession true, just hide the animation overlay
    setShowEnterAnimation(false);
    // isInSession remains true until the conversation ends
  }, []);

  const handleButtonClick = async () => {
    if (conversation.status === "connected") {
      // User explicitly ending the session
      userRequestedEndRef.current = true;
      await stopConversation();
    } else if (isInSession) {
      // Already in session but not connected - try to reconnect
      await startConversation();
    } else {
      if (!user) {
        setShowLoginDialog(true);
        return;
      }
      // Enter session mode and show animation
      setIsInSession(true);
      setShowEnterAnimation(true);
      // Start conversation during the animation
      await startConversation();
    }
  };

  // Handler for explicitly leaving the room (back button, etc.)
  const handleLeaveRoom = useCallback(() => {
    userRequestedEndRef.current = true;
    if (conversation.status === "connected") {
      stopConversation();
    } else {
      setIsInSession(false);
      userRequestedEndRef.current = false;
      hasEverConnectedRef.current = false;
    }
  }, [conversation.status, stopConversation]);

  const isConversationConnected = conversation.status === "connected";

  if (agentsLoading || !selectedAgent) {
    return (
      <div className="flex flex-col items-center gap-6 md:gap-10 w-full">
        <div className="w-full flex flex-col items-center">
          <div className="relative w-full h-48 md:h-64 flex items-center justify-center">
            <div className="w-24 h-24 md:w-32 lg:w-40 md:h-32 lg:h-40 rounded-full bg-muted/30 animate-pulse" />
          </div>
          <div className="flex items-center gap-1.5 md:gap-2 mt-2 md:mt-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-muted/30" />
            ))}
          </div>
        </div>
        <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-muted/30 animate-pulse" />
        <div className="h-4 w-24 bg-muted/30 rounded animate-pulse" />
      </div>
    );
  }

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
      <div className="flex flex-col items-center gap-6 md:gap-10 w-full">
      {!isConversationConnected && !isInSession && (
        <AgentSelector
          agents={agents}
          selectedAgent={selectedAgent}
          onSelect={setSelectedAgent}
          disabled={isConnecting}
        />
      )}

        {(isConversationConnected || isInSession) && (currentAgentRef.current || selectedAgent) && (
          <FortuneSessionView
            agent={(currentAgentRef.current || selectedAgent)!}
            displayName={profile?.display_name}
            isConnecting={isConnecting}
            elapsedSeconds={!billingStatus.isExempt && isConversationConnected ? elapsedSeconds : undefined}
            maxSeconds={!billingStatus.isExempt && isConversationConnected ? MAX_SECONDS_PER_TICKET : undefined}
            onLeave={handleLeaveRoom}
            isSpeaking={conversation.isSpeaking}
            ticketBalance={billingStatus.ticketBalance}
            isExempt={billingStatus.isExempt}
            onMicClick={handleButtonClick}
            isConnected={isConversationConnected}
            statusText={isConnecting ? "CONNECTING..." : conversation.isSpeaking ? "SPEAKING..." : isConversationConnected ? "LISTENING..." : connectionError ? "ERROR" : "TAP TO START"}
            connectionError={connectionError}
          />
        )}

      {/* Only show VoiceButton when not in session */}
      {!isInSession && (
        <VoiceButton
          isConnected={isConversationConnected}
          isConnecting={isConnecting}
          isSpeaking={conversation.isSpeaking}
          onClick={handleButtonClick}
        />
      )}

      {!isConversationConnected && !user && <ProfileHint />}

      {user && !billingStatus.isExempt && !isConversationConnected && (
        <TicketBalanceDisplay
          isFirstFreeReading={isFirstFreeReading}
          ticketBalance={billingStatus.ticketBalance}
        />
      )}

      <LoginRequiredDialog
        open={showLoginDialog}
        onOpenChange={setShowLoginDialog}
        onLogin={() => navigate("/auth")}
        onCancel={() => setShowLoginDialog(false)}
      />

      <TicketRequiredDialog
        open={showTicketDialog}
        onOpenChange={setShowTicketDialog}
        ticketBalance={billingStatus.ticketBalance}
        onUseTicket={async () => {
          setIsUsingTicket(true);
          try {
            const success = await useTicket();
            if (success) {
              setElapsedSeconds(0);
              startTimer();
              setShowTicketDialog(false);
              toast.success("チケットを使用しました。続けて占いをお楽しみください！");
            }
          } catch (error) {
            console.error("Failed to use ticket:", error);
            toast.error("チケットの使用に失敗しました");
          } finally {
            setIsUsingTicket(false);
          }
        }}
        onPurchase={() => {
          setShowTicketDialog(false);
          navigate('/tickets');
        }}
        onCancel={() => setShowTicketDialog(false)}
        isUsingTicket={isUsingTicket}
        title="時間切れです"
        description={`${MAX_SECONDS_PER_TICKET / 60}分経過しました。続けるにはチケットが必要です。`}
        showEndOption
        onEnd={stopConversation}
      />
      </div>
    </>
  );
};

export default VoiceChat;
