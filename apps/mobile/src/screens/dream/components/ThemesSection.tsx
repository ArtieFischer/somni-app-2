import React, { useState } from 'react';
import { Pressable } from 'react-native';
import { VStack, HStack, Box, Text } from '@gluestack-ui/themed';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { darkTheme } from '@somni/theme';
import { Card } from '../../../components/atoms';

interface Theme {
  code: string;
  name: string;
  description: string;
}

interface ThemesSectionProps {
  themes: Theme[];
  themesLoading: boolean;
  themesError: Error | null;
}

export const ThemesSection: React.FC<ThemesSectionProps> = ({
  themes,
  themesLoading,
  themesError,
}) => {
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);

  return (
    <Card variant="elevated" marginHorizontal={0}>
      <VStack space="md">
        <HStack space="sm" style={{ alignItems: 'center' }}>
          <MaterialCommunityIcons
            name="tag-multiple"
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
                  opacity: 0.5,
                }}
              />
            ))}
          </HStack>
        ) : themesError ? (
          <Text
            style={{ fontSize: 14, color: darkTheme.colors.status.error }}
          >
            Failed to load themes
          </Text>
        ) : themes.length === 0 ? (
          <Text
            style={{ fontSize: 14, color: darkTheme.colors.text.secondary }}
          >
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
                      backgroundColor:
                        selectedTheme === theme.code
                          ? darkTheme.colors.secondary + '20'
                          : 'transparent',
                      borderWidth: 1,
                      borderColor: darkTheme.colors.secondary,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 14,
                        color: darkTheme.colors.secondary,
                        fontWeight: '500',
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
                  borderColor: darkTheme.colors.border.secondary,
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    color: darkTheme.colors.text.secondary,
                    lineHeight: 20,
                  }}
                >
                  {themes.find((t) => t.code === selectedTheme)
                    ?.description || ''}
                </Text>
              </Box>
            )}
          </VStack>
        )}
      </VStack>
    </Card>
  );
};