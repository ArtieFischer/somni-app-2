-- Add push notification fields to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS push_token TEXT,
ADD COLUMN IF NOT EXISTS push_token_platform TEXT CHECK (push_token_platform IN ('ios', 'android')),
ADD COLUMN IF NOT EXISTS push_token_updated_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS notification_preferences JSONB DEFAULT '{"interpretations": true, "reminders": true, "achievements": true}'::jsonb;

-- Add index for push token lookups
CREATE INDEX IF NOT EXISTS idx_profiles_push_token ON public.profiles(push_token) WHERE push_token IS NOT NULL;

-- Create a function to send push notifications (to be called from backend)
CREATE OR REPLACE FUNCTION public.get_user_push_token(p_user_id UUID)
RETURNS TABLE(push_token TEXT, platform TEXT, preferences JSONB) 
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.push_token,
    p.push_token_platform,
    p.notification_preferences
  FROM public.profiles p
  WHERE p.user_id = p_user_id
    AND p.push_token IS NOT NULL;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_user_push_token(UUID) TO authenticated;

-- Add comment for documentation
COMMENT ON COLUMN public.profiles.push_token IS 'Expo push notification token for the user';
COMMENT ON COLUMN public.profiles.push_token_platform IS 'Platform of the push token (ios or android)';
COMMENT ON COLUMN public.profiles.push_token_updated_at IS 'Last time the push token was updated';
COMMENT ON COLUMN public.profiles.notification_preferences IS 'User notification preferences as JSON';