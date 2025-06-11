import { useState, useCallback, useRef, useEffect } from 'react';
import { useDreamStore } from '@somni/stores';
import { AudioService } from '../infrastructure/services/AudioService';
import { useOfflineRecordingQueue } from './useOfflineRecordingQueue';
import { useNetworkStatus } from './useNetworkStatus';
import { useAuth } from './useAuth'; // Import useAuth

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
  stopRecording: () => Promise<any>;
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
  const { user } = useAuth(); // Get user from auth
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
      
      // Update UI state immediately for instant feedback
      dreamStore.startRecording();
      setRecordingDuration(0);

      // Start duration timer immediately
      durationTimerRef.current = setInterval(() => {
        setRecordingDuration(prev => {
          const newDuration = prev + 1;
          dreamStore.updateRecordingSession({ duration: newDuration });
          return newDuration;
        });
      }, 1000);

      // Then start actual audio recording (async but don't await)
      audioService.startRecording().catch(err => {
        // If recording fails, revert the UI state
        const errorMessage = err instanceof Error ? err.message : 'Failed to start recording';
        setError(errorMessage);
        dreamStore.setError(errorMessage);
        dreamStore.stopRecording();
        clearTimer();
        setRecordingDuration(0);
      });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start recording';
      setError(errorMessage);
      dreamStore.setError(errorMessage);
      dreamStore.stopRecording();
      clearTimer();
    } finally {
      // Quick transition
      setTimeout(() => {
        isTransitioningRef.current = false;
      }, 100);
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

      // Create placeholder dream entry with actual user ID
      dreamStore.addDream({
        id: `temp_${currentSession.id}`,
        userId: user?.id || 'anonymous',
        rawTranscript: 'Waiting for transcription...',
        duration: audioResult.duration,
        confidence: 0,
        wasEdited: false,
        recordedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        status: 'pending'
      });

      dreamStore.updateRecordingSession({ 
        status: 'completed',
        dreamId: `temp_${currentSession.id}`,
        audioUri: audioResult.uri // Store the URI in session
      });

      // Return the audio result so the component can use it
      return audioResult;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to process recording';
      setError(errorMessage);
      dreamStore.setError(errorMessage);
      return null;
    } finally {
      setIsProcessing(false);
      setRecordingDuration(0);
      isTransitioningRef.current = false;
    }
  }, [dreamStore, user, audioService, clearTimer]);

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