-- Check current onboarding status for all users
SELECT 
    user_id,
    handle,
    username,
    onboarding_complete,
    created_at,
    updated_at
FROM profiles
ORDER BY created_at DESC;

-- If you need to reset onboarding for a specific user (replace 'YOUR_USER_ID' with actual ID)
-- UPDATE profiles 
-- SET onboarding_complete = false 
-- WHERE user_id = 'YOUR_USER_ID';

-- Or reset onboarding for the most recently created user
UPDATE profiles 
SET onboarding_complete = false 
WHERE user_id = (
    SELECT user_id 
    FROM profiles 
    ORDER BY created_at DESC 
    LIMIT 1
);

-- Verify the update
SELECT 
    user_id,
    handle,
    username,
    onboarding_complete,
    created_at
FROM profiles
ORDER BY created_at DESC
LIMIT 1;