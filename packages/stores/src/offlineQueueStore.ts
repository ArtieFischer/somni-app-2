import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import { 
  OfflineRecording, 
  OfflineQueueStore, 
  UploadResult, 
  UploadProgress,
  QueueStats,
  QueueFilter,
  QueueError
} from '@somni/types';

// Helper function to generate unique IDs
const generateId = () => `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// Helper function to determine if error is retryable
const isRetryableError = (error: any): boolean => {
  if (!error) return false;
  
  const message = error.message || '';
  const status = error.status || error.code;
  
  // Network errors are retryable
  if (message.includes('network') || message.includes('Network')) return true;
  if (message.includes('timeout') || message.includes('Timeout')) return true;
  if (message.includes('fetch')) return true;
  
  // Server errors (5xx) are retryable
  if (status >= 500 && status < 600) return true;
  
  // Rate limiting (429) is retryable
  if (status === 429) return true;
  
  // Connection errors are retryable
  if (message.includes('connection') || message.includes('Connection')) return true;
  
  return false;
};

// Create the offline queue store
export const useOfflineQueueStore = create<OfflineQueueStore>()(
  persist(
    (set, get) => ({
      // Initial state
      recordings: [],
      isProcessing: false,
      totalPendingSize: 0,
      currentUpload: null,
      
      // Settings with sensible defaults
      maxRetries: 3,
      batchSize: 3, // Process max 3 uploads simultaneously
      wifiOnlyMode: false,
      autoRetryEnabled: true,
      
      // Statistics
      uploadHistory: [],

      // Queue management actions
      addRecording: (recording) => {
        const newRecording: OfflineRecording = {
          ...recording,
          id: generateId(),
          retryCount: 0,
          status: 'pending',
          priority: getRecordingPriority(recording),
          maxRetries: get().maxRetries,
          deviceInfo: {
            platform: 'mobile',
            version: '1.0.0'
          }
        };

        set(state => {
          const updatedRecordings = [...state.recordings, newRecording];
          const newTotalSize = state.totalPendingSize + recording.fileSize;
          
          return {
            recordings: updatedRecordings,
            totalPendingSize: newTotalSize
          };
        });

        console.log('📥 Added recording to queue:', newRecording.id, 'Priority:', newRecording.priority);
        
        // Auto-start processing if enabled and conditions are good
        if (get().autoRetryEnabled && !get().isProcessing) {
          setTimeout(() => get().processQueue(), 1000);
        }
      },

      removeRecording: (id) => {
        set(state => {
          const recordingToRemove = state.recordings.find(r => r.id === id);
          const updatedRecordings = state.recordings.filter(r => r.id !== id);
          const removedSize = recordingToRemove?.fileSize || 0;
          
          return {
            recordings: updatedRecordings,
            totalPendingSize: Math.max(0, state.totalPendingSize - removedSize)
          };
        });

        console.log('🗑️ Removed recording from queue:', id);
      },

      updateRecording: (id, updates) => {
        set(state => ({
          recordings: state.recordings.map(recording =>
            recording.id === id
              ? { 
                  ...recording, 
                  ...updates, 
                  lastAttempt: new Date().toISOString() 
                }
              : recording
          )
        }));

        console.log('📝 Updated recording in queue:', id, updates);
      },

      clearCompletedRecordings: () => {
        set(state => {
          const completedRecordings = state.recordings.filter(r => r.status === 'completed');
          const remainingRecordings = state.recordings.filter(r => r.status !== 'completed');
          const removedSize = completedRecordings.reduce((sum, r) => sum + r.fileSize, 0);
          
          // Clean up local files for completed recordings
          completedRecordings.forEach(async (recording) => {
            try {
              await FileSystem.deleteAsync(recording.audioUri, { idempotent: true });
            } catch (error) {
              console.warn('Failed to delete audio file:', error);
            }
          });
          
          return {
            recordings: remainingRecordings,
            totalPendingSize: Math.max(0, state.totalPendingSize - removedSize)
          };
        });

        console.log('🧹 Cleared completed recordings');
      },

      clearAllRecordings: () => {
        set({
          recordings: [],
          totalPendingSize: 0,
          currentUpload: null
        });

        console.log('🗑️ Cleared all recordings from queue');
      },

      // Processing actions
      processQueue: async () => {
        const state = get();
        if (state.isProcessing) {
          console.log('⏳ Queue processing already in progress');
          return;
        }

        const pendingRecordings = state.recordings.filter(r => r.status === 'pending');
        if (pendingRecordings.length === 0) {
          console.log('✅ No pending recordings to process');
          return;
        }

        set({ isProcessing: true });
        console.log(`🚀 Starting queue processing: ${pendingRecordings.length} recordings`);

        try {
          // Sort by priority (high -> normal -> low)
          const sortedRecordings = pendingRecordings.sort((a, b) => {
            const priorityOrder = { high: 3, normal: 2, low: 1 };
            return priorityOrder[b.priority] - priorityOrder[a.priority];
          });

          // Process recordings one by one to avoid overwhelming
          for (const recording of sortedRecordings) {
            try {
              await get().processRecording(recording.id);
            } catch (error) {
              console.error(`❌ Failed to process recording ${recording.id}:`, error);
            }
          }

          get().updateStats();
          console.log('✅ Queue processing completed');

        } catch (error) {
          console.error('❌ Queue processing error:', error);
        } finally {
          set({ isProcessing: false, currentUpload: null });
        }
      },

      processRecording: async (recordingId) => {
        const recording = get().recordings.find(r => r.id === recordingId);
        if (!recording) {
          return { success: false, error: 'Recording not found' };
        }

        const startTime = Date.now();

        try {
          // Check if file still exists (skip for mock files)
          const isMockFile = recording.audioUri.includes('mock_audio');
          
          if (!isMockFile) {
            const fileInfo = await FileSystem.getInfoAsync(recording.audioUri);
            if (!fileInfo.exists) {
              get().updateRecording(recordingId, { 
                status: 'failed', 
                error: 'Audio file no longer exists' 
              });
              return { success: false, error: 'File not found' };
            }
          }

          get().updateRecording(recordingId, { status: 'uploading' });
          
          // Simulate chunked upload with progress
          const uploadResult = await simulateChunkedUploadWithProgress(recording, (progress) => {
            get().setUploadProgress(recordingId, progress);
          });

          if (uploadResult.success) {
            get().updateRecording(recordingId, { 
              status: 'completed',
              uploadDuration: Date.now() - startTime
            });
            
            // Add to upload history
            set(state => ({
              uploadHistory: [
                {
                  recordingId,
                  timestamp: new Date().toISOString(),
                  success: true,
                  duration: uploadResult.uploadDuration || 0,
                  fileSize: recording.fileSize
                },
                ...state.uploadHistory.slice(0, 99) // Keep last 100 entries
              ]
            }));

            // Clean up local file after successful upload (skip for mock files)
            try {
              if (!isMockFile) {
                await FileSystem.deleteAsync(recording.audioUri, { idempotent: true });
              }
            } catch (deleteError) {
              console.warn('Failed to delete local file:', deleteError);
            }

            // Update the dream with the server ID if provided
            if (uploadResult.dreamId) {
              try {
                const { useDreamStore } = await import('./dreamStore');
                const dreamStore = useDreamStore.getState();
                dreamStore.updateDream(`temp_${recording.sessionId}`, {
                  id: uploadResult.dreamId,
                  status: 'completed',
                  rawTranscript: uploadResult.transcript || 'Dream uploaded successfully'
                });
              } catch (error) {
                console.warn('Failed to update dream store:', error);
              }
            }

            console.log('✅ Upload completed:', recordingId);
            return uploadResult;

          } else {
            throw new Error(uploadResult.error || 'Upload failed');
          }

        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Upload failed';
          const isRetryable = isRetryableError(error);
          
          if (recording.retryCount >= recording.maxRetries) {
            get().updateRecording(recordingId, { 
              status: 'failed', 
              error: errorMessage 
            });
            console.error('❌ Upload failed permanently:', recordingId, errorMessage);
          } else if (isRetryable) {
            // Schedule automatic retry with exponential backoff
            const retryDelay = Math.min(5000 * Math.pow(2, recording.retryCount), 60000); // Max 60s
            console.warn(`⚠️ Upload failed, scheduling retry in ${retryDelay}ms:`, recordingId, errorMessage);
            
            get().updateRecording(recordingId, { 
              error: errorMessage,
              retryCount: recording.retryCount + 1
            });
            
            // Schedule the retry
            setTimeout(() => {
              get().updateRecording(recordingId, { 
                status: 'pending'
              });
              console.log(`🔄 Auto-retry: Recording ${recordingId} moved back to pending (attempt ${recording.retryCount + 1}/${recording.maxRetries})`);
              
              // Force queue processing after a short delay
              setTimeout(() => {
                get().processQueue();
              }, 1000);
            }, retryDelay);
          } else {
            get().updateRecording(recordingId, { 
              status: 'failed', 
              error: errorMessage 
            });
            console.error('❌ Upload failed (non-retryable):', recordingId, errorMessage);
          }

          // Add to upload history
          set(state => ({
            uploadHistory: [
              {
                recordingId,
                timestamp: new Date().toISOString(),
                success: false,
                duration: 0,
                fileSize: recording.fileSize
              },
              ...state.uploadHistory.slice(0, 99)
            ]
          }));

          return { success: false, error: errorMessage };
        } finally {
          get().clearUploadProgress();
        }
      },

      retryFailedRecordings: async () => {
        const failedRecordings = get().recordings.filter(
          r => r.status === 'failed' && r.retryCount < r.maxRetries
        );

        console.log(`🔄 Retrying ${failedRecordings.length} failed recordings`);

        for (const recording of failedRecordings) {
          get().updateRecording(recording.id, { 
            status: 'pending',
            retryCount: recording.retryCount + 1,
            error: undefined
          });
        }

        if (failedRecordings.length > 0) {
          await get().processQueue();
        }
      },

      pauseProcessing: () => {
        set({ isProcessing: false });
        console.log('⏸️ Queue processing paused');
      },

      resumeProcessing: () => {
        if (get().recordings.some(r => r.status === 'pending')) {
          get().processQueue();
        }
      },

      // Filtering and search
      getRecordingsByStatus: (status) => {
        return get().recordings.filter(recording => recording.status === status);
      },

      getRecordingsByFilter: (filter) => {
        let filteredRecordings = [...get().recordings];

        if (filter.status && filter.status.length > 0) {
          filteredRecordings = filteredRecordings.filter(r => 
            filter.status!.includes(r.status)
          );
        }

        if (filter.priority && filter.priority.length > 0) {
          filteredRecordings = filteredRecordings.filter(r => 
            filter.priority!.includes(r.priority)
          );
        }

        if (filter.dateFrom || filter.dateTo) {
          filteredRecordings = filteredRecordings.filter(r => {
            const recordingDate = new Date(r.recordedAt);
            const fromDate = filter.dateFrom ? new Date(filter.dateFrom) : new Date(0);
            const toDate = filter.dateTo ? new Date(filter.dateTo) : new Date();
            return recordingDate >= fromDate && recordingDate <= toDate;
          });
        }

        if (filter.minSize !== undefined || filter.maxSize !== undefined) {
          filteredRecordings = filteredRecordings.filter(r => {
            const minSize = filter.minSize ?? 0;
            const maxSize = filter.maxSize ?? Infinity;
            return r.fileSize >= minSize && r.fileSize <= maxSize;
          });
        }

        return filteredRecordings;
      },

      // Statistics
      getQueueStats: () => {
        const recordings = get().recordings;
        const history = get().uploadHistory;
        
        const pendingCount = recordings.filter(r => r.status === 'pending').length;
        const uploadingCount = recordings.filter(r => r.status === 'uploading').length;
        const failedCount = recordings.filter(r => r.status === 'failed').length;
        const completedCount = recordings.filter(r => r.status === 'completed').length;
        
        const totalSize = recordings.reduce((sum, r) => sum + r.fileSize, 0);
        
        const successfulUploads = history.filter(h => h.success);
        const averageUploadTime = successfulUploads.length > 0 
          ? successfulUploads.reduce((sum, h) => sum + h.duration, 0) / successfulUploads.length 
          : 0;
        
        const successRate = history.length > 0 
          ? (successfulUploads.length / history.length) * 100 
          : 0;

        return {
          totalRecordings: recordings.length,
          pendingCount,
          uploadingCount,
          failedCount,
          completedCount,
          totalSize,
          averageUploadTime,
          successRate
        };
      },

      updateStats: () => {
        // Update cached stats if needed
        const stats = get().getQueueStats();
        console.log('📊 Queue stats updated:', stats);
      },

      getUploadHistory: (limit = 50) => {
        return get().uploadHistory.slice(0, limit);
      },

      // Settings
      setMaxRetries: (maxRetries) => {
        set({ maxRetries });
        console.log('⚙️ Max retries set to:', maxRetries);
      },

      setBatchSize: (batchSize) => {
        set({ batchSize: Math.max(1, Math.min(10, batchSize)) });
        console.log('⚙️ Batch size set to:', batchSize);
      },

      setWifiOnlyMode: (enabled) => {
        set({ wifiOnlyMode: enabled });
        console.log('⚙️ WiFi-only mode:', enabled ? 'enabled' : 'disabled');
      },

      setAutoRetryEnabled: (enabled) => {
        set({ autoRetryEnabled: enabled });
        console.log('⚙️ Auto-retry:', enabled ? 'enabled' : 'disabled');
      },

      // Progress tracking
      setUploadProgress: (recordingId, progress) => {
        set({ 
          currentUpload: { 
            recordingId, 
            progress: {
              ...progress,
              speed: progress.speed || 0,
              remainingTime: progress.remainingTime || 0
            }
          } 
        });
      },

      clearUploadProgress: () => {
        set({ currentUpload: null });
      }
    }),
    {
      name: 'somni-offline-queue-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        recordings: state.recordings,
        maxRetries: state.maxRetries,
        batchSize: state.batchSize,
        wifiOnlyMode: state.wifiOnlyMode,
        autoRetryEnabled: state.autoRetryEnabled,
        uploadHistory: state.uploadHistory
        // Don't persist: isProcessing, currentUpload, totalPendingSize
      })
    }
  )
);

// Helper function to determine recording priority
function getRecordingPriority(
  recording: { duration: number; fileSize: number }
): 'low' | 'normal' | 'high' {
  // Short recordings get high priority
  if (recording.duration < 30) return 'high';
  
  // Small files get high priority
  if (recording.fileSize < 1024 * 1024) return 'high';
  
  // Large files get low priority
  if (recording.fileSize > 5 * 1024 * 1024) return 'low';
  
  return 'normal';
}

// Simulate chunked upload with progress (replace with actual upload service)
async function simulateChunkedUploadWithProgress(
  recording: OfflineRecording,
  onProgress: (progress: UploadProgress) => void
): Promise<UploadResult> {
  const startTime = Date.now();
  const chunkSize = 1024 * 1024; // 1MB chunks
  const totalChunks = Math.ceil(recording.fileSize / chunkSize);
  
  console.log(`📤 Starting chunked upload: ${totalChunks} chunks for ${recording.id}`);
  
  return new Promise((resolve) => {
    let currentChunk = 0;
    
    const uploadChunk = () => {
      currentChunk++;
      const percentage = Math.min(100, (currentChunk / totalChunks) * 100);
      const loaded = Math.floor((recording.fileSize * percentage) / 100);
      
      onProgress({
        loaded,
        total: recording.fileSize,
        percentage,
        speed: loaded / ((Date.now() - startTime) / 1000),
        remainingTime: ((100 - percentage) / percentage) * ((Date.now() - startTime) / 1000)
      });
      
      if (currentChunk >= totalChunks) {
        // Determine success based on retry count and random factors
        const isRetry = recording.retryCount > 0;
        let successChance;
        
        if (isRetry) {
          // Higher success rate on retries
          successChance = 0.85; // 85% success on retry
        } else {
          // First attempt success rate based on file size
          if (recording.fileSize > 5 * 1024 * 1024) {
            successChance = 0.5; // 50% for large files
          } else {
            successChance = 0.7; // 70% for normal files
          }
        }
        
        const success = Math.random() < successChance;
        
        resolve({
          success,
          dreamId: success ? `dream_${recording.sessionId}_${Date.now()}` : undefined,
          error: success ? undefined : `Simulated chunked upload failure (attempt ${recording.retryCount + 1})`,
          uploadDuration: Date.now() - startTime,
          finalFileSize: recording.fileSize,
          transcript: success ? `Transcribed dream from session ${recording.sessionId}` : undefined
        });
      } else {
        // Continue with next chunk after delay
        const delay = Math.random() * 200 + 100; // 100-300ms per chunk
        setTimeout(uploadChunk, delay);
      }
    };
    
    // Start uploading
    uploadChunk();
  });
}