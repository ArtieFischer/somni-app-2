# Fix Real-time Transcription Updates

## Issue
The real-time subscription for dream transcription updates is not working. The app shows "Transcription Started" but doesn't receive updates when transcription completes.

## Root Causes
1. The `dreams` table might not be enabled for Supabase Realtime
2. The subscription might not be properly configured
3. The dream ID mapping between temporary and real IDs might be causing issues

## Solution Steps

### 1. Enable Realtime for Dreams Table

Run the migration in your Supabase dashboard:

```bash
supabase migration up
```

Or manually run this SQL in the Supabase SQL Editor:

```sql
-- Enable real-time for dreams table
ALTER PUBLICATION supabase_realtime ADD TABLE public.dreams;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_dreams_user_id ON public.dreams(user_id);
CREATE INDEX IF NOT EXISTS idx_dreams_transcription_status ON public.dreams(transcription_status);
```

### 2. Verify Realtime is Working

Run the test script:

```bash
npm install dotenv @supabase/supabase-js
npx tsx test-realtime.ts
```

This will subscribe to the dreams table and show any real-time events.

### 3. Check Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to **Database** → **Replication**
3. Ensure the `dreams` table is enabled for real-time
4. If not, toggle it on

### 4. Test the Full Flow

1. Start recording a dream
2. Accept and transcribe
3. Watch the console logs for:
   - `📡 Setting up realtime subscription`
   - `🎯 Realtime event:` messages
   - `✅ Transcription completed` messages

### 5. What's Been Fixed

1. **Added real-time subscription to DreamDiaryScreen** - The Dreams Diary now listens for real-time updates
2. **Enhanced logging** - Better console logs to debug the flow
3. **Fixed ID mapping** - Handles both temporary and real dream IDs
4. **Added migration** - SQL to enable real-time for dreams table

### 6. Expected Behavior

When transcription completes:
1. You should see console logs showing the real-time event
2. The dream in the Dreams Diary should update from "Waiting for transcription..." to show the actual transcript
3. The progress bar should disappear
4. An alert should show "Transcription Complete!"

### 7. Debugging Tips

If it's still not working:

1. **Check console logs** for any errors
2. **Verify user authentication** - Real-time requires valid auth
3. **Check network tab** - Look for WebSocket connections to Supabase
4. **Test with SQL** - Try updating a dream directly in SQL Editor:
   ```sql
   UPDATE dreams 
   SET raw_transcript = 'Test transcript', 
       transcription_status = 'completed'
   WHERE id = 'your-dream-id';
   ```
5. **Check Row Level Security** - Ensure RLS policies allow reading dreams

### 8. Current Implementation

The app now has real-time subscriptions in two places:
- **RecordScreen**: Listens for transcription completion of newly recorded dreams
- **DreamDiaryScreen**: Listens for all dream updates to keep the list current

Both use filtered subscriptions: `filter: user_id=eq.${user.id}` to only receive updates for the current user's dreams.