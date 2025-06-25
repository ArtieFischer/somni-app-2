-- Test query to verify dream_images are being fetched correctly
-- Run this in Supabase SQL editor

-- First, check what's in dream_images table (without user filter to see all)
SELECT 
  di.*,
  d.title as dream_title,
  d.user_id
FROM dream_images di
JOIN dreams d ON di.dream_id = d.id
LIMIT 5;

-- Now test the exact query used in the app
SELECT 
  d.*,
  CASE 
    WHEN COUNT(di.id) = 0 THEN '[]'::json
    ELSE json_agg(
      json_build_object(
        'id', di.id,
        'storage_path', di.storage_path,
        'is_primary', di.is_primary
      ) ORDER BY di.is_primary DESC, di.generated_at DESC
    )
  END as dream_images
FROM dreams d
LEFT JOIN dream_images di ON d.id = di.dream_id
WHERE d.user_id = auth.uid()
GROUP BY d.id
ORDER BY d.created_at DESC
LIMIT 10;

-- Simpler version that matches what Supabase JS client does
SELECT 
  d.id,
  d.title,
  d.created_at,
  d.user_id,
  di.id as "dream_images.id",
  di.storage_path as "dream_images.storage_path",
  di.is_primary as "dream_images.is_primary"
FROM dreams d
LEFT JOIN dream_images di ON d.id = di.dream_id
WHERE d.user_id = auth.uid()
ORDER BY d.created_at DESC
LIMIT 10;