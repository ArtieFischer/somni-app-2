# Enable Real-time Updates When Available

## Current Status
Real-time subscriptions are temporarily disabled because Supabase Replication is not yet available for your project (early access only).

## How to Enable When Available

### 1. Enable Replication in Supabase Dashboard
Once you have access to Replication:
1. Go to your Supabase Dashboard
2. Navigate to **Database** → **Replication**
3. Enable the `dreams` table for real-time

### 2. Re-enable Real-time Subscriptions in Code

Remove the `return;` statements from these files:

#### `/apps/mobile/src/screens/main/DreamDiaryScreen/DreamDiaryScreen.tsx`
```typescript
// Subscribe to real-time dream updates
useEffect(() => {
  // Temporarily disabled until Supabase Replication is enabled
  return; // ← REMOVE THIS LINE
  
  if (!user?.id) return;
  // ... rest of the code
```

#### `/apps/mobile/src/screens/main/RecordScreen/RecordScreen.tsx`
```typescript
// Monitor real-time updates for transcription completion
useEffect(() => {
  // Temporarily disabled until Supabase Replication is enabled
  return; // ← REMOVE THIS LINE
  
  if (!user?.id) return;
  // ... rest of the code
```

### 3. What Will Work When Enabled

1. **Automatic Updates** - Dreams will update in real-time without refreshing
2. **Live Transcription Status** - See transcription progress as it happens
3. **Instant Notifications** - Get alerts when transcription completes

## Current Workaround

For now, use **pull-to-refresh** in the Dreams Diary to see new transcriptions. This fetches the latest data from the database and works perfectly without real-time.

## Testing Real-time When Enabled

Run this SQL to verify the dreams table is in the publication:
```sql
SELECT 
    schemaname,
    tablename 
FROM 
    pg_publication_tables 
WHERE 
    pubname = 'supabase_realtime'
    AND tablename = 'dreams';
```

If it returns a row, real-time is enabled and you can remove the `return;` statements.