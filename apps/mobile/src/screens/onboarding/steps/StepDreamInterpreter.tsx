import React, { useState, useEffect, useRef } from 'react';
import { View, ViewStyle, TouchableOpacity, ScrollView, Image, Dimensions, Animated } from 'react-native';
import { Text, Button } from '../../../components/atoms';
import { useTheme } from '../../../hooks/useTheme';
import { useTranslation } from '../../../hooks/useTranslation';
import { supabase } from '../../../lib/supabase';
import type { OnboardingData } from '../OnboardingScreen';
import type { DreamInterpreter } from '@somni/types';

// Import guide images - using database URLs as fallback
// The actual images will be loaded from the database or local assets

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
      // Use hardcoded data as fallback with proper image URLs
      const baseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://gnodjxczbvkoxufrjdtk.supabase.co';
      setInterpreters([
        {
          id: 'jung',
          name: 'Carl',
          title: 'Depth Psychologist',
          description: 'Links your symbols to timeless archetypes and the collective psyche.',
          features: ['Archetype match', 'Shadow hints', 'Active imagination'],
          image_url: `${baseUrl}/storage/v1/object/public/interpreters/jung.png`,
          interpretation_style: {
            approach: 'jungian',
            focus: ['archetypes', 'collective_unconscious', 'individuation'],
          },
        },
        {
          id: 'freud',
          name: 'Sigmund',
          title: 'Psychoanalyst',
          description: 'Hunts wish-dreams and repressed urges—his (in)famous dirty mind at work.',
          features: ['Wish detector', 'Symbol index', 'Repression radar'],
          image_url: `${baseUrl}/storage/v1/object/public/interpreters/freud.png`,
          interpretation_style: {
            approach: 'freudian',
            focus: ['wish_fulfillment', 'unconscious_desires', 'symbolism'],
          },
        },
        {
          id: 'lakshmi',
          name: 'Lakshmi',
          title: 'Transpersonal Scholar',
          description: 'Frames dreams through karma, chakras, and expanding consciousness.',
          features: ['Karmic threads', 'Chakra map', 'Meditation cue'],
          image_url: `${baseUrl}/storage/v1/object/public/interpreters/lakshmi.png`,
          interpretation_style: {
            approach: 'spiritual',
            focus: ['karma', 'spiritual_growth', 'consciousness'],
          },
        },
        {
          id: 'mary',
          name: 'Mary',
          title: 'Cognitive Neuroscientist',
          description: 'Shows how your sleeping brain files memories and tunes emotions.',
          features: ['Memory snapshot', 'Emotion circuitry', 'Brainwave overlay'],
          image_url: `${baseUrl}/storage/v1/object/public/interpreters/mary.png`,
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

  const getInterpreterImage = (interpreter: DreamInterpreter) => {
    // Use image_url from database if available
    if (interpreter.image_url) {
      return { uri: interpreter.image_url };
    }
    
    // Fallback to placeholder
    return null;
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
      width: 100,
      height: 100,
      borderRadius: 8,
      marginBottom: theme.spacing.medium,
      backgroundColor: theme.colors.background.secondary,
    },
    experimentalBadge: {
      position: 'absolute',
      top: -8,
      right: -8,
      backgroundColor: theme.colors.accent.primary,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      zIndex: 1,
    },
    badgeText: {
      fontSize: 10,
      fontWeight: 'bold',
      color: theme.colors.text.inverse,
    },
    titleText: {
      textAlign: 'center',
      marginBottom: theme.spacing.xs,
      fontWeight: '600',
    },
    featuresContainer: {
      marginTop: theme.spacing.small,
      alignItems: 'center',
    },
    featureItem: {
      fontSize: 12,
      color: theme.colors.text.secondary,
      textAlign: 'center',
      marginBottom: 2,
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
          Choose Your Dream Guide
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
              <View style={{ position: 'relative' }}>
                {getInterpreterImage(interpreter) ? (
                  <Image
                    source={getInterpreterImage(interpreter)}
                    style={styles.interpreterImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={[styles.interpreterImage, { justifyContent: 'center', alignItems: 'center' }]}>
                    <Text style={{ fontSize: 40 }}>
                      {interpreter.id === 'jung' ? '🔮' : 
                       interpreter.id === 'freud' ? '🧠' :
                       interpreter.id === 'lakshmi' ? '🕉️' :
                       interpreter.id === 'mary' ? '🔬' : '✨'}
                    </Text>
                  </View>
                )}
                <View style={styles.experimentalBadge}>
                  <Text style={styles.badgeText}>EXPERIMENTAL STAGE</Text>
                </View>
              </View>
              <View style={styles.interpreterInfo}>
                <Text variant="h3" style={styles.titleText}>
                  {interpreter.name}
                </Text>
                <Text variant="body" style={{ textAlign: 'center', marginBottom: theme.spacing.xs, fontSize: 14, fontWeight: '500' }}>
                  {interpreter.title}
                </Text>
                <Text
                  variant="caption"
                  color="secondary"
                  style={{ textAlign: 'center', marginBottom: theme.spacing.xs }}
                  numberOfLines={3}
                >
                  {interpreter.description}
                </Text>
                <View style={styles.featuresContainer}>
                  {interpreter.features?.map((feature: string, idx: number) => (
                    <Text key={idx} style={styles.featureItem}>
                      • {feature}
                    </Text>
                  ))}
                </View>
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