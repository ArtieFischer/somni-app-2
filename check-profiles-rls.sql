-- Check RLS policies on profiles table

-- 1. Is RLS enabled?
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename = 'profiles';

-- 2. What policies exist?
SELECT 
  polname as policy_name,
  polcmd as command,
  CASE 
    WHEN polcmd = 'r' THEN 'SELECT'
    WHEN polcmd = 'a' THEN 'INSERT'
    WHEN polcmd = 'w' THEN 'UPDATE'
    WHEN polcmd = 'd' THEN 'DELETE'
    WHEN polcmd = '*' THEN 'ALL'
  END as operation,
  pg_get_expr(polqual, polrelid) as using_expression,
  pg_get_expr(polwithcheck, polrelid) as with_check_expression,
  rolname as role
FROM pg_policy pol
JOIN pg_class pc ON pol.polrelid = pc.oid
JOIN pg_roles pr ON pol.polroles @> ARRAY[pr.oid]
WHERE pc.relname = 'profiles'
  AND pc.relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
ORDER BY pol.polname;

-- 3. Quick fix - ensure service role can insert
-- This should be run in Supabase Dashboard
DROP POLICY IF EXISTS "Service role full access" ON public.profiles;
CREATE POLICY "Service role full access" ON public.profiles
  FOR ALL 
  TO service_role
  USING (true)
  WITH CHECK (true);

-- 4. Ensure the trigger function runs with proper permissions
ALTER FUNCTION handle_new_user() SECURITY DEFINER;

-- 5. Grant necessary permissions
GRANT ALL ON public.profiles TO service_role;
GRANT USAGE ON SCHEMA public TO service_role;