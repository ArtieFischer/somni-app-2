import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  ImageBackground,
  Pressable,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  StatusBar,
  Text,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { MainStackScreenProps } from '@somni/types';
import { useAuthStore } from '@somni/stores';
import { useDreamStore } from '@somni/stores';
import { supabase } from '../../../lib/supabase';
import { conversationService, transformDynamicVariables } from '../../../services/conversationService';
import { GuideAvatar } from '../../../components/conversational-ai/GuideAvatar';
import { MessageCard } from '../../../components/conversational-ai/MessageCard';
import { ConversationControl } from '../../../components/conversational-ai/ConversationControl';
import ElevenLabsExpoDom from '../../../components/conversational-ai/ElevenLabsExpoDom';
import { getGuideConfig, GuideType } from '../../../config/guideConfigs';
import { darkTheme } from '@somni/theme';
import { styles } from './ConversationalAIScreen.styles';

type NavigationProps = MainStackScreenProps<'ConversationalAI'>['navigation'];
type RouteProps = MainStackScreenProps<'ConversationalAI'>['route'];

interface ConversationMessage {
  text: string;
  source: 'user' | 'agent' | 'system';
  timestamp: Date;
}

export const ConversationalAIScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProps>();
  const route = useRoute<RouteProps>();
  const { dreamId, interpreterId, interpretationId } = route.params;

  const { profile } = useAuthStore();
  const dreamStore = useDreamStore();
  const dream = dreamStore.getDreamById(dreamId);

  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [currentMessage, setCurrentMessage] = useState<ConversationMessage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isAgentSpeaking, setIsAgentSpeaking] = useState(false);
  const [isMessageCardVisible, setIsMessageCardVisible] = useState(true);

  // ElevenLabs state
  const [elevenLabsSignedUrl, setElevenLabsSignedUrl] = useState<string>('');
  const [conversationId, setConversationId] = useState<string>('');
  const [elevenLabsSessionId, setElevenLabsSessionId] = useState<string>('');
  const [dynamicVariables, setDynamicVariables] = useState<any>(null);

  const guideConfig = getGuideConfig(interpreterId);

  // Background image mapping
  const backgroundImages: Record<GuideType, any> = {
    jung: require('../../../../../../assets/jung-room.png'),
    freud: require('../../../../../../assets/freud-room.png'),
    mary: require('../../../../../../assets/mary-room.png'),
    lakshmi: require('../../../../../../assets/lakshmi-room.png'),
  };

  // Auto-start conversation on mount
  useEffect(() => {
    initializeConversation();
  }, []);

  const initializeConversation = async () => {
    if (!dream || !profile?.user_id) {
      setError('Missing required information');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Show initial system message
      setCurrentMessage({
        text: `Connecting to ${guideConfig.name}...`,
        source: 'system',
        timestamp: new Date(),
      });

      const response = await conversationService.initElevenLabsConversation({
        dreamId: dreamId,
        interpreterId: interpreterId,
      });

      if (response.success && response.data) {
        const { 
          conversationId: convId,
          elevenLabsSessionId: sessionId,
          signedUrl,
          authToken,
          dynamicVariables: vars,
          dynamicVariablesCamelCase,
        } = response.data;

        setConversationId(convId);
        setElevenLabsSessionId(sessionId);
        
        // Transform and set dynamic variables
        const variablesToTransform = vars || dynamicVariablesCamelCase;
        const transformedVars = transformDynamicVariables(variablesToTransform);
        setDynamicVariables(transformedVars);

        // Handle signed URL format
        if (authToken && authToken.startsWith('wss://')) {
          setElevenLabsSignedUrl(authToken);
        } else {
          setElevenLabsSignedUrl(signedUrl);
        }

        setIsLoading(false);
      } else {
        throw new Error(response.data?.error || 'Failed to initialize conversation');
      }
    } catch (error) {
      console.error('Failed to initialize conversation:', error);
      setError('Failed to connect. Please try again.');
      setIsLoading(false);
      setCurrentMessage({
        text: 'Failed to connect. Please try again.',
        source: 'system',
        timestamp: new Date(),
      });
    }
  };

  const handleElevenLabsConnect = () => {
    setIsConnected(true);
    setError(null);
    setCurrentMessage({
      text: `Connected to ${guideConfig.name}. Start speaking when ready.`,
      source: 'system',
      timestamp: new Date(),
    });
  };

  const handleElevenLabsDisconnect = () => {
    setIsConnected(false);
    if (!error) {
      setCurrentMessage({
        text: 'Conversation ended.',
        source: 'system',
        timestamp: new Date(),
      });
    }
  };

  const handleElevenLabsError = (error: any) => {
    console.error('ElevenLabs error:', error);
    setError(error.message || 'Connection error');
    setIsConnected(false);
    setCurrentMessage({
      text: error.message || 'Connection error occurred.',
      source: 'system',
      timestamp: new Date(),
    });
  };

  const handleElevenLabsTranscript = (transcript: { text: string; source: 'user' | 'agent'; isFinal: boolean }) => {
    if (transcript.isFinal && transcript.text && transcript.text.trim().length > 0) {
      setCurrentMessage({
        text: transcript.text,
        source: transcript.source,
        timestamp: new Date(),
      });

      // Update speaking state
      setIsAgentSpeaking(transcript.source === 'agent');
    }
  };

  const handleEndConversation = () => {
    navigation.goBack();
  };

  return (
    <ImageBackground 
      source={backgroundImages[interpreterId]} 
      style={styles.container}
      resizeMode="cover"
    >
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          {/* Close button */}
          <Pressable
            onPress={handleEndConversation}
            style={styles.closeButton}
          >
            <Text style={styles.closeButtonText}>✕</Text>
          </Pressable>

          {/* Message display area */}
          <View style={styles.messageArea}>
            {currentMessage && (isMessageCardVisible || currentMessage.source === 'system') && (
              <MessageCard
                message={currentMessage}
                guideName={guideConfig.name}
                guideType={interpreterId}
              />
            )}
          </View>

          {/* Toggle message card button */}
          <Pressable
            onPress={() => setIsMessageCardVisible(!isMessageCardVisible)}
            style={styles.toggleButton}
          >
            <MaterialCommunityIcons
              name={isMessageCardVisible ? 'eye-off' : 'eye'}
              size={24}
              color="#FFFFFF"
            />
          </Pressable>

          {/* Guide avatar with breathing animation */}
          <View style={styles.avatarContainer}>
            <GuideAvatar
              guideType={interpreterId}
              guideName={guideConfig.name}
              isActive={isAgentSpeaking}
              isConnected={isConnected}
            />
          </View>

          {/* Hidden ElevenLabs component */}
          {elevenLabsSignedUrl && !isLoading && (
            <View style={{ position: 'absolute', opacity: 0, height: 0 }}>
              <ElevenLabsExpoDom
                guideType={interpreterId}
                signedUrl={elevenLabsSignedUrl}
                conversationId={conversationId}
                elevenLabsSessionId={elevenLabsSessionId}
                dynamicVariables={dynamicVariables}
                onConnect={handleElevenLabsConnect}
                onDisconnect={handleElevenLabsDisconnect}
                onError={handleElevenLabsError}
                onTranscript={handleElevenLabsTranscript}
              />
            </View>
          )}

          {/* Bottom control */}
          <View style={styles.controlArea}>
            <ConversationControl
              isLoading={isLoading}
              isConnected={isConnected}
              onEndConversation={handleEndConversation}
            />
          </View>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
};