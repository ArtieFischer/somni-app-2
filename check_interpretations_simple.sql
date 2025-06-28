-- Simple check for interpretations
-- Run each query separately in Supabase SQL Editor

-- 1. Count all interpretations
SELECT COUNT(*) as total_interpretations FROM interpretations;

-- 2. List interpreter types and their counts
SELECT 
  interpreter_type,
  COUNT(*) as count
FROM interpretations
GROUP BY interpreter_type;

-- 3. Check a few sample interpretations
SELECT 
  id,
  dream_id,
  interpreter_type,
  created_at
FROM interpretations
ORDER BY created_at DESC
LIMIT 5;

-- 4. Count interpretations by freud specifically
SELECT COUNT(*) as freud_interpretations
FROM interpretations
WHERE interpreter_type = 'freud';