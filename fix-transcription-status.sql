-- Check for dreams with incorrect transcription_status values
SELECT 
    id, 
    user_id, 
    transcription_status,
    created_at,
    updated_at
FROM dreams
WHERE transcription_status NOT IN ('pending', 'processing', 'completed', 'failed')
ORDER BY created_at DESC;

-- Update any dreams with 'done' status to 'completed'
UPDATE dreams
SET 
    transcription_status = 'completed',
    updated_at = NOW()
WHERE transcription_status = 'done';

-- Update any dreams with 'error' status to 'failed'
UPDATE dreams
SET 
    transcription_status = 'failed',
    updated_at = NOW()
WHERE transcription_status = 'error';

-- Verify the fix
SELECT 
    transcription_status, 
    COUNT(*) as count
FROM dreams
GROUP BY transcription_status
ORDER BY transcription_status;