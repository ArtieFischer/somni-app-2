import { ExpoSpeechRecognitionModule } from '@jamsch/expo-speech-recognition';

export interface SpeechRecognitionResult {
  transcript: string;
  confidence: number;
  isFinal: boolean;
}

export class SpeechService {
  private isListening = false;

  constructor() {
    this.setupEventListeners();
  }

  private setupEventListeners() {
    // Note: This would need to be set up in a React component context
    // For now, this is a placeholder structure
  }

  async requestPermissions(): Promise<boolean> {
    try {
      // Permission handling would be implemented here
      return true;
    } catch (error) {
      console.error('Failed to request speech permissions:', error);
      return false;
    }
  }

  async startListening(options?: {
    language?: string;
    continuous?: boolean;
    onResult?: (result: SpeechRecognitionResult) => void;
    onError?: (error: string) => void;
  }): Promise<void> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        throw new Error('Speech recognition permission not granted');
      }

      this.onResult = options?.onResult;
      this.onError = options?.onError;
      this.isListening = true;

      await ExpoSpeechRecognitionModule.start({
        lang: options?.language || 'en-US',
        requiresOnDeviceRecognition: true,
        addsPunctuation: true,
        contextualStrings: ['dream', 'sleep', 'nightmare', 'lucid'],
      });
    } catch (error) {
      this.isListening = false;
      throw new Error(`Failed to start speech recognition: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async stopListening(): Promise<void> {
    try {
      if (!this.isListening) {
        return;
      }

      await ExpoSpeechRecognitionModule.stop();
      this.isListening = false;
    } catch (error) {
      this.isListening = false;
      throw new Error(`Failed to stop speech recognition: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  getIsListening(): boolean {
    return this.isListening;
  }
}