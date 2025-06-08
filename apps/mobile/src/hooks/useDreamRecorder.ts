import { useState, useCallback } from 'react';
import { useDreamStore } from '@somni/stores';
import { AudioService, SpeechService } from '../infrastructure/services';
import { RecordDreamUseCase } from '@somni/core';
import { DreamRepository } from '../infrastructure/repositories';

export const useDreamRecorder = () => {
  const dreamStore = useDreamStore();
  const [audioService] = useState(() => new AudioService());
  const [speechService] = useState(() => new SpeechService());
  const [recordDreamUseCase] = useState(() => new RecordDreamUseCase(new DreamRepository()));

  const startRecording = useCallback(async () => {
    try {
      dreamStore.startRecording();
      
      // Start audio recording
      await audioService.startRecording();
      
      // Start speech recognition
      await speechService.startListening({
        onResult: (result) => {
          if (result.isFinal) {
            dreamStore.updateRecordingSession({
              transcript: result.transcript,
            });
          }
        },
        onError: (error) => {
          dreamStore.updateRecordingSession({
            status: 'error',
            error,
          });
        },
      });
    } catch (error) {
      dreamStore.updateRecordingSession({
        status: 'error',
        error: error instanceof Error ? error.message : 'Recording failed',
      });
    }
  }, [audioService, speechService, dreamStore]);

  const stopRecording = useCallback(async () => {
    try {
      dreamStore.stopRecording();
      
      // Stop services
      const audioResult = await audioService.stopRecording();
      await speechService.stopListening();
      
      dreamStore.updateRecordingSession({
        status: 'processing',
        audioUri: audioResult.uri,
        duration: audioResult.duration,
      });

      // Process the dream if we have a transcript
      const session = dreamStore.recordingSession;
      if (session?.transcript) {
        const dream = await recordDreamUseCase.execute({
          userId: 'current-user-id', // This would come from auth
          rawTranscript: session.transcript,
          audioUrl: audioResult.uri,
        });

        dreamStore.addDream(dream.toDTO());
        dreamStore.updateRecordingSession({
          status: 'completed',
        });
      }
    } catch (error) {
      dreamStore.updateRecordingSession({
        status: 'error',
        error: error instanceof Error ? error.message : 'Processing failed',
      });
    }
  }, [audioService, speechService, dreamStore, recordDreamUseCase]);

  return {
    isRecording: dreamStore.isRecording,
    duration: dreamStore.recordingDuration,
    amplitude: dreamStore.recordingAmplitude,
    session: dreamStore.recordingSession,
    startRecording,
    stopRecording,
  };
};