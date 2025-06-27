-- Fix interpretations RLS policies immediately
-- The current policies are checking user_id which doesn't exist on interpretations table

-- 1. Drop the incorrect policies
DROP POLICY IF EXISTS "Users can view their own interpretations" ON interpretations;
DROP POLICY IF EXISTS "Users can insert their own interpretations" ON interpretations;
DROP POLICY IF EXISTS "Service role has full access" ON interpretations;

-- 2. Grant permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON interpretations TO authenticated;

-- 3. Create correct policies that check ownership through dreams table

-- Allow users to SELECT interpretations for their own dreams
CREATE POLICY "Users can view interpretations for own dreams" ON interpretations
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM dreams 
      WHERE dreams.id = interpretations.dream_id 
      AND dreams.user_id = auth.uid()
    )
  );

-- Allow users to INSERT interpretations for their own dreams
CREATE POLICY "Users can create interpretations for own dreams" ON interpretations
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM dreams 
      WHERE dreams.id = interpretations.dream_id 
      AND dreams.user_id = auth.uid()
    )
  );

-- Allow users to UPDATE interpretations for their own dreams
CREATE POLICY "Users can update interpretations for own dreams" ON interpretations
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

-- Allow users to DELETE interpretations for their own dreams
CREATE POLICY "Users can delete interpretations for own dreams" ON interpretations
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM dreams 
      WHERE dreams.id = interpretations.dream_id 
      AND dreams.user_id = auth.uid()
    )
  );

-- Service role can do everything
CREATE POLICY "Service role has full access" ON interpretations
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- 4. Test the fix - check if policies are correct
SELECT 
    policyname,
    cmd,
    qual
FROM pg_policies
WHERE schemaname = 'public' 
    AND tablename = 'interpretations'
ORDER BY policyname;