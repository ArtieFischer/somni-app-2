import { useEffect, useCallback } from 'react';
import { useOfflineQueueStore } from '@somni/stores';
import { useNetworkStatus } from './useNetworkStatus';

interface UseOfflineRecordingQueueReturn {
  pendingCount: number;
  failedCount: number;
  completedCount: number;
  uploadingCount: number;
  totalSize: number;
  isProcessing: boolean;
  currentUpload: {
    recordingId: string;
    progress: {
      loaded: number;
      total: number;
      percentage: number;
      speed?: number;
    };
  } | null;
  addRecording: (recording: any) => void;
  processQueue: () => Promise<void>;
  retryFailedRecordings: () => Promise<void>;
  clearCompletedRecordings: () => void;
  clearAllRecordings: () => void;
}

export const useOfflineRecordingQueue = (): UseOfflineRecordingQueueReturn => {
  const queueStore = useOfflineQueueStore();
  const { isOnline, isConnected, isInternetReachable } = useNetworkStatus();

  // Auto-process queue when connection is restored
  useEffect(() => {
    if (isOnline && isConnected && isInternetReachable) {
      const pendingCount = queueStore.getRecordingsByStatus('pending').length;
      if (pendingCount > 0 && !queueStore.isProcessing) {
        console.log('🌐 Connection restored, processing offline queue...', pendingCount, 'recordings');
        setTimeout(() => {
          queueStore.processQueue();
        }, 2000); // Wait 2 seconds for connection to stabilize
      }
    }
  }, [isOnline, isConnected, isInternetReachable, queueStore]);

  // Clean up completed recordings periodically
  useEffect(() => {
    const interval = setInterval(() => {
      const completedCount = queueStore.getRecordingsByStatus('completed').length;
      if (completedCount > 10) { // Keep only last 10 completed
        queueStore.clearCompletedRecordings();
      }
    }, 60000); // Every minute

    return () => clearInterval(interval);
  }, [queueStore]);

  const addRecording = useCallback((recording: {
    sessionId: string;
    audioUri: string;
    duration: number;
    fileSize: number;
    recordedAt: string;
  }) => {
    console.log('📥 Adding recording to queue:', recording.sessionId, 'Size:', Math.round(recording.fileSize / 1024), 'KB');
    
    queueStore.addRecording({
      ...recording,
      maxRetries: 3
    });

    // Try to process immediately if online
    if (isOnline && isConnected && isInternetReachable && !queueStore.isProcessing) {
      console.log('🚀 Online - attempting immediate processing');
      setTimeout(() => {
        queueStore.processQueue();
      }, 1000);
    } else {
      console.log('📱 Offline or processing - recording queued for later upload');
    }
  }, [queueStore, isOnline, isConnected, isInternetReachable]);

  return {
    pendingCount: queueStore.getRecordingsByStatus('pending').length,
    failedCount: queueStore.getRecordingsByStatus('failed').length,
    completedCount: queueStore.getRecordingsByStatus('completed').length,
    uploadingCount: queueStore.getRecordingsByStatus('uploading').length,
    totalSize: queueStore.getQueueStats().totalSize,
    isProcessing: queueStore.isProcessing,
    currentUpload: queueStore.currentUpload,
    addRecording,
    processQueue: queueStore.processQueue,
    retryFailedRecordings: queueStore.retryFailedRecordings,
    clearCompletedRecordings: queueStore.clearCompletedRecordings,
    clearAllRecordings: queueStore.clearAllRecordings
  };
};