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
  const retryableCodes = ['NETWORK_ERROR', 'UPLOAD_FAILED', 'QUOTA_EXCEEDED'];
  return retryableCodes.includes(error.code) || 
         (error.message && error.message.includes('network'));
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
          priority: 'normal',
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

        console.log('📥 Added recording to offline queue:', newRecording.id);
        
        // Auto-start processing if enabled
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
          // Process recordings in batches
          const batchSize = state.batchSize;
          for (let i = 0; i < pendingRecordings.length; i += batchSize) {
            const batch = pendingRecordings.slice(i, i + batchSize);
            
            // Process batch concurrently
            const batchPromises = batch.map(recording => 
              get().processRecording(recording.id)
            );
            
            await Promise.allSettled(batchPromises);
            
            // Brief pause between batches to prevent overwhelming
            if (i + batchSize < pendingRecordings.length) {
              await new Promise(resolve => setTimeout(resolve, 1000));
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

        try {
          // Check if file still exists
          const fileInfo = await FileSystem.getInfoAsync(recording.audioUri);
          if (!fileInfo.exists) {
            get().updateRecording(recordingId, { 
              status: 'failed', 
              error: 'Audio file no longer exists' 
            });
            return { success: false, error: 'File not found' };
          }

          get().updateRecording(recordingId, { status: 'uploading' });
          
          // Simulate upload with progress (replace with actual upload service)
          const uploadResult = await simulateUploadWithProgress(recording, (progress) => {
            get().setUploadProgress(recordingId, progress);
          });

          if (uploadResult.success) {
            get().updateRecording(recordingId, { status: 'completed' });
            
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

            // Clean up local file after successful upload
            try {
              await FileSystem.deleteAsync(recording.audioUri);
            } catch (deleteError) {
              console.warn('Failed to delete local file:', deleteError);
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
            get().updateRecording(recordingId, { 
              status: 'pending',
              error: errorMessage,
              retryCount: recording.retryCount + 1
            });
            console.warn('⚠️ Upload failed, will retry:', recordingId, errorMessage);
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

// Simulate upload with progress (replace with actual upload service)
async function simulateUploadWithProgress(
  recording: OfflineRecording,
  onProgress: (progress: UploadProgress) => void
): Promise<UploadResult> {
  const startTime = Date.now();
  const duration = Math.random() * 3000 + 2000; // 2-5 seconds
  const steps = 20;
  
  return new Promise((resolve) => {
    let step = 0;
    const interval = setInterval(() => {
      step++;
      const percentage = Math.min(100, (step / steps) * 100);
      const loaded = Math.floor((recording.fileSize * percentage) / 100);
      
      onProgress({
        loaded,
        total: recording.fileSize,
        percentage,
        speed: loaded / ((Date.now() - startTime) / 1000),
        remainingTime: ((100 - percentage) / percentage) * ((Date.now() - startTime) / 1000)
      });
      
      if (step >= steps) {
        clearInterval(interval);
        
        // Simulate occasional failures for testing
        const success = Math.random() > 0.1; // 90% success rate
        
        resolve({
          success,
          dreamId: success ? `dream_${recording.sessionId}` : undefined,
          error: success ? undefined : 'Simulated upload failure',
          uploadDuration: Date.now() - startTime,
          finalFileSize: recording.fileSize
        });
      }
    }, duration / steps);
  });
}