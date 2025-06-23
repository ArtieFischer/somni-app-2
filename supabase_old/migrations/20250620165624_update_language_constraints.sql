-- Update language constraint to support all ElevenLabs supported languages
-- Removes the previous constraint that only allowed 'en'

-- First, drop the existing constraint
ALTER TABLE users_profile 
DROP CONSTRAINT IF EXISTS users_profile_language_check;

-- Add new constraint with all supported language codes (2-letter ISO codes)
ALTER TABLE users_profile 
ADD CONSTRAINT users_profile_language_check 
CHECK (language IN (
  'en', -- English
  'es', -- Spanish
  'fr', -- French
  'de', -- German
  'it', -- Italian
  'pt', -- Portuguese
  'pl', -- Polish
  'zh', -- Chinese
  'ja', -- Japanese
  'ko', -- Korean
  'hi', -- Hindi
  'ar', -- Arabic
  'ru', -- Russian
  'tr', -- Turkish
  'nl', -- Dutch
  'sv', -- Swedish
  'da', -- Danish
  'no', -- Norwegian
  'fi'  -- Finnish
));

-- Add comment explaining the language codes
COMMENT ON COLUMN users_profile.language IS 'User preferred language for transcription. Uses 2-letter ISO codes that are mapped to 3-letter codes for ElevenLabs API.';