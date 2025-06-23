-- Add transcription fields to dreams table
ALTER TABLE public.dreams 
ADD COLUMN IF NOT EXISTS transcription_status text DEFAULT 'pending' 
  CHECK (transcription_status IN ('pending', 'processing', 'completed', 'failed')),
ADD COLUMN IF NOT EXISTS transcription_metadata jsonb,
ADD COLUMN IF NOT EXISTS transcription_job_id text,
ADD COLUMN IF NOT EXISTS duration integer; -- duration in seconds

-- Create usage tracking table
CREATE TABLE IF NOT EXISTS public.transcription_usage (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  dream_id uuid REFERENCES public.dreams(id) ON DELETE CASCADE,
  character_count integer NOT NULL,
  duration_seconds numeric NOT NULL,
  language_code text,
  model_id text DEFAULT 'scribe_v1',
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Create indexes separately
CREATE INDEX IF NOT EXISTS transcription_usage_user_id_idx ON public.transcription_usage (user_id);
CREATE INDEX IF NOT EXISTS transcription_usage_created_at_idx ON public.transcription_usage (created_at);

-- Enable RLS
ALTER TABLE public.transcription_usage ENABLE ROW LEVEL SECURITY;

-- RLS policies for transcription_usage
CREATE POLICY "Users can view own transcription usage" ON public.transcription_usage
  FOR SELECT USING (auth.uid() = user_id);

-- Update updated_at trigger for dreams table to handle transcription updates
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Ensure trigger exists
DROP TRIGGER IF EXISTS handle_dreams_updated_at ON public.dreams;
CREATE TRIGGER handle_dreams_updated_at
  BEFORE UPDATE ON public.dreams
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();