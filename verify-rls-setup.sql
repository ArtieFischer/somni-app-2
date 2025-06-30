-- Verify RLS is properly configured

-- 1. Check if RLS is enabled
SELECT 
    relname as table_name,
    relrowsecurity as rls_enabled
FROM pg_class 
WHERE relname = 'shared_dreams';

-- 2. List all active policies
SELECT 
    policyname,
    cmd as operation,
    roles,
    CASE 
        WHEN qual IS NULL THEN 'No USING clause'
        ELSE 'Has USING clause'
    END as using_clause,
    CASE 
        WHEN with_check IS NULL THEN 'No WITH CHECK clause'
        ELSE 'Has WITH CHECK clause'
    END as check_clause
FROM pg_policies
WHERE schemaname = 'public' 
AND tablename = 'shared_dreams'
ORDER BY policyname;

-- 3. Test sharing with an actual dream (from the app)
-- The app should now work with RLS enabled

-- 4. Check recently shared dreams
SELECT 
    sd.id,
    sd.is_anonymous,
    sd.display_name,
    sd.is_active,
    sd.shared_at,
    d.title as dream_title
FROM shared_dreams sd
JOIN dreams d ON d.id = sd.dream_id
ORDER BY sd.shared_at DESC
LIMIT 5;