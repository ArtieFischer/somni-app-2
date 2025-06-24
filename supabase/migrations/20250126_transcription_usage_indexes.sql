-- Add indexes to transcription_usage table for better query performance
CREATE INDEX IF NOT EXISTS idx_transcription_usage_user_id ON transcription_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_transcription_usage_dream_id ON transcription_usage(dream_id);
CREATE INDEX IF NOT EXISTS idx_transcription_usage_created_at ON transcription_usage(created_at DESC);

-- Add RLS policies for transcription_usage
ALTER TABLE transcription_usage ENABLE ROW LEVEL SECURITY;

-- Service role bypass
CREATE POLICY "service_role_bypass_all" ON transcription_usage
    FOR ALL
    USING (
        auth.jwt() IS NULL  -- Direct service role access
        OR 
        auth.jwt()->>'role' = 'service_role'
    );

-- Users can view their own usage
CREATE POLICY "users_select_own" ON transcription_usage
    FOR SELECT
    USING (auth.uid() = user_id);

-- Users can insert their own usage (through edge functions)
CREATE POLICY "users_insert_own" ON transcription_usage
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);