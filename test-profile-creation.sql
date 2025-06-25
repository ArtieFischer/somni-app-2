-- Test if profile creation trigger exists and works

-- Check if trigger exists
SELECT 
  trigger_name, 
  event_manipulation, 
  event_object_table, 
  action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- Check if function exists
SELECT 
  routine_name, 
  routine_type,
  external_language,
  security_type
FROM information_schema.routines 
WHERE routine_name = 'handle_new_user';

-- Check profiles table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;

-- Check existing profiles count
SELECT COUNT(*) as profile_count FROM profiles;

-- Check users without profiles
SELECT 
  au.id, 
  au.email, 
  au.created_at,
  p.user_id as has_profile
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.user_id
WHERE p.user_id IS NULL
LIMIT 10;