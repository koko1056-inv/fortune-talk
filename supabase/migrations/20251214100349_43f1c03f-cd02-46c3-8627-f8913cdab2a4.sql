-- Create billing exemptions table for users who don't need to pay
CREATE TABLE public.billing_exemptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  reason text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.billing_exemptions ENABLE ROW LEVEL SECURITY;

-- Only admins can manage exemptions
CREATE POLICY "Admins can manage billing exemptions"
ON public.billing_exemptions
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Users can check if they are exempt
CREATE POLICY "Users can view their own exemption status"
ON public.billing_exemptions
FOR SELECT
USING (auth.uid() = user_id);

-- Add is_free_reading column to fortune_readings to track which reading was free
ALTER TABLE public.fortune_readings
ADD COLUMN is_free_reading boolean NOT NULL DEFAULT false;

-- Create a function to check if user has used their free reading
CREATE OR REPLACE FUNCTION public.has_used_free_reading(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.fortune_readings
    WHERE user_id = _user_id
      AND is_free_reading = true
  )
$$;

-- Create a function to check if user is billing exempt
CREATE OR REPLACE FUNCTION public.is_billing_exempt(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.billing_exemptions
    WHERE user_id = _user_id
  )
$$;

-- Create a function to get monthly usage in seconds for a user
CREATE OR REPLACE FUNCTION public.get_monthly_usage_seconds(_user_id uuid, _year integer, _month integer)
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(SUM(duration_seconds), 0)::integer
  FROM public.fortune_readings
  WHERE user_id = _user_id
    AND is_free_reading = false
    AND EXTRACT(YEAR FROM created_at) = _year
    AND EXTRACT(MONTH FROM created_at) = _month
$$;