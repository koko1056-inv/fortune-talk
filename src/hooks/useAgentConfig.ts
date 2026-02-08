import { useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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

interface DbAgentConfig {
  id: string;
  agent_id: string;
  name: string;
  description: string;
  emoji: string;
  image_url: string | null;
  gradient: string;
  accent_color: string;
  sort_order: number;
}

const DEFAULT_AGENTS: AgentConfig[] = [
  {
    id: "tarot",
    agentId: "agent_3101kc38wn6qftar7macxcm8rg7g",
    name: "タロット占い",
    description: "78枚のカードが導く運命の物語",
    emoji: "🃏",
    gradient: "from-violet-600 via-purple-600 to-indigo-700",
    accentColor: "280 70% 50%",
  },
  {
    id: "astro",
    agentId: "",
    name: "西洋占星術",
    description: "星座と惑星が語る宇宙の知恵",
    emoji: "⭐",
    gradient: "from-amber-500 via-yellow-500 to-orange-500",
    accentColor: "45 80% 55%",
  },
  {
    id: "eastern",
    agentId: "",
    name: "四柱推命",
    description: "生年月日から読み解く東洋の叡智",
    emoji: "🌙",
    gradient: "from-rose-600 via-red-600 to-pink-600",
    accentColor: "350 70% 50%",
  },
  {
    id: "numerology",
    agentId: "",
    name: "数秘術",
    description: "数字に隠された人生のメッセージ",
    emoji: "🔢",
    gradient: "from-cyan-500 via-teal-500 to-emerald-500",
    accentColor: "175 70% 45%",
  },
];

const mapDbToConfig = (db: DbAgentConfig): AgentConfig => ({
  id: db.id,
  agentId: db.agent_id,
  name: db.name,
  description: db.description,
  emoji: db.emoji,
  imageUrl: db.image_url ?? undefined,
  gradient: db.gradient,
  accentColor: db.accent_color,
});

const fetchAgentsFromDb = async (): Promise<AgentConfig[]> => {
  const { data, error } = await supabase
    .from("agent_configs")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("Failed to fetch agent configs:", error);
    return DEFAULT_AGENTS;
  }

  if (data && data.length > 0) {
    const mapped = data.map(mapDbToConfig);
    // Debug: Log the agent configs loaded from DB
    console.log("[useAgentConfig] Loaded agents from DB:", mapped.map(a => ({
      id: a.id,
      name: a.name,
      agentId: a.agentId,
    })));
    return mapped;
  }

  return DEFAULT_AGENTS;
};

export const useAgentConfig = () => {
  const queryClient = useQueryClient();

  const { data: agents = [], isLoading: loading } = useQuery({
    queryKey: ["agent-configs"],
    queryFn: fetchAgentsFromDb,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<AgentConfig> }) => {
      const dbUpdates: Partial<DbAgentConfig> = {};
      if (updates.agentId !== undefined) dbUpdates.agent_id = updates.agentId;
      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.description !== undefined) dbUpdates.description = updates.description;
      if (updates.emoji !== undefined) dbUpdates.emoji = updates.emoji;
      if (updates.imageUrl !== undefined) dbUpdates.image_url = updates.imageUrl ?? null;
      if (updates.gradient !== undefined) dbUpdates.gradient = updates.gradient;
      if (updates.accentColor !== undefined) dbUpdates.accent_color = updates.accentColor;

      const { error } = await supabase
        .from("agent_configs")
        .update(dbUpdates)
        .eq("id", id);

      if (error) throw error;
      return { id, updates };
    },
    onMutate: async ({ id, updates }) => {
      await queryClient.cancelQueries({ queryKey: ["agent-configs"] });
      const previousAgents = queryClient.getQueryData<AgentConfig[]>(["agent-configs"]);
      
      queryClient.setQueryData<AgentConfig[]>(["agent-configs"], (old) =>
        old?.map((agent) => (agent.id === id ? { ...agent, ...updates } : agent)) ?? []
      );
      
      return { previousAgents };
    },
    onError: (err, variables, context) => {
      if (context?.previousAgents) {
        queryClient.setQueryData(["agent-configs"], context.previousAgents);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["agent-configs"] });
    },
  });

  const updateAgent = useCallback(
    async (id: string, updates: Partial<AgentConfig>) => {
      await updateMutation.mutateAsync({ id, updates });
    },
    [updateMutation]
  );

  const resetToDefaults = useCallback(async () => {
    for (const agent of DEFAULT_AGENTS) {
      await supabase
        .from("agent_configs")
        .update({
          agent_id: agent.agentId,
          name: agent.name,
          description: agent.description,
          emoji: agent.emoji,
          image_url: null,
          gradient: agent.gradient,
          accent_color: agent.accentColor,
        })
        .eq("id", agent.id);
    }
    
    queryClient.setQueryData(["agent-configs"], DEFAULT_AGENTS);
  }, [queryClient]);

  return { agents, updateAgent, resetToDefaults, loading };
};
