-- Clean up conflicting policies on dreams table

-- Drop ALL existing policies to start fresh
DROP POLICY IF EXISTS "dreams_self_all" ON dreams;
DROP POLICY IF EXISTS "dreams_service_role_all" ON dreams;
DROP POLICY IF EXISTS "service_role_all_access" ON dreams;
DROP POLICY IF EXISTS "users_delete_own" ON dreams;
DROP POLICY IF EXISTS "users_insert_own" ON dreams;
DROP POLICY IF EXISTS "users_update_own" ON dreams;
DROP POLICY IF EXISTS "users_view_own" ON dreams;

-- Create clean policies

-- 1. Service role bypass - MOST IMPORTANT
CREATE POLICY "service_role_bypass_all" ON dreams
    FOR ALL
    USING (
        auth.jwt() IS NULL  -- Direct service role access (no JWT)
        OR 
        auth.jwt()->>'role' = 'service_role'  -- Or JWT with service role
    );

-- 2. Users can view their own dreams
CREATE POLICY "users_select_own" ON dreams
    FOR SELECT
    USING (auth.uid() = user_id);

-- 3. Users can insert their own dreams
CREATE POLICY "users_insert_own" ON dreams
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- 4. Users can update their own dreams
CREATE POLICY "users_update_own" ON dreams
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 5. Users can delete their own dreams
CREATE POLICY "users_delete_own" ON dreams
    FOR DELETE
    USING (auth.uid() = user_id);

-- Verify final policies
SELECT 
    policyname,
    cmd,
    permissive,
    qual
FROM pg_policies
WHERE tablename = 'dreams'
ORDER BY policyname;