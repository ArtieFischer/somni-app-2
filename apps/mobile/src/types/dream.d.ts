// Dream entity type augmentations
import { Dream as BaseDream } from '@somni/shared';

declare module '@somni/shared' {
  interface Dream extends BaseDream {
    // Audio-related properties
    hasAudio?: boolean;
    audio_url?: string;
    audio_duration?: number;
    
    // Recording properties
    isRecording?: boolean;
    recordingDuration?: number;
    localAudioPath?: string;
    
    // Transcription properties
    isTranscribing?: boolean;
    transcription_status?: 'pending' | 'processing' | 'completed' | 'failed';
    transcription_error?: string;
    
    // Sync properties
    isSyncing?: boolean;
    syncError?: string;
    lastSyncAttempt?: string;
    
    // Queue properties
    isQueued?: boolean;
    queuedAt?: string;
    queuePosition?: number;
    
    // UI state properties
    isExpanded?: boolean;
    isSelected?: boolean;
    
    // Metadata
    device_info?: {
      platform: string;
      version: string;
      model?: string;
    };
    
    // Computed properties
    formattedDate?: string;
    displayTitle?: string;
  }
}