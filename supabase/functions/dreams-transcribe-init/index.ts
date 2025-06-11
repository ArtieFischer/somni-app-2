import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Get auth header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Parse request
    const { dreamId, audioBase64, duration } = await req.json()

    // For Phase 1: Just update the dream status
    const { data, error } = await supabase
      .from('dreams')
      .update({ 
        transcription_status: 'processing',
        duration: duration
      })
      .eq('id', dreamId)
      .select()
      .single()

    if (error) {
      throw error
    }

    // Mock transcription (Phase 1)
    setTimeout(async () => {
      await supabase
        .from('dreams')
        .update({ 
          raw_transcript: 'This is a test transcription',
          transcription_status: 'completed'
        })
        .eq('id', dreamId)
    }, 3000)

    return new Response(
      JSON.stringify({ success: true, dreamId }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})