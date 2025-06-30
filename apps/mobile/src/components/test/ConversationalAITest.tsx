import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { conversationService, transformDynamicVariables } from '../../services/conversationService';
import { Message } from '../../types/websocket.types';
import { supabase } from '../../lib/supabase';
import ElevenLabsExpoDom from '../conversational-ai/ElevenLabsExpoDom';

export const ConversationalAITest: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [token, setToken] = useState<string>('');
  const [selectedInterpreter, setSelectedInterpreter] = useState<
    'jung' | 'freud' | 'mary' | 'lakshmi'
  >('lakshmi');
  const [dreamId, setDreamId] = useState<string>(
    'f51f4f18-45c2-452d-a6a0-2a6018cf78a5',
  );
  
  // Add a reset button for testing
  const resetConnection = () => {
    // First hide the component to ensure cleanup
    setShowElevenLabsComponent(false);
    
    // Then reset all state
    setIsConnected(false);
    setIsConnecting(false);
    setSessionStarted(false);
    setElevenLabsSignedUrl('');
    setElevenLabsAuthToken('');
    setConversationId('');
    setElevenLabsSessionId('');
    setDynamicVariables(null);
    setMessages([]);
  };
  const [elevenLabsSignedUrl, setElevenLabsSignedUrl] = useState<string>('');
  const [elevenLabsAuthToken, setElevenLabsAuthToken] = useState<string>('');
  const [conversationId, setConversationId] = useState<string>('');
  const [elevenLabsSessionId, setElevenLabsSessionId] = useState<string>('');
  const [dynamicVariables, setDynamicVariables] = useState<any>(null);
  const [showElevenLabsComponent, setShowElevenLabsComponent] = useState<boolean>(false);
  const [sessionStarted, setSessionStarted] = useState<boolean>(false);
  
  // Add debug effect to track dynamic variables
  useEffect(() => {
    console.log('🔍 Dynamic variables state updated:', {
      hasDynamicVariables: !!dynamicVariables,
      keys: dynamicVariables ? Object.keys(dynamicVariables) : 'null',
      userName: dynamicVariables?.user_name || dynamicVariables?.userName || 'not found'
    });
  }, [dynamicVariables]);

  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    getAuthToken();
  }, []);


  const getAuthToken = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.access_token) {
        setToken(session.access_token);
        console.log('👤 User ID:', session.user.id);
      } else {
        Alert.alert(
          'Auth Error',
          'No authentication token found. Please log in.',
        );
      }
    } catch (error) {
      console.error('Error getting auth token:', error);
      Alert.alert('Error', 'Failed to get authentication token');
    }
  };




  const addMessage = (message: Message) => {
    console.log('📝 Adding message to state:', {
      id: message.id,
      text: message.text?.substring(0, 50) + '...' || 'no text',
      sender: message.sender,
      timestamp: message.timestamp.toLocaleTimeString()
    });
    
    setMessages((prev) => {
      const newMessages = [...prev, message];
      console.log('📋 Total messages now:', newMessages.length);
      return newMessages;
    });

    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };



  // Connect for ElevenLabs implementation
  const connectElevenLabs = async () => {
    if (!token) {
      Alert.alert('Error', 'No authentication token available');
      return;
    }

    setIsConnecting(true);

    try {
      // First, let's check if the dream exists
      console.log('🔍 Checking dream ID:', dreamId);
      console.log('🎭 Selected interpreter:', selectedInterpreter);
      console.log('🔑 Auth token available:', !!token);
      
      // For testing, you might want to use a known working dream ID
      // or create a new dream first
      console.log('💡 TIP: Make sure this dream exists in your database');
      console.log('💡 You can also try creating a new dream first');
      
      const response = await conversationService.initElevenLabsConversation({
        dreamId: dreamId.trim(), // Remove any trailing spaces
        interpreterId: selectedInterpreter,
      });
      
      console.log('📦 Backend response:', JSON.stringify(response, null, 2));
      console.log('🔍 Response data keys:', response.data ? Object.keys(response.data) : 'No data');
      
      if (response.success && response.data) {
        const { 
          conversationId,
          elevenLabsSessionId,
          signedUrl, 
          authToken, 
          dynamicVariables,
          dynamicVariablesCamelCase,
          previousMessages = [],
          messageCount 
        } = response.data;
        
        // Log if elevenLabsSessionId is missing
        if (!elevenLabsSessionId) {
          console.error('⚠️ Backend did not return elevenLabsSessionId!');
          console.error('🔍 Available fields:', Object.keys(response.data));
        }
        
        console.log('✅ New conversation session:', {
          conversationId,
          elevenLabsSessionId,
          hasDynamicVariables: !!dynamicVariables,
          previousMessagesCount: previousMessages.length,
          totalMessageCount: messageCount
        });
        
        // Extra validation for elevenLabsSessionId
        if (elevenLabsSessionId) {
          console.log('✅ elevenLabsSessionId successfully extracted:', elevenLabsSessionId);
        } else {
          console.error('❌ elevenLabsSessionId is undefined after extraction!');
          console.error('🔍 Full response.data:', response.data);
        }
        
        // Set all the state values
        setConversationId(conversationId);
        setElevenLabsSessionId(elevenLabsSessionId);
        
        // Use dynamicVariablesCamelCase if dynamicVariables is not provided
        const variablesToTransform = dynamicVariables || dynamicVariablesCamelCase;
        
        console.log('🔍 Variables check:', {
          hasDynamicVariables: !!dynamicVariables,
          hasDynamicVariablesCamelCase: !!dynamicVariablesCamelCase,
          usingWhich: dynamicVariables ? 'dynamicVariables' : 'dynamicVariablesCamelCase'
        });
        
        // Transform dynamic variables to ensure all are in snake_case format
        const transformedVariables = transformDynamicVariables(variablesToTransform);
        console.log('🔄 Setting transformed variables');
        setDynamicVariables(transformedVariables);
        
        // Handle signed URL format
        if (authToken && authToken.startsWith('wss://')) {
          console.log('🎯 Using authToken as signed URL');
          setElevenLabsSignedUrl(authToken);
          setElevenLabsAuthToken('');
        } else {
          console.log('🎯 Using separate URL and token');
          setElevenLabsSignedUrl(signedUrl);
          setElevenLabsAuthToken(authToken);
        }
        
        // Show previous conversation context if exists
        if (messageCount > 0) {
          addMessage({
            id: Date.now().toString(),
            text: `Continuing conversation about this dream (${messageCount} previous messages)`,
            sender: 'system',
            timestamp: new Date(),
          });
          
          // Optionally show last few messages for context
          previousMessages.slice(-3).forEach((msg, index) => {
            setTimeout(() => {
              addMessage({
                id: `prev-${msg.id}`,
                text: `[Previous] ${msg.content}`,
                sender: msg.role as 'user' | 'assistant',
                timestamp: new Date(msg.created_at),
              });
            }, index * 100); // Stagger for visual effect
          });
        }
        
        // Connection successful - update UI
        setIsConnecting(false);
        setIsConnected(true);
        setShowElevenLabsComponent(true);
        // Don't reset sessionStarted here - let ElevenLabsExpoDom manage its own state
        
        console.log('✅ Ready for new conversation with fresh session');
      } else {
        // Handle error response
        const errorMsg = response.data?.error || 'Failed to initialize ElevenLabs conversation';
        console.error('❌ Backend error:', errorMsg);
        Alert.alert('Error', errorMsg);
        setIsConnecting(false);
      }
    } catch (error) {
      console.error('❌ Connection error details:', error);
      console.error('❌ Error type:', error?.constructor?.name);
      console.error('❌ Error stack:', error?.stack);
      
      // Parse error message for more details
      let errorMessage = 'Unknown error';
      if (error instanceof Error) {
        console.error('❌ Error message:', error.message);
        
        // Check for timeout
        if (error.name === 'AbortError') {
          errorMessage = 'Request timed out. Backend might be slow or unreachable.';
        } else {
          // Try to extract the actual error from the backend response
          const match = error.message.match(/"error":"([^"]+)"/);
          if (match && match[1]) {
            errorMessage = match[1];
          } else {
            errorMessage = error.message;
          }
        }
      }
      
      Alert.alert('Connection Failed', errorMessage);
      setIsConnecting(false);
    }
  };

  // ElevenLabs handlers
  const handleElevenLabsMessage = (message: any) => {
    console.log('💬 handleElevenLabsMessage called:', {
      hasText: !!message?.text,
      text: message?.text?.substring(0, 50),
      source: message?.source,
      type: message?.type,
      fullMessage: message
    });
    
    // Don't add messages here to avoid duplicates
    // Messages are handled by handleElevenLabsTranscript
  };
  
  const handleElevenLabsTranscript = async (transcript: { text: string; source: 'user' | 'agent'; isFinal: boolean }) => {
    console.log('📝 Transcript received:', {
      text: (transcript.text?.substring(0, 50) || 'no text') + '...',
      source: transcript.source,
      isFinal: transcript.isFinal,
      length: transcript.text?.length || 0
    });
    
    // Only add final transcripts as actual messages to avoid duplication
    if (transcript.isFinal && transcript.text && transcript.text.trim().length > 0) {
      console.log('✅ Adding final transcript to messages');
      const message = {
        id: Date.now().toString(),
        text: transcript.text,
        sender: transcript.source === 'user' ? 'user' : 'agent',
        timestamp: new Date(),
      };
      
      addMessage(message);
      
      // Save message to backend with session tracking
      if (conversationId && elevenLabsSessionId) {
        console.log('💾 Saving message to backend:', {
          conversationId: conversationId.slice(0, 8) + '...',
          elevenLabsSessionId: elevenLabsSessionId.slice(0, 8) + '...',
          role: transcript.source === 'user' ? 'user' : 'assistant',
          contentLength: transcript.text.length,
          content: transcript.text.substring(0, 100) + '...'
        });
        
        try {
          const result = await conversationService.saveMessage({
            conversationId,
            elevenLabsSessionId,
            content: transcript.text,
            role: transcript.source === 'user' ? 'user' : 'assistant',
            metadata: {
              timestamp: new Date().toISOString(),
              source: 'elevenlabs'
            }
          });
          
          if (!result.success) {
            console.error('❌ Failed to save message to backend');
            Alert.alert('Error', 'Failed to save message to database');
          } else {
            console.log('✅ Message saved successfully with ID:', result.messageId);
          }
        } catch (error) {
          console.error('❌ Error saving message:', error);
          Alert.alert('Error', 'Failed to save message: ' + error.message);
        }
      } else {
        console.warn('⚠️ Cannot save message - missing IDs:', {
          hasConversationId: !!conversationId,
          hasElevenLabsSessionId: !!elevenLabsSessionId,
          conversationId: conversationId || 'undefined',
          elevenLabsSessionId: elevenLabsSessionId || 'undefined'
        });
      }
    }
  };

  const handleElevenLabsConnect = () => {
    setIsConnected(true);
    setIsConnecting(false);
    setSessionStarted(true); // Mark session as started
  };

  const handleElevenLabsDisconnect = () => {
    setIsConnected(false);
    setIsConnecting(false);
  };

  const handleElevenLabsError = (error: any) => {
    Alert.alert('ElevenLabs Error', error.message || 'An error occurred');
    setIsConnected(false);
    setIsConnecting(false);
  };
  
  const handleElevenLabsConversationEnd = () => {
    console.log('🔔 Conversation ended');
    // Here you would sync with backend to save conversation state
    setIsConnected(false);
    setElevenLabsSignedUrl('');
    setElevenLabsAuthToken('');
    // Keep conversationId but clear the session
    setElevenLabsSessionId('');
    // Don't reset dynamic variables - they should persist until reset button is clicked
    // setDynamicVariables(null);
    setShowElevenLabsComponent(false);
    setSessionStarted(false);
  };

  // SECURITY: Agent IDs should NOT be exposed in frontend
  // This is only for testing visualization - actual agent ID will come from backend
  const getAgentId = (_interpreter: string): string => {
    // For testing only - shows which interpreter is selected
    // Real agent ID is handled securely by backend
    // TODO: Replace with your actual ElevenLabs agent ID for testing
    return 'agent_01jyz4635nfa598s7gsra7n4zv';
    // return `${interpreter}-agent`;
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Conversational AI Test</Text>

        <TouchableOpacity
          style={styles.resetButton}
          onPress={resetConnection}
        >
          <Text style={styles.resetButtonText}>Reset</Text>
        </TouchableOpacity>

        <Text style={styles.status}>
          Status:{' '}
          {isConnecting
            ? 'Connecting...'
            : isConnected
              ? 'Connected'
              : 'Disconnected'}
        </Text>

        <Text style={styles.configNote}>
          🚀 ElevenLabs Conversational AI
        </Text>
        <Text style={styles.configNote}>
          🔒 Requires HTTPS for microphone (use --tunnel or physical device)
        </Text>
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
      >
        {console.log('🎬 Rendering messages:', messages.length, messages.map(m => ({ id: m.id, sender: m.sender, text: m.text?.substring(0, 30) || 'no text' })))}
        {messages.map((message) => (
          <View
            key={message.id}
            style={[
              styles.messageBubble,
              message.sender === 'user'
                ? styles.userMessage
                : message.sender === 'agent'
                  ? styles.agentMessage
                  : styles.systemMessage,
            ]}
          >
            <View style={styles.messageHeader}>
              <Text style={styles.messageSender}>
                {message.sender === 'user' ? '🎙️ You' : message.sender === 'agent' ? '🤖 Agent' : 'System'}
              </Text>
              <Text style={styles.messageTime}>
                {message.timestamp.toLocaleTimeString()}
              </Text>
            </View>
            <Text style={[
              styles.messageText,
              { color: message.sender === 'user' ? '#fff' : '#000' }
            ]}>
              {message.text}
            </Text>
          </View>
        ))}
      </ScrollView>
      
      {showElevenLabsComponent && (
        <View style={{ flex: 0, height: 280, marginTop: 10 }}>
          <ElevenLabsExpoDom
            dom={{ style: { flex: 1 } }}
            signedUrl={elevenLabsSignedUrl}
            authToken={elevenLabsAuthToken}
            conversationId={conversationId}
            elevenLabsSessionId={elevenLabsSessionId}
            dynamicVariables={dynamicVariables}
            agentId={!elevenLabsSignedUrl ? getAgentId(selectedInterpreter) : undefined}
            onMessage={handleElevenLabsMessage}
            onTranscript={handleElevenLabsTranscript}
            onConnect={handleElevenLabsConnect}
            onDisconnect={handleElevenLabsDisconnect}
            onError={handleElevenLabsError}
            onConversationEnd={handleElevenLabsConversationEnd}
          />
        </View>
      )}


      <View style={[styles.controls, { paddingTop: 10, paddingBottom: 10 }]}>
        {!showElevenLabsComponent ? (
          <>
            <View style={styles.configSection}>
              <Text style={styles.label}>Interpreter:</Text>
              <View style={styles.interpreterButtons}>
                {(['jung', 'freud', 'mary', 'lakshmi'] as const).map((interp) => (
                  <TouchableOpacity
                    key={interp}
                    style={[
                      styles.interpreterButton,
                      selectedInterpreter === interp &&
                        styles.interpreterButtonActive,
                    ]}
                    onPress={() => setSelectedInterpreter(interp)}
                  >
                    <Text
                      style={[
                        styles.interpreterButtonText,
                        selectedInterpreter === interp &&
                          styles.interpreterButtonTextActive,
                      ]}
                    >
                      {interp.charAt(0).toUpperCase() + interp.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>Dream ID (UUID):</Text>
              <TextInput
                style={styles.dreamIdInput}
                value={dreamId}
                onChangeText={setDreamId}
                placeholder="Enter dream UUID or use default"
              />
            </View>

            <TouchableOpacity
              style={[styles.button, isConnecting && styles.buttonDisabled]}
              onPress={connectElevenLabs}
              disabled={isConnecting || !token}
            >
              <Text style={styles.buttonText}>
                {isConnecting ? 'Starting Conversation...' : '🎤 Start Voice Conversation'}
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity
            style={styles.disconnectButton}
            onPress={() => {
              handleElevenLabsConversationEnd();
            }}
          >
            <Text style={styles.buttonText}>End Conversation</Text>
          </TouchableOpacity>
        )}
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  resetButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: '#FF9500',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  resetButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  status: {
    fontSize: 14,
    color: '#666',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 8,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#007AFF',
  },
  agentMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#E5E5EA',
  },
  systemMessage: {
    alignSelf: 'center',
    backgroundColor: '#F0F0F0',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  messageSender: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  messageTime: {
    fontSize: 11,
    color: '#999',
  },
  controls: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  disconnectButton: {
    backgroundColor: '#FF3B30',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  configSection: {
    marginBottom: 10,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  interpreterButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  interpreterButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    alignItems: 'center',
  },
  interpreterButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  interpreterButtonText: {
    fontSize: 14,
    color: '#666',
  },
  interpreterButtonTextActive: {
    color: '#fff',
  },
  dreamIdInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
  },
  configNote: {
    fontSize: 11,
    color: '#FF9500',
    fontStyle: 'italic',
    marginTop: 4,
  },
});
