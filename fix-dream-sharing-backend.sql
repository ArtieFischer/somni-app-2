-- Drop existing objects if they exist
DROP VIEW IF EXISTS public.v_public_shared_dreams CASCADE;
DROP TABLE IF EXISTS public.shared_dreams CASCADE;

-- Create a simpler shared_dreams table that matches backend expectations
CREATE TABLE public.shared_dreams (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    dream_id UUID NOT NULL REFERENCES public.dreams(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
    is_anonymous BOOLEAN NOT NULL DEFAULT false,
    display_name TEXT,
    shared_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add indexes
CREATE INDEX idx_shared_dreams_dream_id ON public.shared_dreams(dream_id);
CREATE INDEX idx_shared_dreams_user_id ON public.shared_dreams(user_id);
CREATE INDEX idx_shared_dreams_shared_at ON public.shared_dreams(shared_at DESC);

-- Create unique constraint to prevent duplicate shares
CREATE UNIQUE INDEX idx_shared_dreams_unique_share ON public.shared_dreams(dream_id, user_id);

-- Enable RLS
ALTER TABLE public.shared_dreams ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Anyone can view shared dreams" ON public.shared_dreams;
DROP POLICY IF EXISTS "Users can share their own dreams" ON public.shared_dreams;
DROP POLICY IF EXISTS "Users can update their own shared dreams" ON public.shared_dreams;
DROP POLICY IF EXISTS "Users can delete their own shared dreams" ON public.shared_dreams;

-- Create new policies with simpler rules

-- Allow anyone to read shared dreams
CREATE POLICY "shared_dreams_select_policy"
    ON public.shared_dreams
    FOR SELECT
    USING (true);

-- Allow authenticated users to insert their own shared dreams
CREATE POLICY "shared_dreams_insert_policy"
    ON public.shared_dreams
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own shared dreams
CREATE POLICY "shared_dreams_update_policy"
    ON public.shared_dreams
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own shared dreams
CREATE POLICY "shared_dreams_delete_policy"
    ON public.shared_dreams
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- Grant necessary permissions
GRANT ALL ON public.shared_dreams TO authenticated;
GRANT SELECT ON public.shared_dreams TO anon;

-- Create a simpler view for public shared dreams
CREATE VIEW public.shared_dreams_public AS
SELECT 
    sd.id as share_id,
    sd.dream_id,
    d.title as dream_title,
    d.transcript as dream_transcript,
    d.created_at as dream_created_at,
    d.mood,
    d.clarity,
    sd.is_anonymous,
    CASE 
        WHEN sd.is_anonymous THEN NULL 
        ELSE COALESCE(sd.display_name, p.full_name)
    END as display_name,
    sd.shared_at,
    ARRAY(
        SELECT jsonb_build_object(
            'code', t.code,
            'label', t.label
        )
        FROM public.dream_themes dt
        JOIN public.themes t ON dt.theme_id = t.id
        WHERE dt.dream_id = d.id
    ) as themes
FROM public.shared_dreams sd
JOIN public.dreams d ON sd.dream_id = d.id
JOIN public.profiles p ON sd.user_id = p.id
WHERE d.transcript IS NOT NULL;

-- Grant access to the view
GRANT SELECT ON public.shared_dreams_public TO anon, authenticated;

-- Test the table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'shared_dreams'
ORDER BY ordinal_position;