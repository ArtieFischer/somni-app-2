-- Migration: Dreams Table Schema Overhaul
-- Date: 2025-01-25
-- Purpose: Restructure dreams table for new features (semantic search, public sharing, improved UX)
-- WARNING: This migration removes several columns. Ensure data is backed up before running.

-- Step 1: Add new columns first (safe operation)
ALTER TABLE dreams
ADD COLUMN IF NOT EXISTS mood smallint CHECK (mood >= 1 AND mood <= 5),
ADD COLUMN IF NOT EXISTS clarity smallint CHECK (clarity >= 1 AND clarity <= 100),
ADD COLUMN IF NOT EXISTS location_metadata jsonb;

-- Step 2: Create indexes for new columns
CREATE INDEX IF NOT EXISTS idx_dreams_mood ON dreams(mood);
CREATE INDEX IF NOT EXISTS idx_dreams_clarity ON dreams(clarity);
CREATE INDEX IF NOT EXISTS idx_dreams_location_metadata ON dreams USING GIN (location_metadata);
CREATE INDEX IF NOT EXISTS idx_dreams_country ON dreams ((location_metadata->>'country'));

-- Step 3: Migrate existing data if needed
-- Migrate mood data (if you want to preserve any existing mood_before/mood_after data)
UPDATE dreams 
SET mood = CASE 
    WHEN mood_after IS NOT NULL THEN GREATEST(1, LEAST(5, (mood_after + 5) / 2))
    WHEN mood_before IS NOT NULL THEN GREATEST(1, LEAST(5, (mood_before + 5) / 2))
    ELSE NULL
END
WHERE mood IS NULL;

-- Migrate location data to metadata (if location column exists)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'dreams' AND column_name = 'location') THEN
        -- This would require PostGIS functions to extract lat/lng if needed
        -- For now, we'll skip automatic migration of point data
        NULL;
    END IF;
END $$;

-- Step 4: Drop old columns
-- WARNING: This permanently removes data. Ensure you have backups!
ALTER TABLE dreams
DROP COLUMN IF EXISTS refined_narrative,
DROP COLUMN IF EXISTS sleep_phase,
DROP COLUMN IF EXISTS mood_before,
DROP COLUMN IF EXISTS mood_after,
DROP COLUMN IF EXISTS location,
DROP COLUMN IF EXISTS location_accuracy,
DROP COLUMN IF EXISTS embedding;

-- Step 5: Add comments for documentation
COMMENT ON COLUMN dreams.mood IS 'Single mood rating from 1-5 for the dream';
COMMENT ON COLUMN dreams.clarity IS 'Dream vividness/clarity rating from 1-100';
COMMENT ON COLUMN dreams.location_metadata IS 'Location data without coordinates: {city, country, country_code, method}';

-- Step 6: Update any views that might reference removed columns
-- (Add any view updates here if needed)

-- Step 7: Verify the changes
DO $$
BEGIN
    RAISE NOTICE 'Migration completed. Current dreams table columns:';
    RAISE NOTICE '%', (
        SELECT string_agg(column_name || ' (' || data_type || ')', ', ' ORDER BY ordinal_position)
        FROM information_schema.columns
        WHERE table_name = 'dreams'
    );
END $$;