-- Alternative solution: Remove foreign key constraint completely
-- This allows dreams to be created without any user validation

-- Drop the constraint if it exists
ALTER TABLE public.dreams DROP CONSTRAINT IF EXISTS dreams_user_id_fkey;

-- Verify it's gone
SELECT
  tc.constraint_name,
  tc.constraint_type,
  kcu.column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
WHERE tc.table_schema = 'public'
  AND tc.table_name = 'dreams'
  AND tc.constraint_type = 'FOREIGN KEY'
  AND kcu.column_name = 'user_id';

-- Should return no rows if successful