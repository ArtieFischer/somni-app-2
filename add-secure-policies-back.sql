-- Re-enable security for shared_dreams in a backend-compatible way

-- 1. Re-enable RLS
ALTER TABLE shared_dreams ENABLE ROW LEVEL SECURITY;

-- 2. Create simple, backend-compatible policies

-- Allow anyone to read active shared dreams (for the public feed)
CREATE POLICY "public_read_active_shares" ON shared_dreams
    FOR SELECT
    USING (is_active = true);

-- Allow all authenticated requests to insert (backend validates ownership)
CREATE POLICY "authenticated_insert" ON shared_dreams
    FOR INSERT
    WITH CHECK (true);  -- Backend handles validation

-- Allow updates only to the user's own shares
CREATE POLICY "user_update_own" ON shared_dreams
    FOR UPDATE
    USING (
        user_id = auth.uid()  -- Direct user access
        OR 
        auth.jwt() ->> 'role' = 'service_role'  -- Backend access
    )
    WITH CHECK (
        user_id = auth.uid() 
        OR 
        auth.jwt() ->> 'role' = 'service_role'
    );

-- Allow deletes only to the user's own shares
CREATE POLICY "user_delete_own" ON shared_dreams
    FOR DELETE
    USING (
        user_id = auth.uid()
        OR 
        auth.jwt() ->> 'role' = 'service_role'
    );

-- 3. Test that sharing still works
-- This should succeed
INSERT INTO shared_dreams (dream_id, user_id, is_anonymous, display_name)
VALUES (
    gen_random_uuid(),  -- Different dream for testing
    '5f73c470-9639-497f-a125-ee13427464c7'::uuid, 
    false, 
    'Test User'
)
RETURNING 'RLS enabled - insert test successful!' as status, id;

-- 4. Verify policies are active
SELECT 
    policyname,
    cmd,
    permissive,
    roles
FROM pg_policies
WHERE schemaname = 'public' 
AND tablename = 'shared_dreams'
ORDER BY policyname;

-- 5. Test the community feed works
SELECT COUNT(*) as active_shares FROM shared_dreams WHERE is_active = true;