import { useAudioRecorder, RecordingPresets, AudioModule } from 'expo-audio';
import * as FileSystem from 'expo-file-system';

export interface AudioRecordingResult {
  uri: string;
  duration: number;
  fileSize: number;
  format: string;
}

export class AudioService {
  private audioRecorder: ReturnType<typeof useAudioRecorder> | null = null;
  private isRecording = false;
  private recordingStartTime: number = 0;

  initialize(): void {
    this.audioRecorder = useAudioRecorder(
      RecordingPresets.HIGH_QUALITY,
      {
        onRecordingStatusUpdate: this.handleStatusUpdate.bind(this)
      }
    );
  }

  async requestPermissions(): Promise<boolean> {
    try {
      const { status } = await AudioModule.requestRecordingPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Permission request failed:', error);
      return false;
    }
  }

  async startRecording(): Promise<void> {
    if (this.isRecording || !this.audioRecorder) {
      throw new Error('Recording already in progress or not initialized');
    }

    const hasPermission = await this.requestPermissions();
    if (!hasPermission) {
      throw new Error('Microphone permission denied');
    }

    try {
      await this.audioRecorder.prepareToRecordAsync();
      this.audioRecorder.record();
      this.isRecording = true;
      this.recordingStartTime = Date.now();
    } catch (error) {
      throw new Error(`Failed to start recording: ${error}`);
    }
  }

  async stopRecording(): Promise<AudioRecordingResult> {
    if (!this.isRecording || !this.audioRecorder) {
      throw new Error('No recording in progress');
    }

    try {
      await this.audioRecorder.stop();
      const uri = this.audioRecorder.uri;
      
      if (!uri) {
        throw new Error('Recording URI not available');
      }

      const fileInfo = await FileSystem.getInfoAsync(uri);
      const duration = Math.floor((Date.now() - this.recordingStartTime) / 1000);
      
      this.isRecording = false;

      return {
        uri,
        duration,
        fileSize: fileInfo.size || 0,
        format: 'wav'
      };
    } catch (error) {
      this.isRecording = false;
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

  private handleStatusUpdate(status: any): void {
    // Handle real-time status updates
    console.log('Recording status:', status);
  }

  cleanup(): void {
    if (this.audioRecorder && this.isRecording) {
      this.audioRecorder.stop();
    }
    this.isRecording = false;
    this.audioRecorder = null;
  }
}