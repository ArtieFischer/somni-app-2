-- Check the actual database schema
-- Run this in your Supabase SQL Editor to see the real column names

-- 1. Check profiles table structure
SELECT 
    'PROFILES TABLE:' as info,
    column_name, 
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'profiles'
ORDER BY ordinal_position;

-- 2. Check dreams table structure  
SELECT 
    'DREAMS TABLE:' as info,
    column_name, 
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'dreams'
ORDER BY ordinal_position;

-- 3. Check if profiles has id or user_id as primary key
SELECT 
    tc.constraint_name, 
    tc.constraint_type, 
    kcu.column_name
FROM information_schema.table_constraints tc 
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name 
    AND tc.table_schema = kcu.table_schema
WHERE tc.table_schema = 'public' 
AND tc.table_name = 'profiles'
AND tc.constraint_type = 'PRIMARY KEY';

-- 4. Check what column names exist in profiles that might be used for display name
SELECT column_name 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'profiles'
AND column_name IN ('full_name', 'username', 'name', 'display_name', 'handle');