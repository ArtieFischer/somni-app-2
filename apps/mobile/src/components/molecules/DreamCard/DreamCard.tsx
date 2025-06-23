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
  Image,
} from '../../ui';
import { Card } from '../../atoms';
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
      return t('time.today') as string;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return t('time.yesterday') as string;
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

  const getDreamTitle = () => {
    console.log('🎯 DreamCard - Getting title for dream:', {
      dreamId: dream.id,
      hasTitle: !!dream.title,
      title: dream.title,
      hasImageUrl: !!dream.image_url,
      imageUrl: dream.image_url,
      dreamKeys: Object.keys(dream)
    });
    
    if (dream.title) {
      return dream.title;
    }
    // Fallback: Dream YY/MM/DD
    const date = new Date(dream.recordedAt);
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `Dream ${year}/${month}/${day}`;
  };

  // Removed unused getStatusColor function

  return (
    <Card variant="elevated">
      <Pressable onPress={() => onPress?.(dream)}>
      <VStack space="md">
        {/* Header */}
        <HStack justifyContent="space-between" alignItems="center">
          <HStack space="sm" alignItems="center">
            <Text
              size="sm"
              fontWeight="$medium"
              color={darkTheme.colors.text.secondary}
            >
              {String(formatDate(dream.recordedAt))}
            </Text>
            <Text size="sm" color={darkTheme.colors.text.secondary}>
              •
            </Text>
            <Text size="sm" color={darkTheme.colors.text.secondary}>
              {formatTime(dream.recordedAt)}
            </Text>
          </HStack>
          <HStack space="md" alignItems="center">
            {dream.status !== 'completed' && (
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
            )}
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

        {/* Title */}
        <Text
          size="lg"
          fontWeight="$semibold"
          color={darkTheme.colors.text.primary}
          numberOfLines={2}
          ellipsizeMode="tail"
        >
          {getDreamTitle()}
        </Text>

        {/* Dream Image */}
        <Box
          borderRadius={8}
          overflow="hidden"
          bg={darkTheme.colors.background.secondary}
          aspectRatio={3 / 2}
        >
          {console.log('🖼️ DreamCard - Image check:', { dreamId: dream.id, image_url: dream.image_url, hasImage: !!dream.image_url })}
          {dream.image_url ? (
            <Image
              source={{ uri: dream.image_url }}
              alt={getDreamTitle()}
              style={{ width: '100%', height: '100%' }}
              resizeMode="cover"
            />
          ) : (
            <Box
              w="100%"
              h="100%"
              bg={darkTheme.colors.background.elevated}
              justifyContent="center"
              alignItems="center"
            >
              <Ionicons
                name="image-outline"
                size={48}
                color={darkTheme.colors.border.secondary}
              />
            </Box>
          )}
        </Box>

        {/* Content */}
        <Text
          size="sm"
          numberOfLines={3}
          ellipsizeMode="tail"
          lineHeight="$sm"
          color={
            dream.rawTranscript &&
            dream.rawTranscript !== 'Waiting for transcription...'
              ? darkTheme.colors.text.secondary
              : darkTheme.colors.text.secondary
          }
          opacity={0.8}
        >
          {dream.rawTranscript &&
          dream.rawTranscript !== 'Waiting for transcription...'
            ? dream.rawTranscript
            : dream.status === 'transcribing' 
              ? String(t('record.transcribing')) 
              : dream.status === 'pending' 
                ? String(t('journal.transcriptionPostponed'))
                : String(t('journal.waitingForTranscription'))}
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
        <HStack justifyContent="flex-end" alignItems="center">
          <Box />
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
          ) : dream.status === 'transcribing' ? (
            <Spinner size="small" color={darkTheme.colors.primary} />
          ) : dream.status === 'pending' ? (
            <Pressable onPress={() => onRetryPress?.(dream)} p="$2">
              <Box 
                bg={darkTheme.colors.primary + '20'}
                borderRadius="$full"
                w={32}
                h={32}
                justifyContent="center"
                alignItems="center"
              >
                <MaterialCommunityIcons
                  name="reload"
                  size={20}
                  color={darkTheme.colors.primary}
                />
              </Box>
            </Pressable>
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
    </Card>
  );
};
