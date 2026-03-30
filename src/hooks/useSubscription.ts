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

      const { data, error } = await supabase.rpc("get_subscription_status", {
        _user_id: user.id,
      });

      if (error) {
        console.error("Failed to get subscription status:", error);
        return defaultStatus;
      }

      return {
        isPremium: data?.isPremium ?? false,
        planType: data?.planType ?? "free",
        status: data?.status ?? "none",
        trialEnd: data?.trialEnd ?? null,
        currentPeriodEnd: data?.currentPeriodEnd ?? null,
      };
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
