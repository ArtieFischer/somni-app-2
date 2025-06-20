-- Enable real-time for dreams table
-- This ensures that the dreams table broadcasts changes to connected clients

-- First, check if the supabase_realtime publication exists
-- If not, create it
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication
    WHERE pubname = 'supabase_realtime'
  ) THEN
    CREATE PUBLICATION supabase_realtime;
  END IF;
END $$;

-- Add the dreams table to the real-time publication
-- This allows clients to receive real-time updates when dreams are inserted, updated, or deleted
ALTER PUBLICATION supabase_realtime ADD TABLE public.dreams;

-- Create an index on user_id for better real-time performance
-- This helps with the filter `user_id=eq.${user.id}` in subscriptions
CREATE INDEX IF NOT EXISTS idx_dreams_user_id ON public.dreams(user_id);

-- Create an index on transcription_status for better query performance
CREATE INDEX IF NOT EXISTS idx_dreams_transcription_status ON public.dreams(transcription_status);

-- Ensure RLS is enabled on dreams table (should already be enabled)
ALTER TABLE public.dreams ENABLE ROW LEVEL SECURITY;

-- Add a comment to document the real-time setup
COMMENT ON TABLE public.dreams IS 'Dreams table with real-time enabled for live transcription updates';