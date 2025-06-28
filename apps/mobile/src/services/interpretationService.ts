import { supabase } from '../lib/supabase';

export interface InterpretationResponse {
  dreamId: string;
  interpreterId: string;
  interpretation: string;
  dreamTopic: string;
  quickTake: string;
  symbols: string[];
  selfReflection: string;
  emotionalTone?: {
    primary: string;
    secondary: string;
    intensity: number;
  };
  practicalGuidance?: string[];
  interpretationCore?: {
    type: string;
    primaryInsight: string;
    keyPattern: string;
    personalGuidance: string;
    [key: string]: any;
  };
  generationMetadata?: {
    knowledgeFragmentsUsed: number;
    fragmentIdsUsed: string[];
  };
}

export interface InterpretationStartResponse {
  success: boolean;
  message: string;
  dreamId: string;
  interpreterType: string;
}

export interface Interpretation {
  id: string;
  dream_id: string;
  interpreter_type: string; // This is the actual field name in DB
  interpreter_id?: string; // For compatibility
  interpretation?: string;
  interpretation_summary?: string;
  full_response?: any;
  key_symbols?: any;
  symbols?: string[];
  advice?: string;
  mood_analysis?: any;
  emotional_tone?: {
    primary: string;
    secondary: string;
    intensity: number;
  };
  dream_topic?: string;
  quick_take?: string;
  primary_insight?: string;
  key_pattern?: string;
  created_at: string;
  version: number;
}

const API_URL = process.env.EXPO_PUBLIC_SOMNI_BACKEND_URL || 'http://localhost:3000';
const API_SECRET = process.env.EXPO_PUBLIC_SOMNI_BACKEND_API_SECRET || '';

console.log('InterpretationService initialized with:', {
  API_URL,
  API_SECRET_LENGTH: API_SECRET.length,
  API_SECRET_PREFIX: API_SECRET.substring(0, 10) + '...'
});

export const interpretationService = {
  async startInterpretation(dreamId: string, userId: string, interpreterType: string): Promise<InterpretationStartResponse> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No active session');
      }

      console.log('Starting interpretation:', {
        url: `${API_URL}/api/v1/dreams/interpret-async`,
        dreamId,
        userId,
        interpreterType,
        apiUrl: API_URL,
        hasSession: !!session,
        hasAccessToken: !!session?.access_token,
        apiSecretPrefix: API_SECRET.substring(0, 10) + '...'
      });

      // Add timeout to prevent hanging - but use a longer timeout for async operations
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout for async endpoint

      let response;
      try {
        response = await fetch(`${API_URL}/api/v1/dreams/interpret-async`, {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            'authorization': `Bearer ${session.access_token}`,
            'x-api-secret': API_SECRET,
          },
          body: JSON.stringify({ 
            dreamId, 
            userId, 
            interpreterType
          }),
          signal: controller.signal
        });
      } catch (fetchError: any) {
        clearTimeout(timeoutId);
        if (fetchError.name === 'AbortError') {
          // Don't treat timeout as complete failure for async operations
          console.warn('Initial request timed out, but interpretation may still be processing');
          return {
            success: true,
            message: 'Interpretation request submitted. Processing may take a few moments.',
            dreamId,
            interpreterType
          };
        }
        throw fetchError;
      }
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', {
          status: response.status,
          statusText: response.statusText,
          errorText,
          url: response.url
        });
        
        try {
          const errorJson = JSON.parse(errorText);
          throw new Error(errorJson.error || errorJson.message || 'Failed to start interpretation');
        } catch (e) {
          if (e instanceof SyntaxError) {
            throw new Error(`API Error: ${response.status} ${response.statusText}`);
          }
          throw e;
        }
      }

      let result;
      try {
        const responseText = await response.text();
        console.log('Raw response:', responseText);
        result = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Failed to parse response:', parseError);
        throw new Error('Invalid response from server');
      }
      
      console.log('Interpretation API response:', {
        success: result.success,
        message: result.message,
        dreamId: result.dreamId,
        interpreterType: result.interpreterType,
        fullResult: result
      });
      
      if (!result.success) {
        throw new Error(result.error || result.message || 'Failed to start interpretation');
      }
      
      return result;
    } catch (error) {
      console.error('Error starting interpretation:', error);
      throw error;
    }
  },


  // Fetch existing interpretations
  async getInterpretations(dreamId: string): Promise<Interpretation[]> {
    try {
      const { data, error } = await supabase
        .from('interpretations')
        .select('*')
        .eq('dream_id', dreamId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      console.log('🔍 Fetched interpretations:', {
        count: data?.length || 0,
        firstInterpretation: data?.[0] ? {
          id: data[0].id,
          dream_id: data[0].dream_id,
          interpreter_type: data[0].interpreter_type,
          hasInterpretation: !!data[0].interpretation,
          created_at: data[0].created_at,
          allFields: Object.keys(data[0])
        } : null
      });
      
      return data || [];
    } catch (error) {
      console.error('Error fetching interpretations:', error);
      throw error;
    }
  },

  // Subscribe to new interpretations
  subscribeToInterpretation(dreamId: string, onInterpretation: (interpretation: Interpretation) => void) {
    console.log(`📡 Setting up real-time subscription for dream: ${dreamId}`);
    
    const subscription = supabase
      .channel(`dream-${dreamId}-interpretations`)
      .on('postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'interpretations',
          filter: `dream_id=eq.${dreamId}`,
        },
        (payload) => {
          console.log('🔔 Real-time event received:', {
            event: payload.eventType,
            table: payload.table,
            dream_id: payload.new?.dream_id,
            interpretation_id: payload.new?.id,
            timestamp: new Date().toISOString()
          });
          onInterpretation(payload.new as Interpretation);
        }
      )
      .subscribe((status) => {
        console.log(`📡 Subscription status for dream ${dreamId}:`, status);
        if (status === 'SUBSCRIBED') {
          console.log('✅ Successfully subscribed to interpretations');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ Failed to subscribe to interpretations');
        } else if (status === 'TIMED_OUT') {
          console.error('⏱️ Subscription timed out');
        }
      });

    return subscription;
  },
};