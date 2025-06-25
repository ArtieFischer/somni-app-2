-- Fix profile creation issues for both new and existing users

-- First, let's check and fix permissions
DO $$
BEGIN
  -- Check if authenticated users have INSERT permission
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_privileges
    WHERE table_name = 'profiles' 
    AND grantee = 'authenticated'
    AND privilege_type = 'INSERT'
  ) THEN
    GRANT INSERT ON profiles TO authenticated;
    RAISE NOTICE 'Granted INSERT permission to authenticated users';
  END IF;
END $$;

-- Create or replace the INSERT policy
DO $$
BEGIN
  -- Drop existing insert policy if it exists
  DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
  
  -- Create policy allowing users to insert their own profile
  CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);
    
  RAISE NOTICE 'Created INSERT policy for authenticated users';
END $$;

-- Create profiles for existing users who don't have one
INSERT INTO profiles (
  user_id,
  handle,
  username,
  sex,
  locale,
  is_premium,
  onboarding_complete,
  location_accuracy,
  settings,
  created_at,
  updated_at
)
SELECT 
  au.id,
  'user_' || substring(au.id::text, 1, 8),
  COALESCE(
    au.raw_user_meta_data->>'display_name',
    au.raw_user_meta_data->>'full_name',
    au.raw_user_meta_data->>'username',
    au.email
  ),
  'unspecified'::sex_enum,
  COALESCE(au.raw_user_meta_data->>'locale', 'en'),
  false,
  false,
  'none'::loc_accuracy_enum,
  '{
    "location_sharing": "none",
    "sleep_schedule": null,
    "improve_sleep_quality": null,
    "interested_in_lucid_dreaming": null
  }'::jsonb,
  au.created_at,
  au.created_at
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.user_id
WHERE p.user_id IS NULL;

-- Update the trigger function to be more robust
CREATE OR REPLACE FUNCTION handle_new_user() 
RETURNS trigger 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  default_handle text;
BEGIN
  -- Check if profile already exists
  IF EXISTS (SELECT 1 FROM profiles WHERE user_id = new.id) THEN
    RETURN new;
  END IF;

  -- Generate a unique handle if not provided
  default_handle := COALESCE(
    new.raw_user_meta_data->>'handle', 
    new.raw_user_meta_data->>'username', 
    'user_' || substring(new.id::text, 1, 8)
  );
  
  -- Ensure handle is unique by adding a suffix if needed
  WHILE EXISTS (SELECT 1 FROM profiles WHERE handle = default_handle) LOOP
    default_handle := default_handle || '_' || substring(md5(random()::text), 1, 4);
  END LOOP;

  INSERT INTO public.profiles (
    user_id, 
    handle,
    username,
    sex,
    locale,
    is_premium,
    onboarding_complete,
    location_accuracy,
    settings,
    created_at,
    updated_at
  )
  VALUES (
    new.id,
    default_handle,
    COALESCE(
      new.raw_user_meta_data->>'display_name', 
      new.raw_user_meta_data->>'full_name', 
      new.raw_user_meta_data->>'username'
    ),
    COALESCE(
      (new.raw_user_meta_data->>'sex')::sex_enum,
      'unspecified'::sex_enum
    ),
    COALESCE(new.raw_user_meta_data->>'locale', 'en'),
    false,
    false,
    'none'::loc_accuracy_enum,
    '{
      "location_sharing": "none",
      "sleep_schedule": null,
      "improve_sleep_quality": null,
      "interested_in_lucid_dreaming": null
    }'::jsonb,
    now(),
    now()
  );
  
  RETURN new;
EXCEPTION
  WHEN unique_violation THEN
    -- If there's still a unique violation, log it and continue
    RAISE LOG 'handle_new_user: unique violation for user %', new.id;
    RETURN new;
  WHEN OTHERS THEN
    -- Log other errors but don't fail the auth signup
    RAISE LOG 'handle_new_user error: % %', SQLERRM, SQLSTATE;
    RETURN new;
END;
$$ LANGUAGE plpgsql;

-- Ensure the trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();