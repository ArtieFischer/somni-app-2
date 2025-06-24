-- Emergency Fix: Add missing location_accuracy column to dreams table
-- This is a temporary fix to unblock transcription functionality
-- This column will be removed in the main migration (20250125_dreams_table_overhaul.sql)

-- Add location_accuracy column to dreams table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'dreams' AND column_name = 'location_accuracy') THEN
        ALTER TABLE dreams 
        ADD COLUMN location_accuracy loc_accuracy_enum DEFAULT 'none';
        
        RAISE NOTICE 'Added location_accuracy column to dreams table';
    ELSE
        RAISE NOTICE 'location_accuracy column already exists in dreams table';
    END IF;
END $$;

-- Also ensure the location column exists if the types expect it
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'dreams' AND column_name = 'location') THEN
        -- Only add if PostGIS is available
        IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'postgis') THEN
            ALTER TABLE dreams 
            ADD COLUMN location geography(Point, 4326);
            
            RAISE NOTICE 'Added location column to dreams table';
        END IF;
    END IF;
END $$;