-- Function to get share status for a specific dream
CREATE OR REPLACE FUNCTION get_dream_share_status(p_dream_id UUID)
RETURNS JSON AS $$
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