import React, { useState } from 'react';
import { ScrollView } from 'react-native';
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
import { useNavigation } from '@react-navigation/native';
import { MainStackScreenProps } from '@somni/types';
import { Ionicons } from '@expo/vector-icons';

interface DreamDetailData {
  title: string;
  date: string;
  dreamTopic: string;
  symbols: string[];
  quickTake: string;
  dreamWork: string;
  interpretation: string;
  selfReflection: string;
  imageUrl?: string;
}

interface DreamDetailScreenProps {
  dreamData: DreamDetailData;
  onBack?: () => void;
}

type NavigationProps = MainStackScreenProps<'DreamDetail'>['navigation'];

type TabType = 'overview' | 'analysis' | 'reflection';

export const DreamDetailScreen: React.FC<DreamDetailScreenProps> = ({
  dreamData,
  onBack,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const navigation = useNavigation<NavigationProps>();

  const tabs = [
    { id: 'overview' as TabType, label: 'Overview' },
    { id: 'analysis' as TabType, label: 'Analysis' },
    { id: 'reflection' as TabType, label: 'Reflection' },
  ];

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
      {/* Dream Image */}
      <Box
        borderRadius="$lg"
        overflow="hidden"
        bg={darkTheme.colors.background.secondary}
        aspectRatio={3 / 2}
      >
        {dreamData.imageUrl ? (
          <Image
            source={{ uri: dreamData.imageUrl }}
            alt={dreamData.title}
            style={{ width: '100%', height: '100%' }}
            resizeMode="cover"
          />
        ) : (
          <Box
            w="$full"
            h="$full"
            bg={darkTheme.colors.background.elevated}
            justifyContent="center"
            alignItems="center"
          >
            <Ionicons
              name="image-outline"
              size={64}
              color={darkTheme.colors.border.secondary}
            />
          </Box>
        )}
      </Box>

      {/* Dream Topic */}
      <Card variant="elevated" marginHorizontal={0}>
        <VStack space="md">
          <Text size="sm" color="$textLight400" fontWeight="$medium">
            DREAM TOPIC
          </Text>
          <Text size="lg" color="$textLight50" lineHeight="$lg">
            {dreamData.dreamTopic}
          </Text>
        </VStack>
      </Card>

      {/* Symbols */}
      <Card variant="elevated" marginHorizontal={0}>
        <VStack space="md">
          <Text size="sm" color="$textLight400" fontWeight="$medium">
            KEY SYMBOLS
          </Text>
          <HStack space="sm" flexWrap="wrap">
            {dreamData.symbols.map((symbol, index) => (
              <Badge
                key={index}
                variant="outline"
                bg={darkTheme.colors.background.secondary}
                borderColor={darkTheme.colors.secondary + '40'}
                mb="$2"
              >
                <BadgeText color="$textLight200" size="sm">
                  {symbol}
                </BadgeText>
              </Badge>
            ))}
          </HStack>
        </VStack>
      </Card>

      {/* Quick Take */}
      <Card variant="elevated" marginHorizontal={0}>
        <VStack space="md">
          <Text size="sm" color="$textLight400" fontWeight="$medium">
            QUICK TAKE
          </Text>
          <Text size="md" color="$textLight100" lineHeight="$md">
            {dreamData.quickTake}
          </Text>
        </VStack>
      </Card>
    </VStack>
  );

  const renderAnalysis = () => (
    <VStack space="lg">
      {/* Dream Work */}
      <Card variant="elevated" marginHorizontal={0}>
        <VStack space="md">
          <Text size="sm" color="$textLight400" fontWeight="$medium">
            DREAM WORK
          </Text>
          <Text size="md" color="$textLight100" lineHeight="$lg">
            {dreamData.dreamWork}
          </Text>
        </VStack>
      </Card>

      {/* Interpretation */}
      <Card variant="elevated" marginHorizontal={0}>
        <VStack space="md">
          <Text size="sm" color="$textLight400" fontWeight="$medium">
            DETAILED INTERPRETATION
          </Text>
          <Text size="md" color="$textLight100" lineHeight="$lg">
            {dreamData.interpretation}
          </Text>
        </VStack>
      </Card>
    </VStack>
  );

  const renderReflection = () => (
    <VStack space="lg">
      <Card variant="elevated" marginHorizontal={0}>
        <VStack space="md">
          <Text size="sm" color="$textLight400" fontWeight="$medium">
            SELF-REFLECTION QUESTION
          </Text>
          <Text size="md" color="$textLight100" lineHeight="$lg">
            {dreamData.selfReflection}
          </Text>
        </VStack>
      </Card>

      {/* Journal Prompt */}
      <Card variant="filled" bg={darkTheme.colors.primary + '10'}>
        <VStack space="md">
          <Text size="sm" color={darkTheme.colors.primary} fontWeight="$medium">
            JOURNAL PROMPT
          </Text>
          <Text size="md" color="$textLight200" lineHeight="$lg">
            Take a moment to reflect on the question above. Consider writing your thoughts in your dream journal to deepen your understanding of this dream's personal meaning.
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
              <Pressable onPress={() => onBack ? onBack() : navigation.goBack()}>
                <Text color={darkTheme.colors.primary} fontWeight="$medium">
                  ← Back
                </Text>
              </Pressable>
              <Text size="xs" color="$textLight400">
                {dreamData.date}
              </Text>
            </HStack>
            
            <Heading size="xl" color="$textLight50" numberOfLines={2}>
              {dreamData.title}
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

// Example usage with sample data
export const sampleDreamData: DreamDetailData = {
  title: "Flying Over Purple Mountains",
  date: "Today, 3:42 AM",
  dreamTopic: "Regressive longing for childhood and maternal comfort",
  symbols: [
    "parent's house",
    "animals",
    "fat hamster",
    "hair loss",
    "mirror",
    "mother's call"
  ],
  quickTake: "The dream reveals a regressive desire for childhood security and maternal nurturing, with a hint of castration anxiety and unresolved Oedipal conflicts.",
  dreamWork: "The dream employs mechanisms of regression, condensation, and displacement to convey the dreamer's unconscious wishes and conflicts. The enlarged parent's house serves as a backdrop for a chaotic, instinctual realm, while the mirror reflects the dreamer's emerging anxieties about virility and identity.",
  interpretation: "You, dear patient, are clearly yearning for a return to the comfort and security of childhood, symbolized by the enlarged parent's house. The presence of various animals, particularly the fat hamster that persistently follows you, suggests an unconscious desire for instinctual freedom and a regression to a more primitive, oral stage of development. The hamster, with its rounded, phallic shape, may represent a symbol of masculine potency, which you are struggling to integrate into your psyche. Your nonchalant reaction to hair loss, a classic symbol of castration anxiety, indicates a defensive mechanism to ward off feelings of inadequacy. The lineup of animals behind you, responding to your mother's call, reveals a lingering Oedipal conflict, where you feel pressured to conform to familial expectations and surrender to maternal authority. This dream, much like the case of my patient Dora, highlights the complex interplay between instinctual drives, ego formation, and the struggle for identity.",
  selfReflection: "Can you recall a recent situation where you felt overwhelmed by expectations or desires, and how did you respond to the pressure?",
  imageUrl: "https://via.placeholder.com/600x400/1a1a1a/666666?text=Dream+Image+Placeholder"
};