-- Migration to fix frontend database integration issues
-- Run this in Supabase SQL Editor

-- Add 'prefer_not_to_say' value to sex_enum to match frontend expectations
-- This allows users to select "prefer not to say" during onboarding
ALTER TYPE sex_enum ADD VALUE IF NOT EXISTS 'prefer_not_to_say';

-- Verify the enum now includes all expected values
-- Should return: male, female, other, unspecified, prefer_not_to_say
SELECT unnest(enum_range(NULL::sex_enum)) as sex_options;

-- Optional: Check current profiles table structure
-- Uncomment to verify the table structure matches expectations
/*
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;
*/

-- Optional: Check if there are any existing profiles that need updating
-- Uncomment to see current data distribution
/*
SELECT 
    sex, 
    COUNT(*) as count 
FROM profiles 
GROUP BY sex;
*/