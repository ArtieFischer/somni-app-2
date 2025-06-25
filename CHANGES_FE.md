# Frontend Changes Log

## 2025-01-26: Duration Tracking and Minimum Recording Length

### Changes Made

1. **Edge Function Updates** (`supabase/functions/dreams-transcribe-init/index.ts`)
   - Added 5-second minimum duration check
   - Records marked as "error" with specific metadata if too short
   - Removed attempt to update non-existent `duration` field in dreams table
   - Added transcription_usage record creation after successful transcription
   - Fixed status values: 'failed' → 'error', 'completed' → 'done'

2. **New Hook** (`apps/mobile/src/hooks/useDreamDurations.ts`)
   - Created hook to fetch durations from transcription_usage table
   - Maps dream IDs to their recorded durations for display

3. **DreamCard Component** (`apps/mobile/src/components/molecules/DreamCard/DreamCard.tsx`)
   - Added `duration` prop to receive duration from transcription_usage
   - Display duration in top-right corner (was always showing 0:00)
   - Added error display for "Recording too short" errors
   - Shows X icon instead of retry button for too-short recordings

4. **DreamDiaryScreen** (`apps/mobile/src/screens/main/DreamDiaryScreen/DreamDiaryScreen.tsx`)
   - Integrated useDreamDurations hook
   - Pass duration data to each DreamCard

5. **Database Migration** (`supabase/migrations/20250126_transcription_usage_indexes.sql`)
   - Added indexes for better query performance
   - Added RLS policies for transcription_usage table

### Duration Storage Strategy
- Duration is now stored in `transcription_usage` table, not in `dreams` table
- This allows tracking usage for billing/analytics purposes
- Frontend displays duration from transcription_usage when available
- Falls back to legacy dream.duration field for compatibility

### Error Handling
- Recordings shorter than 5 seconds are rejected
- Clear error message displayed in the UI
- No retry option for too-short recordings (user must record again)

### API Changes
- Edge function now expects and validates `duration` parameter
- Returns 400 error with specific message for too-short recordings
- Records transcription usage after successful processing

### Bug Fixes
- Fixed duration display always showing "0:00" - now shows for all dreams (not just non-completed)
- Added DreamCardWithDuration wrapper to fetch duration from transcription_usage table
- Fixed error display for "too short" recordings by checking both 'error' and 'failed' status
- Added refresh of dream data after transcription failure to get updated metadata
- Improved error handling to show specific message for too-short recordings

### Additional Fixes (2025-01-26 Update)
- Fixed dream not appearing in diary after "too short" error:
  - Added dream to local store immediately after creation
  - Fetch and update dream with error metadata when transcription fails
  - Don't overwrite failed status with pending status
- Fixed realtime updates not showing error metadata:
  - Map full dream data (including metadata) when status changes to 'failed'
- Added proper error handling in RecordScreen:
  - Show specific alert for "too short" recordings
  - Catch and handle errors from acceptRecording function