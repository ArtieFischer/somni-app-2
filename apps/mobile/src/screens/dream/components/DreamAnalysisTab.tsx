import React from 'react';
import { Alert, ActivityIndicator, Pressable } from 'react-native';
import { VStack, HStack, Text } from '@gluestack-ui/themed';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { darkTheme } from '@somni/theme';
import { Card } from '../../../components/atoms';
import { Dream, DreamInterpreter } from '@somni/types';
import { Interpretation } from '../../../services/interpretationService';
import { InterpretationDisplay } from '../../../components/organisms/InterpretationDisplay';
import { GuideCard } from './GuideCard';
import { ThemesSection } from './ThemesSection';
import { format } from 'date-fns';

interface DreamAnalysisTabProps {
  dream: Dream;
  dreamGuide: DreamInterpreter | null;
  guideLoading: boolean;
  guideSince?: string;
  themes: Array<{ code: string; name: string; description: string }>;
  themesLoading: boolean;
  themesError: Error | null;
  interpretation: Interpretation | null;
  interpretationLoading: boolean;
  interpretationError: string | null;
  isInterpretationReady: boolean;
  onDiscussDream: () => void;
  onAskForInterpretation: () => void;
  onCheckInterpretationStatus: () => void;
}

const getRandomTip = () => {
  const tips = [
    "Dreams are the mind's way of processing emotions and memories",
    'Keep a dream journal to improve dream recall',
    'Most dreams occur during REM sleep',
    'Everyone dreams, but not everyone remembers their dreams',
    'Dreams can help solve problems and boost creativity',
    'The average person has 4-6 dreams per night',
    'Dream symbols often represent emotions or experiences',
  ];
  return tips[Math.floor(Math.random() * tips.length)];
};

export const DreamAnalysisTab: React.FC<DreamAnalysisTabProps> = ({
  dream,
  dreamGuide,
  guideLoading,
  guideSince,
  themes,
  themesLoading,
  themesError,
  interpretation,
  interpretationLoading,
  interpretationError,
  isInterpretationReady,
  onDiscussDream,
  onAskForInterpretation,
  onCheckInterpretationStatus,
}) => {
  console.log('Rendering analysis tab:', {
    guideLoading,
    dreamGuide,
  });

  return (
    <VStack space="lg">
      {/* Your Guide Section */}
      <GuideCard
        dreamGuide={dreamGuide}
        guideLoading={guideLoading}
        guideSince={guideSince}
        isInterpretationReady={isInterpretationReady}
        onDiscussDream={onDiscussDream}
      />

      {/* Themes Section */}
      <ThemesSection
        themes={themes}
        themesLoading={themesLoading}
        themesError={themesError}
      />

      {/* Interpretation Section */}
      {interpretation ? (
        <InterpretationDisplay
          interpretation={interpretation}
          interpreterName={dreamGuide?.full_name}
        />
      ) : (
        <Card variant="elevated" marginHorizontal={0}>
          <VStack space="md">
            <HStack space="sm" style={{ alignItems: 'center' }}>
              <MaterialCommunityIcons
                name="telescope"
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
                INTERPRETATION
              </Text>
            </HStack>

            {interpretationLoading ? (
              <VStack
                space="md"
                style={{ alignItems: 'center', paddingVertical: 20 }}
              >
                <ActivityIndicator
                  size="large"
                  color={darkTheme.colors.primary}
                />
                <Text
                  style={{
                    fontSize: 16,
                    color: darkTheme.colors.text.primary,
                    fontWeight: '600',
                  }}
                >
                  {dreamGuide?.name || 'Your guide'} is analyzing your
                  dream...
                </Text>

                <Text
                  style={{
                    fontSize: 14,
                    color: darkTheme.colors.text.secondary,
                  }}
                >
                  This may take a few moments
                </Text>

                <Text
                  style={{
                    fontSize: 13,
                    color: darkTheme.colors.text.secondary,
                    fontStyle: 'italic',
                    textAlign: 'center',
                    marginTop: 8,
                  }}
                >
                  💡 {getRandomTip()}
                </Text>
              </VStack>
            ) : interpretationError ? (
              <VStack space="md">
                <Text
                  style={{
                    fontSize: 14,
                    color: darkTheme.colors.status.error,
                  }}
                >
                  {interpretationError}
                </Text>
                <HStack space="sm">
                  <Pressable
                    onPress={onAskForInterpretation}
                    style={{
                      backgroundColor: darkTheme.colors.primary,
                      borderRadius: 12,
                      paddingHorizontal: 24,
                      paddingVertical: 16,
                      alignItems: 'center',
                      flex: 1,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 16,
                        color: '#FFFFFF',
                        fontWeight: '600',
                      }}
                    >
                      Try Again
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={onCheckInterpretationStatus}
                    style={{
                      backgroundColor: darkTheme.colors.background.secondary,
                      borderRadius: 12,
                      paddingHorizontal: 24,
                      paddingVertical: 16,
                      alignItems: 'center',
                      borderWidth: 1,
                      borderColor: darkTheme.colors.border.secondary,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 16,
                        color: darkTheme.colors.text.primary,
                        fontWeight: '600',
                      }}
                    >
                      Check Status
                    </Text>
                  </Pressable>
                </HStack>
              </VStack>
            ) : (
              <VStack space="md">
                <Text
                  style={{
                    fontSize: 14,
                    color: darkTheme.colors.text.secondary,
                    lineHeight: 20,
                  }}
                >
                  Ask your guide for a deep interpretation of your dream. This
                  analysis may take a few minutes, and you'll be notified when
                  it's ready.
                </Text>

                <Pressable
                  onPress={onAskForInterpretation}
                  disabled={!dream.raw_transcript || themes.length === 0}
                  style={{
                    backgroundColor:
                      !dream.raw_transcript || themes.length === 0
                        ? darkTheme.colors.background.secondary
                        : darkTheme.colors.primary,
                    borderRadius: 12,
                    paddingHorizontal: 24,
                    paddingVertical: 16,
                    opacity:
                      !dream.raw_transcript || themes.length === 0 ? 0.6 : 1,
                    alignItems: 'center',
                  }}
                >
                  <Text
                    style={{
                      fontSize: 16,
                      color:
                        !dream.raw_transcript || themes.length === 0
                          ? darkTheme.colors.text.secondary
                          : '#FFFFFF',
                      fontWeight: '600',
                    }}
                  >
                    Ask for Interpretation
                  </Text>
                </Pressable>
              </VStack>
            )}
          </VStack>
        </Card>
      )}
    </VStack>
  );
};