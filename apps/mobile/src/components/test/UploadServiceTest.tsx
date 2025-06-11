// apps/mobile/src/hooks/useOfflineRecordingQueue.ts

import { useEffect, useCallback, useState, useRef } from 'react';
import { useOfflineQueueStore } from '@somni/stores';
import { ProgressiveUploadService } from '@somni/stores';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import { useDreamStore } from '@somni/stores';
import { 
  OfflineRecording, 
  UploadResult, 
  NetworkCondition,
  UploadOptions 
} from '@somni/types';

interface UseOfflineRecordingQueueReturn {
  // Queue status
  pendingCount: number;
  failedCount: number;
  completedCount: number;
  uploadingCount: number;
  totalSize: number;
  isProcessing: boolean;
  
  // Current upload info
  currentUpload: {
    recordingId: string;
    progress: {
      loaded: number;
      total: number;
      percentage: number;
      speed?: number;
    };
  } | null;
  
  // Network awareness
  networkStatus: {
    isOnline: boolean;
    type: string;
    quality: string;
    isWifi: boolean;
    shouldUpload: boolean;
    blockReason?: string;
  };
  
  // Queue management actions
  addRecording: (recording: {
    sessionId: string;
    audioUri: string;
    duration: number;
    fileSize: number;
    recordedAt: string;
  }) => void;
  
  processQueue: () => Promise<void>;
  retryFailedRecordings: () => Promise<void>;
  clearCompletedRecordings: () => void;
  clearAllRecordings: () => void;
  removeRecording: (id: string) => void;
  
  // Settings
  setWifiOnlyMode: (enabled: boolean) => void;
  setAutoRetryEnabled: (enabled: boolean) => void;
  setMaxRetries: (retries: number) => void;
  
  // Advanced features
  pauseProcessing: () => void;
  resumeProcessing: () => void;
  getQueueStats: () => {
    totalRecordings: number;
    successRate: number;
    averageUploadTime: number;
    networkEfficiency: number;
  };
}

export const useOfflineRecordingQueue = (): UseOfflineRecordingQueueReturn => {
  const queueStore = useOfflineQueueStore();
  const dreamStore = useDreamStore();
  const networkStatus = useNetworkStatus();
  
  // Upload service instance (singleton)
  const [uploadService] = useState(() => new ProgressiveUploadService());
  const [isServiceInitialized, setIsServiceInitialized] = useState(false);
  
  // Force re-renders when network or queue state changes
  const [updateTrigger, setUpdateTrigger] = useState(0);
  
  // FIXED: Track WiFi-only mode properly
  const [wifiOnlyMode, setWifiOnlyModeState] = useState(true); // Default to true
  
  // Prevent infinite loops with refs
  const lastNetworkState = useRef<string>('');
  const isProcessingRef = useRef(false);

  useEffect(() => {
    setUpdateTrigger(prev => prev + 1);
  }, [
    networkStatus.isOnline,
    networkStatus.isConnected,
    networkStatus.isInternetReachable,
    networkStatus.type,
    networkStatus.connectionQuality,
    wifiOnlyMode, // FIXED: Use local state instead of queueStore
    queueStore.isProcessing
  ]);

  // Initialize upload service
  useEffect(() => {
    const initializeService = async () => {
      try {
        await uploadService.initialize({
          baseUrl: process.env.EXPO_PUBLIC_API_URL || 'https://api.somni.app',
          defaultChunkSize: 1024 * 1024, // 1MB
          maxRetries: 3,
          timeoutMs: 30000,
          concurrentUploads: 2 // Conservative for mobile
        });
        setIsServiceInitialized(true);
        console.log('📡 Upload service initialized in queue hook');
      } catch (error) {
        console.error('❌ Failed to initialize upload service:', error);
      }
    };

    initializeService();

    // Cleanup on unmount
    return () => {
      uploadService.cleanup();
    };
  }, [uploadService]);

  // Helper functions (moved up for better organization)
  const shouldUploadNow = useCallback((): { allowed: boolean; reason?: string } => {
    // Check the actual network status from our hook
    if (!networkStatus.isOnline) {
      return { allowed: false, reason: 'Not online' };
    }
    
    if (!networkStatus.isConnected) {
      return { allowed: false, reason: 'Not connected' };
    }
    
    if (!networkStatus.isInternetReachable) {
      return { allowed: false, reason: 'No internet access' };
    }
    
    // FIXED: Use local state for WiFi-only mode
    if (wifiOnlyMode && !networkStatus.isWifi) {
      return { allowed: false, reason: 'WiFi-only mode enabled (disable in settings)' };
    }
    
    if (networkStatus.connectionQuality === 'poor') {
      return { allowed: false, reason: 'Poor connection quality' };
    }
    
    return { allowed: true };
  }, [networkStatus, wifiOnlyMode]); // FIXED: Use local state

  // Update network condition in upload service (only when it actually changes)
  useEffect(() => {
    if (!isServiceInitialized) return;

    const networkKey = `${networkStatus.type}-${networkStatus.connectionQuality}-${networkStatus.isConnected}-${networkStatus.isInternetReachable}`;
    
    // Only update if network state actually changed
    if (lastNetworkState.current === networkKey) return;
    lastNetworkState.current = networkKey;

    const networkCondition: NetworkCondition = {
      type: networkStatus.type as any,
      quality: networkStatus.connectionQuality as any,
      isMetered: networkStatus.isCellular,
      bandwidth: getBandwidthEstimate(networkStatus),
      latency: getLatencyEstimate(networkStatus)
    };

    uploadService.setNetworkCondition(networkCondition);
    console.log('📡 Updated upload service network condition:', networkCondition);
  }, [
    uploadService, 
    isServiceInitialized,
    networkStatus.type,
    networkStatus.connectionQuality,
    networkStatus.isConnected,
    networkStatus.isInternetReachable,
    networkStatus.isCellular
  ]);

  // Auto-process queue when network conditions improve OR when failed recordings become pending again
  useEffect(() => {
    if (!isServiceInitialized || isProcessingRef.current) return;

    const uploadCheck = shouldUploadNow();
    const hasPendingRecordings = queueStore.getRecordingsByStatus('pending').length > 0;
    
    if (uploadCheck.allowed && hasPendingRecordings && !queueStore.isProcessing) {
      const delay = getProcessingDelay(networkStatus);
      console.log(`🔄 Network conditions good, will process queue in ${delay}ms`);
      
      const timer = setTimeout(() => {
        processQueue();
      }, delay);

      return () => clearTimeout(timer);
    } else if (hasPendingRecordings && !uploadCheck.allowed) {
      console.log(`🚫 Cannot process queue - ${uploadCheck.reason}. Keeping ${hasPendingRecordings} recordings in pending state.`);
    }
  }, [
    networkStatus.isOnline, 
    networkStatus.isConnected, 
    networkStatus.isInternetReachable, 
    networkStatus.isWifi, 
    wifiOnlyMode, // FIXED: Use local state
    isServiceInitialized,
    // ADDED: Track pending count to trigger auto-retry when failed recordings become pending
    queueStore.getRecordingsByStatus('pending').length
  ]);

  // Enhanced queue processing with upload service integration
  const processQueue = useCallback(async () => {
    if (!isServiceInitialized || isProcessingRef.current || queueStore.isProcessing) {
      console.log('⏳ Service not ready or already processing');
      return;
    }

    const pendingRecordings = queueStore.getRecordingsByStatus('pending');
    if (pendingRecordings.length === 0) {
      console.log('✅ No pending recordings to process');
      return;
    }

    // Check if we should upload based on current conditions
    const uploadCheck = shouldUploadNow();
    if (!uploadCheck.allowed) {
      console.log(`🚫 Cannot process queue - ${uploadCheck.reason}. Keeping ${pendingRecordings.length} recordings in pending state.`);
      return;
    }

    console.log(`🚀 Processing ${pendingRecordings.length} recordings with upload service`);

    // Set processing flags
    isProcessingRef.current = true;
    
    try {
      // Process recordings one by one to avoid overwhelming the service
      for (const recording of pendingRecordings) {
        try {
          await processRecordingWithUploadService(recording);
        } catch (error) {
          console.error(`❌ Failed to process recording ${recording.id}:`, error);
        }
      }
    } finally {
      isProcessingRef.current = false;
    }

    console.log('✅ Queue processing completed');
  }, [isServiceInitialized, queueStore, shouldUploadNow]);

  // Process individual recording using upload service
  const processRecordingWithUploadService = async (recording: OfflineRecording) => {
    try {
      // Triple-check network before starting upload
      const uploadCheck = shouldUploadNow();
      if (!uploadCheck.allowed) {
        console.log(`🚫 Skipping upload for ${recording.id} - ${uploadCheck.reason}`);
        return;
      }

      queueStore.updateRecording(recording.id, { status: 'uploading' });
      
      const uploadOptions: UploadOptions = {
        onProgress: (progress) => {
          queueStore.setUploadProgress(recording.id, progress);
        },
        retryAttempts: recording.maxRetries - recording.retryCount,
        wifiOnly: wifiOnlyMode, // FIXED: Use local state
        priority: recording.priority,
        metadata: {
          sessionId: recording.sessionId,
          recordingId: recording.id,
          retryCount: recording.retryCount
        }
      };

      console.log(`📤 Starting upload for recording ${recording.id}`);

      const result: UploadResult = await uploadService.uploadFile(
        recording.audioUri,
        recording.sessionId,
        recording.duration,
        recording.recordedAt,
        uploadOptions
      );

      if (result.success) {
        // Update recording as completed
        queueStore.updateRecording(recording.id, { 
          status: 'completed'
        });

        // Create/update dream in dream store
        const dreamExists = dreamStore.getDreamById(`temp_${recording.sessionId}`);
        if (dreamExists) {
          // Update existing placeholder dream
          dreamStore.updateDream(dreamExists.id, {
            id: result.dreamId,
            status: 'completed',
            wasEdited: false
          });
        } else {
          // Create new dream entry
          dreamStore.addDream({
            id: result.dreamId || `dream_${recording.sessionId}`,
            userId: 'current-user', // TODO: Get from auth store
            rawTranscript: `Dream uploaded from recording ${recording.sessionId}`,
            duration: recording.duration,
            confidence: 1.0,
            wasEdited: false,
            recordedAt: recording.recordedAt,
            createdAt: new Date().toISOString(),
            status: 'completed',
            audioUri: recording.audioUri,
            fileSize: recording.fileSize
          });
        }

        console.log(`✅ Recording ${recording.id} uploaded successfully: ${result.dreamId}`);

      } else {
        throw new Error(result.error || 'Upload failed');
      }

    } catch (error) {
      console.error(`❌ Upload service error for ${recording.id}:`, error);
      
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      
      if (recording.retryCount >= recording.maxRetries) {
        queueStore.updateRecording(recording.id, { 
          status: 'failed', 
          error: errorMessage 
        });
        console.error(`💀 Recording ${recording.id} failed permanently after ${recording.retryCount} retries`);
      } else {
        // FIXED: Auto-retry with delay and better error handling
        const retryDelay = Math.min(1000 * Math.pow(2, recording.retryCount), 10000); // Exponential backoff, max 10s
        console.warn(`⚠️ Recording ${recording.id} will retry in ${retryDelay}ms (attempt ${recording.retryCount + 1}/${recording.maxRetries})`);
        
        // First update the retry count
        queueStore.updateRecording(recording.id, { 
          error: errorMessage,
          retryCount: recording.retryCount + 1
        });
        
        // Then schedule the retry
        setTimeout(() => {
          queueStore.updateRecording(recording.id, { 
            status: 'pending'
          });
          console.log(`🔄 Auto-retry: Recording ${recording.id} moved back to pending (attempt ${recording.retryCount + 1}/${recording.maxRetries})`);
          
          // Force queue processing after a short delay
          setTimeout(() => {
            if (shouldUploadNow().allowed) {
              console.log(`🚀 Auto-processing retry for ${recording.id}`);
              processQueue();
            }
          }, 1000);
        }, retryDelay);
      }
    } finally {
      queueStore.clearUploadProgress();
    }
  };

  // Smart recording addition with immediate processing
  const addRecording = useCallback((recording: {
    sessionId: string;
    audioUri: string;
    duration: number;
    fileSize: number;
    recordedAt: string;
  }) => {
    // Add to queue with intelligent priority
    const priority = getRecordingPriority(recording, networkStatus);
    
    queueStore.addRecording({
      ...recording,
      priority,
      maxRetries: queueStore.maxRetries
    });

    console.log(`📥 Added recording to queue with priority: ${priority}`);

    // Try immediate upload if conditions are good
    const uploadCheck = shouldUploadNow();
    if (uploadCheck.allowed && networkStatus.connectionQuality !== 'fair' && !isProcessingRef.current) {
      console.log('🚀 Good network conditions, attempting immediate upload');
      setTimeout(() => processQueue(), 500); // Small delay to ensure queue is updated
    } else {
      console.log(`📱 Recording queued for later upload - ${uploadCheck.reason || 'Conditions not optimal'}`);
    }
  }, [queueStore, networkStatus, processQueue, shouldUploadNow]);

  // Enhanced retry with exponential backoff
  const retryFailedRecordings = useCallback(async () => {
    const uploadCheck = shouldUploadNow();
    if (!uploadCheck.allowed) {
      console.log(`🚫 Cannot retry failed recordings - ${uploadCheck.reason}`);
      Alert.alert('Cannot Retry', uploadCheck.reason || 'Upload conditions not met');
      return;
    }

    const failedRecordings = queueStore.getRecordingsByStatus('failed');
    const retryableRecordings = failedRecordings.filter(
      r => r.retryCount < r.maxRetries
    );

    if (retryableRecordings.length === 0) {
      console.log('ℹ️ No retryable recordings found');
      Alert.alert('No Retries Available', 'All failed recordings have exceeded maximum retry attempts.');
      return;
    }

    console.log(`🔄 Retrying ${retryableRecordings.length} failed recordings`);

    // Reset failed recordings to pending status
    for (let i = 0; i < retryableRecordings.length; i++) {
      const recording = retryableRecordings[i];
      const delay = Math.min(1000 * Math.pow(2, recording.retryCount), 30000); // Max 30s delay

      setTimeout(() => {
        queueStore.updateRecording(recording.id, { 
          status: 'pending',
          retryCount: recording.retryCount + 1,
          error: undefined
        });
        console.log(`🔄 Manual retry: Recording ${recording.id} moved to pending (attempt ${recording.retryCount + 1}/${recording.maxRetries})`);
      }, delay * i); // Stagger the retries
    }

    // Process queue after all retries are scheduled
    setTimeout(() => processQueue(), 2000);
    
    Alert.alert(
      'Retry Started', 
      `${retryableRecordings.length} failed recordings will be retried with exponential backoff.`
    );
  }, [queueStore, processQueue, shouldUploadNow]);

  const getRecordingPriority = (
    recording: { duration: number; fileSize: number },
    network: typeof networkStatus
  ): 'low' | 'normal' | 'high' => {
    // Short recordings get high priority
    if (recording.duration < 30) return 'high';
    
    // Small files on good network get high priority
    if (recording.fileSize < 1024 * 1024 && network.connectionQuality === 'excellent') {
      return 'high';
    }
    
    // Large files on poor network get low priority
    if (recording.fileSize > 5 * 1024 * 1024 && network.connectionQuality === 'poor') {
      return 'low';
    }
    
    return 'normal';
  };

  const getBandwidthEstimate = (network: typeof networkStatus): number => {
    switch (network.connectionQuality) {
      case 'excellent': return network.isWifi ? 100 : 50;
      case 'good': return network.isWifi ? 50 : 20;
      case 'fair': return network.isWifi ? 20 : 10;
      case 'poor': return network.isWifi ? 5 : 2;
      default: return 10;
    }
  };

  const getLatencyEstimate = (network: typeof networkStatus): number => {
    switch (network.connectionQuality) {
      case 'excellent': return network.isWifi ? 10 : 30;
      case 'good': return network.isWifi ? 20 : 50;
      case 'fair': return network.isWifi ? 50 : 100;
      case 'poor': return network.isWifi ? 200 : 500;
      default: return 100;
    }
  };

  const getProcessingDelay = (network: typeof networkStatus): number => {
    // Delay processing based on network quality to avoid overwhelming poor connections
    switch (network.connectionQuality) {
      case 'excellent': return 500;
      case 'good': return 1000;
      case 'fair': return 3000;
      case 'poor': return 10000;
      default: return 5000;
    }
  };

  // Enhanced stats calculation
  const getQueueStats = useCallback(() => {
    const baseStats = queueStore.getQueueStats();
    const history = queueStore.getUploadHistory(50);
    
    // Calculate network efficiency (successful uploads per network type)
    const wifiUploads = history.filter(h => h.success); // Simplified
    const networkEfficiency = history.length > 0 ? (wifiUploads.length / history.length) * 100 : 0;
    
    return {
      ...baseStats,
      networkEfficiency
    };
  }, [queueStore]);

  // Get current upload status reason
  const getUploadStatusReason = (): string | undefined => {
    const uploadCheck = shouldUploadNow();
    return uploadCheck.allowed ? undefined : uploadCheck.reason;
  };

  return {
    // Queue status
    pendingCount: queueStore.getRecordingsByStatus('pending').length,
    failedCount: queueStore.getRecordingsByStatus('failed').length,
    completedCount: queueStore.getRecordingsByStatus('completed').length,
    uploadingCount: queueStore.getRecordingsByStatus('uploading').length,
    totalSize: queueStore.getQueueStats().totalSize,
    isProcessing: queueStore.isProcessing || isProcessingRef.current,
    
    // Current upload (only show if actually uploading and online)
    currentUpload: shouldUploadNow().allowed ? queueStore.currentUpload : null,
    
    // Network status with block reason
    networkStatus: {
      isOnline: networkStatus.isOnline,
      type: networkStatus.type,
      quality: networkStatus.connectionQuality,
      isWifi: networkStatus.isWifi,
      shouldUpload: shouldUploadNow().allowed,
      blockReason: getUploadStatusReason()
    },
    
    // Actions
    addRecording,
    processQueue,
    retryFailedRecordings,
    clearCompletedRecordings: queueStore.clearCompletedRecordings,
    clearAllRecordings: queueStore.clearAllRecordings,
    removeRecording: queueStore.removeRecording,
    
    // Settings
    setWifiOnlyMode: (enabled: boolean) => {
      setWifiOnlyModeState(enabled);
      queueStore.setWifiOnlyMode(enabled); // Also update the store if it has this method
      console.log(`📶 WiFi-only mode ${enabled ? 'enabled' : 'disabled'}`);
    },
    setAutoRetryEnabled: queueStore.setAutoRetryEnabled,
    setMaxRetries: queueStore.setMaxRetries,
    
    // Advanced
    pauseProcessing: queueStore.pauseProcessing,
    resumeProcessing: () => {
      queueStore.resumeProcessing();
      processQueue();
    },
    getQueueStats
  };
};