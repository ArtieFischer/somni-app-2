import { WebSocketManager } from './websocketManager';
import { ConversationalAIEvents, TranscriptionEvent, ConversationMode } from '../types/websocket.types';
import { audioService } from './audioService';

export interface ConversationalAIConfig {
  token: string;
  dreamId: string;
  conversationId?: string;
  mode?: ConversationMode;
  interpreterId?: string;
  userId?: string;
  websocketUrl?: string;
}

export class ConversationalAIService extends WebSocketManager {
  private mode: ConversationMode = 'text';
  private config: ConversationalAIConfig;
  private isRecording = false;
  private audioBytesSent: number = 0;
  private lastTranscriptText: string = '';
  private lastTranscriptTime: number = 0;

  constructor(config: ConversationalAIConfig) {
    const query: Record<string, any> = {};
    if (config.conversationId) {
      query.conversationId = config.conversationId;
    }

    super({
      namespace: '/conversational-ai',
      token: config.token,
      query: Object.keys(query).length > 0 ? query : undefined,
      autoConnect: false,
      baseUrl: config.websocketUrl,
    });
    
    this.config = config;
    if (config.mode) {
      this.mode = config.mode;
    }
  }

  async initialize(): Promise<void> {
    await this.connect();
    this.setupEventListeners();
    
    const socket = this.getSocket();
    if (socket && this.config.dreamId && !this.config.conversationId) {
      socket.emit('initialize_conversation', {
        dreamId: this.config.dreamId,
        interpreterId: this.config.interpreterId || 'lakshmi'
      });
    }
  }

  private setupEventListeners(): void {
    const socket = this.getSocket();
    if (!socket) return;

    // Connection events
    socket.on('connect', () => {
      console.log('✅ ConversationalAI Connected');
      this.emit('connection_state_changed', { isConnected: true, isConnecting: false });
    });

    socket.on('disconnect', (reason: string) => {
      console.log('❌ ConversationalAI Disconnected:', reason);
      this.emit('connection_state_changed', { isConnected: false, isConnecting: false });
    });

    // Conversation lifecycle
    socket.on('conversation_initialized', (data: any) => {
      this.emit('conversation_initialized', data);
    });

    socket.on('conversation_started', (data: any) => {
      this.emit('conversation_started', data);
    });

    socket.on('conversation_ended', (data: any) => {
      this.emit('conversation_ended', data);
    });

    // Listen to transcription event - backend sends all transcripts here
    socket.on('transcription', (data: { text: string; isFinal: boolean; speaker: string; timestamp: number }) => {
      console.log('Transcription received:', { speaker: data.speaker, isFinal: data.isFinal, text: data.text });
      if (data.speaker === 'user' && data.isFinal && data.text) {
        this.emit('user_transcript', { text: data.text, isFinal: true });
      }
      // Handle agent transcripts if needed in future
    });

    // Handle transcription timeout
    socket.on('transcription_timeout', () => {
      console.log('⏱️ Transcription timeout - no transcript received within 15 seconds');
      this.emit('transcription_timeout');
    });

    // Agent responses
    socket.on('agent_response', (data: { text: string; isTentative?: boolean }) => {
      this.emit('agent_response', data);
    });

    // Remove duplicate event listeners that cause triple messages
    // The backend forwards all transcript events to 'transcription' already
    
    // Audio handling
    socket.on('audio_chunk', async (data: { audio: string; format: string; sampleRate: number; isLast: boolean }) => {
      if (data.format === 'base64') {
        try {
          const binaryString = atob(data.audio);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          
          await audioService.bufferAudioChunk(bytes.buffer, data.sampleRate);
          
          if (data.isLast) {
            await audioService.flushRemainingAudio();
          }
        } catch (error) {
          console.error('Error decoding audio:', error);
        }
      }
      
      this.emit('audio_chunk', data);
    });

    socket.on('audio_done', () => {
      audioService.flushRemainingAudio();
      this.emit('audio_done');
    });

    // ElevenLabs events
    socket.on('elevenlabs_conversation_initiated', (data: any) => {
      this.emit('elevenlabs_conversation_initiated', data);
      
      // Trigger first message after a brief delay
      setTimeout(() => {
        socket.emit('conversation_ready');
      }, 500);
    });

    socket.on('vad_score', (data: { score: number; timestamp: number }) => {
      this.emit('vad_score', data);
    });

    // Error handling
    socket.on('error', (error: { code: string; message: string; details?: any }) => {
      // Only emit actual errors, not configuration messages
      if (error.code !== 'MISSING_TRANSCRIPT_EVENTS') {
        this.emit('error', error);
      }
    });

    // Timeout handling
    socket.on('inactivity_timeout', (data: any) => {
      this.emit('inactivity_timeout', data);
    });

    socket.on('elevenlabs_disconnected', (data: any) => {
      this.emit('elevenlabs_disconnected', data);
    });
  }

  // Audio methods
  sendAudioChunk(chunk: ArrayBuffer): void {
    const socket = this.getSocket();
    if (!socket?.connected) return;
    
    // Convert to base64
    const bytes = new Uint8Array(chunk);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    const base64 = btoa(binary);
    
    socket.emit('send_audio', { audio: base64 });
    this.audioBytesSent += chunk.byteLength;
  }

  private sendAudioEnd(): void {
    const socket = this.getSocket();
    if (!socket?.connected) return;
    
    socket.emit('user-audio-end');
    
    // Log audio session info
    console.log('📊 Audio sent:', {
      bytes: this.audioBytesSent,
      duration: Math.round(this.audioBytesSent / 32) + 'ms'
    });
    
    // Reset counter
    this.audioBytesSent = 0;
  }

  private sendAudioStart(): void {
    const socket = this.getSocket();
    if (!socket?.connected) return;
    
    socket.emit('user-audio-start');
  }

  // Text input
  sendTextInput(text: string): void {
    const socket = this.getSocket();
    if (!socket?.connected) return;
    
    socket.emit('send_text', { text });
  }

  // Conversation control
  endConversation(): void {
    const socket = this.getSocket();
    if (!socket?.connected) return;
    
    socket.emit('end_conversation');
    this.stopAudioRecording();
  }

  // Mode management
  getMode(): ConversationMode {
    return this.mode;
  }

  setMode(mode: ConversationMode): void {
    this.mode = mode;
    this.emit('mode_changed', { mode });
  }

  // Audio recording
  async startAudioRecording(): Promise<boolean> {
    if (this.mode !== 'voice' || this.isRecording) {
      return false;
    }

    const success = await audioService.startRecording(
      (audioData) => {
        this.sendAudioChunk(audioData);
      },
      () => {
        this.sendAudioEnd();
        this.isRecording = false;
      }
    );

    if (success) {
      this.isRecording = true;
      this.audioBytesSent = 0;
      this.sendAudioStart();
    }

    return success;
  }

  async stopAudioRecording(): Promise<void> {
    if (!this.isRecording) return;
    
    await audioService.stopRecording();
    this.isRecording = false;
  }

  // Event handlers
  onConversationInitialized(callback: (data: any) => void): void {
    this.on('conversation_initialized', callback);
  }

  onUserTranscript(callback: (data: { text: string; isFinal: boolean }) => void): void {
    this.on('user_transcript', callback);
  }

  onAgentResponse(callback: (data: { text: string; isTentative?: boolean }) => void): void {
    this.on('agent_response', callback);
  }

  onAudioChunk(callback: (data: any) => void): void {
    this.on('audio_chunk', callback);
  }

  onError(callback: (error: { code: string; message: string }) => void): void {
    this.on('error', callback);
  }

  onConversationEnded(callback: (data: any) => void): void {
    this.on('conversation_ended', callback);
  }

  onInactivityTimeout(callback: (data: any) => void): void {
    this.on('inactivity_timeout', callback);
  }

  onElevenLabsConversationInitiated(callback: (data: any) => void): void {
    this.on('elevenlabs_conversation_initiated', callback);
  }

  onElevenLabsDisconnected(callback: (data: any) => void): void {
    this.on('elevenlabs_disconnected', callback);
  }

  onVADScore(callback: (data: { score: number; timestamp: number }) => void): void {
    this.on('vad_score', callback);
  }

  onAudioDone(callback: () => void): void {
    this.on('audio_done', callback);
  }

  onTranscriptionTimeout(callback: () => void): void {
    this.on('transcription_timeout', callback);
  }

  // Cleanup
  async cleanup(): Promise<void> {
    await this.stopAudioRecording();
    await audioService.cleanup();
    this.disconnect();
  }
}