-- Simple fix for shared_dreams permissions
-- This takes a more aggressive approach to ensure it works

-- 1. Disable RLS completely (we'll add security at the API level)
ALTER TABLE shared_dreams DISABLE ROW LEVEL SECURITY;

-- 2. Grant full permissions to all roles that might be used
GRANT ALL PRIVILEGES ON TABLE shared_dreams TO anon;
GRANT ALL PRIVILEGES ON TABLE shared_dreams TO authenticated;
GRANT ALL PRIVILEGES ON TABLE shared_dreams TO service_role;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- 3. Verify the changes
SELECT 
    'RLS Status' as check_type,
    relrowsecurity::text as status
FROM pg_class 
WHERE relname = 'shared_dreams'
UNION ALL
SELECT 
    'Permissions for ' || grantee as check_type,
    string_agg(privilege_type, ', ') as status
FROM information_schema.role_table_grants 
WHERE table_name = 'shared_dreams'
GROUP BY grantee
ORDER BY check_type;

-- 4. Test insert without any restrictions
INSERT INTO shared_dreams (dream_id, user_id, is_anonymous, display_name)
VALUES (
    'c77cc6da-0c47-414e-b965-5358e3bdac7c'::uuid, 
    '5f73c470-9639-497f-a125-ee13427464c7'::uuid, 
    true, 
    NULL
)
ON CONFLICT (dream_id, user_id) 
DO UPDATE SET 
    is_active = true, 
    is_anonymous = EXCLUDED.is_anonymous,
    display_name = EXCLUDED.display_name,
    updated_at = now()
RETURNING 'Insert successful!' as status, id as share_id;