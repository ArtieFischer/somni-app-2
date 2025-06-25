-- Apply the foreign key fix manually in Supabase Dashboard
-- This changes the foreign key from profiles.user_id to auth.users.id

-- Step 1: Drop the existing foreign key constraint
ALTER TABLE dreams DROP CONSTRAINT IF EXISTS dreams_user_id_fkey;

-- Step 2: Add new foreign key pointing to auth.users instead of profiles
ALTER TABLE dreams 
  ADD CONSTRAINT dreams_user_id_fkey 
  FOREIGN KEY (user_id) 
  REFERENCES auth.users(id) 
  ON DELETE CASCADE;

-- Step 3: Verify the change
SELECT
  tc.constraint_name,
  tc.constraint_type,
  kcu.column_name,
  ccu.table_schema AS foreign_table_schema,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
LEFT JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.table_schema = 'public'
  AND tc.table_name = 'dreams'
  AND tc.constraint_type = 'FOREIGN KEY'
  AND kcu.column_name = 'user_id';

-- Expected result:
-- foreign_table_schema: auth
-- foreign_table_name: users
-- foreign_column_name: id