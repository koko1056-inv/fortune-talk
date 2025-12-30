-- Create daily fortunes table
CREATE TABLE public.daily_fortunes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  fortune_date DATE NOT NULL DEFAULT CURRENT_DATE,
  content TEXT NOT NULL,
  lucky_color TEXT,
  lucky_number INTEGER,
  overall_luck INTEGER CHECK (overall_luck >= 1 AND overall_luck <= 5),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, fortune_date)
);

-- Enable RLS
ALTER TABLE public.daily_fortunes ENABLE ROW LEVEL SECURITY;

-- Users can view their own daily fortunes
CREATE POLICY "Users can view their own daily fortunes"
ON public.daily_fortunes
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own daily fortunes
CREATE POLICY "Users can insert their own daily fortunes"
ON public.daily_fortunes
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX idx_daily_fortunes_user_date ON public.daily_fortunes(user_id, fortune_date);