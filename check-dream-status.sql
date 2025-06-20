-- Check the latest dream and its transcription
SELECT 
    id,
    user_id,
    LEFT(raw_transcript, 100) as transcript_preview,
    transcription_status,
    duration,
    created_at,
    updated_at
FROM dreams
WHERE user_id = '48399752-a706-4822-89ae-ad333ca0dbc6'
ORDER BY created_at DESC
LIMIT 10;

-- Check if the dreams table is in the real-time publication
SELECT 
    schemaname,
    tablename 
FROM 
    pg_publication_tables 
WHERE 
    pubname = 'supabase_realtime'
    AND tablename = 'dreams';