-- Fix permissions for shared_dreams table
-- The backend is trying to access the table directly, not through functions

-- 1. Grant proper permissions on the table
GRANT ALL ON shared_dreams TO authenticated;
GRANT SELECT ON shared_dreams TO anon;

-- 2. Also grant permissions on the sequence (for the id column)
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- 3. Check current permissions
SELECT 
    grantee, 
    privilege_type 
FROM information_schema.role_table_grants 
WHERE table_name = 'shared_dreams';

-- 4. Verify RLS policies are correct
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'shared_dreams';

-- 5. Test direct insert (what the backend is trying to do)
-- This simulates the backend's direct table access
INSERT INTO shared_dreams (
    dream_id,
    user_id,
    is_anonymous,
    display_name
) VALUES (
    'c77cc6da-0c47-414e-b965-5358e3bdac7c'::uuid,
    auth.uid(),  -- This will use the current authenticated user
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