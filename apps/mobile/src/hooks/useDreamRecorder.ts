import { useState, useCallback, useRef, useEffect } from 'react';
import { useDreamStore } from '@somni/stores';
import { useAudioRecorderService } from './useAudioRecorder';
import { useOfflineRecordingQueue } from './useOfflineRecordingQueue';
import { useNetworkStatus } from './useNetworkStatus';

interface UseDreamRecorderReturn {
  isRecording: boolean;
  isProcessing: boolean;
  recordingDuration: number;
  recordingAmplitude: number;
  session: any;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<void>;
  error: string | null;
  clearError: () => void;
  offlineQueueStatus: {
    pendingCount: number;
    failedCount: number;
    isProcessing: boolean;
  };
}

export const useDreamRecorder = (): UseDreamRecorderReturn => {
  const dreamStore = useDreamStore();
  const audioService = useAudioRecorderService();
  const offlineQueue = useOfflineRecordingQueue();
  const { isOnline } = useNetworkStatus();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const durationTimerRef = useRef<NodeJS.Timeout | null>(null);

  const clearTimer = useCallback(() => {
    if (durationTimerRef.current) {
      clearInterval(durationTimerRef.current);
      durationTimerRef.current = null;
    }
  }, []);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      clearTimer();
      audioService.cleanup();
    };
  }, [clearTimer, audioService]);

  const startRecording = useCallback(async () => {
    try {
      setError(null);
      dreamStore.clearError();
      
      // Start recording session in store
      dreamStore.startRecording();

      // Start audio recording
      await audioService.startRecording();

      console.log('🎙️ Recording started successfully');

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start recording';
      console.error('❌ Recording start error:', errorMessage);
      setError(errorMessage);
      dreamStore.setRecordingError(errorMessage);
    }
  }, [dreamStore, audioService]);

  const stopRecording = useCallback(async () => {
    if (!audioService.isRecording) {
      console.log('⚠️ No recording in progress');
      return;
    }

    try {
      setIsProcessing(true);
      clearTimer();
      
      // Stop recording session in store
      dreamStore.stopRecording();

      // Stop audio recording and get result
      const audioResult = await audioService.stopRecording();
      const currentSession = dreamStore.recordingSession;
      
      if (!currentSession?.id) {
        throw new Error('No session ID available');
      }

      console.log('✅ Recording stopped, adding to queue:', {
        sessionId: currentSession.id,
        duration: audioResult.duration,
        fileSize: audioResult.fileSize
      });

      // Always add to offline queue first
      offlineQueue.addRecording({
        sessionId: currentSession.id,
        audioUri: audioResult.uri,
        duration: audioResult.duration,
        fileSize: audioResult.fileSize,
        recordedAt: new Date().toISOString()
      });

      // Create placeholder dream entry
      dreamStore.addDream({
        userId: 'current-user', // TODO: Get from auth
        rawTranscript: 'Processing...',
        duration: audioResult.duration,
        confidence: 0,
        wasEdited: false,
        recordedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        status: isOnline ? 'transcribing' : 'pending'
      });

      dreamStore.updateRecordingSession({ 
        status: 'completed',
        audioUri: audioResult.uri,
        duration: audioResult.duration
      });

      // Clear session after a delay
      setTimeout(() => {
        dreamStore.clearRecordingSession();
      }, 2000);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to process recording';
      console.error('❌ Recording stop error:', errorMessage);
      setError(errorMessage);
      dreamStore.setRecordingError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  }, [dreamStore, audioService, offlineQueue, isOnline, clearTimer]);

  const clearError = useCallback(() => {
    setError(null);
    dreamStore.clearError();
  }, [dreamStore]);

  return {
    isRecording: dreamStore.isRecording,
    isProcessing,
    recordingDuration: dreamStore.recordingSession?.duration || 0,
    recordingAmplitude: 0, // TODO: Connect to real amplitude
    session: dreamStore.recordingSession,
    startRecording,
    stopRecording,
    error: error || dreamStore.error,
    clearError,
    offlineQueueStatus: {
      pendingCount: offlineQueue.pendingCount,
      failedCount: offlineQueue.failedCount,
      isProcessing: offlineQueue.isProcessing
    }
  };
};