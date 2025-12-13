-- Create fortune readings history table
CREATE TABLE public.fortune_readings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  agent_name TEXT NOT NULL,
  agent_emoji TEXT,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ended_at TIMESTAMP WITH TIME ZONE,
  duration_seconds INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.fortune_readings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own readings" 
ON public.fortune_readings 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own readings" 
ON public.fortune_readings 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own readings" 
ON public.fortune_readings 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_fortune_readings_user_id ON public.fortune_readings(user_id);
CREATE INDEX idx_fortune_readings_created_at ON public.fortune_readings(created_at DESC);