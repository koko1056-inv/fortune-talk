import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import OnboardingFlow from "@/components/onboarding/OnboardingFlow";

const Onboarding = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile, loading } = useProfile();

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    // If onboarding already completed, go home
    if (!loading && profile && profile.onboarding_completed) {
      navigate("/");
    }
  }, [user, profile, loading, navigate]);

  if (!user || loading) return null;

  return <OnboardingFlow />;
};

export default Onboarding;
