import { useState, useCallback, useRef, useEffect } from 'react';
import { useDreamStore } from '@somni/stores';
import { AudioService } from '../infrastructure/services/AudioService';
import { useOfflineRecordingQueue } from './useOfflineRecordingQueue';
import { useNetworkStatus } from './useNetworkStatus';

// Create a singleton instance
let audioServiceInstance: AudioService | null = null;

const getAudioService = () => {
  if (!audioServiceInstance) {
    audioServiceInstance = new AudioService();
    audioServiceInstance.initialize();
  }
  return audioServiceInstance;
};

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
  const offlineQueue = useOfflineRecordingQueue();
  const { isConnected } = useNetworkStatus();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const durationTimerRef = useRef<NodeJS.Timeout | null>(null);
  const audioService = getAudioService();
  
  // Prevent race conditions
  const isTransitioningRef = useRef(false);
  const clearSessionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const clearTimer = useCallback(() => {
    if (durationTimerRef.current) {
      clearInterval(durationTimerRef.current);
      durationTimerRef.current = null;
    }
  }, []);

  const clearSessionTimeout = useCallback(() => {
    if (clearSessionTimeoutRef.current) {
      clearTimeout(clearSessionTimeoutRef.current);
      clearSessionTimeoutRef.current = null;
    }
  }, []);

  const startRecording = useCallback(async () => {
    // Prevent multiple simultaneous transitions
    if (isTransitioningRef.current) {
      console.log('⚠️ Recording transition in progress, ignoring');
      return;
    }

    // Cancel any pending session clear
    clearSessionTimeout();

    try {
      isTransitioningRef.current = true;
      setError(null);
      dreamStore.clearError();
      
      // Start recording in the store first
      dreamStore.startRecording();

      // Then start actual audio recording
      await audioService.startRecording();

      // Start duration timer
      setRecordingDuration(0);
      durationTimerRef.current = setInterval(() => {
        const currentDuration = audioService.getCurrentDuration();
        setRecordingDuration(currentDuration);
        dreamStore.updateRecordingSession({ duration: currentDuration });
      }, 1000);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start recording';
      setError(errorMessage);
      dreamStore.setError(errorMessage);
      dreamStore.stopRecording();
      clearTimer();
    } finally {
      isTransitioningRef.current = false;
    }
  }, [dreamStore, audioService, clearTimer, clearSessionTimeout]);

  const stopRecording = useCallback(async () => {
    // Prevent multiple simultaneous transitions
    if (isTransitioningRef.current) {
      console.log('⚠️ Recording transition in progress, ignoring');
      return;
    }

    // Check if we're actually recording
    if (!dreamStore.isRecording || !audioService.getIsRecording()) {
      console.log('Not recording, skipping stop');
      return;
    }

    try {
      isTransitioningRef.current = true;
      setIsProcessing(true);
      clearTimer();
      
      // Get the current session before stopping
      const currentSession = dreamStore.recordingSession;
      
      if (!currentSession?.id) {
        throw new Error('No session ID available');
      }

      // Stop the audio recording first
      const audioResult = await audioService.stopRecording();
      
      // Then update the store
      dreamStore.stopRecording();

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
        id: `temp_${currentSession.id}`,
        userId: 'current-user', // TODO: Get from auth
        rawTranscript: 'Processing...',
        duration: audioResult.duration,
        confidence: 0,
        wasEdited: false,
        recordedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        status: isConnected ? 'transcribing' : 'pending'
      });

      dreamStore.updateRecordingSession({ 
        status: 'completed',
        dreamId: `temp_${currentSession.id}`
      });

      // Clear session after a delay (but can be cancelled if new recording starts)
      clearSessionTimeoutRef.current = setTimeout(() => {
        dreamStore.clearRecordingSession();
        setRecordingDuration(0);
      }, 2000);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to process recording';
      setError(errorMessage);
      dreamStore.setError(errorMessage);
    } finally {
      setIsProcessing(false);
      setRecordingDuration(0);
      isTransitioningRef.current = false;
    }
  }, [dreamStore, offlineQueue, isConnected, audioService, clearTimer]);

  const clearError = useCallback(() => {
    setError(null);
    dreamStore.clearError();
  }, [dreamStore]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimer();
      clearSessionTimeout();
      if (audioService.getIsRecording()) {
        audioService.cleanup();
      }
    };
  }, [clearTimer, clearSessionTimeout, audioService]);

  return {
    isRecording: dreamStore.isRecording && !isTransitioningRef.current,
    isProcessing,
    recordingDuration,
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