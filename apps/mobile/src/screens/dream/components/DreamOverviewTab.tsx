import React, { useMemo } from 'react';
import { Image as RNImage } from 'react-native';
import { VStack, HStack, Box, Text } from '@gluestack-ui/themed';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { darkTheme } from '@somni/theme';
import { Card } from '../../../components/atoms';
import { Dream, DreamImage } from '@somni/types';
import { format } from 'date-fns';
import { supabase } from '../../../lib/supabase';
import { ShareOptions } from './ShareOptions';
import { MoodIndicator } from './MoodIndicator';
import { ClarityIndicator } from './ClarityIndicator';

interface DreamWithImages extends Dream {
  dream_images?: DreamImage[];
}

interface DreamOverviewTabProps {
  dream: DreamWithImages;
  onCaptureViewShot: () => Promise<string | null>;
  isCapturing: boolean;
}

/**
 * DreamOverviewTab
 * Shows the top-level "Overview" content for a dream.
 * All conditional renders are guarded with strict booleans (using !!)
 * to avoid React‑Native's "Text strings must be rendered within a <Text>" warning.
 */
const DreamOverviewTab: React.FC<DreamOverviewTabProps> = ({
  dream,
  onCaptureViewShot,
  isCapturing,
}) => {
  /* ────────────────────────────────────────── */
  /* Primary image URL (memoised)              */
  /* ────────────────────────────────────────── */
  const imageUrl = useMemo(() => {
    const storagePath = dream.dream_images?.[0]?.storage_path;
    if (!storagePath) return null;
    return storagePath.startsWith('http')
      ? storagePath
      : supabase.storage.from('dream-images').getPublicUrl(storagePath).data
          .publicUrl;
  }, [dream.dream_images]);

  /* ────────────────────────────────────────── */
  /* Render                                     */
  /* ────────────────────────────────────────── */
  return (
    <VStack space="lg">
      {/* Dream image */}
      {!!imageUrl && (
        <Box
          style={{
            borderRadius: 12,
            overflow: 'hidden',
            backgroundColor: darkTheme.colors.background.secondary,
            aspectRatio: 3 / 2,
          }}
        >
          <RNImage
            source={{ uri: imageUrl }}
            style={{ width: '100%', height: '100%' }}
            resizeMode="cover"
          />
        </Box>
      )}

      {/* Placeholder when there is an image prompt but no image yet */}
      {!!dream.image_prompt && !dream.dream_images?.length && (
        <Box
          style={{
            borderRadius: 12,
            overflow: 'hidden',
            backgroundColor: darkTheme.colors.background.secondary,
            aspectRatio: 3 / 2,
          }}
        >
          <Box
            style={{
              width: '100%',
              height: '100%',
              backgroundColor: darkTheme.colors.background.elevated,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <MaterialCommunityIcons
              name="image-filter-drama"
              size={64}
              color={darkTheme.colors.border.secondary}
            />
            <Text
              style={{
                fontSize: 14,
                color: darkTheme.colors.text.secondary,
                marginTop: 8,
              }}
            >
              Image coming soon
            </Text>
          </Box>
        </Box>
      )}

      {/* Lucid badge */}
      {!!dream.is_lucid && (
        <Card
          variant="elevated"
          marginHorizontal={0}
          style={{ backgroundColor: `${darkTheme.colors.primary}20` }}
        >
          <HStack space="sm" style={{ alignItems: 'center' }}>
            <Ionicons
              name="sparkles"
              size={20}
              color={darkTheme.colors.primary}
            />
            <Text
              style={{
                fontSize: 16,
                color: darkTheme.colors.primary,
                fontWeight: '500',
              }}
            >
              Lucid Dream
            </Text>
          </HStack>
        </Card>
      )}

      {/* Transcript */}
      <Card variant="elevated" marginHorizontal={0}>
        <VStack space="md">
          <HStack space="sm" style={{ alignItems: 'center' }}>
            <MaterialCommunityIcons
              name="script-text-outline"
              size={20}
              color={darkTheme.colors.secondary}
            />
            <Text
              style={{
                fontSize: 14,
                color: darkTheme.colors.text.secondary,
                fontWeight: '500',
              }}
            >
              DREAM TRANSCRIPT
            </Text>
          </HStack>
          <Text
            style={{
              fontSize: 16,
              color: darkTheme.colors.text.primary,
              lineHeight: 24,
            }}
          >
            {dream.raw_transcript || 'No transcript available'}
          </Text>
        </VStack>
      </Card>

      {/* Mood & Clarity */}
      <MoodIndicator mood={dream.mood} />
      <ClarityIndicator clarity={dream.clarity} />

      {/* Duration & Recorded time */}
      {!!dream.duration && (
        <Card variant="elevated" marginHorizontal={0}>
          <HStack space="md" style={{ alignItems: 'center' }}>
            <HStack space="sm" style={{ alignItems: 'center', flex: 1 }}>
              <Ionicons
                name="time-outline"
                size={20}
                color={darkTheme.colors.secondary}
              />
              <VStack>
                <Text
                  style={{
                    fontSize: 12,
                    color: darkTheme.colors.text.secondary,
                  }}
                >
                  Duration
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    color: darkTheme.colors.text.secondary,
                  }}
                >
                  {Math.floor(dream.duration / 60)}:
                  {String(dream.duration % 60).padStart(2, '0')}
                </Text>
              </VStack>
            </HStack>
            <HStack space="sm" style={{ alignItems: 'center', flex: 1 }}>
              <MaterialCommunityIcons
                name="calendar-clock"
                size={20}
                color={darkTheme.colors.secondary}
              />
              <VStack>
                <Text
                  style={{
                    fontSize: 12,
                    color: darkTheme.colors.text.secondary,
                  }}
                >
                  Recorded
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    color: darkTheme.colors.text.secondary,
                  }}
                >
                  {format(new Date(dream.created_at), 'h:mm a')}
                </Text>
              </VStack>
            </HStack>
          </HStack>
        </Card>
      )}

      {/* Share buttons */}
      <ShareOptions
        dream={dream}
        onCaptureViewShot={onCaptureViewShot}
        isCapturing={isCapturing}
      />
    </VStack>
  );
};

export default DreamOverviewTab;
