import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface FortuneReading {
  id: string;
  user_id: string;
  agent_name: string;
  agent_emoji: string | null;
  started_at: string;
  ended_at: string | null;
  duration_seconds: number | null;
  created_at: string;
}

const fetchReadings = async (userId: string): Promise<FortuneReading[]> => {
  const { data, error } = await supabase
    .from('fortune_readings')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching readings:', error);
    return [];
  }

  return data || [];
};

export const useFortuneHistory = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: readings = [], isLoading: loading } = useQuery({
    queryKey: ['fortune-readings', user?.id],
    queryFn: () => fetchReadings(user!.id),
    enabled: !!user,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  const saveMutation = useMutation({
    mutationFn: async ({
      agentName,
      agentEmoji,
      startedAt,
      endedAt,
      isFreeReading = false,
    }: {
      agentName: string;
      agentEmoji: string;
      startedAt: Date;
      endedAt: Date;
      isFreeReading?: boolean;
    }) => {
      if (!user) throw new Error('Not authenticated');

      const durationSeconds = Math.round((endedAt.getTime() - startedAt.getTime()) / 1000);

      const { data, error } = await supabase
        .from('fortune_readings')
        .insert({
          user_id: user.id,
          agent_name: agentName,
          agent_emoji: agentEmoji,
          started_at: startedAt.toISOString(),
          ended_at: endedAt.toISOString(),
          duration_seconds: durationSeconds,
          is_free_reading: isFreeReading,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      if (user) {
        queryClient.invalidateQueries({ queryKey: ['fortune-readings', user.id] });
        queryClient.invalidateQueries({ queryKey: ['billing-status', user.id] });
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('fortune_readings')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      if (user) {
        queryClient.invalidateQueries({ queryKey: ['fortune-readings', user.id] });
      }
    },
  });

  const saveReading = useCallback(
    async (
      agentName: string,
      agentEmoji: string,
      startedAt: Date,
      endedAt: Date,
      isFreeReading = false
    ) => {
      if (!user) return null;

      try {
        const data = await saveMutation.mutateAsync({
          agentName,
          agentEmoji,
          startedAt,
          endedAt,
          isFreeReading,
        });
        return data;
      } catch (error) {
        console.error('Error saving reading:', error);
        return null;
      }
    },
    [user, saveMutation]
  );

  const deleteReading = useCallback(
    async (id: string) => {
      if (!user) return false;

      try {
        await deleteMutation.mutateAsync(id);
        return true;
      } catch (error) {
        console.error('Error deleting reading:', error);
        return false;
      }
    },
    [user, deleteMutation]
  );

  const refetch = useCallback(() => {
    if (user) {
      queryClient.invalidateQueries({ queryKey: ['fortune-readings', user.id] });
    }
  }, [queryClient, user]);

  return {
    readings,
    loading,
    saveReading,
    deleteReading,
    refetch,
  };
};
