-- Enhanced user profiles migration
-- Adds new fields for comprehensive account creation flow

-- Add new columns to users_profile table
ALTER TABLE users_profile 
ADD COLUMN IF NOT EXISTS sex text CHECK (sex IN ('male', 'female', 'other', 'prefer_not_to_say'));

ALTER TABLE users_profile 
ADD COLUMN IF NOT EXISTS date_of_birth date;

ALTER TABLE users_profile 
ADD COLUMN IF NOT EXISTS language text DEFAULT 'en' CHECK (language IN ('en'));

ALTER TABLE users_profile 
ADD COLUMN IF NOT EXISTS dream_interpreter text CHECK (dream_interpreter IN ('carl', 'sigmund', 'lakshmi', 'mary'));

ALTER TABLE users_profile 
ADD COLUMN IF NOT EXISTS improve_sleep_quality text CHECK (improve_sleep_quality IN ('yes', 'no', 'not_sure'));

ALTER TABLE users_profile 
ADD COLUMN IF NOT EXISTS interested_in_lucid_dreaming text CHECK (interested_in_lucid_dreaming IN ('yes', 'no', 'dont_know_yet'));

-- Create dream_interpreters table
CREATE TABLE IF NOT EXISTS dream_interpreters (
  id text PRIMARY KEY,
  name text NOT NULL,
  full_name text NOT NULL,
  description text NOT NULL,
  image_url text NOT NULL,
  interpretation_style jsonb NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Insert the 4 dream interpreters
INSERT INTO dream_interpreters (id, name, full_name, description, image_url, interpretation_style) VALUES
  ('carl', 'Carl', 'Carl Jung', 'Explores collective unconscious and universal archetypes in your dreams', '/storage/v1/object/public/interpreters/carl.jpg', '{"approach": "jungian", "focus": ["archetypes", "collective_unconscious", "individuation"]}'),
  ('sigmund', 'Sigmund', 'Sigmund Freud', 'Analyzes dreams as wish fulfillment and unconscious desires', '/storage/v1/object/public/interpreters/sigmund.jpg', '{"approach": "freudian", "focus": ["wish_fulfillment", "unconscious_desires", "symbolism"]}'),
  ('lakshmi', 'Lakshmi', 'Lakshmi Devi', 'Interprets dreams through spiritual and karmic perspectives', '/storage/v1/object/public/interpreters/lakshmi.jpg', '{"approach": "spiritual", "focus": ["karma", "spiritual_growth", "consciousness"]}'),
  ('mary', 'Mary', 'Mary Whiton', 'Uses modern cognitive science to understand dream meanings', '/storage/v1/object/public/interpreters/mary.jpg', '{"approach": "cognitive", "focus": ["memory_processing", "problem_solving", "neuroscience"]}')
ON CONFLICT (id) DO NOTHING;

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('interpreters', 'interpreters', true)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for dream_interpreters table
ALTER TABLE dream_interpreters ENABLE ROW LEVEL SECURITY;

-- Everyone can read dream interpreters
CREATE POLICY "Public read access to dream interpreters" ON dream_interpreters
  FOR SELECT USING (true);

-- Storage policies for avatars
CREATE POLICY "Users can upload own avatar" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update own avatar" ON storage.objects
  FOR UPDATE WITH CHECK (
    bucket_id = 'avatars' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete own avatar" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'avatars' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Public avatar access" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

-- Storage policies for interpreter images (public read only)
CREATE POLICY "Public interpreter images" ON storage.objects
  FOR SELECT USING (bucket_id = 'interpreters');

-- Update the user creation trigger to handle new fields
CREATE OR REPLACE FUNCTION handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users_profile (id, username, display_name)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'username', 'user_' || substring(new.id::text, 1, 8)),
    COALESCE(new.raw_user_meta_data->>'display_name', new.raw_user_meta_data->>'full_name', '')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;