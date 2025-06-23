import React from 'react';
import { Pressable, Text } from '../ui';
import { darkTheme } from '@somni/theme';

interface PillButtonProps {
  label: string;
  isActive: boolean;
  onPress: () => void;
  flex?: number;
}

export const PillButton: React.FC<PillButtonProps> = ({
  label,
  isActive,
  onPress,
  flex,
}) => {
  return (
    <Pressable
      flex={flex}
      onPress={onPress}
      bg={isActive ? darkTheme.colors.primary + '20' : darkTheme.colors.background.elevated}
      borderWidth={1}
      borderColor={isActive ? darkTheme.colors.primary : 'transparent'}
      borderRadius="$full"
      px="$4"
      py="$2"
      alignItems="center"
    >
      <Text
        size="sm"
        fontWeight={isActive ? '$semibold' : '$normal'}
        color={isActive ? darkTheme.colors.primary : darkTheme.colors.text.primary}
      >
        {label}
      </Text>
    </Pressable>
  );
};