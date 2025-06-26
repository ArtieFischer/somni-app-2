-- Check if interpreters table exists and its structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'interpreters'
ORDER BY ordinal_position;

-- Check current permissions on interpreters table
SELECT 
    grantee,
    privilege_type
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
AND table_name = 'interpreters';

-- Check if RLS is enabled
SELECT 
    tablename,
    rowsecurity
FROM pg_tables
WHERE schemaname = 'public' 
AND tablename = 'interpreters';

-- Check existing RLS policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public' 
AND tablename = 'interpreters';

-- Grant SELECT permission to authenticated users (if needed)
-- GRANT SELECT ON public.interpreters TO authenticated;

-- Create RLS policy for authenticated users to read interpreters (if needed)
-- CREATE POLICY "Allow authenticated users to read interpreters"
-- ON public.interpreters
-- FOR SELECT
-- TO authenticated
-- USING (true);

-- Enable RLS if not already enabled
-- ALTER TABLE public.interpreters ENABLE ROW LEVEL SECURITY;