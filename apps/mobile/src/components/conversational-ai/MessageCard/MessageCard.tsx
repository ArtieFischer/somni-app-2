import React from 'react';
import { View, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { GuideType } from '../../../config/guideConfigs';
import { styles } from './MessageCard.styles';

interface ConversationMessage {
  text: string;
  source: 'user' | 'agent' | 'system';
  timestamp: Date;
}

interface MessageCardProps {
  message: ConversationMessage;
  guideName: string;
  guideType: GuideType;
}

const getMessageIcon = (source: string, guideType: GuideType) => {
  if (source === 'system') return 'information-outline';
  if (source === 'user') return 'account';
  
  // Guide-specific icons
  switch (guideType) {
    case 'jung':
      return 'crystal-ball';
    case 'freud':
      return 'brain';
    case 'lakshmi':
      return 'om';
    case 'mary':
      return 'test-tube';
    default:
      return 'account-star';
  }
};

const getHeaderText = (source: string, guideName: string) => {
  switch (source) {
    case 'user':
      return 'You';
    case 'agent':
      return guideName;
    case 'system':
      return 'System';
    default:
      return '';
  }
};

export const MessageCard: React.FC<MessageCardProps> = ({
  message,
  guideName,
  guideType,
}) => {
  const icon = getMessageIcon(message.source, guideType);
  const header = getHeaderText(message.source, guideName);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <MaterialCommunityIcons
          name={icon as any}
          size={20}
          color="#FFFFFF"
          style={styles.icon}
        />
        <Text style={styles.headerText}>{header}</Text>
      </View>
      <View style={styles.body}>
        <Text style={styles.messageText}>{message.text}</Text>
      </View>
    </View>
  );
};