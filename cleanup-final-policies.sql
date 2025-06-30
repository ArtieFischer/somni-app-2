-- Clean up and finalize the shared_dreams policies

-- 1. Remove the overly permissive testing policy
DROP POLICY IF EXISTS "Allow all operations for testing" ON shared_dreams;

-- 2. Verify final policy setup
SELECT 
    policyname,
    cmd as operation,
    roles,
    qual IS NOT NULL as has_using_clause,
    with_check IS NOT NULL as has_check_clause
FROM pg_policies
WHERE tablename = 'shared_dreams'
ORDER BY policyname;

-- 3. Summary of what each policy does:
SELECT 
    'public_read_active_shares' as policy,
    'Allows anyone to view active shared dreams' as purpose
UNION ALL
SELECT 
    'authenticated_insert',
    'Allows authenticated users to share dreams'
UNION ALL
SELECT 
    'service_role_all',
    'Allows backend service full access'
UNION ALL
SELECT 
    'user_update_own',
    'Users can update their own shares'
UNION ALL
SELECT 
    'user_delete_own',
    'Users can delete their own shares';

-- 4. Test that sharing still works after cleanup
-- Try sharing a dream from the app one more time