-- Enable RLS on transcription_usage table
ALTER TABLE transcription_usage ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own transcription usage" ON transcription_usage;
DROP POLICY IF EXISTS "Service role can insert transcription usage" ON transcription_usage;
DROP POLICY IF EXISTS "Service role can update transcription usage" ON transcription_usage;

-- Policy: Users can view their own transcription usage
CREATE POLICY "Users can view their own transcription usage" ON transcription_usage
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Policy: Service role can insert transcription usage (for edge functions)
CREATE POLICY "Service role can insert transcription usage" ON transcription_usage
  FOR INSERT
  WITH CHECK (true);

-- Policy: Service role can update transcription usage (for edge functions)
CREATE POLICY "Service role can update transcription usage" ON transcription_usage
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Grant permissions to authenticated users
GRANT SELECT ON transcription_usage TO authenticated;

-- Grant all permissions to service_role (for edge functions)
GRANT ALL ON transcription_usage TO service_role;