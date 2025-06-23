import React, { useState, useEffect, useRef } from 'react';
import { View, ViewStyle, TouchableOpacity, ScrollView, Image, Dimensions, Animated } from 'react-native';
import { Text, Button } from '../../../components/atoms';
import { useTheme } from '../../../hooks/useTheme';
import { useTranslation } from '../../../hooks/useTranslation';
import { supabase } from '../../../lib/supabase';
import type { OnboardingData } from '../OnboardingScreen';
import type { DreamInterpreter } from '@somni/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface StepDreamInterpreterProps {
  data: Partial<OnboardingData>;
  onUpdate: (data: Partial<OnboardingData>) => void;
  onNext: () => void;
  onPrevious: () => void;
}

export const StepDreamInterpreter: React.FC<StepDreamInterpreterProps> = ({
  data,
  onUpdate,
  onNext,
  onPrevious,
}) => {
  const theme = useTheme();
  const { t } = useTranslation('onboarding');
  const scrollViewRef = useRef<ScrollView>(null);
  const [interpreters, setInterpreters] = useState<DreamInterpreter[]>([]);
  const [selectedInterpreter, setSelectedInterpreter] = useState<string | undefined>(
    data.dream_interpreter
  );
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const scrollX = useRef(new Animated.Value(0)).current;
  
  const CARD_WIDTH = SCREEN_WIDTH * 0.7;
  const CARD_MARGIN = theme.spacing.medium;

  useEffect(() => {
    fetchInterpreters();
  }, []);
  
  useEffect(() => {
    // Set initial selection if none exists
    if (interpreters.length > 0 && !selectedInterpreter) {
      setSelectedInterpreter(interpreters[0].id);
      setSelectedIndex(0);
    } else if (interpreters.length > 0 && selectedInterpreter) {
      // If we have a previous selection, find its index and scroll to it
      const index = interpreters.findIndex(i => i.id === selectedInterpreter);
      if (index !== -1) {
        setSelectedIndex(index);
        // Scroll to the selected interpreter after a short delay
        setTimeout(() => {
          scrollViewRef.current?.scrollTo({ 
            x: index * (CARD_WIDTH + CARD_MARGIN), 
            animated: false 
          });
        }, 100);
      }
    }
  }, [interpreters]);

  const fetchInterpreters = async () => {
    try {
      const { data: interpreterData, error } = await supabase
        .from('interpreters')
        .select('*')
        .order('id');

      if (error) throw error;

      setInterpreters(interpreterData || []);
    } catch (error) {
      console.error('Error fetching interpreters:', error);
      // Use hardcoded data as fallback
      setInterpreters([
        {
          id: 'carl',
          name: 'Carl',
          full_name: 'Carl Jung',
          description: 'Explores collective unconscious and universal archetypes in your dreams',
          image_url: '',
          interpretation_style: {
            approach: 'jungian',
            focus: ['archetypes', 'collective_unconscious', 'individuation'],
          },
        },
        {
          id: 'sigmund',
          name: 'Sigmund',
          full_name: 'Sigmund Freud',
          description: 'Analyzes dreams as wish fulfillment and unconscious desires',
          image_url: '',
          interpretation_style: {
            approach: 'freudian',
            focus: ['wish_fulfillment', 'unconscious_desires', 'symbolism'],
          },
        },
        {
          id: 'lakshmi',
          name: 'Lakshmi',
          full_name: 'Lakshmi Devi',
          description: 'Interprets dreams through spiritual and karmic perspectives',
          image_url: '',
          interpretation_style: {
            approach: 'spiritual',
            focus: ['karma', 'spiritual_growth', 'consciousness'],
          },
        },
        {
          id: 'mary',
          name: 'Mary',
          full_name: 'Mary Whiton',
          description: 'Uses modern cognitive science to understand dream meanings',
          image_url: '',
          interpretation_style: {
            approach: 'cognitive',
            focus: ['memory_processing', 'problem_solving', 'neuroscience'],
          },
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleScroll = (event: any) => {
    const contentOffset = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffset / (CARD_WIDTH + CARD_MARGIN));
    if (index >= 0 && index < interpreters.length) {
      setSelectedIndex(index);
      // Immediately update the selected interpreter based on visible slide
      setSelectedInterpreter(interpreters[index].id);
    }
  };

  const handleContinue = () => {
    if (selectedInterpreter) {
      // DEBUG: Show what interpreter data is being sent
      console.log('=== DEBUG: StepDreamInterpreter - Sending Data ===');
      console.log(JSON.stringify({ dream_interpreter: selectedInterpreter }, null, 2));
      console.log('=================================================');
      
      onUpdate({ dream_interpreter: selectedInterpreter as any });
      onNext();
    }
  };

  const getInterpreterEmoji = (id: string) => {
    switch (id) {
      case 'carl': return '🔮';
      case 'sigmund': return '🧠';
      case 'lakshmi': return '🕉️';
      case 'mary': return '🔬';
      default: return '✨';
    }
  };

  const styles: Record<string, ViewStyle> = {
    container: {
      flex: 1,
      paddingTop: theme.spacing.xl,
    },
    header: {
      paddingHorizontal: theme.spacing.large,
    },
    carouselContainer: {
      marginTop: theme.spacing.large,
    },
    scrollView: {
      paddingVertical: theme.spacing.medium,
    },
    interpreterCard: {
      width: CARD_WIDTH,
      marginHorizontal: CARD_MARGIN / 2,
      padding: theme.spacing.large,
      borderRadius: theme.borderRadius.large,
      borderWidth: 2,
      borderColor: theme.colors.border.primary,
      backgroundColor: theme.colors.background.elevated,
      alignItems: 'center',
      ...theme.shadows.medium,
    },
    interpreterImage: {
      width: 120,
      height: 120,
      borderRadius: 60,
      marginBottom: theme.spacing.medium,
      backgroundColor: theme.colors.background.secondary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    interpreterEmoji: {
      fontSize: 60,
    },
    interpreterInfo: {
      alignItems: 'center',
      marginTop: theme.spacing.small,
    },
    dotsContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      paddingVertical: theme.spacing.medium,
    },
    dot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      marginHorizontal: 4,
      backgroundColor: theme.colors.border.primary,
    },
    dotActive: {
      backgroundColor: theme.colors.accent.primary,
      width: 24,
    },
    buttonContainer: {
      flexDirection: 'row',
      gap: theme.spacing.medium,
      paddingHorizontal: theme.spacing.large,
      paddingVertical: theme.spacing.large,
    },
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="h2" style={{ marginBottom: theme.spacing.small }}>
          Choose Your Dream Interpreter
        </Text>
        <Text variant="body" color="secondary">
          Select the approach that resonates with you
        </Text>
      </View>

      <View style={styles.carouselContainer}>
        <Animated.ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled={false}
          showsHorizontalScrollIndicator={false}
          snapToInterval={CARD_WIDTH + CARD_MARGIN}
          decelerationRate="fast"
          contentContainerStyle={{
            paddingHorizontal: (SCREEN_WIDTH - CARD_WIDTH) / 2,
          }}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: true, listener: handleScroll }
          )}
          onMomentumScrollEnd={handleScroll}
          scrollEventThrottle={16}
        >
          {interpreters.map((interpreter, index) => (
            <TouchableOpacity
              key={interpreter.id}
              style={styles.interpreterCard}
              onPress={() => {
                // Scroll to this card when tapped
                scrollViewRef.current?.scrollTo({ 
                  x: index * (CARD_WIDTH + CARD_MARGIN), 
                  animated: true 
                });
                setSelectedInterpreter(interpreter.id);
                setSelectedIndex(index);
              }}
              activeOpacity={0.9}
            >
              <View style={styles.interpreterImage}>
                <Text style={styles.interpreterEmoji}>
                  {getInterpreterEmoji(interpreter.id)}
                </Text>
              </View>
              <View style={styles.interpreterInfo}>
                <Text variant="h3" style={{ textAlign: 'center', marginBottom: theme.spacing.xs }}>
                  {interpreter.name}
                </Text>
                <Text variant="body" style={{ textAlign: 'center', marginBottom: theme.spacing.xs }}>
                  {interpreter.full_name}
                </Text>
                <Text
                  variant="caption"
                  color="secondary"
                  style={{ textAlign: 'center', marginTop: theme.spacing.xs }}
                  numberOfLines={3}
                >
                  {interpreter.description}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </Animated.ScrollView>

        {/* Dots indicator */}
        <View style={styles.dotsContainer}>
          {interpreters.map((_, index) => (
            <Animated.View
              key={index}
              style={[
                styles.dot,
                selectedIndex === index && styles.dotActive,
              ]}
            />
          ))}
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <Button
          variant="outline"
          size="md"
          onPress={onPrevious}
          style={{ flex: 1 }}
        >
          {t('common.back') as string}
        </Button>
        <Button
          variant="solid"
          size="md"
          onPress={handleContinue}
          disabled={!selectedInterpreter}
          style={{ flex: 1 }}
        >
          {t('common.continue') as string}
        </Button>
      </View>
    </View>
  );
};