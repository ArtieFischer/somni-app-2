-- Debug script to understand dream sharing issue

-- 1. Check if shared_dreams table exists
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'shared_dreams'
) as table_exists;

-- 2. Check table structure if it exists
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'shared_dreams'
ORDER BY ordinal_position;

-- 3. Check RLS policies
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
WHERE schemaname = 'public' 
AND tablename = 'shared_dreams';

-- 4. Test if we can insert a record (replace with actual IDs)
-- This will help identify constraint issues
/*
INSERT INTO public.shared_dreams (
    dream_id, 
    user_id, 
    is_anonymous, 
    display_name
) VALUES (
    'c77cc6da-0c47-414e-b965-5358e3bdac7c', -- Your dream ID
    '5f73c470-9639-497f-a125-ee13427464c7', -- Your user ID
    true,
    NULL
) RETURNING *;
*/

-- 5. Check if there are any existing shares for this dream
SELECT * FROM public.shared_dreams 
WHERE dream_id = 'c77cc6da-0c47-414e-b965-5358e3bdac7c';

-- 6. Verify the dream exists and belongs to the user
SELECT 
    id,
    user_id,
    title,
    created_at
FROM public.dreams 
WHERE id = 'c77cc6da-0c47-414e-b965-5358e3bdac7c'
AND user_id = '5f73c470-9639-497f-a125-ee13427464c7';

-- 7. Check if there are any constraints that might be causing issues
SELECT
    tc.constraint_name,
    tc.constraint_type,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
LEFT JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.table_schema = 'public'
AND tc.table_name = 'shared_dreams';