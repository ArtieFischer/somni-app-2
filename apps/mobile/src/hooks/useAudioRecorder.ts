import { useState, useRef, useCallback } from 'react';
import { Audio } from 'expo-av';
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
  const recordingRef = useRef<Audio.Recording | null>(null);

  const requestPermissions = useCallback(async (): Promise<boolean> => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
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
      // Configure audio mode for recording
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY,
        (status) => {
          if (status.isRecording) {
            const durationMillis = status.durationMillis || 0;
            setRecordingDuration(Math.floor(durationMillis / 1000));
          }
        }
      );

      recordingRef.current = recording;
      setIsRecording(true);
      setRecordingDuration(0);

    } catch (error) {
      throw new Error(`Failed to start recording: ${error}`);
    }
  }, [isRecording, requestPermissions]);

  const stopRecording = useCallback(async (): Promise<AudioRecordingResult> => {
    if (!isRecording || !recordingRef.current) {
      throw new Error('No recording in progress');
    }

    try {
      await recordingRef.current.stopAndUnloadAsync();
      
      const uri = recordingRef.current.getURI();
      if (!uri) {
        throw new Error('Recording URI not available');
      }

      const fileInfo = await FileSystem.getInfoAsync(uri);
      const duration = recordingDuration;
      
      setIsRecording(false);
      setRecordingDuration(0);
      recordingRef.current = null;

      return {
        uri,
        duration,
        fileSize: fileInfo.size || 0,
        format: 'wav'
      };
    } catch (error) {
      setIsRecording(false);
      setRecordingDuration(0);
      recordingRef.current = null;
      
      throw new Error(`Failed to stop recording: ${error}`);
    }
  }, [isRecording, recordingDuration]);

  const cleanup = useCallback(() => {
    if (recordingRef.current && isRecording) {
      recordingRef.current.stopAndUnloadAsync();
      setIsRecording(false);
      setRecordingDuration(0);
      recordingRef.current = null;
    }
  }, [isRecording]);

  return {
    isRecording,
    recordingDuration,
    startRecording,
    stopRecording,
    cleanup
  };
};