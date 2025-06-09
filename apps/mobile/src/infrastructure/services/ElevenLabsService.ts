import * as FileSystem from 'expo-file-system';

export interface TTSOptions {
  text: string;
  voiceId?: string;
  stability?: number;        // 0-1, default 0.5
  similarityBoost?: number;  // 0-1, default 0.5
  style?: number;           // 0-1, default 0
  useSpeakerBoost?: boolean; // default true
}

export interface VoiceCloneOptions {
  name: string;
  description?: string;
  files: string[];  // Array of audio file URIs
  labels?: Record<string, string>;
}

export interface ElevenLabsConfig {
  apiKey: string;
  defaultVoiceId: string;
  baseUrl?: string;
}

export class ElevenLabsService {
  private apiKey: string;
  private defaultVoiceId: string;
  private baseUrl: string;
  
  constructor(config: ElevenLabsConfig) {
    this.apiKey = config.apiKey;
    this.defaultVoiceId = config.defaultVoiceId;
    this.baseUrl = config.baseUrl || 'https://api.elevenlabs.io/v1';
  }

  private getHeaders() {
    return {
      'Accept': 'audio/mpeg',
      'xi-api-key': this.apiKey,
      'Content-Type': 'application/json',
    };
  }

  /**
   * Generate speech from text using ElevenLabs TTS
   */
  async generateSpeech(options: TTSOptions): Promise<string> {
    const {
      text,
      voiceId = this.defaultVoiceId,
      stability = 0.5,
      similarityBoost = 0.5,
      style = 0,
      useSpeakerBoost = true
    } = options;

    if (!text || text.trim().length === 0) {
      throw new Error('Text is required for speech generation');
    }

    if (text.length > 5000) {
      throw new Error('Text exceeds maximum length of 5000 characters');
    }

    try {
      const response = await fetch(`${this.baseUrl}/text-to-speech/${voiceId}`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          text: text.trim(),
          model_id: "eleven_monolingual_v1",
          voice_settings: {
            stability,
            similarity_boost: similarityBoost,
            style,
            use_speaker_boost: useSpeakerBoost
          }
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`ElevenLabs API error: ${response.status} - ${errorText}`);
      }

      // Convert response to base64 for React Native audio playback
      const arrayBuffer = await response.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString('base64');
      
      // Save to temporary file
      const filename = `speech_${Date.now()}.mp3`;
      const filepath = `${FileSystem.cacheDirectory}${filename}`;
      
      await FileSystem.writeAsStringAsync(filepath, base64, {
        encoding: FileSystem.EncodingType.Base64,
      });

      return filepath;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to generate speech');
    }
  }

  /**
   * Clone a voice using audio samples
   */
  async cloneVoice(options: VoiceCloneOptions): Promise<string> {
    const { name, description, files, labels } = options;

    if (!name || name.trim().length === 0) {
      throw new Error('Voice name is required');
    }

    if (!files || files.length === 0) {
      throw new Error('At least one audio file is required for voice cloning');
    }

    try {
      const formData = new FormData();
      
      formData.append('name', name.trim());
      if (description) {
        formData.append('description', description.trim());
      }

      // Add audio files
      for (let i = 0; i < files.length; i++) {
        const fileUri = files[i];
        formData.append('files', {
          uri: fileUri,
          type: 'audio/mpeg',
          name: `voice_sample_${i}.mp3`
        } as any);
      }

      // Add labels if provided
      if (labels) {
        formData.append('labels', JSON.stringify(labels));
      }

      const response = await fetch(`${this.baseUrl}/voices/add`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'xi-api-key': this.apiKey,
        },
        body: formData
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Voice cloning failed: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      return result.voice_id;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to clone voice');
    }
  }

  /**
   * Get available voices
   */
  async getVoices(): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseUrl}/voices`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'xi-api-key': this.apiKey,
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch voices: ${response.status}`);
      }

      const result = await response.json();
      return result.voices || [];
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to fetch voices');
    }
  }

  /**
   * Delete a cloned voice
   */
  async deleteVoice(voiceId: string): Promise<void> {
    if (!voiceId) {
      throw new Error('Voice ID is required');
    }

    try {
      const response = await fetch(`${this.baseUrl}/voices/${voiceId}`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
          'xi-api-key': this.apiKey,
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to delete voice: ${response.status}`);
      }
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to delete voice');
    }
  }
}

/**
 * Error handling utility for ElevenLabs API errors
 */
export const handleElevenLabsError = (error: any): string => {
  if (error?.status === 401) {
    return 'Invalid ElevenLabs API key. Please check your configuration.';
  }
  
  if (error?.status === 422) {
    return 'Invalid request parameters. Please check your input.';
  }
  
  if (error?.status === 429) {
    return 'Rate limit exceeded. Please try again later.';
  }
  
  if (error?.status >= 500) {
    return 'ElevenLabs service temporarily unavailable. Please try again later.';
  }

  if (error?.message?.includes('network')) {
    return 'Network error. Please check your internet connection.';
  }
  
  return error?.message || 'Speech generation failed. Please try again.';
};