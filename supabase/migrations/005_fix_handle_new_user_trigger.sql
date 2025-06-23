-- Fix the handle_new_user trigger to use SECURITY DEFINER
-- This allows the trigger to bypass RLS when creating profiles

-- First, drop the existing trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Recreate the function with SECURITY DEFINER
CREATE OR REPLACE FUNCTION handle_new_user() 
RETURNS trigger 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql 
AS $$
BEGIN
  INSERT INTO public.profiles (
    user_id, 
    handle,
    username,
    sex,
    locale
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
    COALESCE(
      (new.raw_user_meta_data->>'sex')::sex_enum,
      'unspecified'::sex_enum
    ),
    COALESCE(new.raw_user_meta_data->>'locale', 'en')
  );
  RETURN new;
EXCEPTION
  WHEN unique_violation THEN
    -- If handle already exists, append a random suffix
    INSERT INTO public.profiles (
      user_id, 
      handle,
      username,
      sex,
      locale
    )
    VALUES (
      new.id,
      COALESCE(
        new.raw_user_meta_data->>'handle', 
        new.raw_user_meta_data->>'username', 
        'user'
      ) || '_' || substring(md5(random()::text), 1, 6),
      COALESCE(
        new.raw_user_meta_data->>'display_name', 
        new.raw_user_meta_data->>'full_name', 
        new.raw_user_meta_data->>'username'
      ),
      COALESCE(
        (new.raw_user_meta_data->>'sex')::sex_enum,
        'unspecified'::sex_enum
      ),
      COALESCE(new.raw_user_meta_data->>'locale', 'en')
    );
    RETURN new;
  WHEN OTHERS THEN
    -- Log the error for debugging
    RAISE LOG 'Error in handle_new_user: % %', SQLERRM, SQLSTATE;
    -- Re-raise the exception
    RAISE;
END;
$$;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Also ensure the service role can insert into profiles
-- (This should already exist but let's make sure)
GRANT INSERT ON public.profiles TO service_role;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO service_role;