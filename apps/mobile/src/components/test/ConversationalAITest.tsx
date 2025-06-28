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
import { ConversationalAIService } from '../../services/conversationalAIService';
import { conversationService } from '../../services/conversationService';
import { Message } from '../../types/websocket.types';
import { supabase } from '../../lib/supabase';

export const ConversationalAITest: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [mode, setMode] = useState<'voice' | 'text'>('text'); // Default to text mode
  const [token, setToken] = useState<string>('');
  const [selectedInterpreter, setSelectedInterpreter] = useState<'jung' | 'freud' | 'mary' | 'lakshmi'>('lakshmi');
  const [dreamId, setDreamId] = useState<string>('f51f4f18-45c2-452d-a6a0-2a6018cf78a5');
  const [isRecording, setIsRecording] = useState(false);
  
  const serviceRef = useRef<ConversationalAIService | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    getAuthToken();
    
    return () => {
      if (serviceRef.current) {
        serviceRef.current.disconnect();
      }
    };
  }, []);

  const getAuthToken = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        setToken(session.access_token);
        console.log('👤 User ID:', session.user.id);
      } else {
        Alert.alert('Auth Error', 'No authentication token found. Please log in.');
      }
    } catch (error) {
      console.error('Error getting auth token:', error);
      Alert.alert('Error', 'Failed to get authentication token');
    }
  };

  const connectToWebSocket = async () => {
    if (!token) {
      Alert.alert('Error', 'No authentication token available');
      return;
    }

    console.log('🚀 Starting connection process...');
    setIsConnecting(true);
    
    try {
      // Step 1: Create conversation via HTTP API
      console.log('📞 Creating conversation via API...');
      
      const conversationData = await conversationService.startConversation({
        dreamId: dreamId,
        interpreterId: selectedInterpreter,
      });

      console.log('✅ Conversation created:', conversationData);

      // Step 2: Connect to WebSocket with the conversation ID
      const { data: { session } } = await supabase.auth.getSession();
      
      const service = new ConversationalAIService({
        token: conversationData.token || token,
        dreamId: dreamId,
        conversationId: conversationData.conversationId,
        mode: 'text',
        interpreterId: selectedInterpreter,
        userId: session?.user?.id,
        websocketUrl: conversationData.websocketUrl || process.env.EXPO_PUBLIC_SOMNI_BACKEND_URL,
      });
      
      serviceRef.current = service;

      service.on('connection_state_changed', (state: any) => {
        setIsConnected(state.isConnected);
        setIsConnecting(state.isConnecting);
        if (state.error) {
          Alert.alert('Connection Error', state.error);
        }
      });

      // Handle conversation_started event
      service.on('conversation_started', (data: any) => {
        console.log('Conversation started:', data);
        // Keep text mode for testing
        // if (data.mode) {
        //   setMode(data.mode);
        // }
        if (data.message) {
          // Replace {{symbol}} placeholder if it exists
          const message = data.message.replace('{{symbol}}', 'this symbol');
          addMessage({
            id: Date.now().toString(),
            text: message,
            sender: 'agent',
            timestamp: new Date(),
          });
        }
      });

      service.onConversationInitialized((data: any) => {
        console.log('Conversation initialized with ID:', data.conversationId);
        
        let connectionMessage = 'Connected! You can now start chatting.';
        if (data.isResumed) {
          connectionMessage = `Resumed conversation with ${data.messageCount || 0} previous messages. You can continue chatting.`;
          console.log(`📖 Conversation resumed: ${data.messageCount} previous messages`);
        }
        
        addMessage({
          id: Date.now().toString(),
          text: connectionMessage,
          sender: 'system',
          timestamp: new Date(),
        });
      });

      service.onAgentResponse((data: any) => {
        addMessage({
          id: Date.now().toString(),
          text: data.text,
          sender: 'agent',
          timestamp: new Date(),
        });
      });

      service.onUserTranscript((data: any) => {
        console.log('User transcript:', data);
        if (data.isFinal) {
          addMessage({
            id: Date.now().toString(),
            text: data.text,
            sender: 'user',
            timestamp: new Date(),
          });
        }
      });

      service.onAudioChunk((data: any) => {
        console.log('Audio chunk received:', data.chunk.byteLength, 'bytes');
        // Audio playback will be handled by the service
      });

      service.onError((error: any) => {
        console.error('Conversation error:', error);
        
        // Handle specific error codes
        switch (error.code) {
          case 'CONVERSATION_NOT_FOUND':
            Alert.alert('Error', 'Conversation not found. Please reconnect.');
            disconnect();
            break;
          case 'ELEVENLABS_ERROR':
            Alert.alert('Voice Error', 'Voice service unavailable. Switching to text mode.');
            setMode('text');
            serviceRef.current?.setMode('text');
            break;
          case 'UNAUTHORIZED':
            Alert.alert('Auth Error', 'Session expired. Please log in again.');
            disconnect();
            break;
          default:
            Alert.alert('Error', error.message || 'An unexpected error occurred');
        }
      });

      service.onConversationEnded((data: any) => {
        Alert.alert('Conversation Ended', `Duration: ${data.duration}s`);
        setIsConnected(false);
      });

      service.onInactivityTimeout((data: any) => {
        console.log('⏱️ Inactivity timeout received:', data);
        
        // Disconnect the service
        setIsConnected(false);
        
        addMessage({
          id: Date.now().toString(),
          text: `Connection timed out due to inactivity. Please connect again.`,
          sender: 'system',
          timestamp: new Date(),
        });
        
        Alert.alert(
          'Connection Timeout',
          'Your session has timed out due to inactivity.',
          [{ 
            text: 'OK',
            onPress: () => {
              // Ensure we're fully disconnected
              if (serviceRef.current) {
                serviceRef.current.disconnect();
              }
            }
          }]
        );
      });

      service.onElevenLabsConversationInitiated((data: any) => {
        console.log('🎙️ ElevenLabs ready:', data);
        addMessage({
          id: Date.now().toString(),
          text: `Voice conversation ready (${data.audioFormat})`,
          sender: 'system',
          timestamp: new Date(),
        });
      });

      service.onElevenLabsDisconnected((data: any) => {
        console.log('🔌 ElevenLabs disconnected:', data);
        // The inactivity_timeout handler will take care of disconnecting
        // This is just for logging since elevenlabs_disconnected triggers inactivity_timeout
      });

      await service.initialize();
      
    } catch (error) {
      console.error('Connection error:', error);
      Alert.alert('Connection Failed', error instanceof Error ? error.message : 'Unknown error');
      setIsConnecting(false);
    }
  };

  const disconnect = () => {
    if (serviceRef.current) {
      serviceRef.current.endConversation();
      serviceRef.current.disconnect();
      serviceRef.current = null;
      setIsConnected(false);
    }
  };

  const sendMessage = () => {
    console.log('📤 sendMessage called:', {
      inputText,
      hasService: !!serviceRef.current,
      isConnected,
      mode
    });
    
    if (!inputText.trim()) {
      console.log('❌ No input text');
      return;
    }
    
    if (!serviceRef.current) {
      console.log('❌ No service reference');
      return;
    }
    
    if (!isConnected) {
      console.log('❌ Not connected');
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date(),
    };

    addMessage(userMessage);
    console.log('📨 Sending text to service:', inputText);
    serviceRef.current.sendTextInput(inputText);
    setInputText('');
  };

  const addMessage = (message: Message) => {
    setMessages(prev => [...prev, message]);
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const startRecording = async () => {
    if (!serviceRef.current || !isConnected || mode !== 'voice') return;

    const success = await serviceRef.current.startAudioRecording();
    if (success) {
      setIsRecording(true);
    } else {
      Alert.alert('Recording Error', 'Failed to start audio recording');
    }
  };

  const stopRecording = async () => {
    if (!serviceRef.current) return;

    await serviceRef.current.stopAudioRecording();
    setIsRecording(false);
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Conversational AI Test</Text>
        <Text style={styles.status}>
          Status: {isConnecting ? 'Connecting...' : isConnected ? 'Connected' : 'Disconnected'}
        </Text>
        <View style={styles.modeContainer}>
          <Text style={styles.mode}>Mode: {mode}</Text>
          {isConnected && (
            <TouchableOpacity
              style={styles.modeButton}
              onPress={() => {
                const newMode = mode === 'text' ? 'voice' : 'text';
                setMode(newMode);
                serviceRef.current?.setMode(newMode);
              }}
            >
              <Text style={styles.modeButtonText}>
                Switch to {mode === 'text' ? 'Voice' : 'Text'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView 
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
      >
        {messages.map((message) => (
          <View
            key={message.id}
            style={[
              styles.messageBubble,
              message.sender === 'user' ? styles.userMessage :
              message.sender === 'agent' ? styles.agentMessage :
              styles.systemMessage,
            ]}
          >
            <Text style={styles.messageText}>{message.text}</Text>
            <Text style={styles.messageTime}>
              {message.timestamp.toLocaleTimeString()}
            </Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.controls}>
        {!isConnected ? (
          <>
            <View style={styles.configSection}>
              <Text style={styles.label}>Interpreter:</Text>
              <View style={styles.interpreterButtons}>
                {(['jung', 'freud', 'mary', 'lakshmi'] as const).map((interp) => (
                  <TouchableOpacity
                    key={interp}
                    style={[
                      styles.interpreterButton,
                      selectedInterpreter === interp && styles.interpreterButtonActive,
                    ]}
                    onPress={() => setSelectedInterpreter(interp)}
                  >
                    <Text
                      style={[
                        styles.interpreterButtonText,
                        selectedInterpreter === interp && styles.interpreterButtonTextActive,
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
              onPress={connectToWebSocket}
              disabled={isConnecting || !token}
            >
              <Text style={styles.buttonText}>
                {isConnecting ? 'Connecting...' : 'Connect'}
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            {mode === 'text' ? (
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  value={inputText}
                  onChangeText={setInputText}
                  placeholder="Type a message..."
                  onSubmitEditing={sendMessage}
                  returnKeyType="send"
                />
                <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
                  <Text style={styles.buttonText}>Send</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.voiceControlsContainer}>
                <TouchableOpacity
                  style={[styles.recordButton, isRecording && styles.recordingButton]}
                  onPressIn={startRecording}
                  onPressOut={stopRecording}
                >
                  <Text style={styles.recordButtonText}>
                    {isRecording ? '🔴 Recording...' : '🎤 Hold to Record'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
            <TouchableOpacity style={styles.disconnectButton} onPress={disconnect}>
              <Text style={styles.buttonText}>Disconnect</Text>
            </TouchableOpacity>
          </>
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
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  status: {
    fontSize: 14,
    color: '#666',
  },
  mode: {
    fontSize: 14,
    color: '#666',
  },
  modeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  modeButton: {
    marginLeft: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: '#007AFF',
    borderRadius: 12,
  },
  modeButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
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
  messageText: {
    fontSize: 16,
    color: '#000',
  },
  messageTime: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  controls: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
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
  sendButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    justifyContent: 'center',
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
    marginBottom: 16,
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
    marginBottom: 16,
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
  voiceControlsContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  recordButton: {
    width: 200,
    height: 60,
    backgroundColor: '#007AFF',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  recordingButton: {
    backgroundColor: '#FF3B30',
  },
  recordButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});