import { useState, useEffect, useCallback } from 'react';
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

export const useFortuneHistory = () => {
  const { user } = useAuth();
  const [readings, setReadings] = useState<FortuneReading[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReadings = useCallback(async () => {
    if (!user) {
      setReadings([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('fortune_readings')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReadings(data || []);
    } catch (error) {
      console.error('Error fetching readings:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchReadings();
  }, [fetchReadings]);

  const saveReading = useCallback(async (
    agentName: string,
    agentEmoji: string,
    startedAt: Date,
    endedAt: Date
  ) => {
    if (!user) return null;

    const durationSeconds = Math.round((endedAt.getTime() - startedAt.getTime()) / 1000);

    try {
      const { data, error } = await supabase
        .from('fortune_readings')
        .insert({
          user_id: user.id,
          agent_name: agentName,
          agent_emoji: agentEmoji,
          started_at: startedAt.toISOString(),
          ended_at: endedAt.toISOString(),
          duration_seconds: durationSeconds,
        })
        .select()
        .single();

      if (error) throw error;
      
      // Refresh the list
      await fetchReadings();
      return data;
    } catch (error) {
      console.error('Error saving reading:', error);
      return null;
    }
  }, [user, fetchReadings]);

  const deleteReading = useCallback(async (id: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('fortune_readings')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      await fetchReadings();
      return true;
    } catch (error) {
      console.error('Error deleting reading:', error);
      return false;
    }
  }, [user, fetchReadings]);

  return {
    readings,
    loading,
    saveReading,
    deleteReading,
    refetch: fetchReadings,
  };
};
