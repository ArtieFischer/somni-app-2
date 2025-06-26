-- Fix permissions for interpreters table
-- Run this script in Supabase SQL editor to allow authenticated users to read interpreters

-- First, grant SELECT permission to authenticated users
GRANT SELECT ON public.interpreters TO authenticated;

-- Enable Row Level Security
ALTER TABLE public.interpreters ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all authenticated users to read interpreters
CREATE POLICY "Allow authenticated users to read interpreters"
ON public.interpreters
FOR SELECT
TO authenticated
USING (true);

-- Optional: Insert the interpreters data if table is empty
-- Check if table has data first
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public.interpreters LIMIT 1) THEN
        INSERT INTO public.interpreters (id, name, full_name, description, image_url, interpretation_style)
        VALUES 
        ('carl', 'Carl', 'Carl Jung', 'Explores collective unconscious and universal archetypes in your dreams', '', 
         '{"approach": "jungian", "focus": ["archetypes", "collective_unconscious", "individuation"]}'),
        
        ('sigmund', 'Sigmund', 'Sigmund Freud', 'Analyzes dreams as wish fulfillment and unconscious desires', '', 
         '{"approach": "freudian", "focus": ["wish_fulfillment", "unconscious_desires", "symbolism"]}'),
        
        ('lakshmi', 'Lakshmi', 'Lakshmi Devi', 'Interprets dreams through spiritual and karmic perspectives', '', 
         '{"approach": "spiritual", "focus": ["karma", "spiritual_growth", "consciousness"]}'),
        
        ('mary', 'Mary', 'Mary Whiton', 'Uses modern cognitive science to understand dream meanings', '', 
         '{"approach": "cognitive", "focus": ["memory_processing", "problem_solving", "neuroscience"]}');
    END IF;
END $$;