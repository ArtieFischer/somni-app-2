import React from 'react';
import { VStack, Text } from '@gluestack-ui/themed';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { darkTheme } from '@somni/theme';
import { Card } from '../../../components/atoms';

export const DreamReflectionTab: React.FC = () => {
  return (
    <VStack space="lg">
      <Card variant="elevated" marginHorizontal={0}>
        <VStack
          space="md"
          style={{ alignItems: 'center', paddingVertical: 16 }}
        >
          <MaterialCommunityIcons
            name="meditation"
            size={48}
            color={darkTheme.colors.border.secondary}
          />
          <Text
            style={{
              fontSize: 18,
              color: darkTheme.colors.text.secondary,
              textAlign: 'center',
            }}
          >
            Reflection Coming Soon
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: darkTheme.colors.text.secondary,
              textAlign: 'center',
            }}
          >
            Personal reflection prompts will be available after dream analysis.
          </Text>
        </VStack>
      </Card>
    </VStack>
  );
};