-- Update the handle_new_user function for simplified signup flow
CREATE OR REPLACE FUNCTION handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (
    user_id, 
    handle,
    username
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
    )
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Ensure the trigger is properly set
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();