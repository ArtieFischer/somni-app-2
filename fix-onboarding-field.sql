-- Fix onboarding field for existing users
-- This script updates the onboarding_complete field to false for users who haven't completed onboarding

-- First, let's check what columns exist in the profiles table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'profiles'
AND column_name LIKE 'onboarding%';

-- Check current user's onboarding status
SELECT 
    user_id,
    handle,
    username,
    onboarding_complete,
    created_at,
    updated_at
FROM profiles
WHERE user_id = auth.uid();

-- If you need to manually reset onboarding to see the onboarding flow:
-- UPDATE profiles 
-- SET onboarding_complete = false,
--     updated_at = now()
-- WHERE user_id = auth.uid();

-- To set onboarding as complete:
-- UPDATE profiles 
-- SET onboarding_complete = true,
--     updated_at = now()
-- WHERE user_id = auth.uid();