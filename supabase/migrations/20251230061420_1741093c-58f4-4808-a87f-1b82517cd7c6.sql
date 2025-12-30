-- Add tutorial_completed flag to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS tutorial_completed BOOLEAN DEFAULT false;

-- Update existing profiles to have tutorial_completed as false
UPDATE public.profiles SET tutorial_completed = false WHERE tutorial_completed IS NULL;