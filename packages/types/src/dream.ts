// Sleep phase enum
export type SleepPhase = 'unknown' | 'n1' | 'n2' | 'n3' | 'rem';

// Transcription status enum
export type TranscriptionStatus = 'pending' | 'processing' | 'completed' | 'failed';

// Location metadata for dreams
export interface DreamLocationMetadata {
  city?: string;
  country?: string;
  countryCode?: string;
  method?: 'manual' | 'gps';
}

export interface Dream {
  id: string;
  user_id: string; // Changed from userId
  
  // Content
  title?: string; // AI-generated title
  raw_transcript?: string; // Changed from rawTranscript
  
  // Sleep data
  is_lucid: boolean;
  mood?: number; // Single mood rating 1-5
  clarity?: number; // Dream vividness 1-100
  
  // Location metadata (no coordinates)
  location_metadata?: DreamLocationMetadata;
  
  // Transcription
  transcription_status: TranscriptionStatus;
  transcription_metadata?: Record<string, any>;
  transcription_job_id?: string;
  
  // Image generation
  image_prompt?: string;
  
  // Timestamps
  created_at: string;
  updated_at: string;
  
  // Legacy fields for backward compatibility
  userId?: string; // Use user_id
  rawTranscript?: string; // Use raw_transcript
  createdAt?: string; // Use created_at
  updatedAt?: string; // Use updated_at
  recordedAt?: string; // Use created_at
  duration?: number; // Deprecated
  confidence?: number; // Deprecated
  wasEdited?: boolean; // Deprecated
  status?: 'pending' | 'transcribing' | 'completed' | 'failed'; // Use transcription_status
  audioUri?: string; // Deprecated
  fileSize?: number; // Deprecated
  tags?: string[]; // Use dream_themes
  emotions?: string[]; // Use mood fields
  image_url?: string; // Use dream_images table
  transcriptionStatus?: TranscriptionStatus; // Legacy camelCase version of transcription_status
  transcriptionMetadata?: Record<string, any>; // Legacy camelCase version of transcription_metadata
  transcriptionJobId?: string; // Legacy camelCase version of transcription_job_id
}

export interface DreamDTO {
  id?: string;
  user_id: string;
  
  // Content
  title?: string;
  raw_transcript?: string;
  
  // Sleep data
  is_lucid?: boolean;
  mood?: number; // 1-5
  clarity?: number; // 1-100
  
  // Location metadata
  location_metadata?: DreamLocationMetadata;
  
  // Transcription
  transcription_status?: TranscriptionStatus;
  transcription_metadata?: Record<string, any>;
  transcription_job_id?: string;
  
  // Image generation
  image_prompt?: string;
  
  // Frontend-only fields (not stored in database)
  duration?: number; // Recording duration in seconds for display
  
  // Timestamps
  created_at?: string;
  updated_at?: string;
}

export interface RecordingSession {
  id: string;
  status: 'idle' | 'recording' | 'processing' | 'completed' | 'error';
  startTime?: string;
  endTime?: string;
  duration: number;
  audioUri?: string;
  dreamId?: string;
  error?: string;
  
  // Additional session metadata
  deviceInfo?: {
    platform: string;
    version: string;
    model?: string;
  };
  networkStatus?: {
    isOnline: boolean;
    connectionType: string;
  };
}

// Search and filter types
export interface DreamSearchQuery {
  text?: string;
  tags?: string[];
  emotions?: string[];
  status?: Dream['status'][];
  dateFrom?: string;
  dateTo?: string;
  minDuration?: number;
  maxDuration?: number;
  minConfidence?: number;
}

export interface DreamSearchResult {
  dreams: Dream[];
  totalCount: number;
  hasMore: boolean;
  query: DreamSearchQuery;
}

// Statistics types
export interface DreamStats {
  totalDreams: number;
  totalDuration: number;
  averageDuration: number;
  completedDreams: number;
  pendingDreams: number;
  transcribingDreams: number;
  failedDreams: number;
  
  // Time-based stats
  dreamsThisWeek: number;
  dreamsThisMonth: number;
  longestDream: Dream | null;
  shortestDream: Dream | null;
  
  // Quality stats
  averageConfidence: number;
  highConfidenceDreams: number; // >90%
  editedDreams: number;
  
  // Content stats
  mostCommonTags: Array<{ tag: string; count: number }>;
  mostCommonEmotions: Array<{ emotion: string; count: number }>;
}

// Store state types
export interface DreamStoreState {
  dreams: Dream[];
  recordingSession: RecordingSession | null;
  isRecording: boolean;
  error: string | null;
  isLoading: boolean;
  
  // Cached stats (updated when dreams change)
  totalDreams: number;
  totalRecordingTime: number;
  lastRecordingDate: string | null;
}

// Action types for better type safety
export interface DreamStoreActions {
  // Recording session actions
  startRecording: () => void;
  stopRecording: () => void;
  updateRecordingSession: (updates: Partial<RecordingSession>) => void;
  clearRecordingSession: () => void;
  setRecordingError: (error: string) => void;

  // Dream management actions
  addDream: (dreamDTO: DreamDTO) => Dream;
  updateDream: (dreamId: string, updates: Partial<DreamDTO>) => void;
  deleteDream: (dreamId: string) => void;
  getDreamById: (id: string) => Dream | undefined;
  getDreamsByStatus: (status: Dream['status']) => Dream[];
  
  // Search and filter
  searchDreams: (query: DreamSearchQuery) => DreamSearchResult;
  getDreamsByDateRange: (startDate: string, endDate: string) => Dream[];
  
  // Statistics
  updateStats: () => void;
  getDreamStats: () => DreamStats;

  // Error handling
  setError: (error: string | null) => void;
  clearError: () => void;
  
  // Loading states
  setLoading: (loading: boolean) => void;
  
  // Data management
  clearAllData: () => void;
  exportDreams: () => DreamDTO[];
  importDreams: (dreams: DreamDTO[]) => void;
}

// Complete store type
export type DreamStore = DreamStoreState & DreamStoreActions;

// Utility types for dream operations
export type DreamStatus = Dream['status'];
export type DreamUpdate = Partial<Omit<Dream, 'id' | 'createdAt'>>;
export type DreamCreate = Omit<DreamDTO, 'id' | 'createdAt'> & {
  createdAt?: string;
};

// Event types for dream lifecycle
export interface DreamEvent {
  type: 'created' | 'updated' | 'deleted' | 'status_changed';
  dreamId: string;
  timestamp: string;
  previousData?: Partial<Dream>;
  newData?: Partial<Dream>;
}

// Validation types
export interface DreamValidationError {
  field: keyof Dream;
  message: string;
  code: string;
}

export interface DreamValidationResult {
  isValid: boolean;
  errors: DreamValidationError[];
}