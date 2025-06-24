# Transcription Status Reference

## Database Enum (transcription_status_enum)
The database supports these values:
- `pending`
- `processing` 
- `done`
- `error`
- `completed` (legacy)
- `failed` (legacy)

## Currently Used Status Values

### In Edge Functions (dreams-transcribe-init)
- `'processing'` - When transcription starts
- `'completed'` - When transcription succeeds
- `'failed'` - When transcription fails or recording is too short

### In Frontend (Dream.status - legacy field)
Maps from transcription_status:
- `'pending'` - Not yet transcribed
- `'transcribing'` - Currently processing (maps from 'processing')
- `'completed'` - Successfully transcribed (maps from 'completed')
- `'failed'` - Transcription failed (maps from 'failed')

### Important Notes
1. The edge function uses `'completed'` and `'failed'` (not 'done' and 'error')
2. The frontend Dream.status field is a legacy field that maps from transcription_status
3. When checking for too-short recordings:
   - Check `dream.transcription_status === 'failed'`
   - Check `dream.transcription_metadata?.error === 'Recording too short'`