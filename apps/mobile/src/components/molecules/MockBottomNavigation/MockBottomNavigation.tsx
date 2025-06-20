import React from 'react';
import { Box, HStack, VStack, Text, Pressable } from '@gluestack-ui/themed';
import { darkTheme } from '@somni/theme';

interface TabItem {
  id: string;
  label: string;
  icon: string;
}

interface MockBottomNavigationProps {
  activeTab?: string;
  onTabPress?: (tabId: string) => void;
}

export const MockBottomNavigation: React.FC<MockBottomNavigationProps> = ({
  activeTab = 'record',
  onTabPress,
}) => {
  const tabs: TabItem[] = [
    { id: 'feed', label: 'Feed', icon: '📱' },
    { id: 'diary', label: 'Diary', icon: '📖' },
    { id: 'record', label: 'Record', icon: '🎙️' },
    { id: 'analysis', label: 'Analysis', icon: '📊' },
    { id: 'profile', label: 'Profile', icon: '👤' },
  ];

  return (
    <Box
      position="absolute"
      bottom={0}
      left={0}
      right={0}
      bg={darkTheme.colors.background.elevated}
      borderTopWidth={1}
      borderTopColor={darkTheme.colors.border.primary}
      pt="$2"
      pb="$6"
      px="$2"
    >
      <HStack justifyContent="space-around" alignItems="center">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const isRecord = tab.id === 'record';
          
          return (
            <Pressable
              key={tab.id}
              onPress={() => onTabPress?.(tab.id)}
              flex={1}
              alignItems="center"
            >
              {isRecord ? (
                <Box
                  w="$16"
                  h="$16"
                  borderRadius="$full"
                  bg={darkTheme.colors.secondary}
                  alignItems="center"
                  justifyContent="center"
                  mt="$-8"
                  shadowColor={darkTheme.colors.secondary}
                  shadowOffset={{ width: 0, height: 4 }}
                  shadowOpacity={0.3}
                  shadowRadius={8}
                  elevation={8}
                >
                  <Text size="2xl">{tab.icon}</Text>
                </Box>
              ) : (
                <VStack space="xs" alignItems="center" py="$2">
                  <Text
                    size="xl"
                    color={isActive ? darkTheme.colors.secondary : '$textLight400'}
                  >
                    {tab.icon}
                  </Text>
                  <Text
                    size="xs"
                    color={isActive ? darkTheme.colors.secondary : '$textLight400'}
                    fontWeight={isActive ? '$medium' : '$normal'}
                  >
                    {tab.label}
                  </Text>
                </VStack>
              )}
            </Pressable>
          );
        })}
      </HStack>
    </Box>
  );
};