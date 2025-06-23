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

// Navigation types
export type {
  MainTabParamList,
  MainTabScreenProps,
  TabIconName
} from './navigation';

export { TAB_NAMES } from './navigation';

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

// Location accuracy levels
export type LocationAccuracy = 'none' | 'manual' | 'exact';

// Sex enum
export type Sex = 'male' | 'female' | 'other' | 'unspecified' | 'prefer_not_to_say';

// Settings JSONB structure
export interface ProfileSettings {
  location_sharing: LocationAccuracy;
  sleep_schedule?: {
    bed: string; // e.g., "23:30"
    wake: string; // e.g., "07:00"
    tz: string; // e.g., "Europe/Warsaw"
  } | null;
  improve_sleep_quality?: boolean | null;
  interested_in_lucid_dreaming?: boolean | null;
}

// Corresponds to the 'profiles' table - Primary UserProfile interface
export interface UserProfile {
  user_id: string; // UUID from auth.users (renamed from id)
  handle: string; // Unique @username identifier
  username?: string; // Display name (not unique)
  sex: Sex;
  birth_date?: string; // ISO date string
  avatar_url?: string;
  locale: string; // Language code, e.g., 'en', 'pl'
  dream_interpreter?: 'carl' | 'sigmund' | 'lakshmi' | 'mary';
  is_premium: boolean;
  onboarding_complete: boolean;
  
  // Location fields
  location?: { lat: number; lng: number }; // PostGIS point
  location_accuracy: LocationAccuracy;
  location_country?: string;
  location_city?: string;
  
  // Settings JSONB
  settings: ProfileSettings;
  
  created_at: string;
  updated_at: string;
  
  // Backward compatibility fields (deprecated)
  id?: string; // Use user_id instead
  onboarding_completed?: boolean; // Use onboarding_complete
  language?: string; // Use locale
  sleep_schedule?: { // Use settings.sleep_schedule
    bedtime: string;
    wake_time: string;
  };
}

// Dream Interpreter type
export interface DreamInterpreter {
  id: string;
  name: string;
  full_name: string;
  description: string;
  image_url: string;
  interpretation_style: {
    approach: string;
    focus: string[];
  };
  created_at?: string;
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

// Dream Images table
export interface DreamImage {
  id: string;
  dream_id: string;
  storage_path: string;
  is_primary: boolean;
  generated_at: string;
}

// Themes table
export interface Theme {
  code: string; // e.g., 'falling', 'flying'
  label: string;
  description?: string;
  embedding?: number[]; // MiniLM 384-dim
  created_at?: string;
}

// Dream Themes join table
export interface DreamTheme {
  dream_id: string;
  theme_code: string;
  rank?: number; // 1-10, order of relevance
  score?: number; // Cosine similarity or LLM score
  explanation?: string; // Why this theme was detected
}

// Interpretations table
export interface Interpretation {
  id: string;
  dream_id: string;
  interpreter_id: 'carl' | 'sigmund' | 'lakshmi' | 'mary';
  interpretation: string;
  key_symbols?: Record<string, any>;
  advice?: string;
  mood_analysis?: Record<string, any>;
  created_at: string;
  version?: number;
}

export * from './offlineQueue';
export * from './uploadService';