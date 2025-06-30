import { supabase } from '../lib/supabase';

export interface StartConversationParams {
  dreamId: string;  // Required by API
  interpreterId: 'jung' | 'freud' | 'mary' | 'lakshmi';
}

export interface StartConversationResponse {
  conversationId: string;
  websocketUrl: string;
  token: string;
  elevenLabsSignedUrl?: string; // Signed URL for direct ElevenLabs connection
}

export interface ElevenLabsInitResponse {
  success: boolean;
  data: {
    conversationId: string;           // Database conversation ID (groups messages by dream)
    elevenLabsSessionId: string;      // Unique ElevenLabs session ID (new each time)
    signedUrl: string;
    authToken: string;
    dynamicVariables: {
      user_name: string;
      user_profile: string;
      dream_content: string;
      dream_emotions: string[];
      conversation_context: string;
      interpreter_style: string;
      previous_conversations_count?: number;
    };
    previousMessages?: Array<{
      id: string;
      content: string;
      role: 'user' | 'assistant';
      created_at: string;
    }>;
    messageCount: number;
    isResumed: boolean;              // Will always be false now
  };
}

export interface SaveMessageParams {
  conversationId: string;
  elevenLabsSessionId: string;
  content: string;
  role: 'user' | 'assistant';
  audioUrl?: string;
  metadata?: {
    audioUrl?: string;
    [key: string]: any;
  };
}

class ConversationService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.EXPO_PUBLIC_SOMNI_BACKEND_URL || 'http://localhost:3000';
  }

  async startConversation(params: StartConversationParams): Promise<StartConversationResponse> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new Error('No authentication token available');
      }

      console.log('🚀 Starting conversation via API...');
      console.log('📍 URL:', `${this.baseUrl}/api/conversations/start`);
      console.log('📦 Params:', params);

      const response = await fetch(`${this.baseUrl}/api/conversations/start`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
          'X-API-Key': process.env.EXPO_PUBLIC_SOMNI_BACKEND_API_SECRET || '',
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error:', response.status, errorText);
        throw new Error(`Failed to start conversation: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ Conversation started:', data);

      return {
        conversationId: data.conversationId,
        websocketUrl: data.websocketUrl || this.baseUrl,
        token: data.token || session.access_token,
        elevenLabsSignedUrl: data.elevenLabsSignedUrl,
      };
    } catch (error) {
      console.error('❌ Error starting conversation:', error);
      throw error;
    }
  }

  async initElevenLabsConversation(params: StartConversationParams): Promise<ElevenLabsInitResponse> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new Error('No authentication token available');
      }

      console.log('🚀 Initializing ElevenLabs conversation...');
      console.log('📍 Backend URL:', this.baseUrl);
      console.log('📍 Full URL:', `${this.baseUrl}/api/v1/conversations/elevenlabs/init`);
      console.log('📦 Params:', params);
      console.log('🔑 Has auth token:', !!session.access_token);

      // Add timeout to fetch
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
      
      console.log('📡 Sending request to backend...');
      
      const response = await fetch(`${this.baseUrl}/api/v1/conversations/elevenlabs/init`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
        signal: controller.signal
      }).finally(() => {
        clearTimeout(timeoutId);
      });
      
      console.log('📡 Response status:', response.status);
      console.log('📡 Response headers:', response.headers);
      
      // Clone response to read it twice
      const responseClone = response.clone();
      const rawText = await responseClone.text();
      console.log('📡 Raw response text:', rawText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error Details:', {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
          body: errorText,
          url: response.url
        });
        
        // Try to parse error response
        let errorDetails = errorText;
        try {
          const errorJson = JSON.parse(errorText);
          errorDetails = errorJson.error || errorJson.message || errorText;
        } catch {
          // Not JSON, use raw text
        }
        
        throw new Error(`Failed to initialize ElevenLabs conversation: ${errorDetails}`);
      }

      const data = await response.json();
      console.log('✅ ElevenLabs conversation initialized:', data);
      console.log('📊 Response structure:', {
        hasSuccess: 'success' in data,
        hasData: 'data' in data,
        topLevelKeys: Object.keys(data),
        dataKeys: data.data ? Object.keys(data.data) : 'no data object',
        hasElevenLabsSessionId: 'elevenLabsSessionId' in data
      });

      // Ensure consistent response structure
      // If backend returns data directly without success/data wrapper
      if (!('success' in data) && 'conversationId' in data && 'elevenLabsSessionId' in data) {
        console.log('🔄 Wrapping direct response in standard format');
        return {
          success: true,
          data: data
        };
      }

      return data;
    } catch (error) {
      console.error('❌ Error initializing ElevenLabs conversation:', error);
      throw error;
    }
  }

  async saveMessage(params: SaveMessageParams): Promise<{ success: boolean; messageId?: string }> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new Error('No authentication token available');
      }

      console.log('💾 Saving message with session tracking:', {
        conversationId: params.conversationId,
        elevenLabsSessionId: params.elevenLabsSessionId,
        role: params.role,
        endpoint: `${this.baseUrl}/api/v1/conversations/elevenlabs/messages`
      });

      const requestBody = {
        conversationId: params.conversationId,
        content: params.content,
        role: params.role,
        metadata: {
          ...params.metadata,
          audioUrl: params.audioUrl || params.metadata?.audioUrl,
          elevenLabsSessionId: params.elevenLabsSessionId,
          timestamp: new Date().toISOString()
        }
      };
      
      console.log('📤 Sending message to backend:', {
        endpoint: `${this.baseUrl}/api/v1/conversations/elevenlabs/messages`,
        bodyPreview: {
          ...requestBody,
          content: requestBody.content.substring(0, 100) + '...'
        }
      });

      const response = await fetch(`${this.baseUrl}/api/v1/conversations/elevenlabs/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Failed to save message:', {
          status: response.status,
          body: errorText
        });
        throw new Error(`Failed to save message: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ Message saved:', {
        messageId: data.id,
        conversationId: params.conversationId,
        sessionId: params.elevenLabsSessionId,
        role: params.role
      });
      return { success: true, messageId: data.id };
    } catch (error) {
      console.error('❌ Error saving message:', error);
      return { success: false };
    }
  }
}

// Helper function to transform dynamic variables to ensure all are in snake_case
function transformDynamicVariables(backendVars: any) {
  if (!backendVars) return null;
  
  const transformed: any = {};
  
  // Copy all existing snake_case variables
  Object.keys(backendVars).forEach(key => {
    if (key.includes('_')) {
      transformed[key] = backendVars[key];
    }
  });
  
  // Transform any remaining camelCase to snake_case
  if (backendVars.userName && !transformed.user_name) transformed.user_name = backendVars.userName;
  if (backendVars.userProfile && !transformed.user_profile) transformed.user_profile = backendVars.userProfile;
  if (backendVars.dreamContent && !transformed.dream_content) transformed.dream_content = backendVars.dreamContent;
  if (backendVars.dreamSymbols && !transformed.dream_symbols) transformed.dream_symbols = backendVars.dreamSymbols;
  if (backendVars.dreamEmotions && !transformed.dream_emotions) transformed.dream_emotions = backendVars.dreamEmotions;
  if (backendVars.recurringThemes && !transformed.recurring_themes) transformed.recurring_themes = backendVars.recurringThemes;
  if (backendVars.emotionalTonePrimary && !transformed.emotional_tone_primary) transformed.emotional_tone_primary = backendVars.emotionalTonePrimary;
  if (backendVars.emotionalToneIntensity && !transformed.emotional_tone_intensity) transformed.emotional_tone_intensity = backendVars.emotionalToneIntensity;
  if (backendVars.quickTake && !transformed.quick_take) transformed.quick_take = backendVars.quickTake;
  if (backendVars.interpretationSummary && !transformed.interpretation_summary) transformed.interpretation_summary = backendVars.interpretationSummary;
  if (backendVars.previousMessages && !transformed.previous_messages) transformed.previous_messages = backendVars.previousMessages;
  if (backendVars.conversationContext && !transformed.conversation_context) transformed.conversation_context = backendVars.conversationContext;
  if (backendVars.interpreterStyle && !transformed.interpreter_style) transformed.interpreter_style = backendVars.interpreterStyle;
  if (backendVars.previousConversationsCount && !transformed.previous_conversations_count) transformed.previous_conversations_count = backendVars.previousConversationsCount;
  if (backendVars.maxTurnLength && !transformed.max_turn_length) transformed.max_turn_length = backendVars.maxTurnLength;
  if (backendVars.dreamTopic && !transformed.dream_topic) transformed.dream_topic = backendVars.dreamTopic;
  
  // Keep other properties that don't need transformation
  if (backendVars.age) transformed.age = backendVars.age;
  if (backendVars.clarity) transformed.clarity = backendVars.clarity;
  if (backendVars.mood) transformed.mood = backendVars.mood;
  
  console.log('🔄 Transformed dynamic variables:', {
    original: Object.keys(backendVars),
    transformed: Object.keys(transformed),
    userName: transformed.user_name,
    hasDreamContent: !!transformed.dream_content
  });
  
  return transformed;
}

export const conversationService = new ConversationService();
export { transformDynamicVariables };