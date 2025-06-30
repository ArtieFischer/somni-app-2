-- Fix for backend that needs to specify user_id directly
-- The backend is using service role which doesn't have auth.uid()

-- 1. First, let's verify the issue by checking auth context
SELECT 
    auth.uid() as auth_user_id,
    auth.role() as auth_role,
    current_user as db_user;

-- 2. Create a modified RLS policy that allows service role to insert with explicit user_id
DROP POLICY IF EXISTS "Service role can manage shared dreams" ON shared_dreams;

CREATE POLICY "Service role can manage all shared dreams" ON shared_dreams
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- 3. Also update the insert policy to handle both cases
DROP POLICY IF EXISTS "Users can share their own dreams" ON shared_dreams;

CREATE POLICY "Users can share their own dreams" ON shared_dreams
    FOR INSERT
    TO authenticated
    WITH CHECK (
        -- Either the user is sharing their own dream (auth.uid() = user_id)
        (auth.uid() = user_id AND EXISTS (
            SELECT 1 FROM dreams 
            WHERE dreams.id = dream_id 
            AND dreams.user_id = auth.uid()
        ))
        OR
        -- Or it's the service role (backend) sharing on behalf of a user
        (auth.role() = 'service_role' AND EXISTS (
            SELECT 1 FROM dreams 
            WHERE dreams.id = dream_id 
            AND dreams.user_id = shared_dreams.user_id
        ))
    );

-- 4. Test the insert with explicit user_id (what backend is doing)
INSERT INTO shared_dreams (
    dream_id,
    user_id,
    is_anonymous,
    display_name
) VALUES (
    'c77cc6da-0c47-414e-b965-5358e3bdac7c'::uuid,
    '5f73c470-9639-497f-a125-ee13427464c7'::uuid,  -- Explicit user_id from backend
    true,
    NULL
) 
ON CONFLICT (dream_id, user_id) 
DO UPDATE SET
    is_anonymous = EXCLUDED.is_anonymous,
    display_name = EXCLUDED.display_name,
    is_active = true,
    updated_at = now()
RETURNING *;

-- 5. Verify the policies
SELECT 
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE tablename = 'shared_dreams'
ORDER BY policyname;