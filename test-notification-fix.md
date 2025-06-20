# Notification Duplicate Fix Test Plan

## Issue
Two empty notifications were being shown when a dream transcription completed.

## Root Cause
1. Both `RecordScreen` and `DreamDiaryScreen` were listening to the same real-time events from the dreams table
2. Both screens were calling `showTranscriptionComplete()` when a transcription completed
3. The notifications weren't actually empty - they showed the correct title and message from translations

## Solution Implemented

### 1. Modified RecordScreen to track dreams recorded from that screen:
- Added `recordedDreamIdsRef` to track dream IDs created from RecordScreen
- Only show notifications for dreams that were recorded from RecordScreen
- Remove dream ID from tracking after showing notification

### 2. Modified useRecordingHandler:
- Changed `acceptRecording` to return the created dream ID
- Returns `string | null` to indicate success/failure

### 3. DreamDiaryScreen already had protection:
- Only shows notifications when the screen is focused (`isFocused`)
- This prevents duplicate notifications when both screens are mounted

## Expected Behavior After Fix

1. **When recording from RecordScreen:**
   - Only RecordScreen shows the transcription complete notification
   - DreamDiaryScreen won't show notification (not focused)

2. **When viewing DreamDiaryScreen:**
   - Only DreamDiaryScreen shows notifications for dreams transcribed while viewing
   - RecordScreen won't show notification (dream ID not in tracked list)

3. **When navigating between screens:**
   - No duplicate notifications
   - Each screen only shows notifications for relevant events

## Testing Steps

1. Record a dream from RecordScreen
2. Accept the recording to start transcription
3. Wait for transcription to complete
4. Verify only ONE notification appears
5. Navigate to DreamDiaryScreen
6. Trigger a transcription retry from there
7. Verify only ONE notification appears when it completes

## Code Changes Summary

1. `RecordScreen.tsx`:
   - Added `recordedDreamIdsRef` to track dreams
   - Modified notification logic to check if dream ID is tracked
   - Updated acceptRecording call to capture dream ID

2. `useRecordingHandler.ts`:
   - Changed return type to `Promise<string | null>`
   - Returns created dream ID on success
   - Returns null on failure

3. `DreamDiaryScreen.tsx`:
   - No changes needed (already had `isFocused` check)