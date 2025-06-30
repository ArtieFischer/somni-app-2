import React from 'react';
import { View } from 'react-native';
import { VStack, HStack, Text } from '@gluestack-ui/themed';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { darkTheme } from '@somni/theme';
import { Card } from '../../../components/atoms';

interface ClarityIndicatorProps {
  clarity?: number;
}

export const ClarityIndicator: React.FC<ClarityIndicatorProps> = ({ clarity }) => {
  return (
    <Card variant="elevated" marginHorizontal={0}>
      <VStack space="md">
        <HStack space="sm" style={{ alignItems: 'center' }}>
          <MaterialCommunityIcons
            name="eye-outline"
            size={20}
            color={darkTheme.colors.secondary}
          />
          <Text
            style={{
              fontSize: 12,
              color: darkTheme.colors.text.secondary,
              fontWeight: '500',
            }}
          >
            CLARITY
          </Text>
        </HStack>
        <VStack space="sm">
          <HStack
            style={{ justifyContent: 'space-between', alignItems: 'center' }}
          >
            <Text
              style={{ fontSize: 14, color: darkTheme.colors.text.primary }}
            >
              {clarity ? `${clarity}%` : 'Not set'}
            </Text>
            {clarity && (
              <Text
                style={{
                  fontSize: 14,
                  color:
                    clarity >= 70
                      ? darkTheme.colors.status.success
                      : darkTheme.colors.secondary,
                }}
              >
                {clarity >= 70
                  ? 'High'
                  : clarity >= 40
                    ? 'Medium'
                    : 'Low'}
              </Text>
            )}
          </HStack>
          {clarity && (
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
                  width: `${clarity}%`,
                  backgroundColor:
                    clarity >= 70
                      ? darkTheme.colors.status.success
                      : clarity >= 40
                        ? darkTheme.colors.primary
                        : darkTheme.colors.secondary,
                }}
              />
            </View>
          )}
        </VStack>
      </VStack>
    </Card>
  );
};