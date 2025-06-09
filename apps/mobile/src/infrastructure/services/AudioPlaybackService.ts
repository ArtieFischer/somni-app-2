import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';

export interface PlaybackStatus {
  isLoaded: boolean;
  isPlaying: boolean;
  positionMillis: number;
  durationMillis?: number;
  didJustFinish: boolean;
}

export class AudioPlaybackService {
  private sound: Audio.Sound | null = null;
  private onStatusUpdate?: (status: PlaybackStatus) => void;

  constructor() {
    this.setupAudio();
  }

  private async setupAudio(): Promise<void> {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: false,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
    } catch (error) {
      console.error('Failed to setup audio mode:', error);
    }
  }

  /**
   * Play generated speech from file path
   */
  async playGeneratedSpeech(audioPath: string): Promise<void> {
    try {
      // Stop any currently playing audio
      await this.cleanup();

      // Verify file exists
      const fileInfo = await FileSystem.getInfoAsync(audioPath);
      if (!fileInfo.exists) {
        throw new Error('Audio file not found');
      }

      // Load and play new audio
      const { sound } = await Audio.Sound.createAsync(
        { uri: audioPath },
        { shouldPlay: true, volume: 1.0 }
      );
      
      this.sound = sound;

      // Set up status update handler
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded) {
          const playbackStatus: PlaybackStatus = {
            isLoaded: status.isLoaded,
            isPlaying: status.isPlaying || false,
            positionMillis: status.positionMillis || 0,
            durationMillis: status.durationMillis,
            didJustFinish: status.didJustFinish || false,
          };

          this.onStatusUpdate?.(playbackStatus);

          // Auto-cleanup when finished
          if (status.didJustFinish) {
            this.cleanup();
          }
        }
      });

    } catch (error) {
      console.error('Audio playback failed:', error);
      throw new Error('Failed to play generated speech');
    }
  }

  /**
   * Play audio from URI (local or remote)
   */
  async playAudio(uri: string): Promise<void> {
    try {
      await this.cleanup();

      const { sound } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: true, volume: 1.0 }
      );
      
      this.sound = sound;

      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded) {
          const playbackStatus: PlaybackStatus = {
            isLoaded: status.isLoaded,
            isPlaying: status.isPlaying || false,
            positionMillis: status.positionMillis || 0,
            durationMillis: status.durationMillis,
            didJustFinish: status.didJustFinish || false,
          };

          this.onStatusUpdate?.(playbackStatus);

          if (status.didJustFinish) {
            this.cleanup();
          }
        }
      });

    } catch (error) {
      console.error('Audio playback failed:', error);
      throw new Error('Failed to play audio');
    }
  }

  /**
   * Pause current playback
   */
  async pause(): Promise<void> {
    if (this.sound) {
      try {
        await this.sound.pauseAsync();
      } catch (error) {
        console.error('Failed to pause audio:', error);
      }
    }
  }

  /**
   * Resume current playback
   */
  async resume(): Promise<void> {
    if (this.sound) {
      try {
        await this.sound.playAsync();
      } catch (error) {
        console.error('Failed to resume audio:', error);
      }
    }
  }

  /**
   * Stop current playback
   */
  async stop(): Promise<void> {
    if (this.sound) {
      try {
        await this.sound.stopAsync();
      } catch (error) {
        console.error('Failed to stop audio:', error);
      }
    }
  }

  /**
   * Set playback position
   */
  async setPosition(positionMillis: number): Promise<void> {
    if (this.sound) {
      try {
        await this.sound.setPositionAsync(positionMillis);
      } catch (error) {
        console.error('Failed to set audio position:', error);
      }
    }
  }

  /**
   * Set volume (0.0 to 1.0)
   */
  async setVolume(volume: number): Promise<void> {
    if (this.sound) {
      try {
        await this.sound.setVolumeAsync(Math.max(0, Math.min(1, volume)));
      } catch (error) {
        console.error('Failed to set audio volume:', error);
      }
    }
  }

  /**
   * Get current playback status
   */
  async getStatus(): Promise<PlaybackStatus | null> {
    if (!this.sound) return null;

    try {
      const status = await this.sound.getStatusAsync();
      if (status.isLoaded) {
        return {
          isLoaded: status.isLoaded,
          isPlaying: status.isPlaying || false,
          positionMillis: status.positionMillis || 0,
          durationMillis: status.durationMillis,
          didJustFinish: status.didJustFinish || false,
        };
      }
    } catch (error) {
      console.error('Failed to get audio status:', error);
    }

    return null;
  }

  /**
   * Set status update callback
   */
  setOnStatusUpdate(callback: (status: PlaybackStatus) => void): void {
    this.onStatusUpdate = callback;
  }

  /**
   * Clean up audio resources
   */
  async cleanup(): Promise<void> {
    if (this.sound) {
      try {
        await this.sound.unloadAsync();
      } catch (error) {
        console.error('Failed to cleanup audio:', error);
      } finally {
        this.sound = null;
      }
    }
  }

  /**
   * Clean up temporary audio files
   */
  async cleanupTempFiles(): Promise<void> {
    try {
      const cacheDir = FileSystem.cacheDirectory;
      if (!cacheDir) return;

      const files = await FileSystem.readDirectoryAsync(cacheDir);
      const audioFiles = files.filter(file => 
        file.startsWith('speech_') && file.endsWith('.mp3')
      );

      for (const file of audioFiles) {
        try {
          await FileSystem.deleteAsync(`${cacheDir}${file}`);
        } catch (error) {
          console.warn(`Failed to delete temp file ${file}:`, error);
        }
      }
    } catch (error) {
      console.error('Failed to cleanup temp files:', error);
    }
  }
}