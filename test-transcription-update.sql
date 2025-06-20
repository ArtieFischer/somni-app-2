-- Test updating a dream to simulate transcription completion
-- Replace 'YOUR_USER_ID' with your actual user ID
-- Replace 'YOUR_DREAM_ID' with an actual dream ID from your database

-- First, find a recent dream to test with:
SELECT id, user_id, raw_transcript, transcription_status, created_at
FROM dreams
WHERE user_id = 'YOUR_USER_ID'
ORDER BY created_at DESC
LIMIT 5;

-- Then update one of those dreams to simulate transcription completion:
UPDATE dreams
SET 
    raw_transcript = 'Test transcription: I had a dream about flying over mountains...',
    transcription_status = 'completed',
    updated_at = NOW()
WHERE 
    id = 'YOUR_DREAM_ID'
    AND user_id = 'YOUR_USER_ID';

-- The app should receive this update via real-time and show the transcription