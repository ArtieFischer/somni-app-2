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
      // Stop the recording first, but don't unload yet
      await this.recording.stopAsync();
      const originalUri = this.recording.getURI();
      
      if (!originalUri) {
        throw new Error('Recording URI not available after stopping');
      }

      // Generate a new unique path in the cache directory for persistence
      const newFileName = `somni_recording_${Date.now()}.m4a`; // Using m4a as it's common for HIGH_QUALITY preset
      const newUri = FileSystem.cacheDirectory + newFileName;

      // Copy the file to the new persistent location
      await FileSystem.copyAsync({
        from: originalUri,
        to: newUri,
      });

      // Now unload the original recording to free up resources
      await this.recording.unloadAsync();

      const fileInfo = await FileSystem.getInfoAsync(newUri);
      const duration = Math.floor((Date.now() - this.recordingStartTime) / 1000);
      
      // Reset state
      this.isRecording = false;
      this.recording = null;
      this.recordingStartTime = 0;

      console.log('🎙️ Recording stopped successfully and saved to:', { uri: newUri, duration });

      return {
        uri: newUri,
        duration,
        fileSize: fileInfo.size || 0,
        format: 'm4a' // Assuming m4a for HIGH_QUALITY preset
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
    // Return exact duration in seconds
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
