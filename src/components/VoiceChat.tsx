import { useConversation } from "@elevenlabs/react";
import { useState, useCallback, useEffect, useRef } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import VoiceButton from "./VoiceButton";
import AudioVisualizer from "./AudioVisualizer";
import StatusIndicator from "./StatusIndicator";
import AgentSelector, { Agent } from "./AgentSelector";
import { useAgentConfig } from "@/hooks/useAgentConfig";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/hooks/useAuth";
import { useFortuneHistory } from "@/hooks/useFortuneHistory";
import { useBillingStatus } from "@/hooks/useBillingStatus";

const VoiceChat = () => {
  const { agents, loading: agentsLoading } = useAgentConfig();
  const { user } = useAuth();
  const { profile } = useProfile();
  const { saveReading } = useFortuneHistory();
  const { billingStatus, isFirstFreeReading, refetch: refetchBilling } = useBillingStatus();
  const [isConnecting, setIsConnecting] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const sessionStartRef = useRef<Date | null>(null);
  const currentAgentRef = useRef<Agent | null>(null);
  const isFreeReadingRef = useRef(false);

  // Set initial selected agent when agents are loaded
  useEffect(() => {
    if (agents.length > 0 && !selectedAgent) {
      // Find first agent with an agentId, or fall back to first agent
      const firstAvailable = agents.find(a => a.agentId.trim().length > 0) || agents[0];
      setSelectedAgent(firstAvailable);
    }
  }, [agents, selectedAgent]);

  // Update selected agent when agents change (e.g., after settings update)
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

  // Reconnection state
  const reconnectAttemptRef = useRef(0);
  const maxReconnectAttempts = 3;

  const conversation = useConversation({
    onConnect: () => {
      console.log("Connected to agent");
      // Reset reconnect attempts on successful connection
      reconnectAttemptRef.current = 0;
      // Record session start time
      sessionStartRef.current = new Date();
      currentAgentRef.current = selectedAgent;
      
      const profileInfo = profile?.display_name 
        ? `${profile.display_name}さん、${selectedAgent.name}と接続しました`
        : `${selectedAgent.name}と接続しました`;
      toast.success(profileInfo, {
        description: "話しかけてください",
      });
    },
    onDisconnect: () => {
      console.log("Disconnected from agent");
      
      // Save reading history if user is logged in
      if (user && sessionStartRef.current && currentAgentRef.current) {
        const endTime = new Date();
        saveReading(
          currentAgentRef.current.name,
          currentAgentRef.current.emoji,
          sessionStartRef.current,
          endTime,
          isFreeReadingRef.current
        );
        sessionStartRef.current = null;
        currentAgentRef.current = null;
        isFreeReadingRef.current = false;
        // Refresh billing status after session ends
        refetchBilling();
      }
      
      toast.info("鑑定を終了しました");
    },
    onError: (error) => {
      console.error("Error:", error);
      
      // Attempt reconnection for network errors
      if (reconnectAttemptRef.current < maxReconnectAttempts && selectedAgent) {
        reconnectAttemptRef.current += 1;
        toast.warning(`接続が不安定です (再試行 ${reconnectAttemptRef.current}/${maxReconnectAttempts})`, {
          description: "自動的に再接続を試みています...",
        });
        
        // Delay before reconnect attempt
        setTimeout(() => {
          startConversation();
        }, 1000 * reconnectAttemptRef.current);
      } else {
        reconnectAttemptRef.current = 0;
        toast.error("エラーが発生しました", {
          description: "もう一度お試しください",
        });
      }
    },
  });

  const startConversation = useCallback(async () => {
    // Check billing status before starting
    if (user && !billingStatus.canStartReading) {
      toast.error("月間利用上限に達しました", {
        description: "来月まで新しい鑑定を開始できません",
      });
      return;
    }

    // Track if this is a free reading
    isFreeReadingRef.current = isFirstFreeReading;

    setIsConnecting(true);
    try {
      // Request microphone with optimized settings for stability
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 16000,
          channelCount: 1,
        } 
      });

      // Keep track of stream for cleanup
      const tracks = stream.getTracks();
      console.log("Microphone tracks:", tracks.map(t => ({ 
        kind: t.kind, 
        enabled: t.enabled, 
        readyState: t.readyState 
      })));
      
      const dynamicPrompt = buildDynamicPrompt();
      
      // Build session options with microphone config for stability
      const sessionOptions: any = {
        agentId: selectedAgent.agentId,
        connectionType: "webrtc",
        microphone: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          channelCount: 1,
        },
      };

      // Add dynamic variables if user has profile
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
      
      console.log("Session started with agent:", selectedAgent.name);
      if (dynamicPrompt) {
        console.log("User profile context:", dynamicPrompt);
      }
    } catch (error) {
      console.error("Failed to start conversation:", error);
      if (error instanceof Error && error.name === "NotAllowedError") {
        toast.error("マイクへのアクセスが必要です", {
          description: "ブラウザの設定を確認してください",
        });
      } else {
        toast.error("接続に失敗しました", {
          description: "もう一度お試しください",
        });
      }
    } finally {
      setIsConnecting(false);
    }
  }, [conversation, selectedAgent, buildDynamicPrompt, profile]);

  const stopConversation = useCallback(async () => {
    await conversation.endSession();
  }, [conversation]);

  const handleButtonClick = () => {
    if (conversation.status === "connected") {
      stopConversation();
    } else {
      startConversation();
    }
  };

  const isConnected = conversation.status === "connected";

  // Show loading skeleton while agents are being fetched
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
    <div className="flex flex-col items-center gap-6 md:gap-10 w-full">
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
              "w-20 h-20 md:w-24 md:h-24 rounded-full mx-auto mb-3 md:mb-4 flex items-center justify-center overflow-hidden",
              "bg-gradient-to-br shadow-crystal animate-float-slow",
              !currentAgentRef.current.imageUrl && "text-4xl md:text-5xl",
              currentAgentRef.current.gradient
            )}
            style={{
              boxShadow: '0 0 40px hsl(280 70% 50% / 0.4), inset 0 0 30px hsl(200 60% 80% / 0.15)'
            }}
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
          <h2 className="text-xl md:text-2xl font-display font-bold text-gradient tracking-wide">
            {currentAgentRef.current.name}
          </h2>
          <p className="text-xs md:text-sm text-muted-foreground mt-1 md:mt-2 tracking-wide">
            {currentAgentRef.current.description}
          </p>
          {/* Show user info during session */}
          {profile?.display_name && (
            <p className="text-[10px] md:text-xs text-accent/70 mt-2 md:mt-3">
              ✧ {profile.display_name}さんの鑑定中 ✧
            </p>
          )}
        </div>
      )}

      {/* Profile hint when not logged in */}
      {!isConnected && !user && (
        <p className="text-[10px] md:text-xs text-muted-foreground/60 text-center px-4">
          💡 ログインしてプロフィールを登録すると、
          <br className="md:hidden" />
          パーソナライズされた占いを受けられます
        </p>
      )}

      {/* Audio Visualizer */}
      <AudioVisualizer 
        isActive={isConnected} 
        isSpeaking={conversation.isSpeaking} 
      />

      {/* Voice Button */}
      <VoiceButton
        isConnected={isConnected}
        isConnecting={isConnecting}
        isSpeaking={conversation.isSpeaking}
        onClick={handleButtonClick}
      />

      {/* Status */}
      <StatusIndicator
        status={isConnecting ? "connecting" : conversation.status}
        isSpeaking={conversation.isSpeaking}
      />
    </div>
  );
};

export default VoiceChat;