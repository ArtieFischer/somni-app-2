-- Check current RLS status and policies on dreams table

-- Check if RLS is enabled
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'dreams';

-- List all policies on dreams table
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
WHERE tablename = 'dreams'
ORDER BY policyname;

-- Check if service role can access dreams
-- This simulates what the edge function is trying to do
SET ROLE postgres; -- Use superuser role to test
SELECT COUNT(*) as dream_count FROM dreams;
RESET ROLE;