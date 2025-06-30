-- Apply Dream Sharing Migrations
-- Run this script in your Supabase SQL Editor

-- First Migration: Create shared_dreams table
-- Create shared_dreams table for dream sharing functionality
CREATE TABLE IF NOT EXISTS public.shared_dreams (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    dream_id UUID NOT NULL REFERENCES public.dreams(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
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
        ELSE COALESCE(sd.display_name, p.username)
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

-- Second Migration: Add dream sharing functions

-- Function to get share status for a specific dream
CREATE OR REPLACE FUNCTION get_dream_share_status(p_dream_id UUID)
RETURNS JSON AS $$$
DECLARE
    v_result JSON;
BEGIN
    SELECT json_build_object(
        'success', true,
        'isShared', EXISTS(
            SELECT 1 FROM public.shared_dreams 
            WHERE dream_id = p_dream_id 
            AND user_id = auth.uid()
        ),
        'shareDetails', (
            SELECT json_build_object(
                'isAnonymous', is_anonymous,
                'displayName', display_name,
                'sharedAt', shared_at
            )
            FROM public.shared_dreams
            WHERE dream_id = p_dream_id 
            AND user_id = auth.uid()
            LIMIT 1
        )
    ) INTO v_result;
    
    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to share a dream
CREATE OR REPLACE FUNCTION share_dream(
    p_dream_id UUID,
    p_is_anonymous BOOLEAN,
    p_display_name TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    v_share_id UUID;
    v_result JSON;
BEGIN
    -- Check if user owns the dream
    IF NOT EXISTS (
        SELECT 1 FROM public.dreams 
        WHERE id = p_dream_id 
        AND user_id = auth.uid()
    ) THEN
        RETURN json_build_object(
            'success', false,
            'shareId', '',
            'error', 'Dream not found or unauthorized'
        );
    END IF;
    
    -- Check if already shared
    IF EXISTS (
        SELECT 1 FROM public.shared_dreams 
        WHERE dream_id = p_dream_id 
        AND user_id = auth.uid()
    ) THEN
        RETURN json_build_object(
            'success', false,
            'shareId', '',
            'error', 'Dream is already shared'
        );
    END IF;
    
    -- Insert the share record
    INSERT INTO public.shared_dreams (dream_id, user_id, is_anonymous, display_name)
    VALUES (p_dream_id, auth.uid(), p_is_anonymous, p_display_name)
    RETURNING id INTO v_share_id;
    
    RETURN json_build_object(
        'success', true,
        'shareId', v_share_id,
        'message', 'Dream shared successfully'
    );
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'shareId', '',
            'error', 'Failed to share dream'
        );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update share settings
CREATE OR REPLACE FUNCTION update_dream_share_settings(
    p_dream_id UUID,
    p_is_anonymous BOOLEAN,
    p_display_name TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    v_share_id UUID;
BEGIN
    -- Update the share settings
    UPDATE public.shared_dreams
    SET 
        is_anonymous = p_is_anonymous,
        display_name = p_display_name
    WHERE dream_id = p_dream_id 
    AND user_id = auth.uid()
    RETURNING id INTO v_share_id;
    
    IF v_share_id IS NULL THEN
        RETURN json_build_object(
            'success', false,
            'shareId', '',
            'error', 'Share record not found'
        );
    END IF;
    
    RETURN json_build_object(
        'success', true,
        'shareId', v_share_id,
        'message', 'Share settings updated successfully'
    );
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'shareId', '',
            'error', 'Failed to update share settings'
        );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to unshare a dream
CREATE OR REPLACE FUNCTION unshare_dream(p_dream_id UUID)
RETURNS JSON AS $$
BEGIN
    -- Delete the share record
    DELETE FROM public.shared_dreams
    WHERE dream_id = p_dream_id 
    AND user_id = auth.uid();
    
    IF NOT FOUND THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Share record not found'
        );
    END IF;
    
    RETURN json_build_object(
        'success', true,
        'message', 'Dream unshared successfully'
    );
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Failed to unshare dream'
        );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get public shared dreams
CREATE OR REPLACE FUNCTION get_public_shared_dreams(
    p_limit INTEGER DEFAULT 50,
    p_offset INTEGER DEFAULT 0
)
RETURNS JSON AS $$
DECLARE
    v_dreams JSON;
    v_total INTEGER;
BEGIN
    -- Get total count
    SELECT COUNT(*) INTO v_total FROM public.v_public_shared_dreams;
    
    -- Get paginated dreams
    SELECT json_agg(row_to_json(d.*))
    INTO v_dreams
    FROM (
        SELECT * FROM public.v_public_shared_dreams
        LIMIT p_limit
        OFFSET p_offset
    ) d;
    
    RETURN json_build_object(
        'success', true,
        'dreams', COALESCE(v_dreams, '[]'::json),
        'total', v_total
    );
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'dreams', '[]'::json,
            'total', 0,
            'error', 'Failed to fetch shared dreams'
        );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_dream_share_status(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION share_dream(UUID, BOOLEAN, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION update_dream_share_settings(UUID, BOOLEAN, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION unshare_dream(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_public_shared_dreams(INTEGER, INTEGER) TO anon, authenticated;

-- Verify the migration
SELECT 'Migration completed successfully!' as status;