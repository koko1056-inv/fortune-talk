-- Enable the pgvector extension
CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA extensions;

-- Add embedding column to conversation_insights table
ALTER TABLE public.conversation_insights
ADD COLUMN IF NOT EXISTS embedding vector(384);

-- Create an index for vector similarity search
-- Using HNSW for better performance on similarity queries
CREATE INDEX IF NOT EXISTS conversation_insights_embedding_idx
ON public.conversation_insights
USING hnsw (embedding vector_cosine_ops);

-- Create the match_conversation_insights function for vector similarity search
CREATE OR REPLACE FUNCTION public.match_conversation_insights(
  query_embedding vector(384),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 5,
  p_user_id uuid DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  user_id uuid,
  session_id uuid,
  summary text,
  keywords text[],
  topics text[],
  key_concerns text[],
  advice_given text[],
  agent_name text,
  session_date timestamptz,
  similarity float
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    ci.id,
    ci.user_id,
    ci.session_id,
    ci.summary,
    ci.keywords,
    ci.topics,
    ci.key_concerns,
    ci.advice_given,
    ci.agent_name,
    ci.session_date,
    1 - (ci.embedding <=> query_embedding) AS similarity
  FROM public.conversation_insights ci
  WHERE 
    ci.user_id = p_user_id
    AND ci.embedding IS NOT NULL
    AND 1 - (ci.embedding <=> query_embedding) > match_threshold
  ORDER BY ci.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;