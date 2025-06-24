-- TEMPORARY: Disable RLS on dreams table to test
-- WARNING: This disables all security - only use for testing!

-- Disable RLS completely
ALTER TABLE dreams DISABLE ROW LEVEL SECURITY;

-- Alternative: Keep RLS enabled but allow all access
-- DROP POLICY IF EXISTS "Service role can do everything" ON dreams;
-- DROP POLICY IF EXISTS "Service role bypass" ON dreams;
-- DROP POLICY IF EXISTS "Users can view their own dreams" ON dreams;
-- DROP POLICY IF EXISTS "Users can insert their own dreams" ON dreams;
-- DROP POLICY IF EXISTS "Users can update their own dreams" ON dreams;
-- DROP POLICY IF EXISTS "Users can delete their own dreams" ON dreams;
-- 
-- CREATE POLICY "Allow all access temporarily" ON dreams
--     USING (true)
--     WITH CHECK (true);