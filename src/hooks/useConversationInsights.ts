import { useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface ConversationInsight {
  id: string;
  user_id: string;
  session_id: string | null;
  summary: string;
  keywords: string[];
  topics: string[];
  key_concerns: string[];
  advice_given: string[];
  agent_name: string;
  session_date: string;
  created_at: string;
}

const fetchInsights = async (userId: string): Promise<ConversationInsight[]> => {
  const { data, error } = await supabase
    .from('conversation_insights')
    .select('*')
    .eq('user_id', userId)
    .order('session_date', { ascending: false });

  if (error) {
    console.error('Error fetching insights:', error);
    return [];
  }

  return (data || []) as ConversationInsight[];
};

export const useConversationInsights = () => {
  const { user } = useAuth();

  const { data: insights = [], isLoading: loading } = useQuery({
    queryKey: ['conversation-insights', user?.id],
    queryFn: () => fetchInsights(user!.id),
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });

  // Extract conversation insights after a session ends
  const extractInsights = useCallback(async (
    sessionId: string,
    messages: { role: string; content: string }[],
    agentName: string
  ) => {
    if (!user || messages.length < 2) return null;

    try {
      const { data, error } = await supabase.functions.invoke('extract-conversation-insights', {
        body: { sessionId, messages, agentName },
      });

      if (error) {
        console.error('Failed to extract insights:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error extracting insights:', error);
      return null;
    }
  }, [user]);

  // Get relevant past insights for context (for RAG)
  const getRelevantContext = useCallback((limit: number = 10): string => {
    if (insights.length === 0) return "";

    const recentInsights = insights.slice(0, limit);
    
    const contextParts: string[] = [];
    
    // Build context from past sessions
    recentInsights.forEach((insight, index) => {
      const date = new Date(insight.session_date).toLocaleDateString('ja-JP');
      contextParts.push(`【過去の相談 ${index + 1}（${date}・${insight.agent_name}）】`);
      contextParts.push(`要約: ${insight.summary}`);
      
      if (insight.topics.length > 0) {
        contextParts.push(`テーマ: ${insight.topics.join('、')}`);
      }
      
      if (insight.key_concerns.length > 0) {
        contextParts.push(`悩み: ${insight.key_concerns.join('、')}`);
      }
      
      if (insight.advice_given.length > 0) {
        contextParts.push(`アドバイス: ${insight.advice_given.join('、')}`);
      }
      
      contextParts.push('');
    });

    return contextParts.join('\n');
  }, [insights]);

  // Get aggregated keywords for quick reference
  const getAggregatedKeywords = useCallback((): string[] => {
    const keywordCounts = new Map<string, number>();
    
    insights.forEach(insight => {
      insight.keywords.forEach(keyword => {
        keywordCounts.set(keyword, (keywordCounts.get(keyword) || 0) + 1);
      });
    });

    // Sort by frequency and return top keywords
    return Array.from(keywordCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([keyword]) => keyword);
  }, [insights]);

  // Get topic distribution
  const getTopicDistribution = useCallback((): Record<string, number> => {
    const topicCounts: Record<string, number> = {};
    
    insights.forEach(insight => {
      insight.topics.forEach(topic => {
        topicCounts[topic] = (topicCounts[topic] || 0) + 1;
      });
    });

    return topicCounts;
  }, [insights]);

  return {
    insights,
    loading,
    extractInsights,
    getRelevantContext,
    getAggregatedKeywords,
    getTopicDistribution,
  };
};
