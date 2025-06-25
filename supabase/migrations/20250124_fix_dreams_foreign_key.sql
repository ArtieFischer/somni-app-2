-- Temporarily disable the foreign key constraint on dreams table
-- This allows dreams to be created even if profile doesn't exist yet

-- Drop the existing foreign key constraint
ALTER TABLE dreams DROP CONSTRAINT IF EXISTS dreams_user_id_fkey;

-- Add a new foreign key that allows missing profiles (ON DELETE CASCADE)
ALTER TABLE dreams 
  ADD CONSTRAINT dreams_user_id_fkey 
  FOREIGN KEY (user_id) 
  REFERENCES auth.users(id) 
  ON DELETE CASCADE;

-- Note: The profile creation should be handled by the existing trigger on auth.users
-- If that trigger is not working, it needs to be fixed in the Supabase dashboard
-- as we cannot modify triggers on auth.users from migrations