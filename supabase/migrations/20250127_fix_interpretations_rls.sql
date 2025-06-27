-- Fix RLS policies for interpretations table to allow real-time subscriptions

-- First, ensure the interpretations table is included in the supabase_realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE interpretations;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own interpretations" ON interpretations;
DROP POLICY IF EXISTS "Users can insert their own interpretations" ON interpretations;
DROP POLICY IF EXISTS "Users can update their own interpretations" ON interpretations;

-- Create new policies with proper real-time support
CREATE POLICY "Users can view their own interpretations"
ON interpretations
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid()
  OR
  -- Also allow viewing interpretations for dreams the user owns
  EXISTS (
    SELECT 1 FROM dreams
    WHERE dreams.id = interpretations.dream_id
    AND dreams.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert their own interpretations"
ON interpretations
FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid()
  AND
  -- Ensure the dream belongs to the user
  EXISTS (
    SELECT 1 FROM dreams
    WHERE dreams.id = dream_id
    AND dreams.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their own interpretations"
ON interpretations
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Create an index to improve performance of real-time subscriptions
CREATE INDEX IF NOT EXISTS idx_interpretations_dream_id ON interpretations(dream_id);
CREATE INDEX IF NOT EXISTS idx_interpretations_user_id ON interpretations(user_id);
CREATE INDEX IF NOT EXISTS idx_interpretations_created_at ON interpretations(created_at DESC);

-- Ensure the service role can manage interpretations
CREATE POLICY "Service role can manage all interpretations"
ON interpretations
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Also ensure dreams table policies allow checking ownership
DROP POLICY IF EXISTS "Users can view their own dreams" ON dreams;
CREATE POLICY "Users can view their own dreams"
ON dreams
FOR SELECT
TO authenticated
USING (user_id = auth.uid());