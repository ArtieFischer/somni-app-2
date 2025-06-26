-- =====================================================================
-- Rollback Script for Update Interpreters Migration
-- Date: 2025-01-26
-- Description: Reverts the interpreter IDs back to original values
-- =====================================================================

-- Disable foreign key constraints temporarily
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_dream_interpreter_fkey;
ALTER TABLE interpretations DROP CONSTRAINT IF EXISTS interpretations_interpreter_id_fkey;
ALTER TABLE conversations DROP CONSTRAINT IF EXISTS conversations_interpreter_id_fkey;

-- Delete current interpreters
DELETE FROM interpreters;

-- Restore original interpreters with old IDs
INSERT INTO interpreters (id, name, full_name, description, image_url, interpretation_style) VALUES
  ('carl', 'Carl', 'Carl Jung', 'Explores collective unconscious and universal archetypes in your dreams', '/storage/v1/object/public/interpreters/carl.jpg', '{"approach": "jungian", "focus": ["archetypes", "collective_unconscious", "individuation"]}'),
  ('sigmund', 'Sigmund', 'Sigmund Freud', 'Analyzes dreams as wish fulfillment and unconscious desires', '/storage/v1/object/public/interpreters/sigmund.jpg', '{"approach": "freudian", "focus": ["wish_fulfillment", "unconscious_desires", "symbolism"]}'),
  ('lakshmi', 'Lakshmi', 'Lakshmi Devi', 'Interprets dreams through spiritual and karmic perspectives', '/storage/v1/object/public/interpreters/lakshmi.jpg', '{"approach": "spiritual", "focus": ["karma", "spiritual_growth", "consciousness"]}'),
  ('mary', 'Mary', 'Mary Whiton', 'Uses modern cognitive science to understand dream meanings', '/storage/v1/object/public/interpreters/mary.jpg', '{"approach": "cognitive", "focus": ["memory_processing", "problem_solving", "neuroscience"]}');

-- Revert references in other tables
UPDATE profiles SET dream_interpreter = 'carl' WHERE dream_interpreter = 'jung';
UPDATE profiles SET dream_interpreter = 'sigmund' WHERE dream_interpreter = 'freud';

UPDATE interpretations SET interpreter_id = 'carl' WHERE interpreter_id = 'jung';
UPDATE interpretations SET interpreter_id = 'sigmund' WHERE interpreter_id = 'freud';

UPDATE conversations SET interpreter_id = 'carl' WHERE interpreter_id = 'jung';
UPDATE conversations SET interpreter_id = 'sigmund' WHERE interpreter_id = 'freud';

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

-- Verify the rollback
DO $$
DECLARE
    interpreter_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO interpreter_count FROM interpreters;
    RAISE NOTICE 'Total interpreters after rollback: %', interpreter_count;
    
    -- Show the restored data
    RAISE NOTICE 'Restored interpreters:';
    FOR r IN SELECT id, name, full_name, image_url FROM interpreters ORDER BY id
    LOOP
        RAISE NOTICE 'ID: %, Name: %, Full Name: %, Image: %', r.id, r.name, r.full_name, r.image_url;
    END LOOP;
END $$;