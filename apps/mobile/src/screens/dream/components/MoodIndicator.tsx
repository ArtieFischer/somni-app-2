import React from 'react';
import { View } from 'react-native';
import { VStack, HStack, Text } from '@gluestack-ui/themed';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { darkTheme } from '@somni/theme';
import { Card } from '../../../components/atoms';

interface MoodIndicatorProps {
  mood?: number;
}

export const MoodIndicator: React.FC<MoodIndicatorProps> = ({ mood }) => {
  const getMoodLabel = (mood?: number) => {
    if (!mood) return 'Not set';
    const labels = ['Very Bad', 'Bad', 'Neutral', 'Good', 'Excellent'];
    return labels[mood - 1];
  };

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

  return (
    <Card variant="elevated" marginHorizontal={0}>
      <VStack space="md">
        <HStack space="sm" style={{ alignItems: 'center' }}>
          <MaterialCommunityIcons
            name="emoticon-outline"
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
            MOOD
          </Text>
        </HStack>
        <VStack space="sm">
          <HStack
            style={{ justifyContent: 'space-between', alignItems: 'center' }}
          >
            <Text
              style={{ fontSize: 16, color: darkTheme.colors.text.primary }}
            >
              {getMoodLabel(mood)}
            </Text>
            {mood && (
              <Text style={{ fontSize: 14, color: getMoodColor(mood) }}>
                {mood}/5
              </Text>
            )}
          </HStack>
          {mood && (
            <View
              style={{
                height: 8,
                backgroundColor: darkTheme.colors.background.secondary,
                borderRadius: 4,
                overflow: 'hidden',
              }}
            >
              <View
                style={{
                  height: '100%',
                  width: `${getMoodPercentage(mood)}%`,
                  backgroundColor: getMoodColor(mood),
                }}
              />
            </View>
          )}
        </VStack>
      </VStack>
    </Card>
  );
};