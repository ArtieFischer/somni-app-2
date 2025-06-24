// Simplified version for testing service role access
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

serve(async (req) => {
  console.log('Function called:', req.method, req.url);
  
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: corsHeaders
    });
  }
  
  try {
    // Get request data
    const body = await req.json();
    const { dreamId, audioBase64, duration, language } = body;
    
    // Initialize Supabase with service role - BYPASS ALL AUTH
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    console.log('Environment check:', {
      hasUrl: !!supabaseUrl,
      hasServiceKey: !!supabaseServiceKey,
      serviceKeyLength: supabaseServiceKey?.length,
      serviceKeyPreview: supabaseServiceKey?.substring(0, 20) + '...'
    });
    
    // Create service client with explicit auth bypass
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false
      },
      global: {
        headers: {
          Authorization: `Bearer ${supabaseServiceKey}`
        }
      }
    });
    
    // First, let's check if we can read ANY dreams at all
    console.log('Testing service role access...');
    const { data: anyDreams, error: anyError } = await supabase
      .from('dreams')
      .select('id')
      .limit(1);
    
    console.log('Service role test:', {
      canReadDreams: !anyError,
      error: anyError,
      found: anyDreams?.length || 0
    });
    
    if (anyError) {
      return new Response(JSON.stringify({
        error: 'Service role cannot access dreams table',
        details: {
          error: anyError,
          hasServiceKey: !!supabaseServiceKey,
          serviceKeyLength: supabaseServiceKey?.length
        }
      }), {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    
    // Now check the specific dream
    console.log('Checking dream:', dreamId);
    const { data: dream, error: dreamError } = await supabase
      .from('dreams')
      .select('*')
      .eq('id', dreamId)
      .single();
    
    console.log('Dream check:', {
      found: !!dream,
      error: dreamError,
      dreamData: dream
    });
    
    if (!dream) {
      return new Response(JSON.stringify({
        error: 'Dream not found',
        dreamId,
        checkError: dreamError
      }), {
        status: 404,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    
    // Try to update the dream
    console.log('Updating dream status...');
    const { data: updated, error: updateError } = await supabase
      .from('dreams')
      .update({
        transcription_status: 'processing'
      })
      .eq('id', dreamId)
      .select()
      .single();
    
    console.log('Update result:', {
      success: !updateError,
      error: updateError,
      updated: updated
    });
    
    if (updateError) {
      return new Response(JSON.stringify({
        error: 'Failed to update dream',
        updateError,
        dreamId
      }), {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    
    // If we got here, everything works!
    return new Response(JSON.stringify({
      success: true,
      message: 'Service role access works!',
      dreamId,
      dreamUserId: dream.user_id,
      updatedStatus: updated.transcription_status
    }), {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
    
  } catch (error) {
    console.error('Function error:', error);
    return new Response(JSON.stringify({
      error: error.message || 'Internal server error',
      type: error.constructor.name
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      status: 500
    });
  }
});