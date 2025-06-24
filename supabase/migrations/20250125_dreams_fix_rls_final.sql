-- Final fix for dreams table RLS
-- This ensures service role can bypass RLS

-- First, check current RLS status
DO $$
DECLARE
    rls_enabled boolean;
BEGIN
    SELECT relrowsecurity INTO rls_enabled
    FROM pg_class
    WHERE relname = 'dreams';
    
    RAISE NOTICE 'RLS is currently: %', CASE WHEN rls_enabled THEN 'ENABLED' ELSE 'DISABLED' END;
END $$;

-- Drop ALL existing policies
DROP POLICY IF EXISTS "Service role can do everything" ON dreams;
DROP POLICY IF EXISTS "Service role bypass" ON dreams;
DROP POLICY IF EXISTS "Users can view their own dreams" ON dreams;
DROP POLICY IF EXISTS "Users can insert their own dreams" ON dreams;
DROP POLICY IF EXISTS "Users can update their own dreams" ON dreams;
DROP POLICY IF EXISTS "Users can delete their own dreams" ON dreams;

-- Create new policies with explicit service_role bypass
-- The key is to check for service_role FIRST

-- Policy 1: Service role can do everything (no restrictions)
CREATE POLICY "service_role_all_access" ON dreams
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Policy 2: Authenticated users can view their own dreams
CREATE POLICY "users_view_own" ON dreams
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- Policy 3: Authenticated users can insert their own dreams
CREATE POLICY "users_insert_own" ON dreams
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Policy 4: Authenticated users can update their own dreams
CREATE POLICY "users_update_own" ON dreams
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Policy 5: Authenticated users can delete their own dreams
CREATE POLICY "users_delete_own" ON dreams
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- Grant explicit permissions
GRANT ALL ON dreams TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON dreams TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON dreams TO anon; -- for edge functions

-- Verify policies
SELECT 
    policyname,
    cmd,
    roles
FROM pg_policies
WHERE tablename = 'dreams'
ORDER BY policyname;