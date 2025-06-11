// supabase/functions/dreams-transcribe-init/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface TranscribeRequest {
  dreamId: string;
  audioBase64: string;
  duration: number; // in seconds
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get auth token from header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
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
      console.error('Auth error:', authError)
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Parse request body
    const { dreamId, audioBase64, duration }: TranscribeRequest = await req.json()

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

    if (dreamError || !dream) {
      console.error('Dream error:', dreamError)
      return new Response(
        JSON.stringify({ error: 'Dream not found or unauthorized' }),
        { 
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // For Phase 1: Mock the transcription process
    console.log(`Mock transcription for dream ${dreamId}, audio size: ${audioBase64.length}`)
    
    // Simulate async processing - in real implementation this will call ElevenLabs
    setTimeout(async () => {
      const mockTranscript = "This is a mock transcription. In the real implementation, this will be replaced with actual speech-to-text results from ElevenLabs."
      
      await supabase
        .from('dreams')
        .update({ 
          raw_transcript: mockTranscript,
          transcription_status: 'completed',
          transcription_metadata: {
            mock: true,
            processed_at: new Date().toISOString()
          }
        })
        .eq('id', dreamId)
    }, 2000) // 2 second delay to simulate processing

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
    console.error('Function error:', error)
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