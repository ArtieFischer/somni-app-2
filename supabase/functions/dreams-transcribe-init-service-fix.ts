// Fixed edge function with proper service role usage
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
    // Initialize Supabase client with service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    // IMPORTANT: Don't use the user's auth token with service role client
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      }
    });
    
    // Get user's auth token for verification only
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({
        error: 'No authorization header'
      }), {
        status: 401,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    
    // Create a separate client for user verification
    const supabaseAnon = createClient(supabaseUrl, supabaseServiceKey);
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAnon.auth.getUser(token);
    
    if (authError || !user) {
      console.error('Auth error:', authError);
      return new Response(JSON.stringify({
        error: 'Unauthorized'
      }), {
        status: 401,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    
    console.log('Authenticated user:', user.id);
    
    // Parse request body
    const body = await req.json();
    const { dreamId, audioBase64, duration, language } = body;
    
    console.log('Request data:', {
      dreamId,
      audioSize: audioBase64?.length || 0,
      duration,
      language
    });
    
    // Validate required fields
    if (!dreamId || !audioBase64) {
      return new Response(JSON.stringify({
        error: 'Missing required fields'
      }), {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    
    // Use admin client to check and update dream
    console.log('Checking dream with admin client...');
    
    const { data: dream, error: dreamError } = await supabaseAdmin
      .from('dreams')
      .select('*')
      .eq('id', dreamId)
      .single();
    
    console.log('Dream check result:', {
      found: !!dream,
      error: dreamError,
      dreamUserId: dream?.user_id,
      currentUserId: user.id
    });
    
    if (!dream) {
      return new Response(JSON.stringify({
        error: 'Dream not found',
        dreamId
      }), {
        status: 404,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    
    // Verify ownership
    if (dream.user_id !== user.id) {
      return new Response(JSON.stringify({
        error: 'Unauthorized - not your dream'
      }), {
        status: 403,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    
    // Update dream status using admin client
    const { data: updated, error: updateError } = await supabaseAdmin
      .from('dreams')
      .update({
        transcription_status: 'processing'
      })
      .eq('id', dreamId)
      .select()
      .single();
    
    if (updateError) {
      console.error('Update error:', updateError);
      return new Response(JSON.stringify({
        error: 'Failed to update dream',
        details: updateError
      }), {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    
    console.log('Dream updated successfully:', updated);
    
    // Call backend for transcription
    try {
      const backendUrl = `${Deno.env.get('SOMNI_BACKEND_URL')}/api/v1/transcription/transcribe`;
      const backendPayload = {
        dreamId,
        audioBase64,
        duration,
        options: {
          languageCode: language || null,
          tagAudioEvents: true,
          diarize: false
        }
      };
      
      console.log('📤 Calling backend:', {
        url: backendUrl,
        dreamId,
        language: language || 'auto-detect'
      });
      
      const backendResponse = await fetch(backendUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Secret': Deno.env.get('SOMNI_BACKEND_API_SECRET')!,
          'X-Supabase-Token': authHeader.replace('Bearer ', '')
        },
        body: JSON.stringify(backendPayload)
      });
      
      if (!backendResponse.ok) {
        const errorText = await backendResponse.text();
        console.error('Backend error:', errorText);
        
        // Update dream with error status
        await supabaseAdmin
          .from('dreams')
          .update({
            transcription_status: 'error',
            transcription_metadata: {
              error: `Backend error: ${backendResponse.status}`,
              failed_at: new Date().toISOString()
            }
          })
          .eq('id', dreamId);
        
        return new Response(JSON.stringify({
          error: 'Transcription service unavailable'
        }), {
          status: 500,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        });
      }
      
      const result = await backendResponse.json();
      
      if (!result.success) {
        return new Response(JSON.stringify({
          error: result.error || 'Transcription failed'
        }), {
          status: 500,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        });
      }
      
      // Save transcription
      const { error: saveError } = await supabaseAdmin
        .from('dreams')
        .update({
          raw_transcript: result.transcription.text,
          transcription_status: 'done',
          transcription_metadata: {
            characterCount: result.transcription.characterCount,
            wordCount: result.transcription.wordCount,
            language: result.transcription.languageCode || null,
            completed_at: new Date().toISOString()
          }
        })
        .eq('id', dreamId);
      
      if (saveError) {
        console.error('Save error:', saveError);
        return new Response(JSON.stringify({
          error: 'Failed to save transcription'
        }), {
          status: 500,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        });
      }
      
      return new Response(JSON.stringify({
        success: true,
        dreamId,
        transcription: result.transcription
      }), {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
      
    } catch (error) {
      console.error('Transcription error:', error);
      
      await supabaseAdmin
        .from('dreams')
        .update({
          transcription_status: 'error',
          transcription_metadata: {
            error: error.message || 'Unexpected error',
            failed_at: new Date().toISOString()
          }
        })
        .eq('id', dreamId);
      
      return new Response(JSON.stringify({
        error: 'Internal server error'
      }), {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    
  } catch (error) {
    console.error('Function error:', error);
    return new Response(JSON.stringify({
      error: error.message || 'Internal server error'
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      status: 500
    });
  }
});