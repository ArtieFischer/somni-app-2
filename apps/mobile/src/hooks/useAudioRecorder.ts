import { useState, useRef, useCallback } from 'react';
import { useAudioRecorder, RecordingPresets, AudioModule } from 'expo-audio';
import * as FileSystem from 'expo-file-system';

export interface AudioRecordingResult {
  uri: string;
  duration: number;
  fileSize: number;
  format: string;
}

export const useAudioRecorderService = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const recordingStartTime = useRef<number>(0);
  const durationTimer = useRef<NodeJS.Timeout | null>(null);

  const audioRecorder = useAudioRecorder(
    RecordingPresets.HIGH_QUALITY,
    {
      onRecordingStatusUpdate: (status) => {
        console.log('Recording status:', status);
      }
    }
  );

  const requestPermissions = useCallback(async (): Promise<boolean> => {
    try {
      const { status } = await AudioModule.requestRecordingPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Permission request failed:', error);
      return false;
    }
  }, []);

  const startRecording = useCallback(async (): Promise<void> => {
    if (isRecording) {
      throw new Error('Recording already in progress');
    }

    const hasPermission = await requestPermissions();
    if (!hasPermission) {
      throw new Error('Microphone permission denied');
    }

    try {
      await audioRecorder.prepareToRecordAsync();
      audioRecorder.record();
      setIsRecording(true);
      recordingStartTime.current = Date.now();
      setRecordingDuration(0);

      // Start duration timer
      durationTimer.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - recordingStartTime.current) / 1000);
        setRecordingDuration(elapsed);
      }, 1000);

    } catch (error) {
      throw new Error(`Failed to start recording: ${error}`);
    }
  }, [isRecording, audioRecorder, requestPermissions]);

  const stopRecording = useCallback(async (): Promise<AudioRecordingResult> => {
    if (!isRecording) {
      throw new Error('No recording in progress');
    }

    try {
      await audioRecorder.stop();
      const uri = audioRecorder.uri;
      
      if (!uri) {
        throw new Error('Recording URI not available');
      }

      const fileInfo = await FileSystem.getInfoAsync(uri);
      const duration = Math.floor((Date.now() - recordingStartTime.current) / 1000);
      
      setIsRecording(false);
      setRecordingDuration(0);

      // Clear timer
      if (durationTimer.current) {
        clearInterval(durationTimer.current);
        durationTimer.current = null;
      }

      return {
        uri,
        duration,
        fileSize: fileInfo.size || 0,
        format: 'wav'
      };
    } catch (error) {
      setIsRecording(false);
      setRecordingDuration(0);
      
      if (durationTimer.current) {
        clearInterval(durationTimer.current);
        durationTimer.current = null;
      }
      
      throw new Error(`Failed to stop recording: ${error}`);
    }
  }, [isRecording, audioRecorder]);

  const cleanup = useCallback(() => {
    if (durationTimer.current) {
      clearInterval(durationTimer.current);
      durationTimer.current = null;
    }
    if (isRecording) {
      audioRecorder.stop();
      setIsRecording(false);
      setRecordingDuration(0);
    }
  }, [isRecording, audioRecorder]);

  return {
    isRecording,
    recordingDuration,
    startRecording,
    stopRecording,
    cleanup
  };
};