import React, { useState, useEffect, useRef } from 'react';
import {
  ScrollView,
  View,
  Image as RNImage,
  Alert,
  Platform,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  VStack,
  HStack,
  Box,
  Text,
  Heading,
  Pressable,
} from '@gluestack-ui/themed';
import { darkTheme } from '@somni/theme';
import { Card, PillButton } from '../../components/atoms';
import { useNavigation, useRoute } from '@react-navigation/native';
import { MainStackScreenProps, Dream, DreamImage } from '@somni/types';
import {
  Ionicons,
  MaterialCommunityIcons,
  FontAwesome5,
} from '@expo/vector-icons';
import { useDreamStore } from '@somni/stores';
import { format } from 'date-fns';
// Use mock in development, real module in production
const Share = __DEV__
  ? require('../../utils/shareMock').default
  : require('react-native-share').default;
import * as FileSystem from 'expo-file-system';
import ViewShot from 'react-native-view-shot';
import { useDreamThemes } from '../../hooks/useDreamThemes';
import { useAuthStore } from '@somni/stores';
import { DreamInterpreter } from '@somni/types';
import { supabase } from '../../lib/supabase';
import { interpretationService, Interpretation, InterpretationStartResponse } from '../../services/interpretationService';
import { InterpretationDisplay } from '../../components/organisms/InterpretationDisplay';

interface DreamWithImages extends Dream {
  dream_images?: DreamImage[];
}

type NavigationProps = MainStackScreenProps<'DreamDetail'>['navigation'];
type RouteProps = MainStackScreenProps<'DreamDetail'>['route'];

type TabType = 'overview' | 'analysis' | 'reflection';


export const DreamDetailScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const navigation = useNavigation<NavigationProps>();
  const route = useRoute<RouteProps>();
  const dreamStore = useDreamStore();
  const viewShotRef = useRef<ViewShot>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);
  const { profile } = useAuthStore();
  const [dreamGuide, setDreamGuide] = useState<DreamInterpreter | null>(null);
  const [guideLoading, setGuideLoading] = useState(true);
  const [isInterpretationReady, setIsInterpretationReady] = useState(false);
  const [dreamImagesLoaded, setDreamImagesLoaded] = useState(false);
  const [interpretation, setInterpretation] = useState<Interpretation | null>(null);
  const [interpretationLoading, setInterpretationLoading] = useState(false);
  const [interpretationJob, setInterpretationJob] = useState<InterpretationStartResponse | null>(null);
  const [loadingMessage, setLoadingMessage] = useState('Analyzing your dream...');
  const [interpretationError, setInterpretationError] = useState<string | null>(null);

  const dreamId = route.params?.dreamId;
  const [dream, setDream] = useState<DreamWithImages | null>(
    dreamId ? dreamStore.getDreamById(dreamId) as DreamWithImages : null
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
          setDream(prev => {
            if (!prev) return prev;
            return {
              ...prev,
              dream_images: images
            };
          });
          
          console.log('✅ Updated dream with images:', { dreamId, imageCount: images.length });
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

  const handleShareOnSomni = () => {
    Alert.alert(
      'Coming Soon',
      'Share on Somni will be available in the next update!',
      [{ text: 'OK' }],
    );
  };

  const captureViewShot = async (): Promise<string | null> => {
    if (!viewShotRef.current) return null;

    try {
      setIsCapturing(true);
      const uri = await viewShotRef.current!.capture();
      console.log('Captured screenshot:', uri);
      return uri;
    } catch (error) {
      console.error('Error capturing screenshot:', error);
      return null;
    } finally {
      setIsCapturing(false);
    }
  };

  const handleShareOnX = async () => {
    if (!dream) return;

    try {
      // Capture the view first
      const screenshotUri = await captureViewShot();

      if (screenshotUri) {
        // Convert screenshot to base64
        const base64 = await FileSystem.readAsStringAsync(screenshotUri, {
          encoding: FileSystem.EncodingType.Base64,
        });

        const dreamText = dream.title || 'Just had an amazing dream';
        const message = `${dreamText} #Somni #DreamJournal`;

        const shareOptions: any = {
          message: message,
          url: `data:image/png;base64,${base64}`,
          social: Share.Social.TWITTER,
          type: 'image/png',
        };

        await Share.shareSingle(shareOptions);

        // Clean up temp file
        await FileSystem.deleteAsync(screenshotUri, { idempotent: true });
      } else {
        // Fallback to text only
        const dreamText = dream.title || 'Just had an amazing dream';
        const message = `${dreamText} #Somni #DreamJournal`;

        const shareOptions: any = {
          message: message,
          social: Share.Social.TWITTER,
        };

        await Share.shareSingle(shareOptions);
      }
    } catch (error) {
      console.error('Error sharing to X:', error);

      // Fallback to web intent if the app isn't installed
      const dreamText = dream.title || 'Just had an amazing dream';
      const tweetText = `${dreamText} #Somni #DreamJournal`;
      const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;

      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        Alert.alert(
          'Unable to Share',
          'Please make sure X (Twitter) is installed on your device',
          [{ text: 'OK' }],
        );
      }
    }
  };

  const handleShareToStory = async () => {
    if (!dream) return;

    try {
      // Check if Instagram is installed first
      const isInstagramInstalled = await Share.isPackageInstalled(
        'com.instagram.android',
      ).catch(() => ({ isInstalled: false }));

      if (!isInstagramInstalled.isInstalled && Platform.OS === 'android') {
        Alert.alert(
          'Instagram Not Found',
          'Please make sure Instagram is installed on your device',
          [{ text: 'OK' }],
        );
        return;
      }

      // Capture the view screenshot
      const screenshotUri = await captureViewShot();

      if (screenshotUri) {
        // Convert screenshot to base64
        const imageBase64 = await FileSystem.readAsStringAsync(screenshotUri, {
          encoding: FileSystem.EncodingType.Base64,
        });

        const shareOptions: any = {
          social: Share.Social.INSTAGRAM_STORIES,
          appId: '1234567890', // You'll need to get a Facebook App ID
          backgroundImage: `data:image/png;base64,${imageBase64}`,
          attributionURL: 'https://somni.app', // Your app's deep link
        };

        await Share.shareSingle(shareOptions);

        // Clean up temp file
        await FileSystem.deleteAsync(screenshotUri, { idempotent: true });
      } else {
        // Fallback if screenshot fails
        Alert.alert(
          'Error',
          'Unable to capture dream details. Please try again.',
          [{ text: 'OK' }],
        );
      }
    } catch (error) {
      console.error('Error sharing to Instagram Story:', error);

      // Fallback to opening Instagram camera if sharing fails
      const instagramURL = 'instagram://story-camera';
      const canOpen = await Linking.canOpenURL(instagramURL);

      if (canOpen) {
        await Linking.openURL(instagramURL);
        Alert.alert(
          'Instagram Stories',
          'Take a screenshot of your dream to share it as a story!',
          [{ text: 'OK' }],
        );
      } else {
        Alert.alert(
          'Error',
          'Unable to share to Instagram Story. Please make sure Instagram is installed.',
          [{ text: 'OK' }],
        );
      }
    }
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
          full_data: data
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
            description: 'Analyzes dreams as wish fulfillment and unconscious desires',
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
            description: 'Explores collective unconscious and universal archetypes in your dreams',
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
            description: 'Interprets dreams through spiritual and karmic perspectives',
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
            description: 'Uses modern cognitive science to understand dream meanings',
            image_url: '/storage/v1/object/public/interpreters/mary.png',
            interpretation_style: {
              approach: 'cognitive',
              focus: ['memory_processing', 'problem_solving', 'neuroscience'],
            },
          },
        };
        
        if (profile.dream_interpreter && fallbackGuides[profile.dream_interpreter]) {
          setDreamGuide(fallbackGuides[profile.dream_interpreter]);
        }
      } finally {
        setGuideLoading(false);
      }
    };

    fetchGuideInfo();
  }, [profile?.dream_interpreter]);

  // Check for existing interpretations
  useEffect(() => {
    const checkExistingInterpretations = async () => {
      if (!dreamId) return;
      
      try {
        const interpretations = await interpretationService.getInterpretations(dreamId);
        if (interpretations.length > 0) {
          setInterpretation(interpretations[0]);
          setIsInterpretationReady(true);
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
        
        // Show notification if app is in background
        if (Platform.OS === 'ios' || Platform.OS === 'android') {
          // This would be handled by push notifications in production
          Alert.alert(
            'Interpretation Ready',
            'Your dream interpretation is ready!',
            [{ text: 'View', onPress: () => setActiveTab('analysis') }]
          );
        }
      }
    );
    
    return () => {
      subscription.unsubscribe();
    };
  }, [dreamId]);


  // Add timeout handling
  useEffect(() => {
    if (interpretationLoading) {
      const timeout = setTimeout(() => {
        setInterpretationLoading(false);
        setInterpretationError('Interpretation is taking longer than expected. Please try again.');
        Alert.alert(
          'Timeout',
          'Interpretation is taking longer than expected. Please try again.',
          [{ text: 'OK' }]
        );
      }, 30000); // 30 second timeout

      return () => clearTimeout(timeout);
    }
  }, [interpretationLoading]);

  if (!dream) {
    return null;
  }

  const tabs = [
    { id: 'overview' as TabType, label: 'Overview' },
    { id: 'analysis' as TabType, label: 'Analysis' },
    { id: 'reflection' as TabType, label: 'Reflection' },
  ];

  const getMoodLabel = (mood?: number) => {
    if (!mood) return 'Not set';
    const labels = ['Very Bad', 'Bad', 'Neutral', 'Good', 'Excellent'];
    return labels[mood - 1];
  };

  const renderTabButton = (tab: { id: TabType; label: string }) => (
    <PillButton
      key={tab.id}
      label={tab.label}
      isActive={activeTab === tab.id}
      onPress={() => {
        setActiveTab(tab.id);
        setSelectedTheme(null); // Clear selected theme when switching tabs
      }}
      flex={1}
    />
  );

  const getMoodPercentage = (mood?: number) => {
    if (!mood) return 0;
    return (mood / 5) * 100;
  };

  const getMoodColor = (mood?: number) => {
    if (!mood) return darkTheme.colors.secondary;
    if (mood >= 4) return darkTheme.colors.status.success;
    if (mood >= 3) return darkTheme.colors.primary;
    return darkTheme.colors.secondary;
  };

  const getGuideEmoji = (id?: string) => {
    switch (id) {
      case 'jung': return '🔮';
      case 'freud': return '🧠';
      case 'lakshmi': return '🕉️';
      case 'mary': return '🔬';
      default: return '✨';
    }
  };

  const getGuideSince = () => {
    // For now, use profile created date or a hardcoded date
    // In the future, this could be stored in user preferences
    if (profile?.created_at) {
      return format(new Date(profile.created_at), 'MMM yyyy');
    }
    return format(new Date(), 'MMM yyyy');
  };

  const getRandomTip = () => {
    const tips = [
      "Dreams are the mind's way of processing emotions and memories",
      "Keep a dream journal to improve dream recall",
      "Most dreams occur during REM sleep",
      "Everyone dreams, but not everyone remembers their dreams",
      "Dreams can help solve problems and boost creativity",
      "The average person has 4-6 dreams per night",
      "Dream symbols often represent emotions or experiences"
    ];
    return tips[Math.floor(Math.random() * tips.length)];
  };

  const handleDiscussDream = () => {
    Alert.alert(
      'Coming Soon',
      'Dream discussions with your guide will be available soon!',
      [{ text: 'OK' }],
    );
  };

  const handleAskForInterpretation = async () => {
    if (!dream || !profile?.user_id || !profile?.dream_interpreter) {
      Alert.alert('Error', 'Missing required information. Please try again.');
      return;
    }

    try {
      setInterpretationLoading(true);
      setInterpretationError(null);
      setLoadingMessage('Analyzing your dream...');

      // Check if interpretation already exists
      const existingInterpretations = await interpretationService.getInterpretations(dream.id);
      if (existingInterpretations.length > 0) {
        setInterpretation(existingInterpretations[0]);
        setInterpretationLoading(false);
        Alert.alert('Interpretation Found', 'An interpretation already exists for this dream.');
        return;
      }

      // Start interpretation (returns immediately)
      const result = await interpretationService.startInterpretation(
        dream.id,
        profile.user_id,
        profile.dream_interpreter
      );

      if (!result.success) {
        throw new Error(result.message || 'Failed to start interpretation');
      }

      setInterpretationJob(result);
      
      // Don't show alert - let the loading UI handle it
      // The real-time subscription will handle the result
    } catch (error: any) {
      console.error('Error requesting interpretation:', error);
      setInterpretationError(error.message);
      setInterpretationLoading(false);
      
      if (error.message.includes('not found')) {
        Alert.alert('Error', 'This dream no longer exists.');
      } else if (error.message.includes('transcription')) {
        Alert.alert('Not Ready', 'Please wait for dream transcription to complete.');
      } else {
        Alert.alert('Error', 'Failed to request interpretation. Please try again.');
      }
    }
  };


  const renderOverview = () => (
    <VStack space="lg">
      {dream.dream_images && dream.dream_images.length > 0 && dream.dream_images[0].storage_path && (() => {
        const imageUrl = dream.dream_images[0].storage_path.startsWith('http') 
          ? dream.dream_images[0].storage_path
          : supabase.storage.from('dream-images').getPublicUrl(dream.dream_images[0].storage_path).data.publicUrl;
        
        console.log('🖼️ Rendering dream image:', {
          originalPath: dream.dream_images[0].storage_path,
          publicUrl: imageUrl
        });
        
        return (
          <Box
            style={{
              borderRadius: 12,
              overflow: 'hidden',
              backgroundColor: darkTheme.colors.background.secondary,
              aspectRatio: 3 / 2
            }}
          >
            <RNImage
              source={{ uri: imageUrl }}
              style={{ width: '100%', height: '100%' }}
              resizeMode="cover"
              onError={(error) => {
                console.error('🚨 Image failed to load:', {
                  dreamId: dream.id,
                  imageUrl: imageUrl,
                  error,
                });
              }}
              onLoad={() => {
                console.log('✅ Image loaded successfully:', imageUrl);
              }}
            />
          </Box>
        );
      })()}
      {dream.image_prompt && (!dream.dream_images || dream.dream_images.length === 0) && (
        <Box
          style={{
            borderRadius: 12,
            overflow: 'hidden',
            backgroundColor: darkTheme.colors.background.secondary,
            aspectRatio: 3 / 2
          }}
        >
          <Box
            style={{
              width: '100%',
              height: '100%',
              backgroundColor: darkTheme.colors.background.elevated,
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            <MaterialCommunityIcons
              name="image-filter-drama"
              size={64}
              color={darkTheme.colors.border.secondary}
            />
            <Text style={{ fontSize: 14, color: darkTheme.colors.text.secondary, marginTop: 8 }}>
              Image coming soon
            </Text>
          </Box>
        </Box>
      )}
      {dream.is_lucid && (
        <Card
          variant="elevated"
          marginHorizontal={0}
          style={{ backgroundColor: darkTheme.colors.primary + '20' }}
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
                fontWeight: '500'
              }}
            >
              Lucid Dream
            </Text>
          </HStack>
        </Card>
      )}
      <Card variant="elevated" marginHorizontal={0}>
        <VStack space="md">
          <HStack space="sm" style={{ alignItems: 'center' }}>
            <MaterialCommunityIcons
              name="script-text-outline"
              size={20}
              color={darkTheme.colors.secondary}
            />
            <Text style={{ fontSize: 14, color: darkTheme.colors.text.secondary, fontWeight: '500' }}>
              DREAM TRANSCRIPT
            </Text>
          </HStack>
          <Text style={{ fontSize: 16, color: darkTheme.colors.text.primary, lineHeight: 24 }}>
            {dream.raw_transcript || 'No transcript available'}
          </Text>
        </VStack>
      </Card>

      <Card variant="elevated" marginHorizontal={0}>
        <VStack space="md">
          <HStack space="sm" style={{ alignItems: 'center' }}>
            <MaterialCommunityIcons
              name="emoticon-outline"
              size={20}
              color={darkTheme.colors.secondary}
            />
            <Text style={{ fontSize: 14, color: darkTheme.colors.text.secondary, fontWeight: '500' }}>
              MOOD
            </Text>
          </HStack>
          <VStack space="sm">
            <HStack style={{ justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontSize: 16, color: darkTheme.colors.text.primary }}>
                {getMoodLabel(dream.mood)}
              </Text>
              {dream.mood && (
                <Text style={{ fontSize: 14, color: getMoodColor(dream.mood) }}>
                  {dream.mood}/5
                </Text>
              )}
            </HStack>
            {dream.mood && (
              <View style={{
                height: 8,
                backgroundColor: darkTheme.colors.background.secondary,
                borderRadius: 4,
                overflow: 'hidden'
              }}>
                <View style={{
                  height: '100%',
                  width: `${getMoodPercentage(dream.mood)}%`,
                  backgroundColor: getMoodColor(dream.mood),
                }} />
              </View>
            )}
          </VStack>
        </VStack>
      </Card>

      <Card variant="elevated" marginHorizontal={0}>
        <VStack space="md">
          <HStack space="sm" style={{ alignItems: 'center' }}>
            <MaterialCommunityIcons
              name="eye-outline"
              size={20}
              color={darkTheme.colors.secondary}
            />
            <Text style={{ fontSize: 12, color: darkTheme.colors.text.secondary, fontWeight: '500' }}>
              CLARITY
            </Text>
          </HStack>
          <VStack space="sm">
            <HStack style={{ justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontSize: 16, color: darkTheme.colors.text.primary }}>
                {dream.clarity ? `${dream.clarity}%` : 'Not set'}
              </Text>
              {dream.clarity && (
                <Text
                  style={{
                    fontSize: 14,
                    color: dream.clarity >= 70
                      ? darkTheme.colors.status.success
                      : darkTheme.colors.secondary
                  }}
                >
                  {dream.clarity >= 70
                    ? 'High'
                    : dream.clarity >= 40
                      ? 'Medium'
                      : 'Low'}
                </Text>
              )}
            </HStack>
            {dream.clarity && (
              <View style={{
                height: 8,
                backgroundColor: darkTheme.colors.background.secondary,
                borderRadius: 4,
                overflow: 'hidden'
              }}>
                <View style={{
                  height: '100%',
                  width: `${dream.clarity}%`,
                  backgroundColor: dream.clarity >= 70
                    ? darkTheme.colors.status.success
                    : dream.clarity >= 40
                      ? darkTheme.colors.primary
                      : darkTheme.colors.secondary,
                }} />
              </View>
            )}
          </VStack>
        </VStack>
      </Card>
      {dream.duration && (
        <Card variant="elevated" marginHorizontal={0}>
          <HStack space="md" style={{ alignItems: 'center' }}>
            <HStack space="sm" style={{ alignItems: 'center', flex: 1 }}>
              <Ionicons
                name="time-outline"
                size={20}
                color={darkTheme.colors.secondary}
              />
              <VStack>
                <Text style={{ fontSize: 12, color: darkTheme.colors.text.secondary }}>
                  Duration
                </Text>
                <Text style={{ fontSize: 14, color: darkTheme.colors.text.secondary }}>
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
                <Text style={{ fontSize: 12, color: darkTheme.colors.text.secondary }}>
                  Recorded
                </Text>
                <Text style={{ fontSize: 14, color: darkTheme.colors.text.secondary }}>
                  {format(new Date(dream.created_at), 'h:mm a')}
                </Text>
              </VStack>
            </HStack>
          </HStack>
        </Card>
      )}

      <VStack space="sm" style={{ marginTop: 16, marginBottom: 16 }}>
        <Pressable
          onPress={handleShareOnSomni}
          style={{
            borderWidth: 1,
            borderColor: darkTheme.colors.border.secondary,
            borderRadius: 12,
            paddingHorizontal: 24,
            paddingVertical: 14,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
          }}
        >
          <Box
            style={{
              width: 24,
              height: 24,
              borderRadius: 12,
              backgroundColor: darkTheme.colors.primary,
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            <Text style={{ fontSize: 14, color: 'white', fontWeight: 'bold' }}>
              S
            </Text>
          </Box>
          <Text style={{ fontSize: 16, color: darkTheme.colors.text.secondary, fontWeight: '500' }}>
            Share on Somni
          </Text>
        </Pressable>

        <Pressable
          onPress={handleShareOnX}
          disabled={isCapturing}
          style={{
            borderWidth: 1,
            borderColor: darkTheme.colors.border.secondary,
            borderRadius: 12,
            paddingHorizontal: 24,
            paddingVertical: 14,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
            opacity: isCapturing ? 0.6 : 1,
          }}
        >
          <FontAwesome5 name="twitter" size={24} color="#1DA1F2" />
          <Text style={{ fontSize: 16, color: darkTheme.colors.text.secondary, fontWeight: '500' }}>
            {isCapturing ? 'Capturing...' : 'Share on X'}
          </Text>
        </Pressable>

        <Pressable
          onPress={handleShareToStory}
          disabled={isCapturing}
          style={{
            borderWidth: 1,
            borderColor: darkTheme.colors.border.secondary,
            borderRadius: 12,
            paddingHorizontal: 24,
            paddingVertical: 14,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
            opacity: isCapturing ? 0.6 : 1,
          }}
        >
          <FontAwesome5 name="instagram" size={24} color="#E4405F" />
          <Text style={{ fontSize: 16, color: darkTheme.colors.text.secondary, fontWeight: '500' }}>
            {isCapturing ? 'Capturing...' : 'Share on Story'}
          </Text>
        </Pressable>
      </VStack>
    </VStack>
  );

  const renderAnalysis = () => {
    console.log('Rendering analysis tab:', { guideLoading, dreamGuide, profile });
    return (
      <VStack space="lg">
        {/* Your Guide Section */}
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
                    alignItems: 'center'
                  }}
                >
                  <ActivityIndicator size="small" color={darkTheme.colors.primary} />
                </Box>
                <VStack style={{ flex: 1 }} space="xs">
                  <Box style={{ width: 100, height: 20, backgroundColor: darkTheme.colors.background.secondary, borderRadius: 4, opacity: 0.5 }} />
                  <Box style={{ width: 150, height: 16, backgroundColor: darkTheme.colors.background.secondary, borderRadius: 4, opacity: 0.5 }} />
                  <Box style={{ width: 120, height: 16, backgroundColor: darkTheme.colors.background.secondary, borderRadius: 4, opacity: 0.5 }} />
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
                      borderColor: darkTheme.colors.primary + '20'
                    }}
                  >
                    {dreamGuide.image_url ? (() => {
                      const imageUrl = dreamGuide.image_url.startsWith('http') 
                        ? dreamGuide.image_url 
                        : `https://tqwlnrlvtdsqgqpuryne.supabase.co${dreamGuide.image_url}`;
                      
                      console.log('🖼️ Rendering interpreter image:', {
                        interpreter: dreamGuide.id,
                        originalUrl: dreamGuide.image_url,
                        finalUrl: imageUrl
                      });
                      
                      return (
                        <RNImage
                          source={{ uri: imageUrl }}
                          style={{ width: '100%', height: '100%', borderRadius: 40 }}
                          resizeMode="cover"
                          onError={(error) => {
                            console.error('🚨 Interpreter image failed to load:', {
                              interpreter: dreamGuide.id,
                              url: imageUrl,
                              error
                            });
                          }}
                          onLoad={() => {
                            console.log('✅ Interpreter image loaded successfully:', imageUrl);
                          }}
                        />
                      );
                    })() : (
                      <Box
                        style={{
                          width: '100%',
                          height: '100%',
                          justifyContent: 'center',
                          alignItems: 'center'
                        }}
                      >
                        <Text style={{ fontSize: 30 }}>{getGuideEmoji(dreamGuide.id)}</Text>
                      </Box>
                    )}
                  </Box>
                  
                  {/* Guide Info */}
                  <VStack style={{ flex: 1 }} space="xs">
                    <Text style={{ fontSize: 20, color: darkTheme.colors.text.primary, fontWeight: 'bold' }}>
                      Dr. {dreamGuide.name}
                    </Text>
                    <HStack space="sm" style={{ alignItems: 'center' }}>
                      <HStack space="xs" style={{ alignItems: 'center' }}>
                        <MaterialCommunityIcons
                          name="calendar-account"
                          size={14}
                          color={darkTheme.colors.text.secondary}
                        />
                        <Text style={{ fontSize: 12, color: darkTheme.colors.text.secondary }}>
                          {getGuideSince()}
                        </Text>
                      </HStack>
                      <HStack space="xs" style={{ alignItems: 'center' }}>
                        <MaterialCommunityIcons
                          name="thought-bubble"
                          size={14}
                          color={darkTheme.colors.text.secondary}
                        />
                        <Text style={{ fontSize: 12, color: darkTheme.colors.text.secondary }}>
                          0 dreams
                        </Text>
                      </HStack>
                    </HStack>
                  </VStack>
                </HStack>
                
                {/* Discuss Button - Full Width within card */}
                <Pressable
                  onPress={handleDiscussDream}
                  disabled={!isInterpretationReady}
                  style={{
                    backgroundColor: isInterpretationReady ? darkTheme.colors.primary : darkTheme.colors.background.secondary,
                    borderRadius: 12,
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    opacity: isInterpretationReady ? 1 : 0.6,
                    alignItems: 'center',
                    marginTop: 16,
                  }}
                >
                  <Text 
                    style={{
                      fontSize: 16,
                      color: isInterpretationReady ? '#FFFFFF' : darkTheme.colors.text.secondary,
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
                </Pressable>
              </>
            ) : null}
          </VStack>
        </Card>

        {/* Themes Section */}
        <Card variant="elevated" marginHorizontal={0}>
          <VStack space="md">
            <HStack space="sm" style={{ alignItems: 'center' }}>
              <MaterialCommunityIcons
                name="tag-multiple"
                size={20}
                color={darkTheme.colors.secondary}
              />
              <Text style={{ fontSize: 14, color: darkTheme.colors.text.secondary, fontWeight: '500' }}>
                THEMES
              </Text>
            </HStack>

            {themesLoading ? (
              <HStack space="sm" style={{ flexWrap: 'wrap' }}>
                {[1, 2, 3].map((i) => (
                  <Box
                    key={i}
                    style={{
                      width: 80,
                      height: 32,
                      borderRadius: 16,
                      backgroundColor: darkTheme.colors.background.secondary,
                      opacity: 0.5
                    }}
                  />
                ))}
              </HStack>
            ) : themesError ? (
              <Text style={{ fontSize: 14, color: darkTheme.colors.status.error }}>
                Failed to load themes
              </Text>
            ) : themes.length === 0 ? (
              <Text style={{ fontSize: 14, color: darkTheme.colors.text.secondary }}>
                No themes detected for this dream
              </Text>
            ) : (
              <VStack space="md">
                <HStack space="sm" style={{ flexWrap: 'wrap' }}>
                  {themes.map((theme, index) => (
                    <Pressable
                      key={`${theme.code}-${index}`}
                      onPress={() =>
                        setSelectedTheme(
                          selectedTheme === theme.code ? null : theme.code,
                        )
                      }
                    >
                      <Box
                        style={{
                          paddingHorizontal: 12,
                          paddingVertical: 8,
                          borderRadius: 20,
                          backgroundColor: selectedTheme === theme.code
                            ? darkTheme.colors.secondary + '20'
                            : 'transparent',
                          borderWidth: 1,
                          borderColor: darkTheme.colors.secondary
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 14,
                            color: darkTheme.colors.secondary,
                            fontWeight: '500'
                          }}
                        >
                          {theme.name}
                        </Text>
                      </Box>
                    </Pressable>
                  ))}
                </HStack>

                {selectedTheme && (
                  <Box
                    style={{
                      padding: 12,
                      borderRadius: 8,
                      backgroundColor: darkTheme.colors.background.secondary,
                      borderWidth: 1,
                      borderColor: darkTheme.colors.border.secondary
                    }}
                  >
                    <Text style={{ fontSize: 14, color: darkTheme.colors.text.secondary, lineHeight: 20 }}>
                      {themes.find((t) => t.code === selectedTheme)
                        ?.description || ''}
                    </Text>
                  </Box>
                )}
              </VStack>
            )}
          </VStack>
        </Card>

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
                <Text style={{ fontSize: 14, color: darkTheme.colors.text.secondary, fontWeight: '500' }}>
                  INTERPRETATION
                </Text>
              </HStack>

              {interpretationLoading ? (
                <VStack space="md" style={{ alignItems: 'center', paddingVertical: 20 }}>
                  <ActivityIndicator size="large" color={darkTheme.colors.primary} />
                  <Text style={{ fontSize: 16, color: darkTheme.colors.text.primary, fontWeight: '600' }}>
                    {dreamGuide?.name || 'Your guide'} is analyzing your dream...
                  </Text>
                  
                  <Text style={{ fontSize: 14, color: darkTheme.colors.text.secondary }}>
                    This may take a few moments
                  </Text>
                  
                  <Text style={{ fontSize: 13, color: darkTheme.colors.text.secondary, fontStyle: 'italic', textAlign: 'center', marginTop: 8 }}>
                    💡 {getRandomTip()}
                  </Text>
                </VStack>
              ) : interpretationError ? (
                <VStack space="md">
                  <Text style={{ fontSize: 14, color: darkTheme.colors.status.error }}>
                    {interpretationError}
                  </Text>
                  <Pressable
                    onPress={handleAskForInterpretation}
                    style={{
                      backgroundColor: darkTheme.colors.primary,
                      borderRadius: 12,
                      paddingHorizontal: 24,
                      paddingVertical: 16,
                      alignItems: 'center',
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
                </VStack>
              ) : (
                <VStack space="md">
                  <Text style={{ fontSize: 14, color: darkTheme.colors.text.secondary, lineHeight: 20 }}>
                    Ask your guide for a deep interpretation of your dream. This analysis may take a few minutes, and you'll be notified when it's ready.
                  </Text>
                  
                  <Pressable
                    onPress={handleAskForInterpretation}
                    disabled={!dream.raw_transcript || themes.length === 0}
                    style={{
                      backgroundColor: (!dream.raw_transcript || themes.length === 0) ? darkTheme.colors.background.secondary : darkTheme.colors.primary,
                      borderRadius: 12,
                      paddingHorizontal: 24,
                      paddingVertical: 16,
                      opacity: (!dream.raw_transcript || themes.length === 0) ? 0.6 : 1,
                      alignItems: 'center',
                    }}
                  >
                    <Text 
                      style={{
                        fontSize: 16,
                        color: (!dream.raw_transcript || themes.length === 0) ? darkTheme.colors.text.secondary : '#FFFFFF',
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

  const renderReflection = () => (
    <VStack space="lg">
      <Card variant="elevated" marginHorizontal={0}>
        <VStack space="md" style={{ alignItems: 'center', paddingVertical: 16 }}>
          <MaterialCommunityIcons
            name="meditation"
            size={48}
            color={darkTheme.colors.border.secondary}
          />
          <Text style={{ fontSize: 18, color: darkTheme.colors.text.secondary, textAlign: 'center' }}>
            Reflection Coming Soon
          </Text>
          <Text style={{ fontSize: 14, color: darkTheme.colors.text.secondary, textAlign: 'center' }}>
            Personal reflection prompts will be available after dream analysis.
          </Text>
        </VStack>
      </Card>
    </VStack>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'analysis':
        return renderAnalysis();
      case 'reflection':
        return renderReflection();
      default:
        return renderOverview();
    }
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: darkTheme.colors.background.primary }}
    >
      <VStack style={{ flex: 1 }}>
        <Box style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 }}>
          <Pressable onPress={() => navigation.goBack()}>
            <HStack space="xs" style={{ alignItems: 'center' }}>
              <Ionicons
                name="chevron-back"
                size={20}
                color={darkTheme.colors.primary}
              />
              <Text style={{ color: darkTheme.colors.primary, fontWeight: '500' }}>
                Back
              </Text>
            </HStack>
          </Pressable>
        </Box>

        <ViewShot
          ref={viewShotRef}
          style={{ flex: 1 }}
          options={{
            format: 'png',
            quality: 0.9,
            result: 'tmpfile',
          }}
        >
          <VStack style={{ flex: 1, backgroundColor: darkTheme.colors.background.primary }}>
            <Box
              style={{
                paddingHorizontal: 20,
                paddingBottom: 16,
                paddingTop: 8,
                borderBottomWidth: 1,
                borderBottomColor: darkTheme.colors.border.primary
              }}
            >
              <VStack space="sm">
                <HStack style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <VStack style={{ flex: 1 }}>
                    <Heading style={{ fontSize: 24, color: darkTheme.colors.text.primary }} numberOfLines={2}>
                      {dream.title || 'Untitled Dream'}
                    </Heading>
                  </VStack>
                  <VStack style={{ alignItems: 'flex-end', marginLeft: 12 }} space="2xs">
                    <Text style={{ fontSize: 12, color: darkTheme.colors.text.secondary }}>
                      {format(new Date(dream.created_at), 'MMM d, h:mm a')}
                    </Text>
                    {dream.location_metadata && (
                      <Text style={{ fontSize: 12, color: darkTheme.colors.text.secondary }}>
                        in{' '}
                        {[
                          dream.location_metadata.city,
                          dream.location_metadata.country,
                        ]
                          .filter(Boolean)
                          .join(', ') || 'Unknown location'}
                      </Text>
                    )}
                  </VStack>
                </HStack>
              </VStack>
            </Box>

            <Box
              style={{
                paddingHorizontal: 20,
                paddingVertical: 16,
                borderBottomWidth: 1,
                borderBottomColor: darkTheme.colors.border.primary
              }}
            >
              <HStack space="sm">{tabs.map(renderTabButton)}</HStack>
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
                    opacity: 0.7
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
                      alignItems: 'center'
                    }}
                  >
                    <Text style={{ fontSize: 12, color: 'white', fontWeight: 'bold' }}>
                      S
                    </Text>
                  </Box>
                  <Text style={{ fontSize: 14, color: darkTheme.colors.text.secondary, fontWeight: '500' }}>
                    Somni - Dream Journal
                  </Text>
                </HStack>
              )}
            </ScrollView>
          </VStack>
        </ViewShot>
      </VStack>
    </SafeAreaView>
  );
};