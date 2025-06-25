import { Dream } from '@somni/types';

/**
 * Maps a database dream record to the frontend Dream type
 * Handles snake_case to camelCase conversion and provides defaults
 */
export function mapDatabaseDreamToFrontend(dbDream: any): Partial<Dream> {
  // console.log('🗺️ Mapping dream:', {
  //   dreamId: dbDream.id,
  //   hasDreamImages: !!dbDream.dream_images,
  //   dreamImagesType: typeof dbDream.dream_images,
  //   dreamImagesLength: dbDream.dream_images?.length,
  //   dreamImages: dbDream.dream_images
  // });
  
  // Log transcription metadata mapping
  if (dbDream.transcription_metadata) {
    // console.log('📊 Mapping dream with transcription_metadata:', {
    //   dreamId: dbDream.id,
    //   transcription_status: dbDream.transcription_status,
    //   transcription_metadata: dbDream.transcription_metadata
    // });
  }
  
  // Extract primary image URL from dream_images array
  let imageUrl: string | undefined = undefined;
  if (dbDream.dream_images && Array.isArray(dbDream.dream_images) && dbDream.dream_images.length > 0) {
    // Find primary image or use the first one
    const primaryImage = dbDream.dream_images.find((img: any) => img.is_primary) || dbDream.dream_images[0];
    imageUrl = primaryImage.storage_path;
    // console.log('🖼️ Found dream image:', {
    //   dreamId: dbDream.id,
    //   imageUrl,
    //   isPrimary: primaryImage.is_primary
    // });
  }
  
  return {
    id: dbDream.id,
    user_id: dbDream.user_id, // Required field
    userId: dbDream.user_id, // Legacy field
    raw_transcript: dbDream.raw_transcript || '', // Required field (can be empty)
    rawTranscript: dbDream.raw_transcript || 'Waiting for transcription...', // Legacy field
    title: dbDream.title || undefined,
    
    // Required fields for new schema
    is_lucid: dbDream.is_lucid || false,
    mood: dbDream.mood || undefined,
    clarity: dbDream.clarity || undefined,
    location_metadata: dbDream.location_metadata || undefined,
    transcription_status: dbDream.transcription_status || 'pending',
    transcription_metadata: dbDream.transcription_metadata || undefined,
    transcription_job_id: dbDream.transcription_job_id || undefined,
    image_prompt: dbDream.image_prompt || undefined,
    created_at: dbDream.created_at || new Date().toISOString(),
    updated_at: dbDream.updated_at || new Date().toISOString(),
    
    // Legacy fields
    duration: dbDream.duration || 0,
    confidence: dbDream.confidence || 0.8,
    wasEdited: dbDream.was_edited || false,
    recordedAt: dbDream.created_at || new Date().toISOString(),
    createdAt: dbDream.created_at || new Date().toISOString(),
    updatedAt: dbDream.updated_at || new Date().toISOString(),
    status: mapTranscriptionStatus(dbDream.transcription_status),
    audioUri: dbDream.audio_url || undefined,
    fileSize: dbDream.file_size || undefined,
    tags: dbDream.tags || [],
    emotions: dbDream.emotions || [],
    image_url: imageUrl || dbDream.image_url || undefined,
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
    case 'done': // Legacy support
      return 'completed';
    case 'processing':
      return 'transcribing';
    case 'failed':
    case 'error': // Legacy support
      return 'failed';
    case 'pending':
    default:
      return 'pending';
  }
}