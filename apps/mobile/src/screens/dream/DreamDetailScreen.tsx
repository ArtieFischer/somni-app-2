import React, { useState, useEffect } from 'react';
import { ScrollView, View } from 'react-native';
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
} from '@gluestack-ui/themed';
import { darkTheme } from '@somni/theme';
import { Card, PillButton } from '../../components/atoms';
import { useNavigation, useRoute } from '@react-navigation/native';
import { MainStackScreenProps, Dream } from '@somni/types';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useDreamStore } from '@somni/stores';
import { format } from 'date-fns';

type NavigationProps = MainStackScreenProps<'DreamDetail'>['navigation'];
type RouteProps = MainStackScreenProps<'DreamDetail'>['route'];

type TabType = 'overview' | 'analysis' | 'reflection';

interface MetricBoxProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  iconColor?: string;
}

const MetricBox: React.FC<MetricBoxProps> = ({ icon, label, value, iconColor = darkTheme.colors.secondary }) => (
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
  
  const dreamId = route.params?.dreamId;
  const dream = dreamId ? dreamStore.getDreamById(dreamId) : null;

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
  
  const getMoodIcon = (mood?: number) => {
    if (!mood) return 'help-circle-outline';
    if (mood <= 2) return 'sad-outline';
    if (mood === 3) return 'happy-outline';
    return 'heart-outline';
  };
  
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
      onPress={() => setActiveTab(tab.id)}
      flex={1}
    />
  );

  const renderOverview = () => (
    <VStack space="lg">
      {/* Dream Metrics */}
      <HStack space="md">
        <MetricBox
          icon={<Ionicons name={getMoodIcon(dream.mood)} size={24} />}
          label="Mood"
          value={getMoodLabel(dream.mood)}
          iconColor={dream.mood && dream.mood >= 4 ? darkTheme.colors.success : darkTheme.colors.secondary}
        />
        <MetricBox
          icon={<MaterialCommunityIcons name="eye-outline" size={24} />}
          label="Clarity"
          value={dream.clarity ? `${dream.clarity}%` : 'Not set'}
          iconColor={dream.clarity && dream.clarity >= 70 ? darkTheme.colors.primary : darkTheme.colors.secondary}
        />
      </HStack>
      
      {/* Lucid Dream Badge */}
      {dream.is_lucid && (
        <Card variant="filled" bg={darkTheme.colors.primary + '20'} marginHorizontal={0}>
          <HStack space="sm" alignItems="center">
            <Ionicons name="sparkles" size={20} color={darkTheme.colors.primary} />
            <Text size="md" color={darkTheme.colors.primary} fontWeight="$medium">
              Lucid Dream
            </Text>
          </HStack>
        </Card>
      )}
      
      {/* Location */}
      {dream.location_metadata && (
        <Card variant="elevated" marginHorizontal={0}>
          <HStack space="sm" alignItems="center">
            <Ionicons name="location-outline" size={20} color={darkTheme.colors.secondary} />
            <VStack flex={1} space="xs">
              <Text size="sm" color="$textLight400" fontWeight="$medium">
                LOCATION
              </Text>
              <Text size="md" color="$textLight100">
                {[dream.location_metadata.city, dream.location_metadata.country]
                  .filter(Boolean)
                  .join(', ') || 'Unknown'}
              </Text>
              {dream.location_metadata.method && (
                <Text size="xs" color="$textLight500">
                  {dream.location_metadata.method === 'gps' ? 'GPS Location' : 'Manual Entry'}
                </Text>
              )}
            </VStack>
          </HStack>
        </Card>
      )}

      {/* Dream Image */}
      {dream.image_prompt && (
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

      {/* Transcript */}
      <Card variant="elevated" marginHorizontal={0}>
        <VStack space="md">
          <HStack space="sm" alignItems="center">
            <MaterialCommunityIcons name="script-text-outline" size={20} color={darkTheme.colors.secondary} />
            <Text size="sm" color="$textLight400" fontWeight="$medium">
              DREAM TRANSCRIPT
            </Text>
          </HStack>
          <Text size="md" color="$textLight100" lineHeight="$lg">
            {dream.raw_transcript || 'No transcript available'}
          </Text>
        </VStack>
      </Card>

      {/* Recording Info */}
      {dream.duration && (
        <Card variant="elevated" marginHorizontal={0}>
          <HStack space="md" alignItems="center">
            <HStack space="sm" alignItems="center" flex={1}>
              <Ionicons name="time-outline" size={20} color={darkTheme.colors.secondary} />
              <VStack>
                <Text size="xs" color="$textLight500">
                  Duration
                </Text>
                <Text size="sm" color="$textLight200">
                  {Math.floor(dream.duration / 60)}:{String(dream.duration % 60).padStart(2, '0')}
                </Text>
              </VStack>
            </HStack>
            <HStack space="sm" alignItems="center" flex={1}>
              <MaterialCommunityIcons name="calendar-clock" size={20} color={darkTheme.colors.secondary} />
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
    </VStack>
  );

  const renderAnalysis = () => (
    <VStack space="lg">
      <Card variant="elevated" marginHorizontal={0}>
        <VStack space="md" alignItems="center" py="$4">
          <MaterialCommunityIcons name="telescope" size={48} color={darkTheme.colors.border.secondary} />
          <Text size="lg" color="$textLight400" textAlign="center">
            Analysis Coming Soon
          </Text>
          <Text size="sm" color="$textLight500" textAlign="center">
            Dream analysis will be available once your dream guide has reviewed your dream.
          </Text>
        </VStack>
      </Card>
    </VStack>
  );

  const renderReflection = () => (
    <VStack space="lg">
      <Card variant="elevated" marginHorizontal={0}>
        <VStack space="md" alignItems="center" py="$4">
          <MaterialCommunityIcons name="meditation" size={48} color={darkTheme.colors.border.secondary} />
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
    <SafeAreaView style={{ flex: 1, backgroundColor: darkTheme.colors.background.primary }}>
      <VStack flex={1}>
        {/* Header */}
        <Box px="$5" py="$4" borderBottomWidth={1} borderBottomColor={darkTheme.colors.border.primary}>
          <VStack space="sm">
            <HStack justifyContent="space-between" alignItems="center">
              <Pressable onPress={() => navigation.goBack()}>
                <HStack space="xs" alignItems="center">
                  <Ionicons name="chevron-back" size={20} color={darkTheme.colors.primary} />
                  <Text color={darkTheme.colors.primary} fontWeight="$medium">
                    Back
                  </Text>
                </HStack>
              </Pressable>
              <Text size="xs" color="$textLight400">
                {format(new Date(dream.created_at), 'MMM d, h:mm a')}
              </Text>
            </HStack>
            
            <Heading size="xl" color="$textLight50" numberOfLines={2}>
              {dream.title || 'Untitled Dream'}
            </Heading>
          </VStack>
        </Box>

        {/* Tab Navigation */}
        <Box px="$5" py="$4" borderBottomWidth={1} borderBottomColor={darkTheme.colors.border.primary}>
          <HStack space="sm">
            {tabs.map(renderTabButton)}
          </HStack>
        </Box>

        {/* Content */}
        <ScrollView 
          flex={1} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        >
          {renderContent()}
        </ScrollView>
      </VStack>
    </SafeAreaView>
  );
};

