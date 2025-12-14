import { useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface BillingStatus {
  isExempt: boolean;
  hasUsedFreeReading: boolean;
  canStartReading: boolean;
  monthlyUsageSeconds: number;
}

const MONTHLY_LIMIT_SECONDS = 30 * 60; // 30 minutes per month

export const useBillingStatus = () => {
  const { user } = useAuth();

  const { data: billingStatus, isLoading, refetch } = useQuery({
    queryKey: ['billing-status', user?.id],
    queryFn: async (): Promise<BillingStatus> => {
      if (!user) {
        return {
          isExempt: false,
          hasUsedFreeReading: false,
          canStartReading: true, // Non-logged in users can try
          monthlyUsageSeconds: 0,
        };
      }

      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth() + 1;

      // Run all checks in parallel
      const [exemptResult, freeReadingResult, usageResult] = await Promise.all([
        supabase.rpc('is_billing_exempt', { _user_id: user.id }),
        supabase.rpc('has_used_free_reading', { _user_id: user.id }),
        supabase.rpc('get_monthly_usage_seconds', { 
          _user_id: user.id, 
          _year: year, 
          _month: month 
        }),
      ]);

      const isExempt = exemptResult.data ?? false;
      const hasUsedFreeReading = freeReadingResult.data ?? false;
      const monthlyUsageSeconds = usageResult.data ?? 0;

      // Determine if user can start a reading
      let canStartReading = true;
      
      if (isExempt) {
        // Exempt users can always use the service
        canStartReading = true;
      } else if (!hasUsedFreeReading) {
        // First reading is free
        canStartReading = true;
      } else {
        // Check monthly limit (for now, limit access until payment is implemented)
        canStartReading = monthlyUsageSeconds < MONTHLY_LIMIT_SECONDS;
      }

      return {
        isExempt,
        hasUsedFreeReading,
        canStartReading,
        monthlyUsageSeconds,
      };
    },
    enabled: true,
    staleTime: 30 * 1000, // 30 seconds
  });

  const checkCanStartReading = useCallback(() => {
    return billingStatus?.canStartReading ?? true;
  }, [billingStatus]);

  const isFirstFreeReading = useMemo(() => {
    if (!user) return false;
    return billingStatus?.hasUsedFreeReading === false;
  }, [user, billingStatus]);

  return {
    billingStatus: billingStatus ?? {
      isExempt: false,
      hasUsedFreeReading: false,
      canStartReading: true,
      monthlyUsageSeconds: 0,
    },
    loading: isLoading,
    checkCanStartReading,
    isFirstFreeReading,
    refetch,
  };
};
