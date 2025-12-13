import { useState, useEffect, useCallback } from "react";

export interface AgentConfig {
  id: string;
  agentId: string;
  name: string;
  description: string;
  emoji: string;
  imageUrl?: string; // Optional custom image URL (base64 or URL)
  gradient: string;
  accentColor: string;
}

const DEFAULT_AGENTS: AgentConfig[] = [
  {
    id: "steve",
    agentId: "agent_3101kc38wn6qftar7macxcm8rg7g",
    name: "スティーブ",
    description: "ビジョナリーな起業家",
    emoji: "🍎",
    gradient: "from-zinc-800 via-zinc-700 to-zinc-900",
    accentColor: "211 100% 50%",
  },
  {
    id: "sophia",
    agentId: "",
    name: "ソフィア",
    description: "クリエイティブディレクター",
    emoji: "🎨",
    gradient: "from-rose-500 via-pink-500 to-fuchsia-500",
    accentColor: "340 80% 55%",
  },
  {
    id: "alex",
    agentId: "",
    name: "アレックス",
    description: "テクニカルアドバイザー",
    emoji: "💻",
    gradient: "from-blue-500 via-indigo-500 to-violet-500",
    accentColor: "230 80% 55%",
  },
  {
    id: "maya",
    agentId: "",
    name: "マヤ",
    description: "ウェルネスコーチ",
    emoji: "🧘",
    gradient: "from-emerald-400 via-teal-500 to-cyan-500",
    accentColor: "165 70% 45%",
  },
];

const STORAGE_KEY = "voice-ai-agents";

export const useAgentConfig = () => {
  const [agents, setAgents] = useState<AgentConfig[]>(() => {
    if (typeof window === "undefined") return DEFAULT_AGENTS;
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return DEFAULT_AGENTS;
      }
    }
    return DEFAULT_AGENTS;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(agents));
  }, [agents]);

  const updateAgent = useCallback((id: string, updates: Partial<AgentConfig>) => {
    setAgents((prev) =>
      prev.map((agent) =>
        agent.id === id ? { ...agent, ...updates } : agent
      )
    );
  }, []);

  const resetToDefaults = useCallback(() => {
    setAgents(DEFAULT_AGENTS);
  }, []);

  return { agents, updateAgent, resetToDefaults };
};
