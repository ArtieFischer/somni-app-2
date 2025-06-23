-- Ensure avatars bucket exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Fix avatar storage policies
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can upload own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Public avatar access" ON storage.objects;

-- Create new policies with proper permissions
CREATE POLICY "Users can upload own avatar" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'avatars' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update own avatar" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'avatars' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete own avatar" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'avatars' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Public avatar access" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'avatars');

-- Also ensure authenticated users can select their own avatars
CREATE POLICY "Authenticated users can view avatars" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'avatars');

-- Create a function to clean empty strings in profile updates
CREATE OR REPLACE FUNCTION clean_profile_data()
RETURNS TRIGGER AS $$
BEGIN
  -- Convert empty strings to NULL for date fields
  IF NEW.birth_date = '' THEN
    NEW.birth_date = NULL;
  END IF;
  
  -- Convert empty strings to NULL for other fields
  IF NEW.avatar_url = '' THEN
    NEW.avatar_url = NULL;
  END IF;
  
  IF NEW.locale = '' THEN
    NEW.locale = NULL;
  END IF;
  
  IF NEW.dream_interpreter = '' THEN
    NEW.dream_interpreter = NULL;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to clean data before insert/update
DROP TRIGGER IF EXISTS clean_profile_data_trigger ON profiles;
CREATE TRIGGER clean_profile_data_trigger
  BEFORE INSERT OR UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION clean_profile_data();