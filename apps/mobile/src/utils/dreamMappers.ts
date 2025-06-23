import { Dream } from '@somni/types';

/**
 * Maps a database dream record to the frontend Dream type
 * Handles snake_case to camelCase conversion and provides defaults
 */
export function mapDatabaseDreamToFrontend(dbDream: any): Partial<Dream> {
  return {
    id: dbDream.id,
    userId: dbDream.user_id,
    rawTranscript: dbDream.raw_transcript || 'Waiting for transcription...',
    title: dbDream.title || undefined,
    duration: dbDream.duration || 0,
    confidence: dbDream.confidence || 0.8,
    wasEdited: dbDream.was_edited || false,
    recordedAt: dbDream.created_at || new Date().toISOString(),
    createdAt: dbDream.created_at || new Date().toISOString(),
    status: mapTranscriptionStatus(dbDream.transcription_status),
    audioUri: dbDream.audio_url || undefined,
    fileSize: dbDream.file_size || undefined,
    tags: dbDream.tags || [],
    emotions: dbDream.emotions || [],
    image_url: dbDream.image_url || undefined,
    image_prompt: dbDream.image_prompt || undefined,
    updatedAt: dbDream.updated_at || undefined,
    version: dbDream.version || undefined,
    metadata: dbDream.metadata || undefined,
    transcriptionStatus: dbDream.transcription_status,
    transcriptionMetadata: dbDream.transcription_metadata,
    transcriptionJobId: dbDream.transcription_job_id,
  };
}

/**
 * Maps database transcription status to frontend Dream status
 */
function mapTranscriptionStatus(dbStatus: string | null | undefined): Dream['status'] {
  switch (dbStatus) {
    case 'completed':
      return 'completed';
    case 'processing':
      return 'transcribing';
    case 'failed':
      return 'failed';
    case 'pending':
    default:
      return 'pending';
  }
}