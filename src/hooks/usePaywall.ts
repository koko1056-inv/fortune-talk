import { useState, useCallback } from "react";
import { useSubscription } from "./useSubscription";
import { useBillingStatus } from "./useBillingStatus";

export const usePaywall = () => {
  const { isPremium } = useSubscription();
  const { billingStatus, isFirstFreeReading } = useBillingStatus();
  const [showPaywall, setShowPaywall] = useState(false);

  const canAccessReading = useCallback((): boolean => {
    // Premium users always have access
    if (isPremium) return true;
    // Billing exempt users always have access
    if (billingStatus.isExempt) return true;
    // First free reading is allowed
    if (isFirstFreeReading) return true;
    // Users with tickets can access
    if (billingStatus.ticketBalance > 0) return true;
    // Otherwise, show paywall
    return false;
  }, [isPremium, billingStatus, isFirstFreeReading]);

  const triggerPaywall = useCallback(() => {
    if (!canAccessReading()) {
      setShowPaywall(true);
      return true; // paywall was shown
    }
    return false; // no paywall needed
  }, [canAccessReading]);

  const closePaywall = useCallback(() => {
    setShowPaywall(false);
  }, []);

  return {
    showPaywall,
    triggerPaywall,
    closePaywall,
    canAccessReading,
    isPremium,
  };
};
