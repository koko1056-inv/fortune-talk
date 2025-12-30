import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface DailyFortune {
  id: string;
  user_id: string;
  fortune_date: string;
  content: string;
  lucky_color: string | null;
  lucky_number: number | null;
  lucky_item: string | null;
  overall_luck: number | null;
  created_at: string;
}

export const useDailyFortune = () => {
  const { user } = useAuth();

  const { data: fortune, isLoading, error, refetch } = useQuery({
    queryKey: ['daily-fortune', user?.id],
    queryFn: async (): Promise<DailyFortune | null> => {
      if (!user) return null;

      const { data, error } = await supabase.functions.invoke('daily-fortune');

      if (error) {
        console.error('Error fetching daily fortune:', error);
        throw error;
      }

      return data as DailyFortune;
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });

  return {
    fortune,
    isLoading,
    error,
    refetch,
  };
};
