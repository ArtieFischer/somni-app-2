-- Check if the dreams with images exist and belong to current user
SELECT 
  id,
  title,
  user_id,
  created_at,
  transcription_status,
  (user_id = auth.uid()) as is_mine
FROM dreams 
WHERE id IN (
  '603ac37a-d2c9-418b-9d14-4d6c0b39fc57',
  '4d800e6f-fc48-43f1-8055-25585fa1e345',
  '64f09c8a-9613-41a6-9e43-750e3a763e74',
  '30393f96-3b33-46b2-93b4-d89d76b28691'
)
ORDER BY created_at DESC;