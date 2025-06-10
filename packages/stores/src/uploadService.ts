import * as FileSystem from 'expo-file-system';
import { 
  UploadService,
  UploadConfig,
  UploadOptions,
  UploadResult,
  UploadProgress,
  UploadError,
  NetworkCondition,
  AdaptiveUploadStrategy,
  ChunkedUploadSession,
  UploadMetrics,
  InitializeUploadRequest,
  InitializeUploadResponse,
  UploadChunk,
  UploadChunkResponse,
  CompleteUploadRequest,
  CompleteUploadResponse,
  UploadStrategy
} from '@somni/types';

/**
 * Progressive Upload Service with chunked uploads and network awareness
 */
export class ProgressiveUploadService implements UploadService {
  private config!: UploadConfig;
  private activeUploads = new Map<string, ChunkedUploadSession>();
  private uploadMetrics = new Map<string, UploadMetrics>();
  private networkCondition: NetworkCondition = {
    type: 'unknown',
    quality: 'good',
    isMetered: false
  };
  private isPaused = false;
  private isInitialized = false;

  // Default configuration
  private static readonly DEFAULT_CONFIG: UploadConfig = {
    baseUrl: process.env.EXPO_PUBLIC_API_URL || 'https://api.somni.app',
    endpoints: {
      initializeUpload: '/api/uploads/initialize',
      uploadChunk: '/api/uploads/chunk',
      completeUpload: '/api/uploads/complete',
      abortUpload: '/api/uploads/abort',
      getUploadStatus: '/api/uploads/status'
    },
    defaultChunkSize: 1024 * 1024, // 1MB
    maxChunkSize: 5 * 1024 * 1024, // 5MB
    minChunkSize: 256 * 1024, // 256KB
    maxRetries: 3,
    timeoutMs: 30000, // 30 seconds
    concurrentUploads: 3,
    networkTimeoutMs: 10000 // 10 seconds
  };

  async initialize(config?: Partial<UploadConfig>): Promise<void> {
    this.config = { ...ProgressiveUploadService.DEFAULT_CONFIG, ...config };
    this.isInitialized = true;
    console.log('📡 Upload service initialized', this.config);
  }

  updateConfig(config: Partial<UploadConfig>): void {
    if (!this.isInitialized) {
      throw new Error('Upload service not initialized');
    }
    this.config = { ...this.config, ...config };
    console.log('⚙️ Upload service config updated', config);
  }

  setNetworkCondition(condition: NetworkCondition): void {
    this.networkCondition = condition;
    console.log('📶 Network condition updated:', condition);
  }

  getAdaptiveStrategy(condition: NetworkCondition, fileSize: number): AdaptiveUploadStrategy {
    const baseChunkSize = this.config.defaultChunkSize;
    let chunkSize = baseChunkSize;
    let concurrentChunks = 1;
    let retryDelay = 1000;
    let timeoutMultiplier = 1;
    let shouldPause = false;

    // Adapt based on network quality
    switch (condition.quality) {
      case 'excellent':
        chunkSize = Math.min(this.config.maxChunkSize, baseChunkSize * 2);
        concurrentChunks = 3;
        retryDelay = 500;
        break;
      case 'good':
        chunkSize = baseChunkSize;
        concurrentChunks = 2;
        retryDelay = 1000;
        break;
      case 'fair':
        chunkSize = Math.max(this.config.minChunkSize, baseChunkSize / 2);
        concurrentChunks = 1;
        retryDelay = 2000;
        timeoutMultiplier = 1.5;
        break;
      case 'poor':
        chunkSize = this.config.minChunkSize;
        concurrentChunks = 1;
        retryDelay = 5000;
        timeoutMultiplier = 2;
        break;
    }

    // Adapt based on network type
    if (condition.type === 'cellular' && condition.isMetered) {
      chunkSize = Math.max(this.config.minChunkSize, chunkSize / 2);
      concurrentChunks = 1;
      retryDelay *= 2;
    }

    // For very large files, use smaller chunks on poor connections
    if (fileSize > 10 * 1024 * 1024 && condition.quality === 'poor') {
      chunkSize = this.config.minChunkSize;
    }

    return {
      chunkSize,
      concurrentChunks,
      retryDelay,
      timeoutMultiplier,
      shouldPause
    };
  }

  async uploadFile(
    audioUri: string,
    sessionId: string,
    duration: number,
    recordedAt: string,
    options: UploadOptions = {}
  ): Promise<UploadResult> {
    if (!this.isInitialized) {
      throw new Error('Upload service not initialized');
    }

    try {
      // Get file info
      const fileInfo = await FileSystem.getInfoAsync(audioUri);
      if (!fileInfo.exists) {
        throw this.createUploadError('NETWORK_ERROR', 'Audio file not found', true);
      }

      const fileSize = fileInfo.size || 0;
      
      // Determine upload strategy
      const strategy = this.determineUploadStrategy(fileSize);
      
      console.log(`📤 Starting ${strategy} upload for file: ${fileSize} bytes`);

      if (strategy === 'direct') {
        return await this.directUpload(audioUri, sessionId, duration, recordedAt, options);
      } else {
        return await this.chunkedUpload(audioUri, sessionId, duration, recordedAt, options);
      }

    } catch (error) {
      console.error('❌ Upload failed:', error);
      if (error instanceof Error && 'code' in error) {
        throw error;
      }
      throw this.createUploadError('SERVER_ERROR', error instanceof Error ? error.message : 'Unknown error', true);
    }
  }

  private determineUploadStrategy(fileSize: number): UploadStrategy {
    const directUploadMaxSize = 2 * 1024 * 1024; // 2MB
    const chunkedUploadMinSize = 1 * 1024 * 1024; // 1MB

    if (fileSize <= directUploadMaxSize) {
      return 'direct';
    } else if (fileSize >= chunkedUploadMinSize) {
      return 'chunked';
    } else {
      return 'adaptive';
    }
  }

  private async directUpload(
    audioUri: string,
    sessionId: string,
    duration: number,
    recordedAt: string,
    options: UploadOptions
  ): Promise<UploadResult> {
    const startTime = Date.now();
    
    try {
      // Read file as base64
      const fileData = await FileSystem.readAsStringAsync(audioUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const fileInfo = await FileSystem.getInfoAsync(audioUri);
      const fileSize = fileInfo.size || 0;

      // Create form data
      const formData = new FormData();
      formData.append('audio', {
        uri: audioUri,
        type: 'audio/wav',
        name: `dream-${sessionId}.wav`
      } as any);
      
      formData.append('sessionId', sessionId);
      formData.append('duration', duration.toString());
      formData.append('recordedAt', recordedAt);
      formData.append('fileSize', fileSize.toString());

      // Upload with progress tracking
      const result = await this.uploadWithProgress(formData, options.onProgress);
      
      if (!result.ok) {
        const errorData = await result.json();
        throw this.createUploadError('SERVER_ERROR', errorData.message || 'Upload failed', true);
      }

      const responseData = await result.json();
      
      return {
        success: true,
        dreamId: responseData.dreamId,
        uploadDuration: Date.now() - startTime,
        finalFileSize: fileSize
      };

    } catch (error) {
      throw this.createUploadError(
        'UPLOAD_FAILED', 
        error instanceof Error ? error.message : 'Direct upload failed', 
        true
      );
    }
  }

  private async chunkedUpload(
    audioUri: string,
    sessionId: string,
    duration: number,
    recordedAt: string,
    options: UploadOptions
  ): Promise<UploadResult> {
    const startTime = Date.now();
    
    try {
      const fileInfo = await FileSystem.getInfoAsync(audioUri);
      const fileSize = fileInfo.size || 0;
      
      // Get adaptive strategy based on network conditions
      const strategy = this.getAdaptiveStrategy(this.networkCondition, fileSize);
      const chunkSize = options.chunkSize || strategy.chunkSize;
      
      // Initialize chunked upload
      const uploadSession = await this.initializeChunkedUpload({
        sessionId,
        fileName: `dream-${sessionId}.wav`,
        fileSize,
        mimeType: 'audio/wav',
        duration,
        recordedAt,
        chunkSize,
        metadata: options.metadata
      });

      console.log(`🚀 Starting chunked upload: ${uploadSession.totalChunks} chunks of ${chunkSize} bytes`);

      // Track upload metrics
      const metrics: UploadMetrics = {
        uploadId: uploadSession.uploadId,
        sessionId,
        startTime: new Date().toISOString(),
        totalBytes: fileSize,
        bytesUploaded: 0,
        chunksTotal: uploadSession.totalChunks,
        chunksCompleted: 0,
        chunksFailed: 0,
        retryCount: 0,
        averageSpeed: 0,
        networkCondition: this.networkCondition,
        errors: []
      };

      this.uploadMetrics.set(uploadSession.uploadId, metrics);

      // Upload chunks
      const uploadedParts: Array<{ chunkNumber: number; etag: string }> = [];
      
      for (let chunkNumber = 1; chunkNumber <= uploadSession.totalChunks; chunkNumber++) {
        const offset = (chunkNumber - 1) * chunkSize;
        const chunkData = await this.readFileChunk(audioUri, offset, chunkSize);
        
        const chunk: UploadChunk = {
          data: chunkData,
          chunkNumber,
          totalChunks: uploadSession.totalChunks,
          chunkSize: chunkData.length,
          offset
        };

        // Upload chunk with retry logic
        const chunkResponse = await this.uploadChunkWithRetry(uploadSession.uploadId, chunk, options);
        uploadedParts.push({
          chunkNumber: chunkResponse.chunkNumber,
          etag: chunkResponse.etag
        });

        // Update progress
        metrics.chunksCompleted++;
        metrics.bytesUploaded += chunk.chunkSize;
        
        if (options.onProgress) {
          const progress: UploadProgress = {
            loaded: metrics.bytesUploaded,
            total: fileSize,
            percentage: (metrics.bytesUploaded / fileSize) * 100,
            speed: metrics.bytesUploaded / ((Date.now() - startTime) / 1000)
          };
          options.onProgress(progress);
        }

        console.log(`✅ Chunk ${chunkNumber}/${uploadSession.totalChunks} uploaded`);
      }

      // Complete upload
      const completionResponse = await this.completeUpload(uploadSession.uploadId, uploadedParts);
      
      metrics.endTime = new Date().toISOString();
      metrics.duration = Date.now() - startTime;
      metrics.averageSpeed = fileSize / (metrics.duration / 1000);

      console.log(`🎉 Chunked upload completed: ${completionResponse.dreamId}`);

      return {
        success: true,
        dreamId: completionResponse.dreamId,
        uploadDuration: metrics.duration,
        finalFileSize: fileSize
      };

    } catch (error) {
      console.error('❌ Chunked upload failed:', error);
      throw this.createUploadError(
        'CHUNK_FAILED',
        error instanceof Error ? error.message : 'Chunked upload failed',
        true
      );
    }
  }

  private async readFileChunk(audioUri: string, offset: number, chunkSize: number): Promise<string> {
    return await FileSystem.readAsStringAsync(audioUri, {
      encoding: FileSystem.EncodingType.Base64,
      position: offset,
      length: chunkSize
    });
  }

  private async uploadChunkWithRetry(
    uploadId: string,
    chunk: UploadChunk,
    options: UploadOptions
  ): Promise<UploadChunkResponse> {
    const maxRetries = options.retryAttempts || this.config.maxRetries;
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await this.uploadChunk(uploadId, chunk);
      } catch (error) {
        lastError = error as Error;
        
        if (attempt < maxRetries) {
          const delay = Math.pow(2, attempt - 1) * 1000; // Exponential backoff
          console.warn(`⚠️ Chunk ${chunk.chunkNumber} failed (attempt ${attempt}), retrying in ${delay}ms`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError || new Error('Chunk upload failed after all retries');
  }

  async initializeChunkedUpload(request: InitializeUploadRequest): Promise<InitializeUploadResponse> {
    const response = await this.makeRequest('POST', this.config.endpoints.initializeUpload, request);
    
    if (!response.ok) {
      throw this.createUploadError('INITIALIZATION_FAILED', 'Failed to initialize upload', true);
    }

    const data = await response.json();
    
    // Create upload session
    const session: ChunkedUploadSession = {
      uploadId: data.uploadId,
      sessionId: request.sessionId,
      totalSize: request.fileSize,
      chunkSize: data.chunkSize,
      totalChunks: data.totalChunks,
      uploadedChunks: [],
      status: 'uploading',
      createdAt: new Date().toISOString(),
      expiresAt: data.expiresAt
    };

    this.activeUploads.set(data.uploadId, session);
    
    return data;
  }

  async uploadChunk(uploadId: string, chunk: UploadChunk): Promise<UploadChunkResponse> {
    // In a real implementation, this would upload to the actual backend
    // For now, we'll simulate the upload
    await new Promise(resolve => setTimeout(resolve, Math.random() * 500 + 200)); // 200-700ms delay

    // Simulate occasional failures for testing
    if (Math.random() < 0.05) { // 5% failure rate
      throw this.createUploadError('CHUNK_FAILED', 'Simulated chunk upload failure', true);
    }

    return {
      chunkNumber: chunk.chunkNumber,
      etag: `etag-${chunk.chunkNumber}-${Date.now()}`,
      received: true
    };
  }

  async completeUpload(uploadId: string, parts: CompleteUploadRequest['parts']): Promise<CompleteUploadResponse> {
    const request: CompleteUploadRequest = {
      uploadId,
      parts
    };

    // Simulate completion
    await new Promise(resolve => setTimeout(resolve, 1000));

    const session = this.activeUploads.get(uploadId);
    if (session) {
      session.status = 'completed';
    }

    return {
      dreamId: `dream_${session?.sessionId || uploadId}`,
      finalUrl: `https://cdn.somni.app/dreams/${uploadId}.wav`,
      processingStatus: 'queued'
    };
  }

  async abortUpload(uploadId: string): Promise<void> {
    const session = this.activeUploads.get(uploadId);
    if (session) {
      session.status = 'aborted';
      this.activeUploads.delete(uploadId);
    }
  }

  private async uploadWithProgress(
    formData: FormData,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<Response> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      if (onProgress) {
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            onProgress({
              loaded: event.loaded,
              total: event.total,
              percentage: Math.round((event.loaded / event.total) * 100),
              speed: event.loaded / ((Date.now() - Date.now()) / 1000)
            });
          }
        });
      }

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          const response = {
            ok: true,
            status: xhr.status,
            json: () => Promise.resolve(JSON.parse(xhr.responseText))
          } as Response;
          resolve(response);
        } else {
          reject(new Error(`HTTP ${xhr.status}: ${xhr.statusText}`));
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Network error'));
      });

      xhr.addEventListener('timeout', () => {
        reject(new Error('Upload timeout'));
      });

      xhr.open('POST', `${this.config.baseUrl}/api/dreams/upload`);
      xhr.timeout = this.config.timeoutMs;
      xhr.send(formData);
    });
  }

  private async makeRequest(method: string, endpoint: string, data?: any): Promise<Response> {
    const url = `${this.config.baseUrl}${endpoint}`;
    
    return fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  private createUploadError(code: UploadError['code'], message: string, retryable: boolean): UploadError {
    return {
      code,
      message,
      retryable,
      timestamp: new Date().toISOString()
    };
  }

  // Additional interface methods (simplified implementations)
  async pauseUpload(uploadId: string): Promise<void> {
    const session = this.activeUploads.get(uploadId);
    if (session) {
      console.log(`⏸️ Paused upload: ${uploadId}`);
    }
  }

  async resumeUpload(uploadId: string): Promise<void> {
    const session = this.activeUploads.get(uploadId);
    if (session) {
      console.log(`▶️ Resumed upload: ${uploadId}`);
    }
  }

  async cancelUpload(uploadId: string): Promise<void> {
    await this.abortUpload(uploadId);
    console.log(`❌ Cancelled upload: ${uploadId}`);
  }

  getUploadProgress(uploadId: string): UploadProgress | null {
    const metrics = this.uploadMetrics.get(uploadId);
    if (!metrics) return null;

    return {
      loaded: metrics.bytesUploaded,
      total: metrics.totalBytes,
      percentage: (metrics.bytesUploaded / metrics.totalBytes) * 100,
      speed: metrics.averageSpeed
    };
  }

  getUploadMetrics(uploadId: string): UploadMetrics | null {
    return this.uploadMetrics.get(uploadId) || null;
  }

  getAllActiveUploads(): ChunkedUploadSession[] {
    return Array.from(this.activeUploads.values());
  }

  async cleanupExpiredUploads(): Promise<void> {
    const now = new Date();
    for (const [uploadId, session] of this.activeUploads.entries()) {
      if (new Date(session.expiresAt) < now) {
        await this.abortUpload(uploadId);
      }
    }
  }

  async cleanup(): Promise<void> {
    for (const uploadId of this.activeUploads.keys()) {
      await this.abortUpload(uploadId);
    }
    this.uploadMetrics.clear();
    console.log('🧹 Upload service cleaned up');
  }
}