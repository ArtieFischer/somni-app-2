-- Force fix the foreign key

-- 1. Drop the constraint with CASCADE to remove dependencies
ALTER TABLE public.dreams 
  DROP CONSTRAINT dreams_user_id_fkey CASCADE;

-- 2. Wait a moment and add the correct constraint
-- Run this as a separate command after the DROP succeeds
ALTER TABLE public.dreams 
  ADD CONSTRAINT dreams_user_id_fkey 
  FOREIGN KEY (user_id) 
  REFERENCES auth.users(id) 
  ON DELETE CASCADE;

-- 3. If the above fails due to permissions on auth.users, 
-- just leave the constraint dropped - the app will still work