-- This enables real-time for the dreams table
-- Run this in your Supabase SQL Editor

-- First, check if the publication exists
SELECT pubname FROM pg_publication WHERE pubname = 'supabase_realtime';

-- Add the dreams table to the publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.dreams;

-- Verify it worked
SELECT 
    schemaname,
    tablename 
FROM 
    pg_publication_tables 
WHERE 
    pubname = 'supabase_realtime'
ORDER BY 
    schemaname, tablename;