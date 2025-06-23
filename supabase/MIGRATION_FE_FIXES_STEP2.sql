-- STEP 2: Verify database structure and check for any data inconsistencies
-- Run this AFTER Step 1 is completed

-- Check current profiles table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check current sex enum values
SELECT unnest(enum_range(NULL::sex_enum)) as sex_options;

-- Check current location accuracy enum values  
SELECT unnest(enum_range(NULL::loc_accuracy_enum)) as location_accuracy_options;

-- Check interpreters table exists and has data
SELECT id, name, full_name FROM interpreters ORDER BY id;

-- Check current profiles data to see what might be inconsistent
SELECT 
    user_id,
    handle,
    username,
    sex,
    birth_date,
    locale,
    dream_interpreter,
    is_premium,
    onboarding_complete,
    location_accuracy,
    settings,
    created_at
FROM profiles 
LIMIT 5;

-- Check settings JSONB structure in existing profiles
SELECT 
    user_id,
    settings->'improve_sleep_quality' as improve_sleep_quality_value,
    settings->'interested_in_lucid_dreaming' as interested_in_lucid_dreaming_value,
    settings->'location_sharing' as location_sharing_value
FROM profiles 
WHERE settings IS NOT NULL
LIMIT 5;