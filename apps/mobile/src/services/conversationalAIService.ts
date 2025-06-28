import { WebSocketManager } from './websocketManager';
import { ConversationalAIEvents, TranscriptionEvent, ConversationMode } from '../types/websocket.types';
import { audioService } from './audioService';

export interface ConversationalAIConfig {
  token: string;
  dreamId: string;  // Required for initialization
  conversationId?: string;  // From HTTP API response
  mode?: ConversationMode;
  interpreterId?: string;
  userId?: string;
  websocketUrl?: string;
}

export class ConversationalAIService extends WebSocketManager {
  private audioQueue: ArrayBuffer[] = [];
  private isPlaying = false;
  private mode: ConversationMode = 'text';
  private config: ConversationalAIConfig;

  constructor(config: ConversationalAIConfig) {
    const query: Record<string, any> = {};
    // If we have a conversationId from HTTP API, pass it in query params
    if (config.conversationId) {
      query.conversationId = config.conversationId;
    }

    console.log('🔧 ConversationalAIService constructor - Config:', {
      hasToken: !!config.token,
      mode: config.mode,
      interpreterId: config.interpreterId,
      dreamId: config.dreamId,
      conversationId: config.conversationId,
      userId: config.userId
    });

    super({
      namespace: '/conversational-ai',
      token: config.token,
      query: Object.keys(query).length > 0 ? query : undefined,
      autoConnect: false,
      baseUrl: config.websocketUrl, // This will be replaced with the correct namespace
    });
    
    this.config = config;
    if (config.mode) {
      this.mode = config.mode;
    }
  }

  async initialize(): Promise<void> {
    console.log('🎯 ConversationalAIService.initialize() called');
    await this.connect();
    console.log('✅ Connect promise resolved, setting up listeners...');
    this.setupEventListeners();
    
    // Only send initialization event if we don't have a conversationId
    // (i.e., if we're not resuming an existing conversation)
    const socket = this.getSocket();
    if (socket && this.config.dreamId && !this.config.conversationId) {
      console.log('📤 Sending initialize_conversation event');
      socket.emit('initialize_conversation', {
        dreamId: this.config.dreamId,
        interpreterId: this.config.interpreterId || 'lakshmi'
      });
    } else if (this.config.conversationId) {
      console.log('📋 Using existing conversation ID:', this.config.conversationId);
    }
  }

  private setupEventListeners(): void {
    const socket = this.getSocket();
    if (!socket) return;

    // Conversation initialized
    socket.on('conversation_initialized', (data: { conversationId: string; elevenLabsSessionId: string; isResumed?: boolean; messageCount?: number }) => {
      console.log('Conversation initialized:', data);
      const { conversationId, isResumed, messageCount } = data;

      if (isResumed) {
        console.log(`📚 Resuming conversation with ${messageCount} previous messages`);
      }
      
      this.emit('conversation_initialized', data);
    });

    // Conversation started (initial greeting)
    socket.on('conversation_started', (data: { interpreter: string; message: string; mode: string }) => {
      console.log('Conversation started:', data);
      this.emit('conversation_started', data);
    });

    // User transcript (real-time transcription of user speech)
    socket.on('user_transcript', (data: { text: string; isFinal: boolean }) => {
      console.log('User transcript:', data);
      this.emit('user_transcript', data);
    });

    // Agent text response
    socket.on('agent_response', (data: { text: string; role: string }) => {
      console.log('Agent response:', data);
      this.emit('agent_response', data);
    });

    // Text response (alternative event name)
    socket.on('text_response', (data: { text: string }) => {
      console.log('Text response:', data);
      this.emit('agent_response', { text: data.text, role: 'agent' });
    });

    // Audio chunks from agent
    socket.on('audio_chunk', (data: { chunk: ArrayBuffer; isLast: boolean }) => {
      console.log('Audio chunk received, size:', data.chunk.byteLength, 'isLast:', data.isLast);
      this.audioQueue.push(data.chunk);
      if (!this.isPlaying) {
        this.playAudioQueue();
      }
      this.emit('audio_chunk', data);
    });

    // Conversation ended
    socket.on('conversation_ended', (data: { conversationId: string; duration: number }) => {
      console.log('Conversation ended:', data);
      this.emit('conversation_ended', data);
    });

    // Error handling
    socket.on('error', (error: { code: string; message: string }) => {
      console.error('Conversational AI error:', error);
      this.emit('error', error);
      
      if (error.code === 'ELEVENLABS_ERROR') {
        // Fallback to text-only mode
        this.mode = 'text';
        this.emit('mode_changed', { mode: 'text' });
      }
    });

    // Inactivity timeout handling
    socket.on('inactivity_timeout', (data: { reason: string; timeout: number }) => {
      console.log('⏱️ Inactivity timeout:', data);
      this.emit('inactivity_timeout', data);
    });

    // ElevenLabs conversation initialized
    socket.on('elevenlabs_conversation_initiated', (data: { audioFormat: string; conversationId: string }) => {
      console.log('🎙️ ElevenLabs conversation initiated:', data);
      this.emit('elevenlabs_conversation_initiated', data);
    });

    // Transcription events
    socket.on('transcription', (data: { text: string; isFinal: boolean; speaker: string; timestamp: number }) => {
      console.log('📝 Transcription:', data);
      if (data.speaker === 'user') {
        this.emit('user_transcript', { text: data.text, isFinal: data.isFinal });
      } else if (data.speaker === 'agent' && data.isFinal) {
        // Only emit agent transcriptions when final to avoid duplicates
        this.emit('agent_response', { text: data.text, role: 'agent' });
      }
    });

    // ElevenLabs disconnected - backup disconnection event
    socket.on('elevenlabs_disconnected', (data: any) => {
      console.log('🔌 ElevenLabs disconnected:', data);
      this.emit('elevenlabs_disconnected', data);
      // Treat this as a potential timeout/disconnection
      this.emit('inactivity_timeout', { 
        reason: data?.reason || 'ElevenLabs connection lost', 
        timeout: data?.timeout || 0 
      });
    });
  }

  sendAudioChunk(chunk: ArrayBuffer): void {
    const socket = this.getSocket();
    if (!socket?.connected) {
      console.error('Cannot send audio chunk: socket not connected');
      return;
    }
    
    console.log('Sending audio chunk to server, size:', chunk.byteLength);
    
    // Socket.IO should handle ArrayBuffer directly
    socket.emit('send_audio', { audio: chunk });
  }

  sendTextInput(text: string): void {
    const socket = this.getSocket();
    if (!socket?.connected) {
      console.error('Cannot send text input: socket not connected');
      return;
    }
    socket.emit('send_text', { text });
  }

  endConversation(): void {
    const socket = this.getSocket();
    if (!socket?.connected) {
      console.error('Cannot end conversation: socket not connected');
      return;
    }
    socket.emit('end_conversation');
    
    // Stop any ongoing audio recording
    this.stopAudioRecording();
  }

  getMode(): ConversationMode {
    return this.mode;
  }

  setMode(mode: ConversationMode): void {
    this.mode = mode;
    this.emit('mode_changed', { mode });
  }

  private async playAudioQueue(): Promise<void> {
    if (this.audioQueue.length === 0) {
      this.isPlaying = false;
      return;
    }

    this.isPlaying = true;

    while (this.audioQueue.length > 0) {
      const audioChunk = this.audioQueue.shift();
      if (audioChunk) {
        try {
          await audioService.playAudioBuffer(audioChunk);
        } catch (error) {
          console.error('Error playing audio chunk:', error);
        }
      }
    }

    this.isPlaying = false;
  }

  onConversationInitialized(callback: (data: { conversationId: string; elevenLabsSessionId: string; isResumed?: boolean; messageCount?: number }) => void): void {
    this.on('conversation_initialized', callback);
  }

  onUserTranscript(callback: (data: { text: string; isFinal: boolean }) => void): void {
    this.on('user_transcript', callback);
  }

  onAgentResponse(callback: (data: { text: string; role: string }) => void): void {
    this.on('agent_response', callback);
  }

  onAudioChunk(callback: (data: { chunk: ArrayBuffer; isLast: boolean }) => void): void {
    this.on('audio_chunk', callback);
  }

  onError(callback: (error: { code: string; message: string }) => void): void {
    this.on('error', callback);
  }

  onConversationEnded(callback: (data: { conversationId: string; duration: number }) => void): void {
    this.on('conversation_ended', callback);
  }

  onModeChanged(callback: (data: { mode: ConversationMode }) => void): void {
    this.on('mode_changed', callback);
  }

  onInactivityTimeout(callback: (data: { reason: string; timeout: number }) => void): void {
    this.on('inactivity_timeout', callback);
  }

  onElevenLabsConversationInitiated(callback: (data: { audioFormat: string; conversationId: string }) => void): void {
    this.on('elevenlabs_conversation_initiated', callback);
  }

  onElevenLabsDisconnected(callback: (data: any) => void): void {
    this.on('elevenlabs_disconnected', callback);
  }

  // Audio recording methods
  async startAudioRecording(): Promise<boolean> {
    if (this.mode !== 'voice') {
      console.warn('Cannot start audio recording in text mode');
      return false;
    }

    return await audioService.startRecording((audioData) => {
      // Send audio chunks to the server
      this.sendAudioChunk(audioData);
    });
  }

  async stopAudioRecording(): Promise<void> {
    await audioService.stopRecording();
  }

  // Cleanup method
  async cleanup(): Promise<void> {
    await this.stopAudioRecording();
    await audioService.cleanup();
    this.disconnect();
  }
}