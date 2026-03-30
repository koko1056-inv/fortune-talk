-- ==========================================
-- Part 1: Onboarding fields on profiles
-- ==========================================

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS birth_time TEXT,
  ADD COLUMN IF NOT EXISTS birth_location TEXT,
  ADD COLUMN IF NOT EXISTS guidance_topics TEXT[],
  ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS personality_summary TEXT;

-- ==========================================
-- Part 2: Onboarding readings table
-- ==========================================

CREATE TABLE IF NOT EXISTS public.onboarding_readings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  birth_chart_data JSONB,
  personality_traits TEXT[],
  summary_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.onboarding_readings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own onboarding readings"
ON public.onboarding_readings FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own onboarding readings"
ON public.onboarding_readings FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- ==========================================
-- Part 3: Subscription system
-- ==========================================

CREATE TABLE IF NOT EXISTS public.user_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  plan_type TEXT NOT NULL DEFAULT 'free' CHECK (plan_type IN ('free', 'weekly', 'monthly', 'yearly')),
  status TEXT NOT NULL DEFAULT 'none' CHECK (status IN ('active', 'expired', 'cancelled', 'trial', 'none')),
  trial_start TIMESTAMP WITH TIME ZONE,
  trial_end TIMESTAMP WITH TIME ZONE,
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  revenuecat_subscription_id TEXT,
  product_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own subscription"
ON public.user_subscriptions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage subscriptions"
ON public.user_subscriptions FOR ALL
USING (true)
WITH CHECK (true);

-- Trigger for updated_at
CREATE TRIGGER update_user_subscriptions_updated_at
BEFORE UPDATE ON public.user_subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- ==========================================
-- Part 4: Helper functions
-- ==========================================

-- Check if user has premium access (active sub or trial)
CREATE OR REPLACE FUNCTION public.is_premium_user(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  _status TEXT;
  _trial_end TIMESTAMPTZ;
  _period_end TIMESTAMPTZ;
BEGIN
  SELECT status, trial_end, current_period_end
  INTO _status, _trial_end, _period_end
  FROM public.user_subscriptions
  WHERE user_id = _user_id;

  IF NOT FOUND THEN RETURN false; END IF;

  -- Active subscription
  IF _status = 'active' AND (_period_end IS NULL OR _period_end > now()) THEN
    RETURN true;
  END IF;

  -- Active trial
  IF _status = 'trial' AND _trial_end IS NOT NULL AND _trial_end > now() THEN
    RETURN true;
  END IF;

  RETURN false;
END;
$$;

-- Get full subscription status
CREATE OR REPLACE FUNCTION public.get_subscription_status(_user_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  _result JSON;
BEGIN
  SELECT json_build_object(
    'isPremium', public.is_premium_user(_user_id),
    'planType', COALESCE(us.plan_type, 'free'),
    'status', COALESCE(us.status, 'none'),
    'trialEnd', us.trial_end,
    'currentPeriodEnd', us.current_period_end
  ) INTO _result
  FROM (SELECT _user_id AS uid) t
  LEFT JOIN public.user_subscriptions us ON us.user_id = t.uid;

  RETURN COALESCE(_result, json_build_object(
    'isPremium', false,
    'planType', 'free',
    'status', 'none',
    'trialEnd', null,
    'currentPeriodEnd', null
  ));
END;
$$;

-- ==========================================
-- Part 5: Update agent_configs with ElevenLabs agent IDs
-- ==========================================

UPDATE public.agent_configs SET agent_id = 'agent_3801kgvv44mretrb43r0b041628g' WHERE id = 'tarot';
UPDATE public.agent_configs SET agent_id = 'agent_7701kgvv139qebmr5c1y9ahgkht9' WHERE id = 'astro';
UPDATE public.agent_configs SET agent_id = 'agent_3801kgvv7sxrennbt53t8e126f11' WHERE id = 'eastern';
UPDATE public.agent_configs SET agent_id = 'agent_7901kgvtxt41ebx9j5wf4rgj1mnb' WHERE id = 'numerology';
