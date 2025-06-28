export type ConversationMode = 'voice' | 'text';

export interface TranscriptionEvent {
  text: string;
  speaker: 'user' | 'agent';
  timestamp: number;
  isFinal: boolean;
}

export interface ConversationalAIEvents {
  conversation_started: (data: {
    message: string;
    interpreter: string;
    mode: ConversationMode;
  }) => void;
  
  audio_response: (chunk: ArrayBuffer) => void;
  
  text_response: (data: { 
    text: string;
    timestamp?: number;
  }) => void;
  
  transcription: (event: TranscriptionEvent) => void;
  
  agent_response: (response: any) => void;
  
  error: (error: { 
    message: string;
    code?: string;
  }) => void;
  
  reconnecting: (data: { 
    attempt: number;
  }) => void;
  
  reconnected: () => void;
  
  conversation_ended: (data: { 
    conversationId: string;
    reason?: string;
  }) => void;
}

export interface DreamInterpretationEvents {
  startConversation: (data: {
    dreamId: string;
    interpreterId: 'jung' | 'freud' | 'mary' | 'lakshmi';
    dreamInterpretation?: any;
    userName?: string;
    initialMessage?: string;
  }) => void;
  
  sendMessage: (data: { 
    message: string;
  }) => void;
  
  endConversation: () => void;
  
  typing: (data: { 
    isTyping: boolean;
  }) => void;

  connectionStatus: (data: { 
    status: string;
  }) => void;
  
  conversationStarted: (data: {
    sessionId: string;
    conversationId: string;
    interpreterId: string;
  }) => void;
  
  messageReceived: (data: {
    message: string;
    timestamp: Date;
  }) => void;
  
  agentTyping: (data: { 
    isTyping: boolean;
  }) => void;
  
  conversationEnded: (data: { 
    reason: string;
    summary?: string;
  }) => void;
  
  error: (data: { 
    code: string;
    message: string;
  }) => void;
}

export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'agent' | 'system';
  timestamp: Date;
}