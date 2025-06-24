-- Migration: Dreams Table RLS Policies
-- Date: 2025-01-25
-- Purpose: Add Row Level Security policies for dreams table

-- Enable RLS on dreams table
ALTER TABLE dreams ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view their own dreams" ON dreams;
DROP POLICY IF EXISTS "Users can insert their own dreams" ON dreams;
DROP POLICY IF EXISTS "Users can update their own dreams" ON dreams;
DROP POLICY IF EXISTS "Users can delete their own dreams" ON dreams;

-- Create policies

-- Policy: Users can view their own dreams
CREATE POLICY "Users can view their own dreams" ON dreams
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: Users can insert their own dreams
CREATE POLICY "Users can insert their own dreams" ON dreams
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own dreams
CREATE POLICY "Users can update their own dreams" ON dreams
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own dreams
CREATE POLICY "Users can delete their own dreams" ON dreams
    FOR DELETE
    USING (auth.uid() = user_id);

-- Service role bypass (for backend operations)
-- This allows service role to perform any operation
CREATE POLICY "Service role can do everything" ON dreams
    FOR ALL
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

-- Grant necessary permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON dreams TO authenticated;

-- Grant usage on dreams_id_seq if it exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_sequences WHERE schemaname = 'public' AND sequencename = 'dreams_id_seq') THEN
        EXECUTE 'GRANT USAGE, SELECT ON SEQUENCE public.dreams_id_seq TO authenticated';
    END IF;
END $$;

-- Verify the policies
DO $$
BEGIN
    RAISE NOTICE 'RLS Policies created for dreams table:';
    RAISE NOTICE '%', (
        SELECT string_agg(policyname, ', ')
        FROM pg_policies
        WHERE tablename = 'dreams'
    );
END $$;