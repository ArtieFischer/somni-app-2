-- Fix Row Level Security policies for interpretations table
-- This migration drops existing policies and creates more explicit ones

-- First, drop existing policies
DROP POLICY IF EXISTS interpretations_owner_all ON interpretations;
DROP POLICY IF EXISTS interpretations_service_role_all ON interpretations;
DROP POLICY IF EXISTS "Users can delete own interpretations" ON interpretations;

-- Grant necessary permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON interpretations TO authenticated;

-- Create explicit SELECT policy
-- Users can read interpretations for their own dreams
CREATE POLICY interpretations_select_own ON interpretations
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM dreams 
      WHERE dreams.id = interpretations.dream_id 
      AND dreams.user_id = auth.uid()
    )
  );

-- Create explicit INSERT policy
-- Users can create interpretations for their own dreams
CREATE POLICY interpretations_insert_own ON interpretations
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM dreams 
      WHERE dreams.id = interpretations.dream_id 
      AND dreams.user_id = auth.uid()
    )
  );

-- Create explicit UPDATE policy
-- Users can update interpretations for their own dreams
CREATE POLICY interpretations_update_own ON interpretations
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM dreams 
      WHERE dreams.id = interpretations.dream_id 
      AND dreams.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM dreams 
      WHERE dreams.id = interpretations.dream_id 
      AND dreams.user_id = auth.uid()
    )
  );

-- Create explicit DELETE policy
-- Users can delete interpretations for their own dreams
CREATE POLICY interpretations_delete_own ON interpretations
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM dreams 
      WHERE dreams.id = interpretations.dream_id 
      AND dreams.user_id = auth.uid()
    )
  );

-- Service role can do everything
CREATE POLICY interpretations_service_role_all ON interpretations
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Add comment to document the policies
COMMENT ON TABLE interpretations IS 'Dream interpretations table with RLS policies allowing users to manage interpretations for their own dreams';