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

const VoiceChat = () => {
  const { agents } = useAgentConfig();
  const { user } = useAuth();
  const { profile } = useProfile();
  const { saveReading } = useFortuneHistory();
  const [isConnecting, setIsConnecting] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<Agent>(agents[0]);
  const sessionStartRef = useRef<Date | null>(null);
  const currentAgentRef = useRef<Agent | null>(null);

  // Update selected agent when agents change (e.g., after settings update)
  useEffect(() => {
    const updated = agents.find((a) => a.id === selectedAgent.id);
    if (updated) {
      setSelectedAgent(updated);
    }
  }, [agents, selectedAgent.id]);

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
    onConnect: () => {
      console.log("Connected to agent");
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
          endTime
        );
        sessionStartRef.current = null;
        currentAgentRef.current = null;
      }
      
      toast.info("鑑定を終了しました");
    },
    onError: (error) => {
      console.error("Error:", error);
      toast.error("エラーが発生しました", {
        description: "もう一度お試しください",
      });
    },
  });

  const startConversation = useCallback(async () => {
    setIsConnecting(true);
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const dynamicPrompt = buildDynamicPrompt();
      
      // Build session options
      const sessionOptions: any = {
        agentId: selectedAgent.agentId,
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