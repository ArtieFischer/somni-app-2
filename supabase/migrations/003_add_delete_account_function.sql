-- Create a function for users to delete their own account
-- This will delete the user from auth.users which will cascade delete all their data

CREATE OR REPLACE FUNCTION delete_user_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_id_to_delete uuid;
BEGIN
  -- Get the current user's ID
  user_id_to_delete := auth.uid();
  
  -- Check if user is authenticated
  IF user_id_to_delete IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  
  -- Log the deletion attempt
  RAISE LOG 'User % is deleting their account', user_id_to_delete;
  
  -- Delete from auth.users (this will cascade to profiles and all related data)
  DELETE FROM auth.users WHERE id = user_id_to_delete;
  
  -- If we get here, the deletion was successful
  RAISE LOG 'Successfully deleted user account %', user_id_to_delete;
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Failed to delete account: %', SQLERRM;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION delete_user_account() TO authenticated;

-- Create a more granular function to just delete all dreams
CREATE OR REPLACE FUNCTION delete_all_user_dreams()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  deleted_count integer;
BEGIN
  -- Delete all dreams for the current user
  DELETE FROM dreams 
  WHERE user_id = auth.uid();
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RETURN deleted_count;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION delete_all_user_dreams() TO authenticated;

-- Create a function to delete a specific dream
CREATE OR REPLACE FUNCTION delete_dream(dream_id_param uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  dream_owner uuid;
BEGIN
  -- Check if the dream belongs to the current user
  SELECT user_id INTO dream_owner
  FROM dreams
  WHERE id = dream_id_param;
  
  IF dream_owner IS NULL THEN
    RAISE EXCEPTION 'Dream not found';
  END IF;
  
  IF dream_owner != auth.uid() THEN
    RAISE EXCEPTION 'Unauthorized: You can only delete your own dreams';
  END IF;
  
  -- Delete the dream (will cascade to related tables)
  DELETE FROM dreams WHERE id = dream_id_param;
  
  RETURN true;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION delete_dream(uuid) TO authenticated;