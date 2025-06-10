// Core dream types
export type {
  Dream,
  DreamDTO,
  DreamStatus,
  DreamUpdate,
  DreamCreate,
  RecordingSession
} from './dream';

// Search and filter types
export type {
  DreamSearchQuery,
  DreamSearchResult
} from './dream';

// Statistics types
export type {
  DreamStats
} from './dream';

// Store types
export type {
  DreamStore,
  DreamStoreState,
  DreamStoreActions
} from './dream';

// Event and validation types
export type {
  DreamEvent,
  DreamValidationError,
  DreamValidationResult
} from './dream';

// Offline queue types
export type {
  OfflineRecording,
  UploadProgress,
  UploadResult,
  QueueStats,
  QueueFilter,
  OfflineQueueState,
  OfflineQueueActions,
  OfflineQueueStore,
  QueueEvent,
  QueueError
} from './offlineQueue';

// Upload service types
export type {
  UploadOptions,
  UploadChunk,
  ChunkedUploadSession,
  UploadEndpoint,
  UploadConfig,
  InitializeUploadRequest,
  InitializeUploadResponse,
  UploadChunkRequest,
  UploadChunkResponse,
  CompleteUploadRequest,
  CompleteUploadResponse,
  UploadError,
  NetworkCondition,
  AdaptiveUploadStrategy,
  UploadMetrics,
  UploadServiceState,
  UploadService,
  UploadStrategy,
  UploadStrategyConfig
} from './uploadService';

// Export the DreamEntity class
export { DreamEntity } from './dreamEntity';

// Sleep and dream types from the old types directory
export type SleepPhase = 'rem' | 'nrem' | 'light' | 'deep' | 'awake';

// Corresponds to the 'dreams' table - Alternative Dream interface for backward compatibility
// Renamed to avoid conflict with DreamEntity class
export interface DreamEntityData {
  id: string; // UUID
  user_id: string; // UUID
  created_at: string; // ISO 8601 string
  updated_at?: string; // ISO 8601 string
  raw_transcript?: string;
  refined_narrative?: string;
  audio_url?: string;
  sleep_phase?: SleepPhase;
  is_lucid?: boolean;
  mood_before?: number; // 1-5
  mood_after?: number; // 1-5
  embedding?: number[]; // Vector represented as an array
}

// Legacy interfaces for backward compatibility
// TODO: Remove these once all code is migrated to new interfaces
export interface User {
  id: string;
  email?: string;
}

export interface DreamEntry {
  id: string;
  userId: string;
  date: string; // ISO Date string
  title: string;
  content: string;
  interpretation?: string;
  tags?: string[];
}

// Audio recording types (can be expanded later)
export interface AudioRecordingResult {
  uri: string;
  duration: number;
  fileSize: number;
  format: string;
  sampleRate?: number;
  channels?: number;
  bitRate?: number;
}

// Network types (can be expanded later)
export interface NetworkStatus {
  isConnected: boolean;
  isInternetReachable: boolean;
  type: string;
  isWifi: boolean;
  isCellular: boolean;
  connectionQuality: 'poor' | 'good' | 'excellent' | 'unknown';
}

// Corresponds to the 'users_profile' table - Primary UserProfile interface
export interface UserProfile {
  id: string; // UUID from auth.users
  username?: string;
  display_name?: string;
  avatar_url?: string;
  is_premium: boolean;
  onboarding_completed: boolean;
  sleep_schedule?: {
    bedtime: string; // e.g., "22:30"
    wake_time: string; // e.g., "06:30"
  };
  lucid_dream_settings?: {
    // Define settings later
  };
  // Additional fields for extended user profile
  userId?: string; // For backward compatibility
  displayName?: string; // Alternative to display_name
  avatar?: string; // Alternative to avatar_url
  preferences?: {
    theme: 'dark' | 'light';
    language: string;
    notifications: boolean;
    autoBackup: boolean;
  };
  createdAt?: string;
  updatedAt?: string;
}

// API response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}

export interface PaginatedResponse<T = any> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Error types
export interface AppError {
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: string;
  userId?: string;
}

// Theme types (for future theme system)
export interface ThemeColors {
  primary: string;
  secondary: string;
  background: {
    primary: string;
    secondary: string;
    elevated: string;
  };
  text: {
    primary: string;
    secondary: string;
    muted: string;
  };
  accent: {
    primary: string;
    secondary: string;
  };
  status: {
    success: string;
    warning: string;
    error: string;
    info: string;
  };
}

export interface Theme {
  colors: ThemeColors;
  spacing: {
    xs: number;
    small: number;
    medium: number;
    large: number;
    xl: number;
  };
  borderRadius: {
    small: number;
    medium: number;
    large: number;
  };
  shadows: {
    small: object;
    medium: object;
    large: object;
  };
}