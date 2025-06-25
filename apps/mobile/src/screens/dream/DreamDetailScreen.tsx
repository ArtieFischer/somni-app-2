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
  Image,
  Progress,
  ProgressFilledTrack,
} from '@gluestack-ui/themed';
import { darkTheme } from '@somni/theme';
import { Card, PillButton } from '../../components/atoms';
import { useNavigation, useRoute } from '@react-navigation/native';
import { MainStackScreenProps, Dream } from '@somni/types';
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

  const dreamId = route.params?.dreamId;
  const dream = dreamId ? dreamStore.getDreamById(dreamId) : null;

  // Call useDreamThemes at the top level
  const {
    themes,
    loading: themesLoading,
    error: themesError,
  } = useDreamThemes(dreamId);

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
    if (mood >= 4) return darkTheme.colors.success;
    if (mood >= 3) return darkTheme.colors.primary;
    return darkTheme.colors.secondary;
  };

  const renderOverview = () => (
    <VStack space="lg">
      {dream.image_url && (
        <Box
          borderRadius="$lg"
          overflow="hidden"
          bg={darkTheme.colors.background.secondary}
          aspectRatio={3 / 2}
        >
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
        </Box>
      )}
      {dream.image_prompt && !dream.image_url && (
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
              <Progress value={getMoodPercentage(dream.mood)} size="md">
                <ProgressFilledTrack bg={getMoodColor(dream.mood)} />
              </Progress>
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
                      ? darkTheme.colors.success
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
              <Progress value={dream.clarity} size="md">
                <ProgressFilledTrack
                  bg={
                    dream.clarity >= 70
                      ? darkTheme.colors.success
                      : dream.clarity >= 40
                        ? darkTheme.colors.primary
                        : darkTheme.colors.secondary
                  }
                />
              </Progress>
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
    return (
      <VStack space="lg">
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

        <Card variant="elevated" marginHorizontal={0}>
          <VStack space="md" alignItems="center" py="$4">
            <MaterialCommunityIcons
              name="telescope"
              size={48}
              color={darkTheme.colors.border.secondary}
            />
            <Text size="lg" color="$textLight400" textAlign="center">
              More Analysis Coming Soon
            </Text>
            <Text size="sm" color="$textLight500" textAlign="center">
              Dream interpretation will be available once your dream guide has
              reviewed your dream.
            </Text>
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
