-- Emergency fix: Restore location_accuracy column after accidental drop
-- Run this to fix the deleted column

-- Check what enum values currently exist
-- SELECT unnest(enum_range(NULL::loc_accuracy_enum));

-- Add 'manual' to existing enum if it doesn't exist
-- (This might fail if 'manual' already exists - that's OK)
DO $$ 
BEGIN
    ALTER TYPE loc_accuracy_enum ADD VALUE 'manual';
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add the location_accuracy column back to profiles table
ALTER TABLE profiles 
ADD COLUMN location_accuracy loc_accuracy_enum DEFAULT 'none' NOT NULL;

-- Set reasonable defaults based on existing location data
-- If they have location_country or location_city, assume manual
-- If they have location coordinates, assume exact
-- Otherwise, default to none

UPDATE profiles 
SET location_accuracy = CASE
  WHEN location IS NOT NULL THEN 'exact'::loc_accuracy_enum
  WHEN location_country IS NOT NULL OR location_city IS NOT NULL THEN 'manual'::loc_accuracy_enum
  ELSE 'none'::loc_accuracy_enum
END;

-- Verify the column was created properly
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'profiles' AND column_name = 'location_accuracy';