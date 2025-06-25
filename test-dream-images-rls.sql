-- Test RLS policies for dream_images

-- Check if you can see dream_images directly
SELECT * FROM dream_images LIMIT 5;

-- Check if you can see dream_images for your own dreams
SELECT 
  di.*,
  d.user_id,
  (d.user_id = auth.uid()) as is_my_dream
FROM dream_images di
JOIN dreams d ON di.dream_id = d.id
LIMIT 5;

-- Check current user
SELECT auth.uid() as current_user_id;

-- Check if there are any dream_images at all
SELECT COUNT(*) as total_dream_images FROM dream_images;

-- Test the exact query used in the app
-- First get dream IDs for current user
WITH user_dreams AS (
  SELECT id FROM dreams WHERE user_id = auth.uid() LIMIT 5
)
SELECT * FROM dream_images 
WHERE dream_id IN (SELECT id FROM user_dreams);

-- Check dreams that should have images
SELECT 
  d.id,
  d.title,
  d.user_id,
  COUNT(di.id) as image_count
FROM dreams d
LEFT JOIN dream_images di ON d.id = di.dream_id
WHERE d.user_id = auth.uid()
GROUP BY d.id, d.title, d.user_id
HAVING COUNT(di.id) > 0;