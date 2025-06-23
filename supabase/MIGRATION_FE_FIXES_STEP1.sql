-- STEP 1: Add new enum value for sex_enum
-- This must be run separately from other operations due to PostgreSQL transaction safety

-- Add 'prefer_not_to_say' value to sex_enum
ALTER TYPE sex_enum ADD VALUE 'prefer_not_to_say';

-- Verify the enum now includes all expected values
SELECT unnest(enum_range(NULL::sex_enum)) as sex_options;