import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';

export class AudioService {
  private recording: Audio.Recording | null = null;
  private sound: Audio.Sound | null = null;
  private recordingUri: string | null = null;
  private streamingInterval: NodeJS.Timeout | null = null;
  private onAudioDataCallback: ((data: ArrayBuffer) => void) | null = null;

  // Recording options for PCM 16-bit, 16kHz mono as required by ElevenLabs
  private recordingOptions: Audio.RecordingOptions = {
    android: {
      extension: '.wav',
      outputFormat: Audio.AndroidOutputFormat.DEFAULT,
      audioEncoder: Audio.AndroidAudioEncoder.DEFAULT,
      sampleRate: 16000,
      numberOfChannels: 1,
      bitRate: 128000,
    },
    ios: {
      extension: '.wav',
      outputFormat: Audio.IOSOutputFormat.LINEARPCM,
      audioQuality: Audio.IOSAudioQuality.HIGH,
      sampleRate: 16000,
      numberOfChannels: 1,
      bitRate: 128000,
      linearPCMBitDepth: 16,
      linearPCMIsBigEndian: false,
      linearPCMIsFloat: false,
    },
    web: {
      mimeType: 'audio/wav',
      bitsPerSecond: 128000,
    },
  };

  async requestPermissions(): Promise<boolean> {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Error requesting audio permissions:', error);
      return false;
    }
  }

  async startRecording(onAudioData: (data: ArrayBuffer) => void): Promise<boolean> {
    try {
      // Request permissions
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        console.error('Audio recording permission denied');
        return false;
      }

      // Configure audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      // Create and prepare recording
      this.recording = new Audio.Recording();
      await this.recording.prepareToRecordAsync(this.recordingOptions);
      await this.recording.startAsync();

      this.onAudioDataCallback = onAudioData;

      // Start streaming audio chunks every 100ms
      this.startStreamingAudioChunks();

      console.log('🎤 Recording started');
      return true;
    } catch (error) {
      console.error('Failed to start recording:', error);
      return false;
    }
  }

  async stopRecording(): Promise<void> {
    try {
      if (this.streamingInterval) {
        clearInterval(this.streamingInterval);
        this.streamingInterval = null;
      }

      if (this.recording) {
        const status = await this.recording.getStatusAsync();
        console.log('Recording status before stop:', status);
        
        await this.recording.stopAndUnloadAsync();
        const uri = this.recording.getURI();
        console.log('Recording URI:', uri);
        
        // Send the full audio data after recording stops
        if (uri && this.onAudioDataCallback) {
          console.log('Reading audio file from:', uri);
          const audioData = await this.readAudioFile(uri);
          if (audioData && audioData.byteLength > 0) {
            console.log('Sending audio data, size:', audioData.byteLength);
            this.onAudioDataCallback(audioData);
          } else {
            console.error('No audio data to send');
          }
          
          // Clean up the temporary file
          try {
            await FileSystem.deleteAsync(uri, { idempotent: true });
          } catch (error) {
            console.error('Error deleting temp audio file:', error);
          }
        }

        this.recording = null;
        this.recordingUri = null;
      }

      console.log('🎤 Recording stopped');
    } catch (error) {
      console.error('Failed to stop recording:', error);
    }
  }

  private startStreamingAudioChunks(): void {
    // For expo-av, we can't stream chunks while recording
    // We'll need to send the full audio after recording stops
    console.log('Note: Streaming audio chunks is not supported with expo-av during recording');
    // Clear the interval since we can't use it
    if (this.streamingInterval) {
      clearInterval(this.streamingInterval);
      this.streamingInterval = null;
    }
  }

  private async readAudioFile(uri: string): Promise<ArrayBuffer | null> {
    try {
      // Read file as base64
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Convert base64 to ArrayBuffer
      const binaryString = atob(base64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      return bytes.buffer;
    } catch (error) {
      console.error('Error reading audio file:', error);
      return null;
    }
  }

  async playAudioBuffer(audioBuffer: ArrayBuffer): Promise<void> {
    try {
      // Convert ArrayBuffer to base64 for React Native
      const bytes = new Uint8Array(audioBuffer);
      let binary = '';
      for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      const base64Audio = btoa(binary);

      // Create temporary file
      const fileUri = FileSystem.documentDirectory + 'temp_audio.pcm';
      await FileSystem.writeAsStringAsync(fileUri, base64Audio, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Play the audio
      if (this.sound) {
        await this.sound.unloadAsync();
      }

      const { sound } = await Audio.Sound.createAsync(
        { uri: fileUri },
        { shouldPlay: true }
      );

      this.sound = sound;

      // Clean up after playback
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          sound.unloadAsync();
          FileSystem.deleteAsync(fileUri, { idempotent: true });
        }
      });
    } catch (error) {
      console.error('Error playing audio buffer:', error);
    }
  }

  async cleanup(): Promise<void> {
    await this.stopRecording();
    if (this.sound) {
      await this.sound.unloadAsync();
      this.sound = null;
    }
  }
}

export const audioService = new AudioService();