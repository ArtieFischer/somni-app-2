-- Test Dream Sharing Functions
-- Run these queries in Supabase SQL Editor to test the functions

-- 1. First, let's check if the share_dream function works
-- Replace the UUID with an actual dream_id from your dreams table
-- This simulates what the backend should be calling

-- Get a test dream ID (run this first)
SELECT id, title, created_at 
FROM dreams 
WHERE user_id = auth.uid() 
ORDER BY created_at DESC 
LIMIT 1;

-- 2. Test sharing a dream (replace the dream_id with one from above)
-- This is what the backend should be calling
SELECT share_dream(
  'c77cc6da-0c47-414e-b965-5358e3bdac7c'::uuid,  -- Replace with your dream_id
  true,  -- is_anonymous
  NULL   -- display_name
);

-- 3. Check if the dream was shared
SELECT * FROM shared_dreams 
WHERE dream_id = 'c77cc6da-0c47-414e-b965-5358e3bdac7c';

-- 4. Test the get_public_shared_dreams function
SELECT * FROM get_public_shared_dreams(10, 0);

-- 5. Test unsharing
SELECT unshare_dream('c77cc6da-0c47-414e-b965-5358e3bdac7c'::uuid);

-- 6. Verify the backend's expected response format
-- The backend expects: { success: boolean, shareId: string, message?: string, error?: string }
-- But our function returns just a UUID
-- Let's create a wrapper function that matches the backend's expectations

CREATE OR REPLACE FUNCTION share_dream_api(
  p_dream_id uuid,
  p_is_anonymous boolean DEFAULT false,
  p_display_name text DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  v_share_id uuid;
  v_result json;
BEGIN
  -- Call the original function
  v_share_id := share_dream(p_dream_id, p_is_anonymous, p_display_name);
  
  -- Return in the format the backend expects
  RETURN json_build_object(
    'success', true,
    'shareId', v_share_id::text,
    'message', 'Dream shared successfully'
  );
  
EXCEPTION 
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'shareId', '',
      'error', SQLERRM
    );
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION share_dream_api(uuid, boolean, text) TO authenticated;

-- Test the new API function
SELECT share_dream_api(
  'c77cc6da-0c47-414e-b965-5358e3bdac7c'::uuid,
  true,
  NULL
);