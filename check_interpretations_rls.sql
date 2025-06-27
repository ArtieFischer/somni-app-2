-- Check existing RLS policies on interpretations table
-- Run this in Supabase SQL Editor to see current policies

-- 1. Check if RLS is enabled
SELECT 
    tablename,
    rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename = 'interpretations';

-- 2. List all policies on interpretations table
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public' 
    AND tablename = 'interpretations';

-- 3. Check table permissions
SELECT 
    grantee,
    table_schema,
    table_name,
    privilege_type
FROM information_schema.table_privileges
WHERE table_schema = 'public' 
    AND table_name = 'interpretations'
ORDER BY grantee, privilege_type;

-- 4. Test query to check if current user can access interpretations
-- Replace 'YOUR_USER_ID' with an actual user ID from your auth.users table
/*
-- First get a user ID:
SELECT id FROM auth.users LIMIT 1;

-- Then test with that user ID:
SELECT 
    i.*,
    d.user_id as dream_owner_id
FROM interpretations i
JOIN dreams d ON d.id = i.dream_id
WHERE d.user_id = 'YOUR_USER_ID_HERE'
LIMIT 5;
*/

-- 5. Check if there are any interpretations in the table
SELECT 
    COUNT(*) as total_interpretations,
    COUNT(DISTINCT dream_id) as unique_dreams_with_interpretations
FROM interpretations;

-- 6. Quick fix if you need to apply permissions immediately
-- (This is what the migration does, but you can run it directly)
/*
-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON interpretations TO authenticated;

-- Drop and recreate the SELECT policy
DROP POLICY IF EXISTS interpretations_owner_all ON interpretations;

CREATE POLICY interpretations_select_own ON interpretations
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM dreams 
      WHERE dreams.id = interpretations.dream_id 
      AND dreams.user_id = auth.uid()
    )
  );
*/