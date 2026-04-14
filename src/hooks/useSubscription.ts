import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface SubscriptionStatus {
  isPremium: boolean;
  planType: "free" | "weekly" | "monthly" | "yearly";
  status: "active" | "expired" | "cancelled" | "trial" | "none";
  trialEnd: string | null;
  currentPeriodEnd: string | null;
}

const defaultStatus: SubscriptionStatus = {
  isPremium: false,
  planType: "free",
  status: "none",
  trialEnd: null,
  currentPeriodEnd: null,
};

export const useSubscription = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: subscription = defaultStatus, isLoading } = useQuery({
    queryKey: ["subscription", user?.id],
    queryFn: async (): Promise<SubscriptionStatus> => {
      if (!user) return defaultStatus;

      // TODO: Implement subscription table query when Stripe is set up
      // For now, return default (free) status
      return defaultStatus;
    },
    enabled: !!user,
    staleTime: 60 * 1000, // 1 minute
  });

  const refetch = () => {
    if (user) {
      queryClient.invalidateQueries({ queryKey: ["subscription", user.id] });
    }
  };

  return {
    subscription,
    isPremium: subscription.isPremium,
    isLoading,
    refetch,
  };
};
