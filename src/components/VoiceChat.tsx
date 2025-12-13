import { useConversation } from "@elevenlabs/react";
import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import VoiceButton from "./VoiceButton";
import AudioVisualizer from "./AudioVisualizer";
import StatusIndicator from "./StatusIndicator";
import AgentSelector, { Agent } from "./AgentSelector";
import { useAgentConfig } from "@/hooks/useAgentConfig";

const VoiceChat = () => {
  const { agents } = useAgentConfig();
  const [isConnecting, setIsConnecting] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<Agent>(agents[0]);

  // Update selected agent when agents change (e.g., after settings update)
  useEffect(() => {
    const updated = agents.find((a) => a.id === selectedAgent.id);
    if (updated) {
      setSelectedAgent(updated);
    }
  }, [agents, selectedAgent.id]);

  const conversation = useConversation({
    onConnect: () => {
      console.log("Connected to agent");
      toast.success(`${selectedAgent.name}と接続しました`, {
        description: "話しかけてください",
      });
    },
    onDisconnect: () => {
      console.log("Disconnected from agent");
      toast.info("切断しました");
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
      
      await (conversation.startSession as any)({
        agentId: selectedAgent.agentId,
      });
      
      console.log("Session started with agent:", selectedAgent.name);
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
  }, [conversation, selectedAgent]);

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
    <div className="flex flex-col items-center gap-10 w-full">
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
      {isConnected && (
        <div className="text-center animate-fade-in">
          <div 
            className={cn(
              "w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center text-5xl",
              "bg-gradient-to-br shadow-crystal animate-float-slow",
              selectedAgent.gradient
            )}
            style={{
              boxShadow: '0 0 40px hsl(280 70% 50% / 0.4), inset 0 0 30px hsl(200 60% 80% / 0.15)'
            }}
          >
            <span className="drop-shadow-lg">{selectedAgent.emoji}</span>
          </div>
          <h2 className="text-2xl font-display font-bold text-gradient tracking-wide">
            {selectedAgent.name}
          </h2>
          <p className="text-sm text-muted-foreground mt-2 tracking-wide">
            {selectedAgent.description}
          </p>
        </div>
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
