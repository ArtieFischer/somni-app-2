-- Create shared_dreams table for dream sharing functionality
CREATE TABLE IF NOT EXISTS public.shared_dreams (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    dream_id UUID NOT NULL REFERENCES public.dreams(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    is_anonymous BOOLEAN NOT NULL DEFAULT false,
    display_name TEXT,
    shared_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Ensure a dream can only be shared once per user
    UNIQUE(dream_id, user_id)
);

-- Add indexes for performance
CREATE INDEX idx_shared_dreams_dream_id ON public.shared_dreams(dream_id);
CREATE INDEX idx_shared_dreams_user_id ON public.shared_dreams(user_id);
CREATE INDEX idx_shared_dreams_shared_at ON public.shared_dreams(shared_at DESC);

-- Enable RLS
ALTER TABLE public.shared_dreams ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users can view all shared dreams (for community feed)
CREATE POLICY "Anyone can view shared dreams"
    ON public.shared_dreams
    FOR SELECT
    USING (true);

-- Users can only share their own dreams
CREATE POLICY "Users can share their own dreams"
    ON public.shared_dreams
    FOR INSERT
    WITH CHECK (
        auth.uid() = user_id 
        AND EXISTS (
            SELECT 1 FROM public.dreams 
            WHERE dreams.id = dream_id 
            AND dreams.user_id = auth.uid()
        )
    );

-- Users can update their own shared dreams
CREATE POLICY "Users can update their own shared dreams"
    ON public.shared_dreams
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Users can delete their own shared dreams
CREATE POLICY "Users can delete their own shared dreams"
    ON public.shared_dreams
    FOR DELETE
    USING (auth.uid() = user_id);

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_shared_dreams_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_shared_dreams_updated_at_trigger
    BEFORE UPDATE ON public.shared_dreams
    FOR EACH ROW
    EXECUTE FUNCTION update_shared_dreams_updated_at();

-- View for public shared dreams with dream details
CREATE OR REPLACE VIEW public.v_public_shared_dreams AS
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
    COALESCE(
        (
            SELECT jsonb_agg(
                jsonb_build_object(
                    'code', t.code,
                    'label', t.label
                )
            )
            FROM public.dream_themes dt
            JOIN public.themes t ON dt.theme_id = t.id
            WHERE dt.dream_id = d.id
        ),
        '[]'::jsonb
    ) as themes
FROM public.shared_dreams sd
JOIN public.dreams d ON sd.dream_id = d.id
JOIN public.profiles p ON sd.user_id = p.id
WHERE d.transcript IS NOT NULL
ORDER BY sd.shared_at DESC;

-- Grant access to the view
GRANT SELECT ON public.v_public_shared_dreams TO anon, authenticated;

-- Add comment for documentation
COMMENT ON TABLE public.shared_dreams IS 'Stores information about dreams that users have chosen to share with the community';
COMMENT ON VIEW public.v_public_shared_dreams IS 'Public view of shared dreams with anonymization support';