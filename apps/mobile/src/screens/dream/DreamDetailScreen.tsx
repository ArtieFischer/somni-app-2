import React, { useState, useEffect, useRef } from 'react';
import {
  ScrollView,
  Alert,
  Platform,
  AppState,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  VStack,
  HStack,
  Box,
  Text,
} from '@gluestack-ui/themed';
import { darkTheme } from '@somni/theme';
import { useNavigation, useRoute } from '@react-navigation/native';
import { MainStackScreenProps, Dream, DreamImage } from '@somni/types';
import { useDreamStore } from '@somni/stores';
import { format } from 'date-fns';
// import ViewShot from 'react-native-view-shot'; // Disabled for Expo Go
import { useDreamThemes } from '../../hooks/useDreamThemes';
import { useAuthStore } from '@somni/stores';
import { DreamInterpreter } from '@somni/types';
import { supabase } from '../../lib/supabase';
import {
  interpretationService,
  Interpretation,
  InterpretationStartResponse,
} from '../../services/interpretationService';
import { notificationService } from '../../services/notificationService';
import {
  DreamDetailHeader,
  TabSelector,
  TabType,
  DreamOverviewTab,
  DreamAnalysisTab,
  DreamReflectionTab,
} from './components';

interface DreamWithImages extends Dream {
  dream_images?: DreamImage[];
}

type NavigationProps = MainStackScreenProps<'DreamDetail'>['navigation'];
type RouteProps = MainStackScreenProps<'DreamDetail'>['route'];

export const DreamDetailScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProps>();
  const route = useRoute<RouteProps>();
  const [activeTab, setActiveTab] = useState<TabType>(route.params?.initialTab || 'overview');
  const dreamStore = useDreamStore();
  // const viewShotRef = useRef<ViewShot>(null); // Disabled for Expo Go
  const viewShotRef = useRef<any>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const { profile } = useAuthStore();
  const [dreamGuide, setDreamGuide] = useState<DreamInterpreter | null>(null);
  const [guideLoading, setGuideLoading] = useState(true);
  const [guideSince, setGuideSince] = useState<string>(format(new Date(), 'MMM yyyy'));
  const [isInterpretationReady, setIsInterpretationReady] = useState(false);
  const [dreamImagesLoaded, setDreamImagesLoaded] = useState(false);
  const [interpretation, setInterpretation] = useState<Interpretation | null>(
    null,
  );
  const [interpretationLoading, setInterpretationLoading] = useState(false);
  const [interpretationJob, setInterpretationJob] =
    useState<InterpretationStartResponse | null>(null);
  const [interpretationError, setInterpretationError] = useState<string | null>(
    null,
  );
  const [guideAnalysesCount, setGuideAnalysesCount] = useState<number>(0);

  const dreamId = route.params?.dreamId;
  const [dream, setDream] = useState<DreamWithImages | null>(
    dreamId ? (dreamStore.getDreamById(dreamId) as DreamWithImages) : null,
  );

  // Call useDreamThemes at the top level
  const {
    themes,
    loading: themesLoading,
    error: themesError,
  } = useDreamThemes(dreamId);

  // Fetch dream with images when component mounts or dreamId changes
  useEffect(() => {
    const fetchDreamWithImages = async () => {
      if (!dreamId || dreamImagesLoaded) return;

      console.log('🔍 Fetching dream images for:', dreamId);

      try {
        // Fetch dream images from the database
        const { data: images, error } = await supabase
          .from('dream_images')
          .select('*')
          .eq('dream_id', dreamId)
          .order('is_primary', { ascending: false });

        if (error) {
          console.error('❌ Error fetching dream images:', error);
          return;
        }

        if (images && images.length > 0) {
          console.log('🖼️ Found dream images:', images);

          // Update the dream with its images
          setDream((prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              dream_images: images,
            };
          });

          console.log('✅ Updated dream with images:', {
            dreamId,
            imageCount: images.length,
          });
        } else {
          console.log('📷 No images found for dream:', dreamId);
        }

        setDreamImagesLoaded(true);
      } catch (error) {
        console.error('❌ Failed to fetch dream images:', error);
      }
    };

    fetchDreamWithImages();
  }, [dreamId, dreamImagesLoaded]);

  const captureViewShot = async (): Promise<string | null> => {
    // ViewShot is temporarily disabled for Expo Go compatibility
    console.warn('ViewShot capture is disabled in Expo Go');
    return null;
    
    // if (!viewShotRef.current) return null;

    // try {
    //   setIsCapturing(true);
    //   const uri = await viewShotRef.current!.capture();
    //   console.log('Captured screenshot:', uri);
    //   return uri;
    // } catch (error) {
    //   console.error('Error capturing screenshot:', error);
    //   return null;
    // } finally {
    //   setIsCapturing(false);
    // }
  };

  useEffect(() => {
    if (!dream) {
      navigation.goBack();
    }
  }, [dream, navigation]);

  useEffect(() => {
    const fetchGuideInfo = async () => {
      if (!profile?.dream_interpreter) {
        setGuideLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('interpreters')
          .select('*')
          .eq('id', profile.dream_interpreter)
          .single();

        if (error) throw error;

        console.log('🧠 Fetched interpreter:', {
          id: data.id,
          name: data.name,
          image_url: data.image_url,
          full_data: data,
        });

        setDreamGuide(data);
      } catch (error) {
        console.error('Error fetching guide:', error);
        // Fallback data for the selected guide
        const fallbackGuides: Record<string, DreamInterpreter> = {
          freud: {
            id: 'freud',
            name: 'Sigmund',
            full_name: 'Sigmund Freud',
            description:
              'Analyzes dreams as wish fulfillment and unconscious desires',
            image_url: '/storage/v1/object/public/interpreters/freud.png',
            interpretation_style: {
              approach: 'freudian',
              focus: ['wish_fulfillment', 'unconscious_desires', 'symbolism'],
            },
          },
          jung: {
            id: 'jung',
            name: 'Carl',
            full_name: 'Carl Jung',
            description:
              'Explores collective unconscious and universal archetypes in your dreams',
            image_url: '/storage/v1/object/public/interpreters/jung.png',
            interpretation_style: {
              approach: 'jungian',
              focus: ['archetypes', 'collective_unconscious', 'individuation'],
            },
          },
          lakshmi: {
            id: 'lakshmi',
            name: 'Lakshmi',
            full_name: 'Lakshmi Devi',
            description:
              'Interprets dreams through spiritual and karmic perspectives',
            image_url: '/storage/v1/object/public/interpreters/lakshmi.png',
            interpretation_style: {
              approach: 'spiritual',
              focus: ['karma', 'spiritual_growth', 'consciousness'],
            },
          },
          mary: {
            id: 'mary',
            name: 'Mary',
            full_name: 'Mary Whiton',
            description:
              'Uses modern cognitive science to understand dream meanings',
            image_url: '/storage/v1/object/public/interpreters/mary.png',
            interpretation_style: {
              approach: 'cognitive',
              focus: ['memory_processing', 'problem_solving', 'neuroscience'],
            },
          },
        };

        if (
          profile.dream_interpreter &&
          fallbackGuides[profile.dream_interpreter]
        ) {
          setDreamGuide(fallbackGuides[profile.dream_interpreter]);
        }
      } finally {
        setGuideLoading(false);
      }
    };

    fetchGuideInfo();
  }, [profile?.dream_interpreter]);

  // Update guideSince when profile is loaded
  useEffect(() => {
    if (profile?.created_at) {
      setGuideSince(format(new Date(profile.created_at), 'MMM yyyy'));
    }
  }, [profile]);

  // Count analyses by current guide
  useEffect(() => {
    const fetchGuideAnalysesCount = async () => {
      if (!profile?.dream_interpreter || !profile?.user_id) {
        console.log('⏳ Waiting for profile data...', { 
          hasDreamInterpreter: !!profile?.dream_interpreter, 
          hasUserId: !!profile?.user_id 
        });
        return;
      }

      try {
        // First get all user's dreams
        const { data: dreams } = await supabase
          .from('dreams')
          .select('id')
          .eq('user_id', profile.user_id);

        if (dreams && dreams.length > 0) {
          const dreamIds = dreams.map(d => d.id);
          
          console.log('🔍 Querying interpretations for guide:', {
            interpreter_id: profile.dream_interpreter,
            dreamIds: dreamIds.slice(0, 3) + '...' // Show first 3 IDs
          });
          
          // Then count interpretations by this guide for these dreams
          const { count, error, data } = await supabase
            .from('interpretations')
            .select('*', { count: 'exact', head: true })
            .eq('interpreter_type', profile.dream_interpreter)
            .in('dream_id', dreamIds);

          // Try alternative query if first one fails
          if (error || count === null) {
            console.log('❌ First query failed, trying alternative...');
            const { data: interpretations, error: altError } = await supabase
              .from('interpretations')
              .select('id, interpreter_type, dream_id')
              .eq('interpreter_type', profile.dream_interpreter)
              .in('dream_id', dreamIds);
              
            const altCount = interpretations?.length || 0;
            console.log('📊 Alternative query result:', {
              count: altCount,
              error: altError,
              sampleData: interpretations?.slice(0, 2)
            });
            
            setGuideAnalysesCount(altCount);
          } else {
            console.log('📊 Guide analyses count:', {
              guide: profile.dream_interpreter,
              dreamCount: dreamIds.length,
              analysesCount: count,
              error: error ? { code: error.code, message: error.message, details: error.details, hint: error.hint } : null
            });

            setGuideAnalysesCount(count || 0);
          }
        }
      } catch (error) {
        console.error('Error fetching guide analyses count:', error);
      }
    };

    fetchGuideAnalysesCount();
  }, [profile?.dream_interpreter, profile?.user_id]);

  // Check for existing interpretations
  useEffect(() => {
    const checkExistingInterpretations = async () => {
      if (!dreamId) return;

      try {
        const interpretations =
          await interpretationService.getInterpretations(dreamId);
        console.log('📋 Interpretations check:', {
          dreamId,
          count: interpretations.length,
          hasInterpretations: interpretations.length > 0
        });
        
        if (interpretations.length > 0) {
          console.log('🔍 Found interpretation:', {
            interpreterType: interpretations[0].interpreter_type,
            currentGuide: profile?.dream_interpreter,
            match: interpretations[0].interpreter_type === profile?.dream_interpreter
          });
          setInterpretation(interpretations[0]);
          setIsInterpretationReady(true);
        } else {
          console.log('❌ No interpretations found for this dream');
        }
      } catch (error) {
        console.error('Error checking interpretations:', error);
      }
    };

    checkExistingInterpretations();
  }, [dreamId]);

  // Set up real-time subscription for new interpretations
  useEffect(() => {
    if (!dreamId) return;

    const subscription = interpretationService.subscribeToInterpretation(
      dreamId,
      (newInterpretation) => {
        console.log('New interpretation received:', newInterpretation);
        setInterpretation(newInterpretation);
        setIsInterpretationReady(true);
        setInterpretationJob(null);
        setInterpretationLoading(false);

        // Show notification based on app state
        const appState = AppState.currentState;
        
        if (appState === 'background' || appState === 'inactive') {
          // App is in background - send local notification
          notificationService.scheduleLocalNotification(
            'Interpretation Ready! 🌙',
            `Your interpretation for "${dream?.title || 'your dream'}" is ready to view.`,
            {
              type: 'interpretation_ready',
              dreamId: dreamId,
              interpretationId: newInterpretation.id,
            }
          );
        } else {
          // App is in foreground - show in-app alert
          Alert.alert(
            'Interpretation Ready! 🌙',
            'Your dream interpretation is ready to view.',
            [
              { text: 'View', onPress: () => setActiveTab('analysis') },
              { text: 'Later', style: 'cancel' }
            ],
          );
        }
      },
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [dreamId]);

  // Add polling mechanism when interpretation is loading
  useEffect(() => {
    if (!interpretationLoading || !dreamId) return;

    let pollInterval: NodeJS.Timeout;
    let timeoutTimer: NodeJS.Timeout;
    let pollCount = 0;
    const MAX_POLLS = 60; // Poll for up to 2 minutes (60 * 2 seconds)

    const pollForInterpretation = async () => {
      try {
        pollCount++;
        console.log(
          `🔄 Polling for interpretation (${pollCount}/${MAX_POLLS})`,
        );

        const interpretations =
          await interpretationService.getInterpretations(dreamId);
        if (interpretations.length > 0) {
          console.log(
            '✅ Interpretation found via polling:',
            interpretations[0],
          );
          setInterpretation(interpretations[0]);
          setIsInterpretationReady(true);
          setInterpretationLoading(false);
          setInterpretationJob(null);
          clearInterval(pollInterval);
          clearTimeout(timeoutTimer);
        } else if (pollCount >= MAX_POLLS) {
          // Max polls reached
          setInterpretationLoading(false);
          setInterpretationError(
            'Your interpretation is still being processed in the background. Please use the "Check Status" button below to see if it\'s ready.',
          );
          clearInterval(pollInterval);
        }
      } catch (error) {
        console.error('Error polling for interpretation:', error);
      }
    };

    // Start polling after 5 seconds (give real-time subscription a chance first)
    const startPollingDelay = setTimeout(() => {
      pollInterval = setInterval(pollForInterpretation, 2000); // Poll every 2 seconds
    }, 5000);

    // Set a final timeout after 2 minutes
    timeoutTimer = setTimeout(() => {
      if (interpretationLoading) {
        setInterpretationLoading(false);
        setInterpretationError(
          'Interpretation is taking longer than expected. It may still be processing. Please check back later.',
        );
        Alert.alert(
          'Processing',
          'Your interpretation is still being generated. Please check back in a few moments.',
          [{ text: 'OK' }],
        );
      }
      clearInterval(pollInterval);
    }, 120000); // 2 minute final timeout

    return () => {
      clearTimeout(startPollingDelay);
      clearInterval(pollInterval);
      clearTimeout(timeoutTimer);
    };
  }, [interpretationLoading, dreamId]);

  const handleDiscussDream = () => {
    if (!dream || !profile?.dream_interpreter || !interpretation) {
      Alert.alert(
        'Not Ready',
        'Please wait for the dream analysis to complete first.',
        [{ text: 'OK' }],
      );
      return;
    }

    navigation.navigate('ConversationalAI', {
      dreamId: dream.id,
      interpreterId: profile.dream_interpreter as 'jung' | 'freud' | 'mary' | 'lakshmi',
      interpretationId: interpretation.id,
    });
  };

  const handleCheckInterpretationStatus = async () => {
    setInterpretationError(null);
    try {
      const interpretations =
        await interpretationService.getInterpretations(
          dream!.id,
        );
      if (interpretations.length > 0) {
        setInterpretation(interpretations[0]);
        setIsInterpretationReady(true);
        Alert.alert('Success', 'Interpretation found!');
      } else {
        Alert.alert(
          'Not Ready',
          'Interpretation is still being generated. Please try again in a moment.',
        );
      }
    } catch (error) {
      console.error(
        'Error checking for interpretation:',
        error,
      );
      Alert.alert(
        'Error',
        'Failed to check for interpretation.',
      );
    }
  };

  if (!dream) {
    return null;
  }

  const handleAskForInterpretation = async () => {
    if (!dream || !profile?.user_id || !profile?.dream_interpreter) {
      Alert.alert('Error', 'Missing required information. Please try again.');
      return;
    }

    try {
      setInterpretationLoading(true);
      setInterpretationError(null);

      // Check if interpretation already exists
      const existingInterpretations =
        await interpretationService.getInterpretations(dream.id);
      if (existingInterpretations.length > 0) {
        setInterpretation(existingInterpretations[0]);
        setInterpretationLoading(false);
        Alert.alert(
          'Interpretation Found',
          'An interpretation already exists for this dream.',
        );
        return;
      }

      // Start interpretation (returns immediately)
      const result = await interpretationService.startInterpretation(
        dream.id,
        profile.user_id,
        profile.dream_interpreter,
      );

      if (!result.success) {
        throw new Error(result.message || 'Failed to start interpretation');
      }

      setInterpretationJob(result);

      // Don't show alert - let the loading UI handle it
      // The real-time subscription will handle the result
    } catch (error: any) {
      console.error('Error requesting interpretation:', error);
      
      // Check if it's a timeout that might still be processing
      if (error.message?.includes('timed out') || error.message?.includes('Processing may take')) {
        // Don't treat timeout as complete failure
        setInterpretationError(
          'Your interpretation is being processed. This may take a moment. You can check the status below.'
        );
        // Keep loading state but start polling
        // Polling will handle finding the interpretation
      } else {
        setInterpretationError(error.message);
        setInterpretationLoading(false);

        if (error.message.includes('not found')) {
          Alert.alert('Error', 'This dream no longer exists.');
        } else if (error.message.includes('transcription')) {
          Alert.alert(
            'Not Ready',
            'Please wait for dream transcription to complete.',
          );
        } else {
          Alert.alert(
            'Error',
            'Failed to request interpretation. Please try again.',
          );
        }
      }
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <DreamOverviewTab
            dream={dream}
            onCaptureViewShot={captureViewShot}
            isCapturing={isCapturing}
          />
        );
      case 'analysis':
        return (
          <DreamAnalysisTab
            dream={dream}
            dreamGuide={dreamGuide}
            guideLoading={guideLoading}
            guideSince={guideSince}
            guideAnalysesCount={guideAnalysesCount}
            themes={themes}
            themesLoading={themesLoading}
            themesError={themesError}
            interpretation={interpretation}
            interpretationLoading={interpretationLoading}
            interpretationError={interpretationError}
            isInterpretationReady={isInterpretationReady}
            currentGuideId={profile?.dream_interpreter}
            onDiscussDream={handleDiscussDream}
            onAskForInterpretation={handleAskForInterpretation}
            onCheckInterpretationStatus={handleCheckInterpretationStatus}
          />
        );
      case 'reflection':
        return <DreamReflectionTab />;
      default:
        return (
          <DreamOverviewTab
            dream={dream}
            onCaptureViewShot={captureViewShot}
            isCapturing={isCapturing}
          />
        );
    }
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: darkTheme.colors.background.primary }}
    >
      <VStack style={{ flex: 1 }}>
        {/* <ViewShot
          ref={viewShotRef}
          style={{ flex: 1 }}
          options={{
            format: 'png',
            quality: 0.9,
            result: 'tmpfile',
          }}
        > */}
          <VStack
            style={{
              flex: 1,
              backgroundColor: darkTheme.colors.background.primary,
            }}
          >
            <DreamDetailHeader
              dream={dream}
              onBackPress={() => navigation.goBack()}
            />

            <Box
              style={{
                paddingHorizontal: 20,
                paddingVertical: 16,
                borderBottomWidth: 1,
                borderBottomColor: darkTheme.colors.border.primary,
              }}
            >
              <TabSelector activeTab={activeTab} onTabChange={setActiveTab} />
            </Box>

            <ScrollView
              style={{ flex: 1 }}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
            >
              {renderContent()}

              {/* Somni branding for screenshots */}
              {activeTab === 'overview' && (
                <HStack
                  style={{
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginTop: 16,
                    opacity: 0.7,
                  }}
                  space="xs"
                >
                  <Box
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: 10,
                      backgroundColor: darkTheme.colors.primary,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 12,
                        color: 'white',
                        fontWeight: 'bold',
                      }}
                    >
                      S
                    </Text>
                  </Box>
                  <Text
                    style={{
                      fontSize: 14,
                      color: darkTheme.colors.text.secondary,
                      fontWeight: '500',
                    }}
                  >
                    Somni - Dream Journal
                  </Text>
                </HStack>
              )}
            </ScrollView>
          </VStack>
        {/* </ViewShot> */}
      </VStack>
    </SafeAreaView>
  );
};