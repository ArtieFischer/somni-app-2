-- Diagnostic script to check profile permissions and policies

-- 1. Check if RLS is enabled on profiles table
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'profiles';

-- 2. Check existing RLS policies on profiles table
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
WHERE tablename = 'profiles'
ORDER BY policyname;

-- 3. Check what permissions authenticated users have
SELECT 
    grantor,
    grantee,
    table_schema,
    table_name,
    privilege_type,
    is_grantable
FROM information_schema.table_privileges
WHERE table_name = 'profiles' 
    AND grantee IN ('authenticated', 'anon', 'service_role')
ORDER BY grantee, privilege_type;

-- 4. Check if trigger exists and is enabled
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement,
    action_timing,
    action_orientation
FROM information_schema.triggers
WHERE event_object_table = 'users'
    AND event_object_schema = 'auth';

-- 5. Check for users without profiles
SELECT 
    au.id as user_id,
    au.email,
    au.created_at as user_created,
    p.user_id as profile_exists
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.user_id
WHERE p.user_id IS NULL
ORDER BY au.created_at DESC;

-- 6. Test if current user has various policies
SELECT 
    'profiles' as table_name,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE tablename = 'profiles' 
            AND cmd = 'INSERT'
            AND roles @> ARRAY['authenticated']::name[]
        ) THEN '✅ INSERT'
        ELSE '❌ INSERT'
    END as insert_policy,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE tablename = 'profiles' 
            AND cmd = 'DELETE'
            AND roles @> ARRAY['authenticated']::name[]
        ) THEN '✅ DELETE'
        ELSE '❌ DELETE'
    END as delete_policy
UNION ALL
SELECT 
    'dreams' as table_name,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE tablename = 'dreams' 
            AND cmd = 'INSERT'
            AND roles @> ARRAY['authenticated']::name[]
        ) THEN '✅ INSERT'
        ELSE '❌ INSERT'
    END as insert_policy,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE tablename = 'dreams' 
            AND cmd = 'DELETE'
            AND roles @> ARRAY['authenticated']::name[]
        ) THEN '✅ DELETE'
        ELSE '❌ DELETE'
    END as delete_policy;