import React from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Pressable,
  Badge,
  BadgeText,
  Spinner,
} from '../../ui';
import { Dream } from '@somni/types';
import { useTranslation } from '../../../hooks/useTranslation';
import { darkTheme } from '@somni/theme';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Alert } from 'react-native';

interface DreamCardProps {
  dream: Dream;
  onPress?: (dream: Dream) => void;
  onAnalyzePress?: (dream: Dream) => void;
  onDeletePress?: (dream: Dream) => void;
  onRetryPress?: (dream: Dream) => void;
}

export const DreamCard: React.FC<DreamCardProps> = ({
  dream,
  onPress,
  onAnalyzePress,
  onDeletePress,
  onRetryPress,
}) => {
  const { t } = useTranslation('dreams');

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return t('time.today');
    } else if (date.toDateString() === yesterday.toDateString()) {
      return t('time.yesterday');
    } else {
      return date.toLocaleDateString();
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Removed unused getStatusColor function

  return (
    <Pressable
      onPress={() => onPress?.(dream)}
      bg={darkTheme.colors.background.elevated}
      borderRadius={12}
      p="$4"
      mx="$4"
      shadowColor="#000000"
      shadowOffset={{ width: 0, height: 2 }}
      shadowOpacity={0.1}
      shadowRadius={4}
      elevation={3}
    >
      <VStack space="md">
        {/* Header */}
        <HStack justifyContent="space-between" alignItems="flex-start">
          <VStack space="xs">
            <Text
              size="md"
              fontWeight="$semibold"
              color={darkTheme.colors.text.primary}
            >
              {String(formatDate(dream.recordedAt))}
            </Text>
            <Text size="sm" color={darkTheme.colors.text.primary} opacity={0.7}>
              {formatTime(dream.recordedAt)}
            </Text>
          </VStack>
          <HStack space="md" alignItems="center">
            <HStack space="xs" alignItems="center">
              <Ionicons
                name="mic"
                size={16}
                color={darkTheme.colors.text.secondary}
              />
              <Text
                size="sm"
                color={darkTheme.colors.text.primary}
                opacity={0.7}
              >
                {formatDuration(dream.duration)}
              </Text>
            </HStack>
            <Pressable
              onPress={() => {
                Alert.alert(
                  String(t('journal.deleteConfirmation.title')),
                  String(t('journal.deleteConfirmation.message')),
                  [
                    { text: String(t('actions.cancel')), style: 'cancel' },
                    {
                      text: String(t('actions.delete')),
                      style: 'destructive',
                      onPress: () => onDeletePress?.(dream),
                    },
                  ],
                );
              }}
              p="$1"
            >
              <Ionicons
                name="trash-outline"
                size={20}
                color={darkTheme.colors.status.error}
              />
            </Pressable>
          </HStack>
        </HStack>


        {/* Content */}
        <Text
          size="md"
          numberOfLines={3}
          ellipsizeMode="tail"
          lineHeight="$md"
          color={
            dream.rawTranscript &&
            dream.rawTranscript !== 'Waiting for transcription...'
              ? darkTheme.colors.text.primary
              : darkTheme.colors.text.secondary
          }
        >
          {dream.rawTranscript &&
          dream.rawTranscript !== 'Waiting for transcription...'
            ? dream.rawTranscript
            : dream.status === 'transcribing' ? String(t('record.transcribing')) : String(t('journal.waitingForTranscription'))}
        </Text>

        {/* Tags */}
        {dream.tags && dream.tags.length > 0 && (
          <HStack space="sm" flexWrap="wrap">
            {dream.tags.slice(0, 3).map((tag, index) => (
              <Badge
                key={index}
                variant="outline"
                borderColor={darkTheme.colors.accent + '40'}
                bg={darkTheme.colors.accent + '20'}
                size="sm"
              >
                <BadgeText color={darkTheme.colors.accent} size="xs">
                  {tag}
                </BadgeText>
              </Badge>
            ))}
          </HStack>
        )}

        {/* Footer */}
        <HStack justifyContent="space-between" alignItems="center">
          <Text size="sm" color={darkTheme.colors.text.primary} opacity={0.6}>
            {dream.confidence
              ? `${Math.round(dream.confidence * 100)}% ${t('analysis.confidence')}`
              : ''}
          </Text>
          {dream.status === 'completed' ? (
            <Pressable onPress={() => onAnalyzePress?.(dream)}>
              <Text
                size="sm"
                color={darkTheme.colors.primary}
                fontWeight="$semibold"
              >
                {String(t('analysis.title'))} →
              </Text>
            </Pressable>
          ) : dream.status === 'transcribing' || dream.status === 'pending' ? (
            <Spinner size="small" color={darkTheme.colors.primary} />
          ) : (
            <Pressable onPress={() => onRetryPress?.(dream)}>
              <HStack space="xs" alignItems="center">
                <Text
                  size="sm"
                  color={darkTheme.colors.primary}
                  fontWeight="$semibold"
                >
                  {String(t('actions.tryAgain'))}
                </Text>
                <MaterialCommunityIcons
                  name="reload"
                  size={16}
                  color={darkTheme.colors.primary}
                />
              </HStack>
            </Pressable>
          )}
        </HStack>
      </VStack>
    </Pressable>
  );
};
