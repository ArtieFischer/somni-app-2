-- Debug analyses count issue
-- Run this in Supabase SQL Editor to check your data

-- 1. Check if you have any interpretations at all
SELECT 
  COUNT(*) as total_interpretations,
  COUNT(DISTINCT interpreter_type) as unique_interpreters,
  COUNT(DISTINCT dream_id) as unique_dreams
FROM interpretations;

-- 2. List all interpreter_types in use
SELECT DISTINCT 
  interpreter_type,
  COUNT(*) as count
FROM interpretations
GROUP BY interpreter_type
ORDER BY count DESC;

-- 3. Check interpretations for a specific user (replace USER_ID)
-- First get your user ID:
SELECT id, email FROM auth.users WHERE email = 'YOUR_EMAIL_HERE';

-- Then check interpretations for that user:
/*
SELECT 
  i.id,
  i.dream_id,
  i.interpreter_type,
  i.created_at,
  d.title as dream_title,
  d.user_id as dream_owner
FROM interpretations i
JOIN dreams d ON d.id = i.dream_id
WHERE d.user_id = 'YOUR_USER_ID_HERE'
ORDER BY i.created_at DESC
LIMIT 10;
*/

-- 4. Check if RLS is blocking the count query
-- This runs as superuser so bypasses RLS
SELECT 
  COUNT(*) as interpretations_by_freud
FROM interpretations i
JOIN dreams d ON d.id = i.dream_id
WHERE i.interpreter_type = 'freud'
  AND d.user_id IN (SELECT id FROM auth.users LIMIT 1);

-- 5. Check if interpreter types have old values
SELECT 
  interpreter_type,
  COUNT(*) as count,
  MIN(created_at) as oldest,
  MAX(created_at) as newest
FROM interpretations
WHERE interpreter_type IN ('carl', 'sigmund', 'jung', 'freud')
GROUP BY interpreter_type;

-- 6. Check sample interpretation data structure
SELECT 
  id,
  dream_id,
  interpreter_type,
  CASE 
    WHEN interpretation IS NOT NULL THEN 'has interpretation'
    ELSE 'no interpretation'
  END as has_interpretation,
  CASE
    WHEN full_response IS NOT NULL THEN 'has full_response'
    ELSE 'no full_response'
  END as has_full_response,
  created_at
FROM interpretations
ORDER BY created_at DESC
LIMIT 5;