import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface TranscribeRequest {
  dreamId: string;
  audioBase64: string;
  duration: number;
}

serve(async (req) => {
  console.log('Function called:', req.method, req.url);
  
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    console.log('Headers:', Object.fromEntries(req.headers.entries()));

    // Get auth token from header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      console.error('No authorization header found');
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { 
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Verify user
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      console.error('Auth error:', authError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log('Authenticated user:', user.id);

    // Parse request body
    const body = await req.json();
    const { dreamId, audioBase64, duration }: TranscribeRequest = body;
    
    console.log('Request data:', { 
      dreamId, 
      audioSize: audioBase64?.length || 0,
      duration 
    });

    // Validate required fields
    if (!dreamId || !audioBase64 || !duration) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Verify dream ownership and update status
    const { data: dream, error: dreamError } = await supabase
      .from('dreams')
      .update({ 
        transcription_status: 'processing',
        duration: duration
      })
      .eq('id', dreamId)
      .eq('user_id', user.id)
      .select('id, raw_transcript')
      .single()

    if (dreamError) {
      console.error('Dream update error:', dreamError);
      return new Response(
        JSON.stringify({ error: 'Dream not found or unauthorized' }),
        { 
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log('Dream found and updated:', dream.id);

    // For Phase 1: Mock the transcription process
    console.log('Starting mock transcription...');
    
    // Simulate async processing - in real implementation this will call ElevenLabs
    setTimeout(async () => {
      const mockTranscript = "This is a mock transcription of your dream. In the real implementation, this will be replaced with actual speech-to-text results from ElevenLabs. The audio was successfully received and processed."
      
      console.log('Updating dream with mock transcript...');
      
      const { error: updateError } = await supabase
        .from('dreams')
        .update({ 
          raw_transcript: mockTranscript,
          transcription_status: 'completed',
          transcription_metadata: {
            mock: true,
            processed_at: new Date().toISOString(),
            duration: duration
          }
        })
        .eq('id', dreamId)
      
      if (updateError) {
        console.error('Failed to update dream with transcript:', updateError);
      } else {
        console.log('Dream updated successfully with mock transcript');
      }
    }, 3000) // 3 second delay to simulate processing

    return new Response(
      JSON.stringify({ 
        success: true,
        dreamId: dreamId,
        status: 'processing',
        message: 'Transcription started (mock mode)'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Function error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error' 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})