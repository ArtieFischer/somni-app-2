-- Add RLS policy to allow viewing images for publicly shared dreams
CREATE POLICY "Anyone can view images for shared dreams"
    ON public.dream_images
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 
            FROM public.shared_dreams sd
            WHERE sd.dream_id = dream_images.dream_id
        )
    );

-- Update the v_public_shared_dreams view to include the primary image URL
DROP VIEW IF EXISTS public.v_public_shared_dreams;

CREATE OR REPLACE VIEW public.v_public_shared_dreams AS
SELECT 
    sd.id as share_id,
    sd.dream_id,
    d.title as dream_title,
    d.raw_transcript as dream_transcript,
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
            JOIN public.themes t ON dt.theme_code = t.code
            WHERE dt.dream_id = d.id
        ),
        '[]'::jsonb
    ) as themes,
    -- Add the primary image storage path
    (
        SELECT di.storage_path
        FROM public.dream_images di
        WHERE di.dream_id = d.id
        AND di.is_primary = true
        ORDER BY di.generated_at ASC
        LIMIT 1
    ) as image_storage_path
FROM public.shared_dreams sd
JOIN public.dreams d ON sd.dream_id = d.id
JOIN public.profiles p ON sd.user_id = p.user_id
WHERE d.raw_transcript IS NOT NULL
ORDER BY sd.shared_at DESC;

-- Grant access to the view
GRANT SELECT ON public.v_public_shared_dreams TO anon, authenticated;