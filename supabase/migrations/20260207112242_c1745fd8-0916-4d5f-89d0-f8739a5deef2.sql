-- Create conversation_insights table to store RAG knowledge base
CREATE TABLE public.conversation_insights (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  session_id UUID REFERENCES public.chat_sessions(id) ON DELETE CASCADE,
  summary TEXT NOT NULL,
  keywords TEXT[] NOT NULL DEFAULT '{}',
  topics TEXT[] NOT NULL DEFAULT '{}',
  key_concerns TEXT[] NOT NULL DEFAULT '{}',
  advice_given TEXT[] NOT NULL DEFAULT '{}',
  agent_name TEXT NOT NULL,
  session_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.conversation_insights ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own insights"
  ON public.conversation_insights
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own insights"
  ON public.conversation_insights
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create index for efficient querying
CREATE INDEX idx_conversation_insights_user_id ON public.conversation_insights(user_id);
CREATE INDEX idx_conversation_insights_keywords ON public.conversation_insights USING GIN(keywords);
CREATE INDEX idx_conversation_insights_topics ON public.conversation_insights USING GIN(topics);
CREATE INDEX idx_conversation_insights_session_date ON public.conversation_insights(session_date DESC);