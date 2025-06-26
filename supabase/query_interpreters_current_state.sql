-- Query to check the current state of interpreters table
-- Run this query to see what's currently in the interpreters table

-- 1. Check if table exists and show all data
SELECT * FROM interpreters ORDER BY id;

-- 2. Check the structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'interpreters'
ORDER BY ordinal_position;

-- 3. Check RLS status
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE schemaname = 'public' 
AND tablename = 'interpreters';

-- 4. Check if the image URLs are accessible
-- This will show the current image URLs and whether they need updating
SELECT 
    id,
    name,
    full_name,
    image_url,
    CASE 
        WHEN image_url LIKE '%/storage/v1/object/public/interpreters/%' THEN 'Supabase Storage URL'
        WHEN image_url LIKE '%assets/%' THEN 'Local Assets URL'
        ELSE 'Other URL Format'
    END as url_type
FROM interpreters;