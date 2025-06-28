import React from 'react';
import { Image as RNImage, ActivityIndicator, Alert, Pressable } from 'react-native';
import { VStack, HStack, Box, Text } from '@gluestack-ui/themed';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { darkTheme } from '@somni/theme';
import { Card } from '../../../components/atoms';
import { DreamInterpreter } from '@somni/types';
import { format } from 'date-fns';

interface GuideCardProps {
  dreamGuide: DreamInterpreter | null;
  guideLoading: boolean;
  guideSince?: string;
  guideAnalysesCount: number;
  isInterpretationReady: boolean;
  currentDreamAnalyzedByGuide?: boolean;
  onDiscussDream: () => void;
}

export const GuideCard: React.FC<GuideCardProps> = ({
  dreamGuide,
  guideLoading,
  guideSince,
  guideAnalysesCount,
  isInterpretationReady,
  currentDreamAnalyzedByGuide,
  onDiscussDream,
}) => {
  const getGuideEmoji = (id?: string) => {
    switch (id) {
      case 'jung':
        return '🔮';
      case 'freud':
        return '🧠';
      case 'lakshmi':
        return '🕉️';
      case 'mary':
        return '🔬';
      default:
        return '✨';
    }
  };

  return (
    <Card variant="elevated" marginHorizontal={0}>
      <VStack space="md">
        <HStack space="sm" style={{ alignItems: 'center' }}>
          <MaterialCommunityIcons
            name="account-star"
            size={20}
            color={darkTheme.colors.secondary}
          />
          <Text
            style={{
              fontSize: 12,
              color: darkTheme.colors.text.secondary,
              fontWeight: '500',
              letterSpacing: 1.2,
              textTransform: 'uppercase',
            }}
          >
            YOUR GUIDE
          </Text>
        </HStack>

        {guideLoading ? (
          <HStack space="md" style={{ alignItems: 'center' }}>
            <Box
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: darkTheme.colors.background.secondary,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <ActivityIndicator
                size="small"
                color={darkTheme.colors.primary}
              />
            </Box>
            <VStack style={{ flex: 1 }} space="xs">
              <Box
                style={{
                  width: 100,
                  height: 20,
                  backgroundColor: darkTheme.colors.background.secondary,
                  borderRadius: 4,
                  opacity: 0.5,
                }}
              />
              <Box
                style={{
                  width: 150,
                  height: 16,
                  backgroundColor: darkTheme.colors.background.secondary,
                  borderRadius: 4,
                  opacity: 0.5,
                }}
              />
              <Box
                style={{
                  width: 120,
                  height: 16,
                  backgroundColor: darkTheme.colors.background.secondary,
                  borderRadius: 4,
                  opacity: 0.5,
                }}
              />
            </VStack>
          </HStack>
        ) : dreamGuide ? (
          <>
            <HStack space="md" style={{ alignItems: 'center' }}>
              {/* Guide Avatar with image */}
              <Box
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 40,
                  overflow: 'hidden',
                  backgroundColor: darkTheme.colors.background.secondary,
                  borderWidth: 2,
                  borderColor: darkTheme.colors.primary + '20',
                }}
              >
                {dreamGuide.image_url ? (
                  (() => {
                    const imageUrl = dreamGuide.image_url.startsWith('http')
                      ? dreamGuide.image_url
                      : `https://tqwlnrlvtdsqgqpuryne.supabase.co${dreamGuide.image_url}`;

                    console.log('🖼️ Rendering interpreter image:', {
                      interpreter: dreamGuide.id,
                      originalUrl: dreamGuide.image_url,
                      finalUrl: imageUrl,
                    });

                    return (
                      <RNImage
                        source={{ uri: imageUrl }}
                        style={{
                          width: '100%',
                          height: '100%',
                          borderRadius: 40,
                        }}
                        resizeMode="cover"
                        onError={(error) => {
                          console.error(
                            '🚨 Interpreter image failed to load:',
                            {
                              interpreter: dreamGuide.id,
                              url: imageUrl,
                              error,
                            },
                          );
                        }}
                        onLoad={() => {
                          console.log(
                            '✅ Interpreter image loaded successfully:',
                            imageUrl,
                          );
                        }}
                      />
                    );
                  })()
                ) : (
                  <Box
                    style={{
                      width: '100%',
                      height: '100%',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <Text style={{ fontSize: 30 }}>
                      {getGuideEmoji(dreamGuide.id)}
                    </Text>
                  </Box>
                )}
              </Box>

              {/* Guide Info */}
              <VStack style={{ flex: 1 }} space="xs">
                <Text
                  style={{
                    fontSize: 20,
                    color: darkTheme.colors.text.primary,
                    fontWeight: 'bold',
                  }}
                >
                  Dr. {dreamGuide.name}
                </Text>
                <HStack space="sm" style={{ alignItems: 'center' }}>
                  <HStack space="xs" style={{ alignItems: 'center' }}>
                    <MaterialCommunityIcons
                      name="calendar-account"
                      size={14}
                      color={darkTheme.colors.text.secondary}
                    />
                    <Text
                      style={{
                        fontSize: 12,
                        color: darkTheme.colors.text.secondary,
                      }}
                    >
                      {guideSince || format(new Date(), 'MMM yyyy')}
                    </Text>
                  </HStack>
                  <HStack space="xs" style={{ alignItems: 'center' }}>
                    <MaterialCommunityIcons
                      name="thought-bubble"
                      size={14}
                      color={darkTheme.colors.text.secondary}
                    />
                    <Text
                      style={{
                        fontSize: 12,
                        color: darkTheme.colors.text.secondary,
                      }}
                    >
                      {guideAnalysesCount} {guideAnalysesCount === 1 ? 'analysis' : 'analyses'}
                    </Text>
                  </HStack>
                </HStack>
              </VStack>
            </HStack>

            {/* Discuss Button - Full Width within card */}
            <Pressable
              onPress={onDiscussDream}
              disabled={!isInterpretationReady || !currentDreamAnalyzedByGuide}
              style={{
                backgroundColor: isInterpretationReady && currentDreamAnalyzedByGuide
                  ? darkTheme.colors.primary
                  : darkTheme.colors.background.secondary,
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 12,
                opacity: isInterpretationReady && currentDreamAnalyzedByGuide ? 1 : 0.6,
                alignItems: 'center',
                marginTop: 16,
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  color: isInterpretationReady && currentDreamAnalyzedByGuide
                    ? '#FFFFFF'
                    : darkTheme.colors.text.secondary,
                  fontWeight: '600',
                }}
              >
                Discuss This Dream
              </Text>
              {!isInterpretationReady && (
                <Text
                  style={{
                    fontSize: 12,
                    color: darkTheme.colors.text.secondary,
                    marginTop: 4,
                  }}
                >
                  Available after full interpretation
                </Text>
              )}
              {isInterpretationReady && !currentDreamAnalyzedByGuide && (
                <Text
                  style={{
                    fontSize: 12,
                    color: darkTheme.colors.text.secondary,
                    marginTop: 4,
                  }}
                >
                  This dream was analyzed by a different guide
                </Text>
              )}
            </Pressable>
          </>
        ) : null}
      </VStack>
    </Card>
  );
};