-- Add missing fields to dreams table
-- These fields align with the frontend Dream type interface

-- Add image fields for AI-generated dream visualizations
ALTER TABLE public.dreams 
ADD COLUMN IF NOT EXISTS image_url text,
ADD COLUMN IF NOT EXISTS image_prompt text;

-- Add title column to store dream titles
ALTER TABLE public.dreams 
ADD COLUMN IF NOT EXISTS title text;

-- Add confidence score for transcription quality
ALTER TABLE public.dreams 
ADD COLUMN IF NOT EXISTS confidence numeric DEFAULT 0.8 CHECK (confidence >= 0 AND confidence <= 1);

-- Add editing tracking
ALTER TABLE public.dreams 
ADD COLUMN IF NOT EXISTS was_edited boolean DEFAULT false;

-- Add file size for audio recordings
ALTER TABLE public.dreams 
ADD COLUMN IF NOT EXISTS file_size bigint;

-- Add tags and emotions as arrays
ALTER TABLE public.dreams 
ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS emotions text[] DEFAULT '{}';

-- Add version tracking
ALTER TABLE public.dreams 
ADD COLUMN IF NOT EXISTS version integer DEFAULT 1;

-- Add metadata for additional unstructured data
ALTER TABLE public.dreams 
ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}';

-- Add indexes for faster queries on these new fields
CREATE INDEX IF NOT EXISTS idx_dreams_has_image ON public.dreams (user_id) WHERE image_url IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_dreams_tags ON public.dreams USING gin(tags);
CREATE INDEX IF NOT EXISTS idx_dreams_emotions ON public.dreams USING gin(emotions);

-- Add comments for documentation
COMMENT ON COLUMN public.dreams.image_url IS 'URL of the AI-generated image representation of the dream';
COMMENT ON COLUMN public.dreams.image_prompt IS 'The prompt used to generate the dream image';
COMMENT ON COLUMN public.dreams.title IS 'Generated or user-provided title for the dream';
COMMENT ON COLUMN public.dreams.confidence IS 'Confidence score of the transcription (0-1)';
COMMENT ON COLUMN public.dreams.was_edited IS 'Whether the dream transcript has been edited by the user';
COMMENT ON COLUMN public.dreams.file_size IS 'Size of the audio file in bytes';
COMMENT ON COLUMN public.dreams.tags IS 'Array of tags associated with the dream';
COMMENT ON COLUMN public.dreams.emotions IS 'Array of emotions identified in the dream';
COMMENT ON COLUMN public.dreams.version IS 'Version number for tracking edits';
COMMENT ON COLUMN public.dreams.metadata IS 'Additional unstructured metadata';