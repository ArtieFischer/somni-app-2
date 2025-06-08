import { useAudioRecorder, RecordingPresets, AudioModule } from 'expo-audio';

export interface AudioRecordingResult {
  uri: string;
  duration: number;
  size: number;
}

export class AudioService {
  private audioRecorder: any;
  private isRecording = false;
  private startTime: number = 0;

  constructor() {
    this.audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  }

  async requestPermissions(): Promise<boolean> {
    try {
      const { status } = await AudioModule.requestRecordingPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Failed to request audio permissions:', error);
      return false;
    }
  }

  async startRecording(): Promise<void> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        throw new Error('Microphone permission not granted');
      }

      await this.audioRecorder.prepareToRecordAsync();
      this.startTime = Date.now();
      this.isRecording = true;
      await this.audioRecorder.record();
    } catch (error) {
      this.isRecording = false;
      throw new Error(`Failed to start recording: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async stopRecording(): Promise<AudioRecordingResult> {
    try {
      if (!this.isRecording) {
        throw new Error('No active recording to stop');
      }

      await this.audioRecorder.stop();
      this.isRecording = false;

      const duration = Math.floor((Date.now() - this.startTime) / 1000);
      const uri = this.audioRecorder.uri;

      // Get file size (mock for now)
      const size = 0; // Would need to implement actual file size detection

      return {
        uri,
        duration,
        size,
      };
    } catch (error) {
      this.isRecording = false;
      throw new Error(`Failed to stop recording: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  getIsRecording(): boolean {
    return this.isRecording;
  }

  getDuration(): number {
    if (!this.isRecording) return 0;
    return Math.floor((Date.now() - this.startTime) / 1000);
  }
}