import { useState, useEffect, useCallback } from "react";

export interface AgentConfig {
  id: string;
  agentId: string;
  name: string;
  description: string;
  emoji: string;
  imageUrl?: string;
  gradient: string;
  accentColor: string;
}

const DEFAULT_AGENTS: AgentConfig[] = [
  {
    id: "tarot",
    agentId: "agent_3101kc38wn6qftar7macxcm8rg7g",
    name: "神秘のタロット",
    description: "カードが導く運命の物語",
    emoji: "🔮",
    gradient: "from-violet-600 via-purple-600 to-indigo-700",
    accentColor: "280 70% 50%",
  },
  {
    id: "astro",
    agentId: "",
    name: "星読みの賢者",
    description: "天体が語る宇宙の知恵",
    emoji: "⭐",
    gradient: "from-amber-500 via-yellow-500 to-orange-500",
    accentColor: "45 80% 55%",
  },
  {
    id: "eastern",
    agentId: "",
    name: "東洋の占術師",
    description: "四柱推命・易の深淵なる教え",
    emoji: "🌙",
    gradient: "from-rose-600 via-red-600 to-pink-600",
    accentColor: "350 70% 50%",
  },
  {
    id: "oracle",
    agentId: "",
    name: "神託の巫女",
    description: "神々の声を聴く者",
    emoji: "✨",
    gradient: "from-cyan-500 via-teal-500 to-emerald-500",
    accentColor: "175 70% 45%",
  },
];

const STORAGE_KEY = "fortune-ai-agents";

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