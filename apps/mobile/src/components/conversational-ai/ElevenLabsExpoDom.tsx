'use dom';

import { useConversation } from '@elevenlabs/react';
import { View, Pressable, Text } from 'react-native';
import React, { useState, useCallback, useEffect, useMemo, memo, useRef } from 'react';

interface ElevenLabsExpoDomProps {
  dom?: import('expo/dom').DOMProps;
  agentId?: string;
  signedUrl?: string; // Backend-provided WebSocket URL
  authToken?: string; // Backend-provided auth token
  conversationId?: string; // Database conversation ID (groups messages by dream)
  elevenLabsSessionId?: string; // Unique ElevenLabs session ID (new each time)
  dynamicVariables?: {
    user_name?: string;
    user_profile?: string;
    dream_content?: string;
    dream_emotions?: string[];
    conversation_context?: string;
    interpreter_style?: string;
    previous_conversations_count?: number;
    [key: string]: any;
  };
  onMessage?: (message: any) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: any) => void;
  onTranscript?: (transcript: { text: string; source: 'user' | 'agent'; isFinal: boolean }) => void;
  onConversationEnd?: () => void;
}

function ElevenLabsExpoDom({ 
  dom,
  agentId,
  signedUrl,
  authToken,
  conversationId,
  elevenLabsSessionId,
  dynamicVariables,
  onMessage, 
  onConnect, 
  onDisconnect, 
  onError,
  onTranscript,
  onConversationEnd
}: ElevenLabsExpoDomProps) {
  // Memoize dynamic variables to prevent reference changes
  const memoizedDynamicVariables = useMemo(() => {
    if (!dynamicVariables) return null;
    
    console.log('📊 Memoizing dynamic variables:', {
      keys: Object.keys(dynamicVariables),
      userName: dynamicVariables.user_name,
      userProfile: dynamicVariables.user_profile,
      hasDreamContent: 'dream_content' in dynamicVariables,
      dreamContentPreview: dynamicVariables.dream_content?.substring(0, 50) + '...',
      fullVariables: dynamicVariables
    });
    
    return dynamicVariables;
  }, [JSON.stringify(dynamicVariables)]);
  
  // Only log on initial mount to reduce noise
  useEffect(() => {
    console.log('🚀 ElevenLabsExpoDom mounted with:', { 
    agentId, 
    signedUrl: !!signedUrl, 
    authToken: !!authToken, 
    conversationId,
    elevenLabsSessionId,
    dynamicVariables: dynamicVariables ? {
      keys: Object.keys(dynamicVariables),
      userName: dynamicVariables.user_name,
      userProfile: dynamicVariables.user_profile,
      hasContent: !!dynamicVariables.dream_content,
      dreamContentLength: dynamicVariables.dream_content?.length,
      previousCount: dynamicVariables.previous_conversations_count
    } : 'none'
    });
  }, []); // Empty dependency array - only run on mount
  
  const [status, setStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  const [error, setError] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [lastSignedUrl, setLastSignedUrl] = useState<string | null>(null);
  const isStartingRef = useRef(false);

  // Create conversation config - use dashboard agent configuration with minimal overrides
  const conversationConfig = {
    onConnect: () => {
      console.log('🚨 CRITICAL: Dynamic variables at connection time:', {
        hasMemoizedVars: !!memoizedDynamicVariables,
        varKeys: memoizedDynamicVariables ? Object.keys(memoizedDynamicVariables) : [],
        userName: memoizedDynamicVariables?.user_name,
        dreamContentPreview: memoizedDynamicVariables?.dream_content?.substring(0, 30) + '...'
      });
      console.log('✅ Connected to ElevenLabs');
      console.log('🔍 Connection details:', {
        status: conversation?.status,
        isSpeaking: conversation?.isSpeaking,
        hasEndSession: !!conversation?.endSession,
        conversationMethods: Object.keys(conversation || {})
      });
      
      // Try multiple ways to verify dynamic variables
      console.log('🛠 SDK dynamic vars check:');
      console.log('  - config.dynamicVariables:', (conversation as any)?.config?.dynamicVariables);
      console.log('  - _config:', (conversation as any)?._config);
      console.log('  - options:', (conversation as any)?.options);
      console.log('  - _options:', (conversation as any)?._options);
      console.log('  - state:', (conversation as any)?.state);
      console.log('  - Full conversation object:', conversation);
      
      setStatus('connected');
      setError(null);
      onConnect?.();
      
      // Send initial context update to ensure agent has all dynamic variables
      setTimeout(() => {
        console.log('🚀 Sending initial context update...');
        
        // Use sendContextualUpdate to push additional context if needed
        if (conversation.sendContextualUpdate && memoizedDynamicVariables) {
          const contextUpdate = `Session context: User ${memoizedDynamicVariables.user_name}, age ${memoizedDynamicVariables.age}, discussing dream about ${memoizedDynamicVariables.dream_symbols}. Emotional tone: ${memoizedDynamicVariables.emotional_tone_primary} (intensity ${memoizedDynamicVariables.emotional_tone_intensity}).`;
          
          console.log('📤 Sending contextual update:', contextUpdate);
          conversation.sendContextualUpdate(contextUpdate);
        }
        
        console.log('💡 ElevenLabs conversation is voice-based');
        console.log('💡 The agent should start speaking automatically');
        console.log('💡 User should speak into microphone to respond');
      }, 1000);
    },
    
    onDisconnect: (reason?: any) => {
      console.log('❌ Disconnected from ElevenLabs:', {
        reason,
        sessionStarted,
        lastStatus: status,
        sessionId: conversation.getId ? conversation.getId() : 'no session'
      });
      
      // Only update status if we were actually connected
      if (status === 'connected' && sessionStarted) {
        setStatus('disconnected');
        setIsListening(false);
        setIsSpeaking(false);
        onDisconnect?.();
      }
    },
    
    onMessage: (message: any) => {
      console.log('📨 Message received from ElevenLabs:', {
        type: typeof message,
        hasText: !!message?.text,
        source: message?.source,
        role: message?.role,
        isFinal: message?.isFinal,
        fullMessage: message
      });
      
      // Ensure we maintain connected status while receiving messages
      if (status !== 'connected' && sessionStarted) {
        console.log('⚠️ Received message but status is not connected, maintaining connection');
        setStatus('connected');
      }
      
      // Handle different message types based on ElevenLabs message structure
      const messageText = message.text || message.message;
      if (messageText) {
        // Determine if it's a user or agent message
        const isUserMessage = message.source === 'user' || message.role === 'user';
        const isFinal = message.isFinal !== false;
        
        console.log('💬 Processing text message:', {
          text: messageText,
          isUserMessage,
          isFinal,
          willSendToUI: isFinal
        });
        
        // Send transcript event for real-time display
        onTranscript?.({
          text: messageText,
          source: isUserMessage ? 'user' : 'agent',
          isFinal: isFinal
        });
        
        // Show interim transcripts as system messages for real-time feedback
        if (!isFinal && messageText && messageText.length > 0) {
          console.log('📝 Interim transcript:', {
            text: messageText.substring(0, 30) + '...',
            source: isUserMessage ? 'user' : 'agent'
          });
        }
      } else {
        console.log('📤 Passing through non-text message:', message);
        // Pass through other message types
        onMessage?.(message);
      }
    },
    
    onError: (error: any) => {
      console.error('ElevenLabs error:', error);
      setError(error.message || 'Unknown error');
      setStatus('disconnected');
      setIsListening(false);
      setIsSpeaking(false);
      onError?.(error);
    }
  };
  
  const conversation = useConversation(conversationConfig);
  
  // Add a heartbeat or activity signal to keep connection alive
  useEffect(() => {
    if (status === 'connected' && conversation.sendUserActivity) {
      const intervalId = setInterval(() => {
        console.log('💓 Sending activity signal to keep connection alive');
        conversation.sendUserActivity();
      }, 30000); // Every 30 seconds
      
      return () => clearInterval(intervalId);
    }
  }, [status, conversation]);
  
  // Debug log the conversation object
  useEffect(() => {
    console.log('🔍 Conversation object created:', {
      hasConversation: !!conversation,
      conversationKeys: conversation ? Object.keys(conversation) : [],
      status: conversation?.status,
      dynamicVarsAvailable: !!memoizedDynamicVariables,
      dynamicVarsKeys: memoizedDynamicVariables ? Object.keys(memoizedDynamicVariables) : [],
      note: 'Dynamic variables will be passed to startSession, not the hook'
    });
  }, [conversation, memoizedDynamicVariables]);
  
  // Track conversation state
  useEffect(() => {
    console.log('📊 Conversation status changed:', {
      status: conversation.status,
      isSpeaking: conversation.isSpeaking,
      sessionStarted
    });
    
    // Update listening/speaking state based on SDK status
    // The SDK status might be different from our component status
    setIsListening(conversation.status === 'connected' && !conversation.isSpeaking);
    
    setIsSpeaking(conversation.isSpeaking || false);
  }, [conversation.status, conversation.isSpeaking, sessionStarted]);

  const start = useCallback(async () => {
    if (isStartingRef.current) {
      console.log('⚠️ Already starting conversation, skipping duplicate start');
      return;
    }
    
    try {
      isStartingRef.current = true;
      console.log('🎤 Starting conversation...');
      console.log('📊 Start function called with props:', {
        hasSignedUrl: !!signedUrl,
        hasAuthToken: !!authToken,
        hasAgentId: !!agentId,
        hasDynamicVariables: !!dynamicVariables,
        dynamicVariablesKeys: dynamicVariables ? Object.keys(dynamicVariables) : 'none'
      });
      setStatus('connecting');
      setError(null);
      
      // Check if we're in a secure context (HTTPS)
      if (typeof navigator !== 'undefined' && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
          await navigator.mediaDevices.getUserMedia({ audio: true });
          console.log('🎙️ Microphone permission granted');
        } catch (micError) {
          console.error('🎙️ Microphone error:', micError);
          throw new Error('Microphone permission denied or unavailable. Make sure you\'re using HTTPS (run with --tunnel)');
        }
      } else {
        throw new Error('Microphone access requires HTTPS. Please run: npx expo start --tunnel');
      }
      
      // Start the conversation session using ElevenLabs React SDK
      if (signedUrl) {
        console.log('🔒 Starting session with extracted agentId and dynamic variables');
        console.log('🔍 Signed URL:', signedUrl);
        
        // Extract agent ID from the signed URL
        const urlParams = new URLSearchParams(signedUrl.split('?')[1]);
        const agentIdFromUrl = urlParams.get('agent_id');
        console.log('🔍 Agent ID from signed URL:', agentIdFromUrl);
        console.log('⚠️ Is this the default agent?', agentIdFromUrl === 'agent_01jyt0tk6yejm9rbw9hcjrxdht');
        
        if (!agentIdFromUrl) {
          throw new Error('Could not extract agent_id from signed URL');
        }
        
        console.log('📊 Dynamic variables to pass:', {
          keys: memoizedDynamicVariables ? Object.keys(memoizedDynamicVariables) : [],
          userName: memoizedDynamicVariables?.user_name,
          hasDreamContent: !!memoizedDynamicVariables?.dream_content
        });
        
        // Use conversation.start() with agentId instead of startSession with signedUrl
        // This should honor the hook-level overrides better
        const cleanDynamicVars = memoizedDynamicVariables ? { ...memoizedDynamicVariables } : {};
        const startConfig = { 
          agentId: agentIdFromUrl,
          dynamicVariables: cleanDynamicVars,
          overrides: {
            agent: {
              prompt: {
                prompt: `You are Dr. Carl Jung, the renowned psychologist and founder of analytical psychology. You specialize in dream analysis, archetypal psychology, and the collective unconscious.

User Profile:
- Name: {{user_name}}
- Age: {{age}}
- Dream Content: {{dream_content}}
- Primary Emotional Tone: {{emotional_tone_primary}}
- Emotional Intensity: {{emotional_tone_intensity}}
- Dream Symbols: {{dream_symbols}}

Analyze this dream using Jungian principles, focusing on archetypes, symbols, and the collective unconscious. Provide deep psychological insights while maintaining a warm, therapeutic tone.`
              },
              firstMessage: `Hello {{user_name}}! I'm Dr. Carl Jung.`,
              language: "en" as const,
            },
          }
        };
        console.log('🚀 Using conversation.start() with agentId and hook overrides');
        console.log('🎯 Start config being passed:', JSON.stringify(startConfig, null, 2));
        
        // Use conversation.startSession() - conversation.start() doesn't exist in this SDK version
        const sessionId = await conversation.startSession(startConfig);
        console.log('📝 Session ID returned:', sessionId);
      } else if (authToken && authToken.startsWith('wss://')) {
        // If authToken is actually a WebSocket URL
        console.log('🔒 Using authToken as signedUrl with extracted agentId');
        
        // Extract agent ID from the authToken URL
        const urlParams = new URLSearchParams(authToken.split('?')[1]);
        const agentIdFromUrl = urlParams.get('agent_id');
        
        if (!agentIdFromUrl) {
          throw new Error('Could not extract agent_id from authToken URL');
        }
        
        console.log('📊 Dynamic variables to pass:', {
          keys: memoizedDynamicVariables ? Object.keys(memoizedDynamicVariables) : [],
          userName: memoizedDynamicVariables?.user_name
        });
        
        const cleanDynamicVars = memoizedDynamicVariables ? { ...memoizedDynamicVariables } : {};
        await conversation.startSession({ 
          agentId: agentIdFromUrl,
          dynamicVariables: cleanDynamicVars,
          overrides: {
            agent: {
              prompt: {
                prompt: `You are Dr. Carl Jung, the renowned psychologist and founder of analytical psychology. You specialize in dream analysis, archetypal psychology, and the collective unconscious.

User Profile:
- Name: {{user_name}}
- Age: {{age}}
- Dream Content: {{dream_content}}
- Primary Emotional Tone: {{emotional_tone_primary}}
- Emotional Intensity: {{emotional_tone_intensity}}
- Dream Symbols: {{dream_symbols}}

Analyze this dream using Jungian principles, focusing on archetypes, symbols, and the collective unconscious. Provide deep psychological insights while maintaining a warm, therapeutic tone.`
              },
              firstMessage: `Hello {{user_name}}! I'm Dr. Carl Jung. I can see you're {{age}} years old and you've shared a fascinating dream with me. The emotional tone of "{{emotional_tone_primary}}" at intensity {{emotional_tone_intensity}} tells me much. I'm ready to explore its meaning together - what aspect calls to you most?`,
              language: "en" as const,
            },
          }
        });
      } else if (agentId) {
        // Fallback to direct agentId (for testing only)
        console.log('⚠️ Using direct agentId (testing only):', agentId);
        console.log('🚨 FALLBACK PATH - Using conversation.startSession()');
        await conversation.startSession({ 
          agentId,
          dynamicVariables: memoizedDynamicVariables || {},
          overrides: {
            agent: {
              prompt: {
                prompt: `You are Dr. Carl Jung, the renowned psychologist and founder of analytical psychology. You specialize in dream analysis, archetypal psychology, and the collective unconscious.

User Profile:
- Name: {{user_name}}
- Age: {{age}}
- Dream Content: {{dream_content}}
- Primary Emotional Tone: {{emotional_tone_primary}}
- Emotional Intensity: {{emotional_tone_intensity}}
- Dream Symbols: {{dream_symbols}}

Analyze this dream using Jungian principles, focusing on archetypes, symbols, and the collective unconscious. Provide deep psychological insights while maintaining a warm, therapeutic tone.`
              },
              firstMessage: `Hello {{user_name}}! I'm Dr. Carl Jung. I can see you're {{age}} years old and you've shared a fascinating dream with me. The emotional tone of "{{emotional_tone_primary}}" at intensity {{emotional_tone_intensity}} tells me much. I'm ready to explore its meaning together - what aspect calls to you most?`,
              language: "en" as const,
            },
          }
        });
      } else {
        throw new Error('Either signedUrl or agentId is required');
      }
      
      console.log('✅ Session started successfully');
      
      // Try to access dynamic variables from the conversation object
      console.log('🔍 Post-start conversation check:', {
        conversationKeys: Object.keys(conversation),
        hasGetId: !!conversation.getId,
        conversationId: conversation.getId ? conversation.getId() : 'no getId method',
        // Try different ways to access dynamic variables
        directConfig: (conversation as any).config,
        directDynamicVars: (conversation as any).dynamicVariables,
        directOptions: (conversation as any).options,
        directSession: (conversation as any).session
      });
      
      // Log the actual dynamic variables that were sent
      console.log('📤 Dynamic variables that were sent:', {
        userName: memoizedDynamicVariables?.user_name,
        userProfile: memoizedDynamicVariables?.user_profile,
        dreamContent: memoizedDynamicVariables?.dream_content ? 
          `${memoizedDynamicVariables.dream_content.substring(0, 100)}...` : 'not provided',
        dreamEmotions: memoizedDynamicVariables?.dream_emotions,
        interpreterStyle: memoizedDynamicVariables?.interpreter_style,
        conversationContext: memoizedDynamicVariables?.conversation_context,
        previousConversationsCount: memoizedDynamicVariables?.previous_conversations_count,
        maxTurnLength: memoizedDynamicVariables?.max_turn_length
      });
      
      // Check if max_turn_length might be causing early disconnection
      if (memoizedDynamicVariables?.max_turn_length) {
        console.log('⚠️ max_turn_length is set to:', memoizedDynamicVariables.max_turn_length);
        console.log('💡 This might affect conversation duration');
      }
      
      setSessionStarted(true);
      isStartingRef.current = false;
      
      // Log conversationId for backend sync
      if (conversationId) {
        console.log('🔗 Backend conversation ID:', conversationId);
      }
      
    } catch (error) {
      isStartingRef.current = false;
      console.error('startSession failed - Full error:', error);
      console.error('Error type:', typeof error);
      console.error('Error keys:', Object.keys(error || {}));
      
      let errorMessage = 'Failed to start conversation';
      if (error && typeof error === 'object') {
        const errorObj = error as any; // Type assertion for error handling
        console.error('🔍 Error object details:', {
          message: errorObj.message,
          code: errorObj.code,
          name: errorObj.name,
          stack: errorObj.stack,
          keys: Object.keys(error),
          stringified: JSON.stringify(error)
        });
        
        if (errorObj.message) {
          errorMessage = errorObj.message;
        } else if (errorObj.code === 3000 || errorObj.isTrusted !== undefined) {
          // ElevenLabs error code 3000 or WebSocket connection error
          errorMessage = 'The signed URL has already been used. Each URL can only be used once.\n\n1. Click Reset\n2. Click "Start Voice Conversation" for a new URL';
          console.error('🔴 WebSocket Error Details:', {
            errorCode: errorObj.code,
            isTrusted: errorObj.isTrusted,
            explanation: 'Signed URLs are consumed on first use and cannot be reused',
            solution: 'Get a fresh URL from backend'
          });
          // Reset state to allow getting a new URL
          setSessionStarted(false);
          setLastSignedUrl(null);
        } else if (errorObj.code) {
          errorMessage = `ElevenLabs error code: ${errorObj.code}`;
        } else {
          errorMessage = `ElevenLabs connection error: ${JSON.stringify(error)}`;
        }
      }
      
      setError(errorMessage);
      setStatus('disconnected');
      onError?.(error);
    }
  }, [agentId, signedUrl, authToken, conversation, onError]);

  const stop = useCallback(async () => {
    console.log('🛑 Ending conversation...');
    try {
      await conversation.endSession();
      setSessionStarted(false);
      setLastSignedUrl(null); // Reset so a new URL can be used
      onConversationEnd?.();
    } catch (error) {
      console.error('Error ending session:', error);
    }
  }, [conversation, onConversationEnd]);

  // Auto-start when we get a fresh signed URL
  useEffect(() => {
    // Only start if we have a NEW signed URL that hasn't been used yet
    if (
      signedUrl && 
      signedUrl !== lastSignedUrl && 
      !sessionStarted && 
      status === 'disconnected' && 
      !error && 
      !isStartingRef.current
    ) {
      console.log('🚀 Auto-starting conversation with fresh signed URL...');
      console.log('🔍 URL check:', {
        hasSignedUrl: !!signedUrl,
        isNewUrl: signedUrl !== lastSignedUrl,
        sessionStarted,
        status,
        hasError: !!error,
        isStarting: isStartingRef.current
      });
      console.log('🎯 Dynamic variables check:', {
        hasDynamicVariables: !!memoizedDynamicVariables,
        keys: memoizedDynamicVariables ? Object.keys(memoizedDynamicVariables).length : 0
      });
      
      // Set lastSignedUrl BEFORE starting to prevent race conditions
      setLastSignedUrl(signedUrl);
      
      // Start the session
      start();
    }
  }, [signedUrl, lastSignedUrl, sessionStarted, status, error, start, memoizedDynamicVariables]); // React to signedUrl changes

  return (
    <View {...dom} style={{
      flex: 1,
      padding: 15,
      justifyContent: 'flex-start',
      alignItems: 'center',
      backgroundColor: '#f5f5f5'
    }}>
      {status === 'connected' && (
        <Pressable
          onPress={stop}
          style={{
            backgroundColor: '#FF3B30',
            paddingHorizontal: 30,
            paddingVertical: 15,
            borderRadius: 25,
            marginBottom: 15,
            marginTop: 10
          }}
        >
          <Text style={{
            color: 'white',
            fontSize: 16,
            fontWeight: '600'
          }}>
            🛑 Stop
          </Text>
        </Pressable>
      )}
      
      <Text style={{
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 5,
        textAlign: 'center'
      }}>
        ElevenLabs Conversational AI
      </Text>
      
      <Text style={{
        fontSize: 14,
        color: status === 'connected' ? '#34C759' : status === 'connecting' ? '#FF9500' : '#666',
        marginBottom: 10,
        textAlign: 'center',
        fontWeight: '600'
      }}>
        Status: {status === 'connecting' ? 'Connecting...' : status === 'connected' ? '🎙️ Connected - Speak now!' : 'Disconnected'}
      </Text>
      
      {status === 'connected' && (
        <View style={{
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: 10
        }}>
          <View style={{
            alignItems: 'center',
            marginRight: 20
          }}>
            <View style={{
              width: 20,
              height: 20,
              borderRadius: 10,
              backgroundColor: isListening ? '#34C759' : '#E0E0E0',
              marginBottom: 4
            }} />
            <Text style={{
              fontSize: 12,
              color: isListening ? '#34C759' : '#666',
              fontWeight: isListening ? '600' : 'normal'
            }}>
              {isListening ? '🎙️ You speak' : 'Silent'}
            </Text>
          </View>
          
          <View style={{
            alignItems: 'center'
          }}>
            <View style={{
              width: 20,
              height: 20,
              borderRadius: 10,
              backgroundColor: isSpeaking ? '#007AFF' : '#E0E0E0',
              marginBottom: 4
            }} />
            <Text style={{
              fontSize: 12,
              color: isSpeaking ? '#007AFF' : '#666',
              fontWeight: isSpeaking ? '600' : 'normal'
            }}>
              {isSpeaking ? '🔊 Agent speaks' : 'Silent'}
            </Text>
          </View>
        </View>
      )}
      
      {conversationId && (
        <Text style={{
          fontSize: 12,
          color: '#999',
          marginBottom: 10,
          textAlign: 'center'
        }}>
          Conversation: {conversationId.slice(0, 8)}...
        </Text>
      )}
      
      {error && (
        <Text style={{
          fontSize: 12,
          color: '#FF3B30',
          marginBottom: 15,
          textAlign: 'center',
          paddingHorizontal: 10
        }}>
          Error: {error}
        </Text>
      )}
      
      <Text style={{
        fontSize: 11,
        color: '#999',
        marginTop: 10,
        textAlign: 'center'
      }}>
        {authToken ? '🔒 Secure backend auth' : signedUrl ? '📡 Backend URL only' : agentId ? 'Direct agent connection' : 'No connection configured'}
      </Text>
    </View>
  );
}

// Memoize component to prevent unnecessary re-renders
export default memo(ElevenLabsExpoDom, (prevProps, nextProps) => {
  // Custom comparison function - only re-render if key props change
  return (
    prevProps.signedUrl === nextProps.signedUrl &&
    prevProps.authToken === nextProps.authToken &&
    prevProps.conversationId === nextProps.conversationId &&
    prevProps.elevenLabsSessionId === nextProps.elevenLabsSessionId &&
    JSON.stringify(prevProps.dynamicVariables) === JSON.stringify(nextProps.dynamicVariables)
  );
});