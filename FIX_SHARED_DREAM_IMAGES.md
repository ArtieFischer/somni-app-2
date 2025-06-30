# Fix for Shared Dream Images Not Loading

## Problem
Dream images are not loading in the Feed screen because:
1. The `dream_images` table has RLS policies that only allow users to view their own dream images
2. The API's `v_public_shared_dreams` view doesn't include image information

## Solution
A migration file has been created at `supabase/migrations/20250130_fix_shared_dream_images.sql` that:
1. Adds an RLS policy allowing anyone to view images for publicly shared dreams
2. Updates the view to include `image_storage_path` in the API response

## How to Apply the Fix

### Option 1: Using Supabase CLI (Recommended)
```bash
cd /Users/gole/Desktop/somni/somni-app-2
supabase db push
```

### Option 2: Manual Application via Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `supabase/migrations/20250130_fix_shared_dream_images.sql`
4. Run the query

## Temporary Workaround
The app has been updated to handle the missing images gracefully:
- Dreams will display without images until the migration is applied
- Once the migration is applied, images will automatically start appearing
- No app update is needed after applying the migration

## Verification
After applying the migration, you should see in the app logs:
- "Image URL generated for dream" messages
- "Processed X dreams with images out of Y total" where X > 0

## Note
The app code has been updated to work both with and without the migration, so it's safe to use while waiting for the backend update.