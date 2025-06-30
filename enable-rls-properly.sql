-- Properly enable RLS and add policies

-- 1. First, enable RLS
ALTER TABLE shared_dreams ENABLE ROW LEVEL SECURITY;

-- 2. Create the policies (these won't exist until RLS is enabled)

-- Allow anyone to read active shared dreams
CREATE POLICY "public_read_active_shares" ON shared_dreams
    FOR SELECT
    USING (is_active = true);

-- Allow all authenticated requests to insert
CREATE POLICY "authenticated_insert" ON shared_dreams
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Allow service role full access
CREATE POLICY "service_role_all" ON shared_dreams
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Allow users to update their own shares
CREATE POLICY "user_update_own" ON shared_dreams
    FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Allow users to delete their own shares
CREATE POLICY "user_delete_own" ON shared_dreams
    FOR DELETE
    TO authenticated
    USING (user_id = auth.uid());

-- 3. Verify RLS is now enabled
SELECT 
    'RLS Status' as check,
    relrowsecurity::text as value
FROM pg_class 
WHERE relname = 'shared_dreams';

-- 4. Verify policies exist
SELECT 
    policyname,
    cmd,
    roles
FROM pg_policies
WHERE tablename = 'shared_dreams'
ORDER BY policyname;

-- 5. The app should still work - test sharing a dream now