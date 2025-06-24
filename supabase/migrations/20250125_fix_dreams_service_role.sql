-- Fix service role access to dreams table
-- Date: 2025-01-25

-- First, drop the existing service role policy if it exists
DROP POLICY IF EXISTS "Service role can do everything" ON dreams;

-- Create a new service role bypass policy
-- This uses a different approach that should work better
CREATE POLICY "Service role bypass" ON dreams
    USING (auth.jwt() ->> 'role' = 'service_role');

-- Alternative: If the above doesn't work, try this instead
-- CREATE POLICY "Service role bypass" ON dreams
--     USING (true)
--     WITH CHECK (true);

-- Verify the policy was created
DO $$
BEGIN
    RAISE NOTICE 'Service role policy created. Current policies:';
    RAISE NOTICE '%', (
        SELECT string_agg(policyname || ' (' || cmd || ')', ', ')
        FROM pg_policies
        WHERE tablename = 'dreams'
    );
END $$;