// Updated edge function without duration field
// Copy this to your Supabase dashboard

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
  
  // Add debug endpoint
  if (req.url.includes('/debug')) {
    return new Response(JSON.stringify({
      message: 'Edge function is running',
      version: '2025-01-25-fixed',
      env: {
        hasSupabaseUrl: !!Deno.env.get('SUPABASE_URL'),
        hasServiceKey: !!Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'),
        hasBackendUrl: !!Deno.env.get('SOMNI_BACKEND_URL'),
        hasApiSecret: !!Deno.env.get('SOMNI_BACKEND_API_SECRET')
      }
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
  
  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
    
    console.log('Supabase client initialized with:', {
      url: supabaseUrl,
      hasServiceKey: !!supabaseServiceKey,
      serviceKeyPreview: supabaseServiceKey?.substring(0, 20) + '...'
    });
    
    console.log('Headers:', Object.fromEntries(req.headers.entries()));
    
    // Get auth token from header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('No authorization header found');
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
    
    // Verify user
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
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
    
    // Create a separate service client that bypasses RLS
    const supabaseService = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      },
      db: {
        schema: 'public'
      },
      global: {
        headers: {
          'x-supabase-auth': 'service_role'
        }
      }
    });
    
    // First, let's check if the dream exists at all
    console.log('Checking dream existence:', { dreamId, userId: user.id });
    
    // Check without user_id filter first to see if dream exists at all
    const { data: checkDreamAny, error: checkErrorAny } = await supabaseService
      .from('dreams')
      .select('id, user_id, transcription_status')
      .eq('id', dreamId)
      .single();
    
    console.log('Dream check (no user filter):', { 
      found: !!checkDreamAny, 
      error: checkErrorAny,
      dream: checkDreamAny,
      dreamUserId: checkDreamAny?.user_id,
      currentUserId: user.id,
      userIdMatch: checkDreamAny?.user_id === user.id
    });
    
    // Now check with user_id filter
    const { data: checkDream, error: checkError } = await supabaseService
      .from('dreams')
      .select('id, user_id, transcription_status')
      .eq('id', dreamId)
      .eq('user_id', user.id)
      .single();
    
    console.log('Dream check (with user filter):', { 
      found: !!checkDream, 
      checkError,
      dream: checkDream
    });
    
    // Verify dream ownership and update status (REMOVED duration field)
    const { data: dream, error: dreamError } = await supabaseService
      .from('dreams')
      .update({
        transcription_status: 'processing'
        // Removed: duration: duration
      })
      .eq('id', dreamId)
      .eq('user_id', user.id)
      .select('id, raw_transcript')
      .single();
    
    if (dreamError) {
      console.error('Dream update error:', dreamError);
      
      // Return detailed debug info in development
      return new Response(JSON.stringify({
        error: 'Dream not found or unauthorized',
        debug: {
          dreamId,
          userId: user.id,
          dreamExists: !!checkDreamAny,
          dreamUserId: checkDreamAny?.user_id,
          userIdMatch: checkDreamAny?.user_id === user.id,
          updateError: dreamError.message,
          hasServiceKey: !!supabaseServiceKey
        }
      }), {
        status: 404,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    
    console.log('Dream found and updated:', dream.id);
    
    // REAL BACKEND INTEGRATION:
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
      
      console.log('📤 Calling Somni Backend for transcription:', {
        url: backendUrl,
        dreamId,
        duration,
        language: language || 'auto-detect',
        audioSize: audioBase64.length,
        hasApiSecret: !!Deno.env.get('SOMNI_BACKEND_API_SECRET'),
        hasBackendUrl: !!Deno.env.get('SOMNI_BACKEND_URL')
      });
      
      console.log('📦 Backend request payload:', {
        dreamId: backendPayload.dreamId,
        audioSize: backendPayload.audioBase64.length,
        duration: backendPayload.duration,
        options: backendPayload.options
      });
      
      const backendResponse = await fetch(backendUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Secret': Deno.env.get('SOMNI_BACKEND_API_SECRET'),
          'X-Supabase-Token': authHeader.replace('Bearer ', '')
        },
        body: JSON.stringify(backendPayload)
      });
      
      console.log('📥 Backend response received:', {
        status: backendResponse.status,
        statusText: backendResponse.statusText,
        headers: Object.fromEntries(backendResponse.headers.entries())
      });
      
      if (!backendResponse.ok) {
        const errorText = await backendResponse.text();
        console.error('❌ Backend transcription failed:', {
          status: backendResponse.status,
          statusText: backendResponse.statusText,
          error: errorText,
          dreamId
        });
        
        // Update dream with error status (fixed status value)
        await supabaseService
          .from('dreams')
          .update({
            transcription_status: 'error', // Changed from 'failed'
            transcription_metadata: {
              error: `Backend error: ${backendResponse.status}`,
              failed_at: new Date().toISOString()
            },
            updated_at: new Date().toISOString()
          })
          .eq('id', dreamId)
          .eq('user_id', user.id);
        
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
      
      const transcriptionResult = await backendResponse.json();
      console.log('📥 Backend response data:', {
        success: transcriptionResult.success,
        hasTranscription: !!transcriptionResult.transcription,
        textLength: transcriptionResult.transcription?.text?.length,
        error: transcriptionResult.error
      });
      
      if (!transcriptionResult.success) {
        console.error('❌ Backend returned error:', {
          error: transcriptionResult.error,
          fullResponse: transcriptionResult
        });
        return new Response(JSON.stringify({
          error: transcriptionResult.error
        }), {
          status: 500,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        });
      }
      
      console.log('✅ Transcription completed successfully:', {
        dreamId,
        textLength: transcriptionResult.transcription?.text?.length,
        wordCount: transcriptionResult.transcription?.wordCount,
        language: transcriptionResult.transcription?.languageCode
      });
      
      // Save transcription to database
      console.log('💾 Saving transcription to database...', {
        dreamId,
        userId: user.id,
        transcriptLength: transcriptionResult.transcription.text?.length
      });
      
      const { error: saveError } = await supabaseService
        .from('dreams')
        .update({
          raw_transcript: transcriptionResult.transcription.text,
          transcription_status: 'done', // Changed from 'completed'
          transcription_metadata: {
            characterCount: transcriptionResult.transcription.characterCount,
            wordCount: transcriptionResult.transcription.wordCount,
            language: transcriptionResult.transcription.languageCode || null,
            completed_at: new Date().toISOString(),
            backend_response: transcriptionResult.transcription
          },
          updated_at: new Date().toISOString()
        })
        .eq('id', dreamId)
        .eq('user_id', user.id);
      
      if (saveError) {
        console.error('❌ Failed to save transcription to database:', {
          error: saveError,
          dreamId,
          userId: user.id
        });
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
      
      console.log('✅ Dream updated with transcription:', {
        dreamId,
        status: 'done'
      });
      
      return new Response(JSON.stringify({
        success: true,
        dreamId,
        transcription: transcriptionResult.transcription
      }), {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
      
    } catch (error) {
      console.error('❌ Unexpected transcription error:', {
        error: error.message || error,
        stack: error.stack,
        dreamId,
        type: error.constructor.name
      });
      
      await supabase
        .from('dreams')
        .update({
          transcription_status: 'error', // Changed from 'failed'
          transcription_metadata: {
            error: error.message || 'Unexpected error during transcription',
            errorType: error.constructor.name,
            failed_at: new Date().toISOString()
          },
          updated_at: new Date().toISOString()
        })
        .eq('id', dreamId)
        .eq('user_id', user.id);
      
      return new Response(JSON.stringify({
        error: 'Internal server error during transcription'
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