-- Diagnose Backend Permission Issues

-- 1. Check what roles exist and their permissions
SELECT 
    rolname,
    rolsuper,
    rolinherit,
    rolcreaterole,
    rolcreatedb,
    rolcanlogin
FROM pg_roles 
WHERE rolname IN ('anon', 'authenticated', 'service_role', 'postgres')
ORDER BY rolname;

-- 2. Check table ownership
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables 
WHERE tablename = 'shared_dreams';

-- 3. Check all grants on shared_dreams
SELECT 
    grantor,
    grantee,
    table_schema,
    table_name,
    privilege_type,
    is_grantable
FROM information_schema.role_table_grants 
WHERE table_name = 'shared_dreams'
ORDER BY grantee, privilege_type;

-- 4. Try different approaches to fix permissions

-- Option A: Grant permissions to authenticated role (if backend uses JWT)
GRANT ALL ON TABLE public.shared_dreams TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Option B: Grant permissions to anon role (if backend doesn't pass auth)
GRANT INSERT, UPDATE, SELECT ON TABLE public.shared_dreams TO anon;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon;

-- Option C: Make sure service_role has explicit grants
GRANT ALL PRIVILEGES ON TABLE public.shared_dreams TO service_role;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- 5. Simplify the policies temporarily to isolate the issue
-- Drop all existing policies
DROP POLICY IF EXISTS "Anyone can view active shared dreams" ON shared_dreams;
DROP POLICY IF EXISTS "Service role can manage all shared dreams" ON shared_dreams;
DROP POLICY IF EXISTS "Users can delete their own shared dreams" ON shared_dreams;
DROP POLICY IF EXISTS "Users can share their own dreams" ON shared_dreams;
DROP POLICY IF EXISTS "Users can update their own shared dreams" ON shared_dreams;

-- Create a single permissive policy for testing
CREATE POLICY "Allow all operations for testing" ON shared_dreams
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- 6. Test insert as different roles
-- As service_role
SET ROLE service_role;
INSERT INTO shared_dreams (dream_id, user_id, is_anonymous, display_name)
VALUES ('c77cc6da-0c47-414e-b965-5358e3bdac7c'::uuid, '5f73c470-9639-497f-a125-ee13427464c7'::uuid, true, NULL)
ON CONFLICT (dream_id, user_id) DO UPDATE SET is_active = true, updated_at = now()
RETURNING 'service_role insert worked' as result, *;
RESET ROLE;

-- As authenticated (this will fail without a specific user context)
SET ROLE authenticated;
SELECT 'Testing as authenticated role - may fail due to no user context' as info;
RESET ROLE;

-- 7. Check if RLS is the issue
ALTER TABLE shared_dreams DISABLE ROW LEVEL SECURITY;
SELECT 'RLS disabled on shared_dreams - try sharing now' as status;

-- To re-enable later:
-- ALTER TABLE shared_dreams ENABLE ROW LEVEL SECURITY;