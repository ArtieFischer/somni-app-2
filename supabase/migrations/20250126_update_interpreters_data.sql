-- =====================================================================
-- Migration: Update Interpreters Table with Correct IDs and Image URLs
-- Date: 2025-01-26
-- Description: Updates interpreter IDs and image URLs to match available assets
-- 
-- Current state:
-- - IDs: carl, sigmund, lakshmi, mary
-- - Image URLs: /storage/v1/object/public/interpreters/{id}.jpg
-- 
-- Target state:
-- - IDs: jung, freud, lakshmi, mary (carl->jung, sigmund->freud)
-- - Image URLs: /storage/v1/object/public/interpreters/{id}.png
-- =====================================================================

-- First, let's check what we currently have
DO $$
BEGIN
    RAISE NOTICE 'Current interpreters in the table:';
END $$;

-- Update the interpreters table with correct data
-- The IDs should match the image filenames we found in /assets/
-- Image files found: freud.png, jung.png, lakshmi.png, mary.png

-- Since we're updating primary keys, we need to handle this carefully
-- First, disable foreign key constraints temporarily
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_dream_interpreter_fkey;
ALTER TABLE interpretations DROP CONSTRAINT IF EXISTS interpretations_interpreter_id_fkey;
ALTER TABLE conversations DROP CONSTRAINT IF EXISTS conversations_interpreter_id_fkey;

-- Delete existing interpreters
DELETE FROM interpreters;

-- Insert interpreters with correct IDs and Supabase Storage URLs
-- Using .png files that were uploaded to the interpreters bucket
-- Current URLs use .jpg but we're updating to .png as per user's upload
INSERT INTO interpreters (id, name, full_name, description, image_url, interpretation_style) VALUES
  ('jung', 'Carl', 'Carl Jung', 'Explores collective unconscious and universal archetypes in your dreams', '/storage/v1/object/public/interpreters/jung.png', '{"approach": "jungian", "focus": ["archetypes", "collective_unconscious", "individuation"]}'),
  ('freud', 'Sigmund', 'Sigmund Freud', 'Analyzes dreams as wish fulfillment and unconscious desires', '/storage/v1/object/public/interpreters/freud.png', '{"approach": "freudian", "focus": ["wish_fulfillment", "unconscious_desires", "symbolism"]}'),
  ('lakshmi', 'Lakshmi', 'Lakshmi Devi', 'Interprets dreams through spiritual and karmic perspectives', '/storage/v1/object/public/interpreters/lakshmi.png', '{"approach": "spiritual", "focus": ["karma", "spiritual_growth", "consciousness"]}'),
  ('mary', 'Mary', 'Mary Whiton', 'Uses modern cognitive science to understand dream meanings', '/storage/v1/object/public/interpreters/mary.png', '{"approach": "cognitive", "focus": ["memory_processing", "problem_solving", "neuroscience"]}');

-- Update any existing references in other tables
-- Update profiles table
UPDATE profiles SET dream_interpreter = 'jung' WHERE dream_interpreter = 'carl';
UPDATE profiles SET dream_interpreter = 'freud' WHERE dream_interpreter = 'sigmund';

-- Update interpretations table
UPDATE interpretations SET interpreter_id = 'jung' WHERE interpreter_id = 'carl';
UPDATE interpretations SET interpreter_id = 'freud' WHERE interpreter_id = 'sigmund';

-- Update conversations table
UPDATE conversations SET interpreter_id = 'jung' WHERE interpreter_id = 'carl';
UPDATE conversations SET interpreter_id = 'freud' WHERE interpreter_id = 'sigmund';

-- Re-add foreign key constraints
ALTER TABLE profiles 
  ADD CONSTRAINT profiles_dream_interpreter_fkey 
  FOREIGN KEY (dream_interpreter) 
  REFERENCES interpreters(id);

ALTER TABLE interpretations 
  ADD CONSTRAINT interpretations_interpreter_id_fkey 
  FOREIGN KEY (interpreter_id) 
  REFERENCES interpreters(id);

ALTER TABLE conversations 
  ADD CONSTRAINT conversations_interpreter_id_fkey 
  FOREIGN KEY (interpreter_id) 
  REFERENCES interpreters(id);

-- Verify the update
DO $$
DECLARE
    interpreter_count INTEGER;
    r RECORD;
BEGIN
    SELECT COUNT(*) INTO interpreter_count FROM interpreters;
    RAISE NOTICE 'Total interpreters after update: %', interpreter_count;
    
    -- Show the updated data
    RAISE NOTICE 'Updated interpreters:';
    FOR r IN SELECT id, name, full_name, image_url FROM interpreters ORDER BY id
    LOOP
        RAISE NOTICE 'ID: %, Name: %, Full Name: %, Image: %', r.id, r.name, r.full_name, r.image_url;
    END LOOP;
END $$;

-- Alternative approach: If you want to use Supabase Storage instead of local assets
-- Uncomment the following section and comment out the INSERT above

/*
-- Insert interpreters with Supabase Storage URLs
INSERT INTO interpreters (id, name, full_name, description, image_url, interpretation_style) VALUES
  ('jung', 'Carl', 'Carl Jung', 'Explores collective unconscious and universal archetypes in your dreams', '/storage/v1/object/public/interpreters/jung.png', '{"approach": "jungian", "focus": ["archetypes", "collective_unconscious", "individuation"]}'),
  ('freud', 'Sigmund', 'Sigmund Freud', 'Analyzes dreams as wish fulfillment and unconscious desires', '/storage/v1/object/public/interpreters/freud.png', '{"approach": "freudian", "focus": ["wish_fulfillment", "unconscious_desires", "symbolism"]}'),
  ('lakshmi', 'Lakshmi', 'Lakshmi Devi', 'Interprets dreams through spiritual and karmic perspectives', '/storage/v1/object/public/interpreters/lakshmi.png', '{"approach": "spiritual", "focus": ["karma", "spiritual_growth", "consciousness"]}'),
  ('mary', 'Mary', 'Mary Whiton', 'Uses modern cognitive science to understand dream meanings', '/storage/v1/object/public/interpreters/mary.png', '{"approach": "cognitive", "focus": ["memory_processing", "problem_solving", "neuroscience"]}');
*/

-- Note: After running this migration, you'll need to:
-- 1. Upload the interpreter images to Supabase Storage if using the Storage approach
-- 2. Update your frontend code to handle the new image URLs
-- 3. Test that all interpreter images are displaying correctly