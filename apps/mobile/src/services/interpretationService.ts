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
  interpreter_id: string;
  interpretation: string;
  key_symbols: any;
  advice: string;
  mood_analysis: any;
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

      // Add timeout to prevent hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

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
          throw new Error('Request timed out. Please try again.');
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
      return data || [];
    } catch (error) {
      console.error('Error fetching interpretations:', error);
      throw error;
    }
  },

  // Subscribe to new interpretations
  subscribeToInterpretation(dreamId: string, onInterpretation: (interpretation: Interpretation) => void) {
    const subscription = supabase
      .channel(`dream-${dreamId}`)
      .on('postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'interpretations',
          filter: `dream_id=eq.${dreamId}`,
        },
        (payload) => {
          onInterpretation(payload.new as Interpretation);
        }
      )
      .subscribe();

    return subscription;
  },
};