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
import { Alert, Image as RNImage } from 'react-native';

interface DreamCardProps {
  dream: Dream;
  duration?: number; // Duration from transcription_usage
  onPress?: (dream: Dream) => void;
  onAnalyzePress?: (dream: Dream) => void;
  onDeletePress?: (dream: Dream) => void;
  onRetryPress?: (dream: Dream) => void;
}

export const DreamCard: React.FC<DreamCardProps> = ({
  dream,
  duration,
  onPress,
  onAnalyzePress,
  onDeletePress,
  onRetryPress,
}) => {
  const { t } = useTranslation('dreams');

  // Debug logging
  if (dream.id.includes('c7d8e7cf')) {
    // Only log for specific debug dream
    // console.log('🎴 DreamCard data:', {
    //   dreamId: dream.id,
    //   status: dream.status,
    //   transcriptionStatus:
    //     dream.transcription_status || dream.transcriptionStatus,
    //   metadata: dream.transcription_metadata || dream.transcriptionMetadata,
    //   duration: duration,
    //   dreamDuration: dream.duration,
    //   hasTranscript: !!(dream.raw_transcript || dream.rawTranscript),
    //   transcript: dream.raw_transcript || dream.rawTranscript,
    // });
  }

  // Debug log for transcription metadata
  if (
    dream.transcription_status === 'failed' ||
    dream.transcriptionStatus === 'failed'
  ) {
    console.log('🚨 Dream with error status:', {
      dreamId: dream.id,
      transcription_status: dream.transcription_status,
      transcriptionStatus: dream.transcriptionStatus,
      transcription_metadata: dream.transcription_metadata,
      transcriptionMetadata: dream.transcriptionMetadata,
      status: dream.status,
    });
  }

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

  // Check if transcription is ready
  const isTranscriptionReady = 
    dream.transcription_status === 'completed' || 
    dream.status === 'completed' ||
    (dream.raw_transcript && 
     dream.raw_transcript !== 'Waiting for transcription...' &&
     dream.raw_transcript !== '');

  return (
    <Card variant="elevated">
      <Pressable 
        onPress={() => isTranscriptionReady ? onPress?.(dream) : undefined}
        style={{ opacity: isTranscriptionReady ? 1 : 0.8 }}
      >
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
              {/* Show duration for pending and processing states */}
              {(dream.transcription_status === 'pending' || 
                dream.transcription_status === 'processing' ||
                dream.status === 'pending' ||
                dream.status === 'transcribing') && (
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
                    {formatDuration(duration || dream.duration || 0)}
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
          {/* {console.log('🎨 DreamCard rendering:', {
            dreamId: dream.id,
            hasImageUrl: !!dream.image_url,
            imageUrl: dream.image_url,
            dreamTitle: getDreamTitle(),
            dreamObject: dream
          })} */}
          <Box
            borderRadius={8}
            overflow="hidden"
            bg={darkTheme.colors.background.secondary}
            aspectRatio={3 / 2}
          >
            {dream.image_url ? (
              <RNImage
                source={{ uri: dream.image_url }}
                style={{ width: '100%', height: '100%' }}
                resizeMode="cover"
                onError={(error) => {
                  console.error('🚨 Image failed to load:', {
                    dreamId: dream.id,
                    imageUrl: dream.image_url,
                    error,
                  });
                }}
                onLoad={() => {
                  console.log('✅ Image loaded successfully:', dream.image_url);
                }}
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
            numberOfLines={3}
            ellipsizeMode="tail"
            color={
              dream.rawTranscript &&
              dream.rawTranscript !== 'Waiting for transcription...'
                ? darkTheme.colors.text.secondary
                : darkTheme.colors.text.secondary
            }
            opacity={0.8}
          >
            {(dream.rawTranscript || dream.raw_transcript) &&
            dream.rawTranscript !== 'Waiting for transcription...' &&
            dream.raw_transcript !== 'Waiting for transcription...'
              ? dream.rawTranscript || dream.raw_transcript
              : dream.status === 'transcribing' ||
                  dream.transcription_status === 'processing'
                ? String(t('record.transcribing'))
                : dream.status === 'pending' ||
                    dream.transcription_status === 'pending'
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

          {/* Check if dream was too short */}
          {(dream.transcriptionStatus === 'failed' ||
            dream.transcription_status === 'failed') &&
            (dream.transcriptionMetadata?.error === 'Recording too short' ||
              dream.transcription_metadata?.error ===
                'Recording too short') && (
              <HStack
                space="sm"
                alignItems="center"
                bg={darkTheme.colors.status.error + '20'}
                p="$2"
                borderRadius="$md"
              >
                <Ionicons
                  name="alert-circle"
                  size={16}
                  color={darkTheme.colors.status.error}
                />
                <Text size="sm" color={darkTheme.colors.status.error}>
                  Recording too short (min 5 seconds)
                </Text>
              </HStack>
            )}

          {/* Footer */}
          <HStack justifyContent="flex-end" alignItems="center">
            <Box />
            {dream.status === 'completed' ||
            dream.transcription_status === 'completed' ||
            dream.transcription_status === 'done' ? (
              <Pressable onPress={() => onAnalyzePress?.(dream)}>
                <Text
                  size="sm"
                  color={darkTheme.colors.primary}
                  fontWeight="$semibold"
                >
                  {String(t('analysis.title'))} →
                </Text>
              </Pressable>
            ) : dream.status === 'transcribing' ||
              dream.transcription_status === 'processing' ? (
              <Spinner size="small" color={darkTheme.colors.primary} />
            ) : dream.status === 'pending' ||
              dream.transcription_status === 'pending' ? (
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
            ) : (dream.transcriptionStatus === 'failed' ||
                dream.transcription_status === 'failed') &&
              (dream.transcriptionMetadata?.error === 'Recording too short' ||
                dream.transcription_metadata?.error ===
                  'Recording too short') ? (
              <Box p="$2">
                <Box
                  bg={darkTheme.colors.status.error + '20'}
                  borderRadius="$full"
                  w={32}
                  h={32}
                  justifyContent="center"
                  alignItems="center"
                >
                  <Ionicons
                    name="close"
                    size={20}
                    color={darkTheme.colors.status.error}
                  />
                </Box>
              </Box>
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
