export interface OfflineRecording {
  id: string;
  sessionId: string;
  audioUri: string;
  duration: number;
  fileSize: number;
  recordedAt: string;
  retryCount: number;
  maxRetries: number;
  status: 'pending' | 'uploading' | 'failed' | 'completed';
  lastAttempt?: string;
  error?: string;
  
  // Additional metadata
  priority: 'low' | 'normal' | 'high';
  deviceInfo?: {
    platform: string;
    version: string;
    batteryLevel?: number;
    storageAvailable?: number;
  };
  networkInfo?: {
    connectionType: string;
    isWifi: boolean;
    quality: string;
  };
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
  speed?: number; // bytes per second
  remainingTime?: number; // seconds
}

export interface UploadResult {
  success: boolean;
  dreamId?: string;
  error?: string;
  uploadDuration?: number;
  finalFileSize?: number;
}

export interface QueueStats {
  totalRecordings: number;
  pendingCount: number;
  uploadingCount: number;
  failedCount: number;
  completedCount: number;
  totalSize: number;
  averageUploadTime: number;
  successRate: number;
}

export interface QueueFilter {
  status?: OfflineRecording['status'][];
  priority?: OfflineRecording['priority'][];
  dateFrom?: string;
  dateTo?: string;
  minSize?: number;
  maxSize?: number;
}

// Store state interface
export interface OfflineQueueState {
  recordings: OfflineRecording[];
  isProcessing: boolean;
  totalPendingSize: number;
  currentUpload: {
    recordingId: string;
    progress: UploadProgress;
  } | null;
  
  // Settings
  maxRetries: number;
  batchSize: number;
  wifiOnlyMode: boolean;
  autoRetryEnabled: boolean;
  
  // Statistics
  uploadHistory: Array<{
    recordingId: string;
    timestamp: string;
    success: boolean;
    duration: number;
    fileSize: number;
  }>;
}

// Store actions interface
export interface OfflineQueueActions {
  // Queue management
  addRecording: (recording: Omit<OfflineRecording, 'id' | 'retryCount' | 'status' | 'priority'>) => void;
  removeRecording: (id: string) => void;
  updateRecording: (id: string, updates: Partial<OfflineRecording>) => void;
  clearCompletedRecordings: () => void;
  clearAllRecordings: () => void;
  
  // Processing
  processQueue: () => Promise<void>;
  processRecording: (recordingId: string) => Promise<UploadResult>;
  retryFailedRecordings: () => Promise<void>;
  pauseProcessing: () => void;
  resumeProcessing: () => void;
  
  // Filtering and search
  getRecordingsByStatus: (status: OfflineRecording['status']) => OfflineRecording[];
  getRecordingsByFilter: (filter: QueueFilter) => OfflineRecording[];
  
  // Statistics
  getQueueStats: () => QueueStats;
  updateStats: () => void;
  getUploadHistory: (limit?: number) => OfflineQueueState['uploadHistory'];
  
  // Settings
  setMaxRetries: (maxRetries: number) => void;
  setBatchSize: (batchSize: number) => void;
  setWifiOnlyMode: (enabled: boolean) => void;
  setAutoRetryEnabled: (enabled: boolean) => void;
  
  // Progress tracking
  setUploadProgress: (recordingId: string, progress: UploadProgress) => void;
  clearUploadProgress: () => void;
}

// Complete store type
export type OfflineQueueStore = OfflineQueueState & OfflineQueueActions;

// Events for queue operations
export interface QueueEvent {
  type: 'recording_added' | 'recording_removed' | 'upload_started' | 'upload_completed' | 'upload_failed' | 'queue_paused' | 'queue_resumed';
  recordingId?: string;
  timestamp: string;
  data?: any;
}

// Error types specific to queue operations
export interface QueueError {
  code: 'NETWORK_ERROR' | 'FILE_NOT_FOUND' | 'UPLOAD_FAILED' | 'QUOTA_EXCEEDED' | 'PERMISSION_DENIED' | 'UNKNOWN_ERROR';
  message: string;
  recordingId?: string;
  retryable: boolean;
  details?: Record<string, any>;
}