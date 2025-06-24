-- NUCLEAR OPTION: Disable RLS completely on dreams table
-- WARNING: This removes all row-level security!
-- Only use this to confirm RLS is the issue

-- Disable RLS
ALTER TABLE dreams DISABLE ROW LEVEL SECURITY;

-- Verify it's disabled
SELECT 
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'dreams';