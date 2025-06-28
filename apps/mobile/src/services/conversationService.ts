import { supabase } from '../lib/supabase';

export interface StartConversationParams {
  dreamId: string;  // Required by API
  interpreterId: 'jung' | 'freud' | 'mary' | 'lakshmi';
}

export interface StartConversationResponse {
  conversationId: string;
  websocketUrl: string;
  token: string;
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
      };
    } catch (error) {
      console.error('❌ Error starting conversation:', error);
      throw error;
    }
  }
}

export const conversationService = new ConversationService();