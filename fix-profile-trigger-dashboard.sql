-- Run this in Supabase Dashboard SQL Editor to fix profile creation trigger
-- You need to be logged in as admin/postgres user

-- First check if the trigger exists
SELECT 
  n.nspname as schema_name,
  t.tgname as trigger_name,
  p.proname as function_name,
  t.tgenabled as is_enabled
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE c.relname = 'users' 
  AND n.nspname = 'auth'
  AND t.tgname = 'on_auth_user_created';

-- If trigger doesn't exist or is disabled, create/enable it:
-- Note: Run this only if the above query returns no results or shows is_enabled = false

-- The function should already exist from migrations, but let's ensure it's correct
CREATE OR REPLACE FUNCTION handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (
    user_id, 
    handle,
    username,
    sex,
    locale,
    is_premium,
    onboarding_complete,
    location_accuracy
  )
  VALUES (
    new.id,
    COALESCE(
      new.raw_user_meta_data->>'handle', 
      new.raw_user_meta_data->>'username', 
      'user_' || substring(new.id::text, 1, 8)
    ),
    COALESCE(
      new.raw_user_meta_data->>'display_name', 
      new.raw_user_meta_data->>'full_name', 
      new.raw_user_meta_data->>'username'
    ),
    COALESCE(new.raw_user_meta_data->>'sex', 'unspecified'),
    COALESCE(new.raw_user_meta_data->>'locale', 'en'),
    false,
    false,
    'none'
  )
  ON CONFLICT (user_id) DO UPDATE SET
    handle = EXCLUDED.handle,
    username = EXCLUDED.username,
    updated_at = now();
  
  RETURN new;
EXCEPTION
  WHEN others THEN
    -- Log the error but don't fail the signup
    RAISE LOG 'Error in handle_new_user: %', SQLERRM;
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger (only if it doesn't exist)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();