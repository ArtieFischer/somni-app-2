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
  Badge,
  BadgeText,
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

interface DreamWithImages extends Dream {
  dream_images?: DreamImage[];
}

type NavigationProps = MainStackScreenProps<'DreamDetail'>['navigation'];
type RouteProps = MainStackScreenProps<'DreamDetail'>['route'];

type TabType = 'overview' | 'analysis' | 'reflection';

interface MetricBoxProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  iconColor?: string;
}

const MetricBox: React.FC<MetricBoxProps> = ({
  icon,
  label,
  value,
  iconColor = darkTheme.colors.secondary,
}) => (
  <Card variant="elevated" marginHorizontal={0} flex={1}>
    <VStack space="sm" alignItems="center" py="$2">
      {icon}
      <Text size="xs" color="$textLight400" fontWeight="$medium">
        {label}
      </Text>
      <Text size="lg" color="$textLight100" fontWeight="$bold">
        {value}
      </Text>
    </VStack>
  </Card>
);

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
          setDream(prev => ({
            ...prev!,
            dream_images: images
          }));
          
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
      const uri = await viewShotRef.current.capture();
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

  const handleDiscussDream = () => {
    Alert.alert(
      'Coming Soon',
      'Dream discussions with your guide will be available soon!',
      [{ text: 'OK' }],
    );
  };

  const handleAskForInterpretation = () => {
    Alert.alert(
      'Interpretation Requested',
      'Your dream guide will analyze this dream and notify you when the interpretation is ready. This may take a few minutes.',
      [{ text: 'OK' }],
    );
    // In the future, this would trigger an API call to request interpretation
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
            borderRadius="$lg"
            overflow="hidden"
            bg={darkTheme.colors.background.secondary}
            aspectRatio={3 / 2}
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
          borderRadius="$lg"
          overflow="hidden"
          bg={darkTheme.colors.background.secondary}
          aspectRatio={3 / 2}
        >
          <Box
            w="$full"
            h="$full"
            bg={darkTheme.colors.background.elevated}
            justifyContent="center"
            alignItems="center"
          >
            <MaterialCommunityIcons
              name="image-filter-drama"
              size={64}
              color={darkTheme.colors.border.secondary}
            />
            <Text size="sm" color="$textLight500" mt="$2">
              Image coming soon
            </Text>
          </Box>
        </Box>
      )}
      {dream.is_lucid && (
        <Card
          variant="filled"
          bg={darkTheme.colors.primary + '20'}
          marginHorizontal={0}
        >
          <HStack space="sm" alignItems="center">
            <Ionicons
              name="sparkles"
              size={20}
              color={darkTheme.colors.primary}
            />
            <Text
              size="md"
              color={darkTheme.colors.primary}
              fontWeight="$medium"
            >
              Lucid Dream
            </Text>
          </HStack>
        </Card>
      )}
      <Card variant="elevated" marginHorizontal={0}>
        <VStack space="md">
          <HStack space="sm" alignItems="center">
            <MaterialCommunityIcons
              name="script-text-outline"
              size={20}
              color={darkTheme.colors.secondary}
            />
            <Text size="sm" color="$textLight400" fontWeight="$medium">
              DREAM TRANSCRIPT
            </Text>
          </HStack>
          <Text size="md" color="$textLight100" lineHeight="$lg">
            {dream.raw_transcript || 'No transcript available'}
          </Text>
        </VStack>
      </Card>

      <Card variant="elevated" marginHorizontal={0}>
        <VStack space="md">
          <HStack space="sm" alignItems="center">
            <MaterialCommunityIcons
              name="emoticon-outline"
              size={20}
              color={darkTheme.colors.secondary}
            />
            <Text size="sm" color="$textLight400" fontWeight="$medium">
              MOOD
            </Text>
          </HStack>
          <VStack space="sm">
            <HStack justifyContent="space-between" alignItems="center">
              <Text size="md" color="$textLight100">
                {getMoodLabel(dream.mood)}
              </Text>
              {dream.mood && (
                <Text size="sm" color={getMoodColor(dream.mood)}>
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
          <HStack space="sm" alignItems="center">
            <MaterialCommunityIcons
              name="eye-outline"
              size={20}
              color={darkTheme.colors.secondary}
            />
            <Text size="sm" color="$textLight400" fontWeight="$medium">
              CLARITY
            </Text>
          </HStack>
          <VStack space="sm">
            <HStack justifyContent="space-between" alignItems="center">
              <Text size="md" color="$textLight100">
                {dream.clarity ? `${dream.clarity}%` : 'Not set'}
              </Text>
              {dream.clarity && (
                <Text
                  size="sm"
                  color={
                    dream.clarity >= 70
                      ? darkTheme.colors.status.success
                      : darkTheme.colors.secondary
                  }
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
          <HStack space="md" alignItems="center">
            <HStack space="sm" alignItems="center" flex={1}>
              <Ionicons
                name="time-outline"
                size={20}
                color={darkTheme.colors.secondary}
              />
              <VStack>
                <Text size="xs" color="$textLight500">
                  Duration
                </Text>
                <Text size="sm" color="$textLight200">
                  {Math.floor(dream.duration / 60)}:
                  {String(dream.duration % 60).padStart(2, '0')}
                </Text>
              </VStack>
            </HStack>
            <HStack space="sm" alignItems="center" flex={1}>
              <MaterialCommunityIcons
                name="calendar-clock"
                size={20}
                color={darkTheme.colors.secondary}
              />
              <VStack>
                <Text size="xs" color="$textLight500">
                  Recorded
                </Text>
                <Text size="sm" color="$textLight200">
                  {format(new Date(dream.created_at), 'h:mm a')}
                </Text>
              </VStack>
            </HStack>
          </HStack>
        </Card>
      )}

      <VStack space="sm" mt="$4" mb="$4">
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
            w={24}
            h={24}
            borderRadius="$full"
            bg={darkTheme.colors.primary}
            justifyContent="center"
            alignItems="center"
          >
            <Text size="sm" color="white" fontWeight="$bold">
              S
            </Text>
          </Box>
          <Text size="md" color="$textLight200" fontWeight="$medium">
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
          <Text size="md" color="$textLight200" fontWeight="$medium">
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
          <Text size="md" color="$textLight200" fontWeight="$medium">
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
            <HStack space="sm" alignItems="center">
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
              <HStack space="md" alignItems="center">
                <Box
                  w={80}
                  h={80}
                  borderRadius="$full"
                  bg={darkTheme.colors.background.secondary}
                  justifyContent="center"
                  alignItems="center"
                >
                  <ActivityIndicator size="small" color={darkTheme.colors.primary} />
                </Box>
                <VStack flex={1} space="xs">
                  <Box w={100} h={20} bg="$backgroundLight200" borderRadius="$sm" opacity={0.5} />
                  <Box w={150} h={16} bg="$backgroundLight200" borderRadius="$sm" opacity={0.5} />
                  <Box w={120} h={16} bg="$backgroundLight200" borderRadius="$sm" opacity={0.5} />
                </VStack>
              </HStack>
            ) : dreamGuide ? (
              <>
                <HStack space="md" alignItems="center">
                  {/* Guide Avatar with image */}
                  <Box
                    w={80}
                    h={80}
                    borderRadius="$full"
                    overflow="hidden"
                    bg={darkTheme.colors.background.secondary}
                    borderWidth={2}
                    borderColor={darkTheme.colors.primary + '20'}
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
                        w="$full"
                        h="$full"
                        justifyContent="center"
                        alignItems="center"
                      >
                        <Text size="3xl">{getGuideEmoji(dreamGuide.id)}</Text>
                      </Box>
                    )}
                  </Box>
                  
                  {/* Guide Info */}
                  <VStack flex={1} space="xs">
                    <Text size="xl" color="$textLight100" fontWeight="$bold">
                      Dr. {dreamGuide.name}
                    </Text>
                    <HStack space="sm" alignItems="center">
                      <HStack space="xs" alignItems="center">
                        <MaterialCommunityIcons
                          name="calendar-account"
                          size={14}
                          color={darkTheme.colors.text.secondary}
                        />
                        <Text size="xs" color="$textLight400">
                          {getGuideSince()}
                        </Text>
                      </HStack>
                      <HStack space="xs" alignItems="center">
                        <MaterialCommunityIcons
                          name="thought-bubble"
                          size={14}
                          color={darkTheme.colors.text.secondary}
                        />
                        <Text size="xs" color="$textLight400">
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
            <HStack space="sm" alignItems="center">
              <MaterialCommunityIcons
                name="tag-multiple"
                size={20}
                color={darkTheme.colors.secondary}
              />
              <Text size="sm" color="$textLight400" fontWeight="$medium">
                THEMES
              </Text>
            </HStack>

            {themesLoading ? (
              <HStack space="sm" flexWrap="wrap">
                {[1, 2, 3].map((i) => (
                  <Box
                    key={i}
                    w={80}
                    h={32}
                    borderRadius="$full"
                    bg="$backgroundLight200"
                    opacity={0.5}
                  />
                ))}
              </HStack>
            ) : themesError ? (
              <Text size="sm" color="$error500">
                Failed to load themes
              </Text>
            ) : themes.length === 0 ? (
              <Text size="sm" color="$textLight500">
                No themes detected for this dream
              </Text>
            ) : (
              <VStack space="md">
                <HStack space="sm" flexWrap="wrap">
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
                        px="$3"
                        py="$2"
                        borderRadius="$full"
                        bg={
                          selectedTheme === theme.code
                            ? darkTheme.colors.secondary + '20'
                            : 'transparent'
                        }
                        borderWidth={1}
                        borderColor={darkTheme.colors.secondary}
                      >
                        <Text
                          size="sm"
                          color={darkTheme.colors.secondary}
                          fontWeight="$medium"
                        >
                          {theme.name}
                        </Text>
                      </Box>
                    </Pressable>
                  ))}
                </HStack>

                {selectedTheme && (
                  <Box
                    p="$3"
                    borderRadius="$md"
                    bg={darkTheme.colors.background.secondary}
                    borderWidth={1}
                    borderColor={darkTheme.colors.border.secondary}
                  >
                    <Text size="sm" color="$textLight300" lineHeight="$md">
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
        <Card variant="elevated" marginHorizontal={0}>
          <VStack space="md">
            <HStack space="sm" alignItems="center">
              <MaterialCommunityIcons
                name="telescope"
                size={20}
                color={darkTheme.colors.secondary}
              />
              <Text size="sm" color="$textLight400" fontWeight="$medium">
                INTERPRETATION
              </Text>
            </HStack>

            <VStack space="md">
              <Text size="sm" color="$textLight300" lineHeight="$md">
                Ask your guide for a deep interpretation of your dream. This analysis may take a few minutes, and you'll be notified when it's ready.
              </Text>
              
              <Pressable
                onPress={handleAskForInterpretation}
                disabled={!dream.raw_transcript || themes.length === 0}
                bg={(!dream.raw_transcript || themes.length === 0) ? darkTheme.colors.background.secondary : darkTheme.colors.primary}
                borderRadius="$lg"
                px="$6"
                py="$4"
                opacity={(!dream.raw_transcript || themes.length === 0) ? 0.6 : 1}
                alignItems="center"
              >
                <Text 
                  size="md" 
                  color={(!dream.raw_transcript || themes.length === 0) ? "$textLight400" : "$textLight50"}
                  fontWeight="$bold"
                >
                  Ask for Interpretation
                </Text>
              </Pressable>
            </VStack>
          </VStack>
        </Card>
      </VStack>
    );
  };

  const renderReflection = () => (
    <VStack space="lg">
      <Card variant="elevated" marginHorizontal={0}>
        <VStack space="md" alignItems="center" py="$4">
          <MaterialCommunityIcons
            name="meditation"
            size={48}
            color={darkTheme.colors.border.secondary}
          />
          <Text size="lg" color="$textLight400" textAlign="center">
            Reflection Coming Soon
          </Text>
          <Text size="sm" color="$textLight500" textAlign="center">
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
      <VStack flex={1}>
        <Box px="$5" pt="$4" pb="$2">
          <Pressable onPress={() => navigation.goBack()}>
            <HStack space="xs" alignItems="center">
              <Ionicons
                name="chevron-back"
                size={20}
                color={darkTheme.colors.primary}
              />
              <Text color={darkTheme.colors.primary} fontWeight="$medium">
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
          <VStack flex={1} bg={darkTheme.colors.background.primary}>
            <Box
              px="$5"
              pb="$4"
              pt="$2"
              borderBottomWidth={1}
              borderBottomColor={darkTheme.colors.border.primary}
            >
              <VStack space="sm">
                <HStack justifyContent="space-between" alignItems="flex-start">
                  <VStack flex={1}>
                    <Heading size="xl" color="$textLight50" numberOfLines={2}>
                      {dream.title || 'Untitled Dream'}
                    </Heading>
                  </VStack>
                  <VStack alignItems="flex-end" space="2xs" ml="$3">
                    <Text size="xs" color="$textLight400">
                      {format(new Date(dream.created_at), 'MMM d, h:mm a')}
                    </Text>
                    {dream.location_metadata && (
                      <Text size="xs" color="$textLight400">
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
              px="$5"
              py="$4"
              borderBottomWidth={1}
              borderBottomColor={darkTheme.colors.border.primary}
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
                  justifyContent="center"
                  alignItems="center"
                  space="xs"
                  mt="$4"
                  opacity={0.7}
                >
                  <Box
                    w={20}
                    h={20}
                    borderRadius="$full"
                    bg={darkTheme.colors.primary}
                    justifyContent="center"
                    alignItems="center"
                  >
                    <Text size="xs" color="white" fontWeight="$bold">
                      S
                    </Text>
                  </Box>
                  <Text size="sm" color="$textLight400" fontWeight="$medium">
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