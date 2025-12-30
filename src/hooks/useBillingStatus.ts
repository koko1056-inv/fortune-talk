import { useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface BillingStatus {
  isExempt: boolean;
  hasUsedFreeReading: boolean;
  canStartReading: boolean;
  ticketBalance: number;
}

// Ticket pricing configuration
export const TICKET_PACKAGES = [
  { amount: 1, pricePerTicket: 1000, totalPrice: 1000, discount: 0 },
  { amount: 10, pricePerTicket: 900, totalPrice: 9000, discount: 10 },
  { amount: 50, pricePerTicket: 800, totalPrice: 40000, discount: 20 },
  { amount: 100, pricePerTicket: 700, totalPrice: 70000, discount: 30 },
] as const;

export const useBillingStatus = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: billingStatus, isLoading, refetch } = useQuery({
    queryKey: ['billing-status', user?.id],
    queryFn: async (): Promise<BillingStatus> => {
      if (!user) {
        return {
          isExempt: false,
          hasUsedFreeReading: false,
          canStartReading: true,
          ticketBalance: 0,
        };
      }

      // Run all checks in parallel
      const [exemptResult, freeReadingResult, ticketResult] = await Promise.all([
        supabase.rpc('is_billing_exempt', { _user_id: user.id }),
        supabase.rpc('has_used_free_reading', { _user_id: user.id }),
        supabase.rpc('get_ticket_balance', { _user_id: user.id }),
      ]);

      const isExempt = exemptResult.data ?? false;
      const hasUsedFreeReading = freeReadingResult.data ?? false;
      const ticketBalance = ticketResult.data ?? 0;

      // Determine if user can start a reading
      let canStartReading = true;
      
      if (isExempt) {
        canStartReading = true;
      } else if (!hasUsedFreeReading) {
        canStartReading = true;
      } else {
        // Check if user has tickets
        canStartReading = ticketBalance > 0;
      }

      return {
        isExempt,
        hasUsedFreeReading,
        canStartReading,
        ticketBalance,
      };
    },
    enabled: true,
    staleTime: 30 * 1000,
  });

  // Mutation to use a ticket
  const useTicketMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not authenticated');
      const { data, error } = await supabase.rpc('use_ticket', { _user_id: user.id });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['billing-status', user?.id] });
    },
  });

  const checkCanStartReading = useCallback(() => {
    return billingStatus?.canStartReading ?? true;
  }, [billingStatus]);

  const isFirstFreeReading = useMemo(() => {
    if (!user) return false;
    return billingStatus?.hasUsedFreeReading === false;
  }, [user, billingStatus]);

  const useTicket = useCallback(async () => {
    return useTicketMutation.mutateAsync();
  }, [useTicketMutation]);

  return {
    billingStatus: billingStatus ?? {
      isExempt: false,
      hasUsedFreeReading: false,
      canStartReading: true,
      ticketBalance: 0,
    },
    loading: isLoading,
    checkCanStartReading,
    isFirstFreeReading,
    useTicket,
    refetch,
  };
};
