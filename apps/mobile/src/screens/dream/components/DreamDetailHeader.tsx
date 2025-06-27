import React from 'react';
import { Pressable } from 'react-native';
import { VStack, HStack, Box, Text, Heading } from '@gluestack-ui/themed';
import { Ionicons } from '@expo/vector-icons';
import { darkTheme } from '@somni/theme';
import { Dream } from '@somni/types';
import { format } from 'date-fns';

interface DreamDetailHeaderProps {
  dream: Dream;
  onBackPress: () => void;
}

export const DreamDetailHeader: React.FC<DreamDetailHeaderProps> = ({
  dream,
  onBackPress,
}) => {
  return (
    <VStack>
      <Box style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 }}>
        <Pressable onPress={onBackPress}>
          <HStack space="xs" style={{ alignItems: 'center' }}>
            <Ionicons
              name="chevron-back"
              size={20}
              color={darkTheme.colors.primary}
            />
            <Text
              style={{ color: darkTheme.colors.primary, fontWeight: '500' }}
            >
              Back
            </Text>
          </HStack>
        </Pressable>
      </Box>

      <Box
        style={{
          paddingHorizontal: 20,
          paddingBottom: 16,
          paddingTop: 8,
          borderBottomWidth: 1,
          borderBottomColor: darkTheme.colors.border.primary,
        }}
      >
        <VStack space="sm">
          <HStack
            style={{
              justifyContent: 'space-between',
              alignItems: 'flex-start',
            }}
          >
            <VStack style={{ flex: 1 }}>
              <Heading
                style={{
                  fontSize: 24,
                  color: darkTheme.colors.text.primary,
                }}
                numberOfLines={2}
              >
                {dream.title || 'Untitled Dream'}
              </Heading>
            </VStack>
            <VStack
              style={{ alignItems: 'flex-end', marginLeft: 12 }}
              space="2xs"
            >
              <Text
                style={{
                  fontSize: 12,
                  color: darkTheme.colors.text.secondary,
                }}
              >
                {format(new Date(dream.created_at), 'MMM d, h:mm a')}
              </Text>
              {dream.location_metadata && (
                <Text
                  style={{
                    fontSize: 12,
                    color: darkTheme.colors.text.secondary,
                  }}
                >
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
    </VStack>
  );
};