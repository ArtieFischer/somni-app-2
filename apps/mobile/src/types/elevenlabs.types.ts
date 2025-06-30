// ElevenLabs WebView Integration Types

export interface ElevenLabsMessage {
  source: 'user' | 'agent';
  text: string;
  timestamp?: number;
  metadata?: Record<string, any>;
}

export interface ElevenLabsSessionData {
  agentId: string;
  sessionToken?: string;
  conversationId?: string;
  dynamicVariables?: Record<string, any>;
  isResumed?: boolean;
}

export interface ElevenLabsWebViewProps {
  agentId: string;
  dreamId?: string;
  interpreterId?: string;
  onMessage?: (message: ElevenLabsMessage) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: ElevenLabsError) => void;
}

export interface ElevenLabsError {
  message: string;
  code?: string;
  details?: any;
}

export interface ElevenLabsWebViewMessage {
  type: 'connect' | 'disconnect' | 'message' | 'error' | 'requestSession' | 'nativeCall';
  data?: any;
  method?: string;
  args?: any[];
}

export interface ElevenLabsNativeBridge {
  getBatteryLevel(): Promise<number>;
  getBrightness(): Promise<number>;
  setBrightness(brightness: number): Promise<void>;
}

export type InterpreterType = 'jung' | 'freud' | 'mary' | 'lakshmi';

export interface AgentMapping {
  [key: string]: string;
}

// Conversation initialization request/response types
export interface ConversationInitRequest {
  dreamId?: string;
  interpreterId: InterpreterType;
  agentId?: string;
}

export interface ConversationInitResponse {
  success: boolean;
  data?: {
    conversationId: string;
    agentId: string;
    sessionToken: string;
    dynamicVariables: Record<string, any>;
    isResumed: boolean;
  };
  error?: string;
}

// Message storage types
export interface MessageStoreRequest {
  conversationId: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp?: number;
  metadata?: Record<string, any>;
}

export interface MessageStoreResponse {
  success: boolean;
  data?: {
    messageId: string;
  };
  error?: string;
}

// WebView state management
export interface ElevenLabsWebViewState {
  isConnected: boolean;
  isConnecting: boolean;
  conversationId?: string;
  error?: ElevenLabsError;
}