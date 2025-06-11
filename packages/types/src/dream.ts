export interface Dream {
  id: string;
  userId: string;
  rawTranscript: string;
  duration: number;
  confidence: number;
  wasEdited: boolean;
  recordedAt: string;
  createdAt: string;
  status: 'pending' | 'transcribing' | 'completed' | 'failed';
  audioUri?: string;
  fileSize?: number;
  tags?: string[];
  emotions?: string[];
  
  // Optional metadata
  updatedAt?: string;
  version?: number;
  metadata?: Record<string, any>;
  
  // NEW: Transcription fields
  transcriptionStatus?: 'pending' | 'processing' | 'completed' | 'failed';
  transcriptionMetadata?: {
    language?: string;
    confidence?: number;
    words?: Array<{
      text: string;
      start: number;
      end: number;
      speaker_id?: string;
    }>;
    processedAt?: string;
    model?: string;
  };
  transcriptionJobId?: string;
}

export interface DreamDTO {
  id?: string;
  userId: string;
  rawTranscript: string;
  duration: number;
  confidence: number;
  wasEdited: boolean;
  recordedAt: string;
  createdAt: string;
  status: 'pending' | 'transcribing' | 'completed' | 'failed';
  audioUri?: string;
  fileSize?: number;
  tags?: string[];
  emotions?: string[];
  updatedAt?: string;
  version?: number;
  metadata?: Record<string, any>;
  
  // NEW: Transcription fields
  transcriptionStatus?: 'pending' | 'processing' | 'completed' | 'failed';
  transcriptionMetadata?: {
    language?: string;
    confidence?: number;
    words?: Array<{
      text: string;
      start: number;
      end: number;
      speaker_id?: string;
    }>;
    processedAt?: string;
    model?: string;
  };
  transcriptionJobId?: string;
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