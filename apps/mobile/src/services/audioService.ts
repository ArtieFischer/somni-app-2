import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { Buffer } from 'buffer';

export class AudioService {
  private recording: Audio.Recording | null = null;
  private sound: Audio.Sound | null = null;
  private streamingInterval: NodeJS.Timeout | null = null;
  private onAudioDataCallback: ((data: ArrayBuffer) => void) | null = null;
  private lastByteSent: number = 0;
  private playbackQueue: Array<{ uri: string; sound?: Audio.Sound }> = [];
  private isPlaying: boolean = false;
  private segmentIndex: number = 0;
  private downloadBuffer: Uint8Array[] = [];
  private onAudioEndCallback: (() => void) | null = null;

  // Recording options for PCM 16-bit, 16kHz mono as required by ElevenLabs
  private recordingOptions: Audio.RecordingOptions = {
    android: {
      extension: '.wav',
      outputFormat: Audio.AndroidOutputFormat.DEFAULT,
      audioEncoder: Audio.AndroidAudioEncoder.DEFAULT,
      sampleRate: 16000,
      numberOfChannels: 1,
      bitRate: 256000,  // Increased for better quality
    },
    ios: {
      extension: '.wav',
      outputFormat: Audio.IOSOutputFormat.LINEARPCM,
      audioQuality: Audio.IOSAudioQuality.HIGH,
      sampleRate: 16000,
      numberOfChannels: 1,
      bitRate: 256000,  // Increased for better quality
      linearPCMBitDepth: 16,
      linearPCMIsBigEndian: false,
      linearPCMIsFloat: false,
    },
    web: {
      mimeType: 'audio/wav',
      bitsPerSecond: 256000,
    },
  };

  // Constants for streaming
  private readonly CHUNK_INTERVAL = 250; // ms - optimized for better recognition
  private readonly SEGMENT_SIZE_KB = 30; // ~50ms of audio
  private readonly MIN_AUDIO_DURATION = 500; // ms
  private readonly VOICE_THRESHOLD = 1000; // RMS threshold for voice activity
  private readonly WAV_HEADER_SIZE = 44; // Standard WAV header size in bytes

  async requestPermissions(): Promise<boolean> {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Error requesting audio permissions:', error);
      return false;
    }
  }

  async startRecording(onAudioData: (data: ArrayBuffer) => void, onAudioEnd?: () => void): Promise<boolean> {
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
      this.onAudioEndCallback = onAudioEnd || null;
      this.lastByteSent = 0;

      // Start streaming audio chunks
      this.startStreamingAudioChunks();

      console.log('🎤 Recording started with streaming');
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
        
        // Calculate total audio sent
        const totalDuration = status.durationMillis || 0;
        const totalBytesSent = this.lastByteSent;
        const expectedBytes = (totalDuration / 1000) * 16000 * 2; // 16kHz, 16-bit
        console.log('📊 Recording stats:', {
          duration: totalDuration,
          bytesSent: totalBytesSent,
          expectedBytes: expectedBytes,
          efficiency: totalBytesSent > 0 ? (totalBytesSent / expectedBytes * 100).toFixed(1) + '%' : '0%'
        });
        
        // Send any remaining audio before stopping
        const uri = this.recording.getURI();
        if (uri) {
          await this.flushRemainingRecordedAudio(uri);
        }
        
        await this.recording.stopAndUnloadAsync();
        console.log('Recording stopped, URI:', uri);
        
        // Signal end of audio stream
        if (this.onAudioEndCallback) {
          console.log('🔄 Calling onAudioEndCallback from audioService');
          this.onAudioEndCallback();
        } else {
          console.log('⚠️ No onAudioEndCallback set in audioService');
        }
        
        // Clean up the temporary file
        if (uri) {
          try {
            await FileSystem.deleteAsync(uri, { idempotent: true });
          } catch (error) {
            console.error('Error deleting temp audio file:', error);
          }
        }

        this.recording = null;
        this.lastByteSent = 0;
      }

      console.log('🎤 Recording stopped');
    } catch (error) {
      console.error('Failed to stop recording:', error);
    }
  }

  // Flush any remaining audio data when recording stops
  private async flushRemainingRecordedAudio(uri: string): Promise<void> {
    try {
      const fileInfo = await FileSystem.getInfoAsync(uri);
      if (!fileInfo.exists) return;
      
      const currentSize = fileInfo.size as number;
      const remainingBytes = currentSize - this.lastByteSent;
      
      if (remainingBytes > 0) {
        // Read remaining audio
        const slice = await FileSystem.readAsStringAsync(uri, {
          encoding: FileSystem.EncodingType.Base64,
          position: this.lastByteSent,
          length: remainingBytes,
        });
        
        // Convert to PCM
        const binaryString = atob(slice);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        
        // Skip header if needed
        let pcmData = bytes;
        if (this.lastByteSent === 0 && bytes.length > this.WAV_HEADER_SIZE) {
          pcmData = bytes.slice(this.WAV_HEADER_SIZE);
        }
        
        // Send final chunk (even if silent)
        if (this.onAudioDataCallback && pcmData.length > 0) {
          this.onAudioDataCallback(pcmData.buffer);
          console.log(`🎤 Flushed final ${pcmData.length} bytes of PCM audio`);
        }
      }
    } catch (error) {
      console.error('Error flushing remaining audio:', error);
    }
  }

  private startStreamingAudioChunks(): void {
    // Poll the temp file for new audio data
    this.streamingInterval = setInterval(async () => {
      if (!this.recording) return;
      
      const uri = this.recording.getURI();
      if (!uri) return;
      
      try {
        const fileInfo = await FileSystem.getInfoAsync(uri);
        if (!fileInfo.exists) return;
        
        const currentSize = fileInfo.size as number;
        const newBytesLength = currentSize - this.lastByteSent;
        
        // Calculate minimum buffer size for MIN_AUDIO_DURATION
        const minBufferSize = (16000 * 2 * this.MIN_AUDIO_DURATION) / 1000;
        
        // Only send if we have enough new data
        if (newBytesLength >= minBufferSize) {
          // Read the WAV file data
          const slice = await FileSystem.readAsStringAsync(uri, {
            encoding: FileSystem.EncodingType.Base64,
            position: this.lastByteSent,
            length: newBytesLength,
          });
          
          // Convert base64 to ArrayBuffer
          const binaryString = atob(slice);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          
          // Extract PCM data (skip WAV header if at beginning)
          let pcmData = bytes;
          if (this.lastByteSent === 0 && bytes.length > this.WAV_HEADER_SIZE) {
            // Skip WAV header for first chunk
            pcmData = bytes.slice(this.WAV_HEADER_SIZE);
            console.log('🎤 Skipped WAV header (44 bytes)');
          }
          
          // Check for voice activity
          if (this.hasVoiceActivity(pcmData)) {
            // Send the PCM chunk
            if (this.onAudioDataCallback) {
              this.onAudioDataCallback(pcmData.buffer);
            }
          }
          
          this.lastByteSent = currentSize;
        }
      } catch (error) {
        console.error('Error streaming audio chunk:', error);
      }
    }, this.CHUNK_INTERVAL);
  }

  // Simple voice activity detection
  private hasVoiceActivity(pcmBuffer: Uint8Array): boolean {
    if (pcmBuffer.length < 2) return false;
    
    // Convert Uint8Array to Int16Array (PCM 16-bit)
    const samples = new Int16Array(pcmBuffer.buffer, pcmBuffer.byteOffset, pcmBuffer.length / 2);
    
    // Calculate RMS (Root Mean Square)
    let sum = 0;
    for (let i = 0; i < samples.length; i++) {
      sum += samples[i] * samples[i];
    }
    const rms = Math.sqrt(sum / samples.length);
    
    // Return true if RMS exceeds threshold
    return rms > this.VOICE_THRESHOLD;
  }


  // Buffer PCM chunks and play them in segments
  async bufferAudioChunk(audioBuffer: ArrayBuffer, sampleRate: number = 16000): Promise<void> {
    this.downloadBuffer.push(new Uint8Array(audioBuffer));
    
    // Calculate total buffered size
    const totalBytes = this.downloadBuffer.reduce((sum, chunk) => sum + chunk.length, 0);
    
    // If we have enough data, flush to a segment
    if (totalBytes >= this.SEGMENT_SIZE_KB * 1024) {
      await this.flushAudioSegment(sampleRate);
    }
  }

  private async flushAudioSegment(sampleRate: number = 16000): Promise<void> {
    if (!this.downloadBuffer.length) return;
    
    try {
      // Combine all chunks
      const totalLength = this.downloadBuffer.reduce((sum, chunk) => sum + chunk.length, 0);
      const combined = new Uint8Array(totalLength);
      let offset = 0;
      
      for (const chunk of this.downloadBuffer) {
        combined.set(chunk, offset);
        offset += chunk.length;
      }
      
      // Create WAV header for PCM data
      const wavBuffer = this.createWAVFromPCM(combined, sampleRate);
      
      // Convert to base64
      const base64Audio = Buffer.from(wavBuffer).toString('base64');
      
      // Write to cache as WAV file
      const segmentPath = `${FileSystem.cacheDirectory}seg-${this.segmentIndex++}.wav`;
      await FileSystem.writeAsStringAsync(segmentPath, base64Audio, {
        encoding: FileSystem.EncodingType.Base64,
      });
      
      // Add to playback queue
      this.playbackQueue.push({ uri: segmentPath });
      
      // Clear buffer
      this.downloadBuffer = [];
      
      // Start playback if not already playing
      if (!this.isPlaying) {
        console.log('🎧 Starting audio playback...');
        this.playNextSegment();
      }
      
      console.log(`🔊 Buffered PCM segment ${this.segmentIndex - 1} (${totalLength} bytes)`);
    } catch (error) {
      console.error('Error flushing audio segment:', error);
    }
  }

  // Create WAV header for PCM data
  private createWAVFromPCM(pcmData: Uint8Array, sampleRate: number): Uint8Array {
    const wavHeader = new ArrayBuffer(44);
    const view = new DataView(wavHeader);
    
    // "RIFF" chunk descriptor
    view.setUint32(0, 0x52494646, false); // "RIFF"
    view.setUint32(4, pcmData.length + 36, true); // file size - 8
    view.setUint32(8, 0x57415645, false); // "WAVE"
    
    // "fmt " sub-chunk
    view.setUint32(12, 0x666d7420, false); // "fmt "
    view.setUint32(16, 16, true); // subchunk size
    view.setUint16(20, 1, true); // audio format (1 = PCM)
    view.setUint16(22, 1, true); // number of channels
    view.setUint32(24, sampleRate, true); // sample rate
    view.setUint32(28, sampleRate * 2, true); // byte rate (sample rate * channels * bits per sample / 8)
    view.setUint16(32, 2, true); // block align (channels * bits per sample / 8)
    view.setUint16(34, 16, true); // bits per sample
    
    // "data" sub-chunk
    view.setUint32(36, 0x64617461, false); // "data"
    view.setUint32(40, pcmData.length, true); // data size
    
    // Combine header and PCM data
    const wavBuffer = new Uint8Array(44 + pcmData.length);
    wavBuffer.set(new Uint8Array(wavHeader), 0);
    wavBuffer.set(pcmData, 44);
    
    return wavBuffer;
  }

  private async playNextSegment(): Promise<void> {
    if (this.playbackQueue.length === 0) {
      this.isPlaying = false;
      return;
    }
    
    this.isPlaying = true;
    const segment = this.playbackQueue.shift()!;
    
    try {
      // Configure audio for playback
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
      
      console.log(`🎧 Playing audio segment: ${segment.uri}`);
      
      const { sound } = await Audio.Sound.createAsync(
        { uri: segment.uri },
        { 
          shouldPlay: true,
          volume: 1.0,
        }
      );
      
      segment.sound = sound;
      
      sound.setOnPlaybackStatusUpdate(async (status) => {
        if (status.isLoaded && status.didJustFinish) {
          // Clean up
          await sound.unloadAsync();
          await FileSystem.deleteAsync(segment.uri, { idempotent: true });
          
          // Play next segment
          this.playNextSegment();
        }
      });
    } catch (error) {
      console.error('Error playing segment:', error);
      this.isPlaying = false;
    }
  }

  // Force flush any remaining audio
  async flushRemainingAudio(sampleRate: number = 16000): Promise<void> {
    if (this.downloadBuffer.length > 0) {
      console.log('🔊 Flushing remaining audio buffer');
      await this.flushAudioSegment(sampleRate);
    }
  }

  // Legacy method for compatibility
  async playAudioBuffer(audioBuffer: ArrayBuffer): Promise<void> {
    await this.bufferAudioChunk(audioBuffer, 16000);
  }

  async cleanup(): Promise<void> {
    await this.stopRecording();
    
    // Stop all playing sounds
    for (const segment of this.playbackQueue) {
      if (segment.sound) {
        await segment.sound.unloadAsync();
      }
      await FileSystem.deleteAsync(segment.uri, { idempotent: true }).catch(() => {});
    }
    
    this.playbackQueue = [];
    this.downloadBuffer = [];
    this.isPlaying = false;
    this.segmentIndex = 0;
    this.lastByteSent = 0;
    
    if (this.sound) {
      await this.sound.unloadAsync();
      this.sound = null;
    }
  }

  // Get recording stats for debugging
  async getRecordingStats(): Promise<{
    isRecording: boolean;
    duration: number;
    bytesSent: number;
  }> {
    if (!this.recording) {
      return { isRecording: false, duration: 0, bytesSent: 0 };
    }
    
    const status = await this.recording.getStatusAsync();
    return {
      isRecording: status.isRecording,
      duration: status.durationMillis || 0,
      bytesSent: this.lastByteSent,
    };
  }
}

export const audioService = new AudioService();