-- Diagnostic queries to understand why profiles aren't being created

-- 1. Check the current function definition
SELECT pg_get_functiondef('handle_new_user'::regproc);

-- 2. Check if there are any users without profiles
SELECT 
  au.id as user_id,
  au.email,
  au.created_at as user_created,
  p.user_id as has_profile
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.user_id
WHERE p.user_id IS NULL
ORDER BY au.created_at DESC
LIMIT 10;

-- 3. Check the profiles table structure
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'profiles'
ORDER BY ordinal_position;

-- 4. Check constraints on profiles table
SELECT
  tc.constraint_name,
  tc.constraint_type,
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
  AND tc.table_name = 'profiles';

-- 5. Test creating a profile manually for one of the users without profile
-- (Replace 'USER_ID_HERE' with an actual user ID from query #2)
/*
INSERT INTO public.profiles (
  user_id,
  handle,
  username,
  sex,
  locale,
  is_premium,
  onboarding_complete,
  location_accuracy
) VALUES (
  'USER_ID_HERE',
  'test_user_manual',
  'Test User',
  'unspecified',
  'en',
  false,
  false,
  'none'
);
*/

-- 6. Check if there are any NOT NULL constraints preventing insertion
SELECT 
  column_name,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'profiles'
  AND is_nullable = 'NO'
  AND column_default IS NULL
ORDER BY ordinal_position;