-- Check if dreams table is in the supabase_realtime publication
SELECT 
    schemaname,
    tablename 
FROM 
    pg_publication_tables 
WHERE 
    pubname = 'supabase_realtime'
    AND tablename = 'dreams';

-- If the above returns no results, the table is not enabled for realtime
-- If it returns a row with 'public' and 'dreams', then it's enabled

-- You can also check all tables enabled for realtime:
SELECT 
    schemaname,
    tablename 
FROM 
    pg_publication_tables 
WHERE 
    pubname = 'supabase_realtime'
ORDER BY 
    schemaname, tablename;