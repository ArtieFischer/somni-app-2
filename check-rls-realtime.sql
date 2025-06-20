-- Check if RLS is enabled on dreams table
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM 
    pg_tables
WHERE 
    schemaname = 'public' 
    AND tablename = 'dreams';

-- Check RLS policies on dreams table
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM 
    pg_policies
WHERE 
    schemaname = 'public' 
    AND tablename = 'dreams'
ORDER BY 
    policyname;

-- Check if user can select from dreams (this affects realtime)
-- Replace 'YOUR_USER_ID' with your actual user ID
SELECT COUNT(*) as accessible_dreams
FROM dreams
WHERE user_id = 'YOUR_USER_ID';

-- Check current user permissions
SELECT current_user, current_role;