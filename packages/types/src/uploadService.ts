export interface UploadOptions {
  onProgress?: (progress: UploadProgress) => void;
  timeout?: number;
  retryAttempts?: number;
  chunkSize?: number;
  wifiOnly?: boolean;
  priority?: 'low' | 'normal' | 'high';
  metadata?: Record<string, any>;
}

export interface UploadChunk {
  data: string; // base64 encoded chunk
  chunkNumber: number;
  totalChunks: number;
  chunkSize: number;
  offset: number;
}

export interface ChunkedUploadSession {
  uploadId: string;
  sessionId: string;
  totalSize: number;
  chunkSize: number;
  totalChunks: number;
  uploadedChunks: number[];
  status: 'initializing' | 'uploading' | 'completing' | 'completed' | 'failed' | 'aborted';
  createdAt: string;
  expiresAt: string;
}

export interface UploadEndpoint {
  initializeUpload: string;
  uploadChunk: string;
  completeUpload: string;
  abortUpload: string;
  getUploadStatus: string;
}

export interface UploadConfig {
  baseUrl: string;
  endpoints: UploadEndpoint;
  defaultChunkSize: number;
  maxChunkSize: number;
  minChunkSize: number;
  maxRetries: number;
  timeoutMs: number;
  concurrentUploads: number;
  networkTimeoutMs: number;
}

// API Request/Response types
export interface InitializeUploadRequest {
  sessionId: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  duration: number;
  recordedAt: string;
  chunkSize?: number;
  metadata?: Record<string, any>;
}

export interface InitializeUploadResponse {
  uploadId: string;
  chunkSize: number;
  totalChunks: number;
  uploadUrls?: string[]; // Pre-signed URLs for each chunk (optional)
  expiresAt: string;
}

export interface UploadChunkRequest {
  uploadId: string;
  chunkNumber: number;
  totalChunks: number;
  data: string; // base64 encoded
  checksum?: string;
}

export interface UploadChunkResponse {
  chunkNumber: number;
  etag: string;
  checksum?: string;
  received: boolean;
}

export interface CompleteUploadRequest {
  uploadId: string;
  parts: Array<{
    chunkNumber: number;
    etag: string;
  }>;
  finalChecksum?: string;
}

export interface CompleteUploadResponse {
  dreamId: string;
  finalUrl: string;
  processingStatus: 'queued' | 'processing' | 'completed';
  estimatedProcessingTime?: number;
}

// Error types specific to upload service
export interface UploadError {
  code: 'NETWORK_ERROR' | 'CHUNK_FAILED' | 'INITIALIZATION_FAILED' | 'COMPLETION_FAILED' | 'TIMEOUT' | 'CHECKSUM_MISMATCH' | 'QUOTA_EXCEEDED' | 'FILE_TOO_LARGE' | 'INVALID_FILE_TYPE' | 'UPLOAD_EXPIRED' | 'SERVER_ERROR';
  message: string;
  uploadId?: string;
  chunkNumber?: number;
  retryable: boolean;
  details?: Record<string, any>;
  timestamp: string;
}

// Network awareness types
export interface NetworkCondition {
  type: 'wifi' | 'cellular' | 'ethernet' | 'unknown';
  quality: 'excellent' | 'good' | 'fair' | 'poor';
  isMetered: boolean;
  bandwidth?: number; // Mbps estimate
  latency?: number; // ms
}

export interface AdaptiveUploadStrategy {
  chunkSize: number;
  concurrentChunks: number;
  retryDelay: number;
  timeoutMultiplier: number;
  shouldPause: boolean;
}

// Upload analytics and monitoring
export interface UploadMetrics {
  uploadId: string;
  sessionId: string;
  startTime: string;
  endTime?: string;
  totalBytes: number;
  bytesUploaded: number;
  chunksTotal: number;
  chunksCompleted: number;
  chunksFailed: number;
  retryCount: number;
  averageSpeed: number; // bytes per second
  networkCondition: NetworkCondition;
  errors: UploadError[];
  duration?: number; // ms
}

// Service state and configuration
export interface UploadServiceState {
  isInitialized: boolean;
  config: UploadConfig;
  activeUploads: Map<string, ChunkedUploadSession>;
  uploadMetrics: Map<string, UploadMetrics>;
  networkCondition: NetworkCondition;
  isPaused: boolean;
  
  // Queue management
  pendingUploads: string[];
  maxConcurrentUploads: number;
  currentUploads: number;
}

// Service interface
export interface UploadService {
  // Configuration
  initialize(config: UploadConfig): Promise<void>;
  updateConfig(config: Partial<UploadConfig>): void;
  
  // Network awareness
  setNetworkCondition(condition: NetworkCondition): void;
  getAdaptiveStrategy(condition: NetworkCondition, fileSize: number): AdaptiveUploadStrategy;
  
  // Upload operations
  uploadFile(
    audioUri: string,
    sessionId: string,
    duration: number,
    recordedAt: string,
    options?: UploadOptions
  ): Promise<UploadResult>;
  
  // Chunked upload operations
  initializeChunkedUpload(request: InitializeUploadRequest): Promise<InitializeUploadResponse>;
  uploadChunk(uploadId: string, chunk: UploadChunk): Promise<UploadChunkResponse>;
  completeUpload(uploadId: string, parts: CompleteUploadRequest['parts']): Promise<CompleteUploadResponse>;
  abortUpload(uploadId: string): Promise<void>;
  
  // Upload management
  pauseUpload(uploadId: string): Promise<void>;
  resumeUpload(uploadId: string): Promise<void>;
  cancelUpload(uploadId: string): Promise<void>;
  
  // Monitoring
  getUploadProgress(uploadId: string): UploadProgress | null;
  getUploadMetrics(uploadId: string): UploadMetrics | null;
  getAllActiveUploads(): ChunkedUploadSession[];
  
  // Cleanup
  cleanupExpiredUploads(): Promise<void>;
  cleanup(): Promise<void>;
}

// Upload strategy patterns
export type UploadStrategy = 'direct' | 'chunked' | 'adaptive';

export interface UploadStrategyConfig {
  strategy: UploadStrategy;
  directUploadMaxSize: number; // bytes
  chunkedUploadMinSize: number; // bytes
  adaptiveThreshold: number; // bytes
}