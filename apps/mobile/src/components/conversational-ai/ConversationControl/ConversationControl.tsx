import React from 'react';
import { View, Pressable, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { styles } from './ConversationControl.styles';

interface ConversationControlProps {
  isLoading: boolean;
  isConnected: boolean;
  onEndConversation: () => void;
}

export const ConversationControl: React.FC<ConversationControlProps> = ({
  isLoading,
  isConnected,
  onEndConversation,
}) => {
  return (
    <View style={styles.container}>
      <Pressable
        onPress={onEndConversation}
        disabled={isLoading}
        style={[
          styles.button,
          isLoading && styles.buttonLoading,
          isConnected && styles.buttonConnected,
        ]}
      >
        {isLoading ? (
          <ActivityIndicator size="large" color="#FFFFFF" />
        ) : (
          <MaterialCommunityIcons
            name={isConnected ? 'stop-circle' : 'microphone-off'}
            size={32}
            color="#FFFFFF"
          />
        )}
      </Pressable>
    </View>
  );
};