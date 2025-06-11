import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';

export interface AudioRecordingResult {
  uri: string;
  duration: number;
  fileSize: number;
  format: string;
}

export class AudioService {
  private recording: Audio.Recording | null = null;
  private isRecording = false;
  private recordingStartTime: number = 0;

  initialize(): void {
    console.log('🎙️ AudioService initialized');
  }

  async requestPermissions(): Promise<boolean> {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Permission request failed:', error);
      return false;
    }
  }

  async startRecording(): Promise<void> {
    if (this.isRecording) {
      throw new Error('Recording already in progress');
    }

    const hasPermission = await this.requestPermissions();
    if (!hasPermission) {
      throw new Error('Microphone permission denied');
    }

    try {
      // Configure audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
      });

      // Create and start recording
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      this.recording = recording;
      this.isRecording = true;
      this.recordingStartTime = Date.now();
      
      console.log('🎙️ Recording started successfully');
    } catch (error) {
      this.isRecording = false;
      this.recording = null;
      throw new Error(`Failed to start recording: ${error}`);
    }
  }

  async stopRecording(): Promise<AudioRecordingResult> {
    if (!this.isRecording || !this.recording) {
      console.log('⚠️ No recording in progress');
      throw new Error('No recording in progress');
    }

    try {
      await this.recording.stopAndUnloadAsync();
      const uri = this.recording.getURI();
      
      if (!uri) {
        throw new Error('Recording URI not available');
      }

      const fileInfo = await FileSystem.getInfoAsync(uri);
      const duration = Math.floor((Date.now() - this.recordingStartTime) / 1000);
      
      // Reset state
      this.isRecording = false;
      this.recording = null;
      this.recordingStartTime = 0;

      console.log('🎙️ Recording stopped successfully', { uri, duration });

      return {
        uri,
        duration,
        fileSize: fileInfo.size || 0,
        format: 'wav'
      };
    } catch (error) {
      this.isRecording = false;
      this.recording = null;
      throw new Error(`Failed to stop recording: ${error}`);
    }
  }

  getIsRecording(): boolean {
    return this.isRecording;
  }

  getCurrentDuration(): number {
    if (!this.isRecording || !this.recordingStartTime) {
      return 0;
    }
    return Math.floor((Date.now() - this.recordingStartTime) / 1000);
  }

  cleanup(): void {
    if (this.recording && this.isRecording) {
      this.recording.stopAndUnloadAsync().catch(console.error);
    }
    this.isRecording = false;
    this.recording = null;
    this.recordingStartTime = 0;
  }
}