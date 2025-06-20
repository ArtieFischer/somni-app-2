# Real-time Subscription Fix Summary

## Problem
- Real-time subscriptions were timing out repeatedly 
- The subscription was being recreated every second during recording due to component re-renders
- Component was re-rendering frequently due to:
  - Recording duration updates (every second)
  - Amplitude simulation updates (every 200ms)
  - These caused the hook to re-run and recreate subscriptions

## Solution Implemented

### 1. Created a robust real-time subscription hook
- File: `/apps/mobile/src/hooks/useRealtimeSubscription.ts`
- Features:
  - Prevents duplicate subscriptions
  - Automatic retry logic (up to 3 retries with 5s delay)
  - Proper cleanup on unmount
  - Single subscription instance management
  - **Stable callback references using useRef**
  - **Memoized configuration to prevent re-subscriptions**
  - **Separated callback updates from subscription lifecycle**

### 2. Fixed RecordScreen subscription recreation
- Moved `handleRecordPress` definition before the navigation listener effect
- Fixed dependency array to prevent constant re-renders
- Replaced manual subscription management with the new hook
- **Memoized real-time event handler with useCallback**

### 3. Updated DreamDiaryScreen 
- Replaced manual subscription with the new hook
- Ensures consistent behavior across screens
- **Memoized real-time event handler with useCallback**

## Key Changes

1. **useRealtimeSubscription Hook**:
   - Manages subscription lifecycle
   - Prevents duplicate channels
   - Implements retry logic for timeouts
   - Provides cleanup mechanism
   - Uses `useRef` to maintain stable callback references across re-renders
   - Memoizes configuration to prevent unnecessary re-subscriptions
   - Only re-subscribes when critical props change (channel name, table, filter)

2. **RecordScreen.tsx**:
   - Fixed effect dependencies causing re-renders
   - Using the new hook for real-time subscription
   - Maintains single subscription instance

3. **DreamDiaryScreen.tsx**:
   - Using the new hook for consistency
   - Same retry and error handling behavior

## Expected Behavior
- Real-time subscriptions should connect once and stay connected
- If a timeout occurs, automatic retry up to 3 times
- No more repeated subscription creation/destruction during recording
- Dreams should update automatically when transcription completes

## Testing
1. Record a dream and accept it
2. Watch the logs - you should see:
   - Single subscription creation
   - No repeated timeout errors during recording
   - Automatic dream updates when transcription completes
3. Check Dream Diary - transcriptions should appear without manual refresh