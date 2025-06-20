import React from 'react';
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Image,
  Pressable,
} from '@gluestack-ui/themed';
import { darkTheme } from '@somni/theme';

export interface CardProps {
  children?: React.ReactNode;
  variant?: 'elevated' | 'filled' | 'outlined';
  padding?: 'sm' | 'md' | 'lg';
  onPress?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'elevated',
  padding = 'md',
  onPress,
}) => {
  const paddingValues = {
    sm: '$3',
    md: '$5',
    lg: '$6',
  };

  const getCardStyles = () => {
    const baseStyles = {
      borderRadius: '$lg',
      overflow: 'hidden',
      padding: paddingValues[padding],
    };

    switch (variant) {
      case 'elevated':
        return {
          ...baseStyles,
          bg: darkTheme.colors.background.elevated,
          shadowColor: darkTheme.colors.primary,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 4,
        };
      case 'filled':
        return {
          ...baseStyles,
          bg: darkTheme.colors.background.secondary,
        };
      case 'outlined':
        return {
          ...baseStyles,
          bg: darkTheme.colors.background.primary,
          borderWidth: 1,
          borderColor: darkTheme.colors.border.primary,
        };
      default:
        return baseStyles;
    }
  };

  const Component = onPress ? Pressable : Box;

  return (
    <Component
      onPress={onPress}
      sx={{
        ...getCardStyles(),
        '_pressed': onPress ? {
          opacity: 0.8,
          scale: 0.98,
        } : {},
      }}
    >
      {children}
    </Component>
  );
};

// Dream Card Component - specific implementation for dreams
export interface DreamCardProps {
  title: string;
  date: string;
  preview: string;
  dreamType?: string;
  imageUri?: string;
  onPress?: () => void;
}

export const DreamCard: React.FC<DreamCardProps> = ({
  title,
  date,
  preview,
  dreamType,
  imageUri,
  onPress,
}) => {
  return (
    <Card variant="elevated" onPress={onPress}>
      {imageUri && (
        <Image
          source={{ uri: imageUri }}
          alt={title}
          h={160}
          w="$full"
          borderRadius="$md"
          mb="$4"
        />
      )}
      <VStack space="sm">
        <HStack justifyContent="space-between" alignItems="center">
          <Text size="xs" color="$textLight400">
            {date}
          </Text>
          {dreamType && (
            <Box
              bg="$primary500"
              px="$2"
              py="$1"
              borderRadius="$full"
            >
              <Text size="xs" color="$white" fontWeight="$medium">
                {dreamType}
              </Text>
            </Box>
          )}
        </HStack>
        <Heading size="md" color="$textLight50">
          {title}
        </Heading>
        <Text size="sm" color="$textLight300" numberOfLines={2}>
          {preview}
        </Text>
      </VStack>
    </Card>
  );
};

// Interpreter Card Component - for selecting dream interpreters
export interface InterpreterCardProps {
  name: string;
  avatar?: string;
  expertise: string;
  description: string;
  isSelected?: boolean;
  onPress?: () => void;
}

export const InterpreterCard: React.FC<InterpreterCardProps> = ({
  name,
  avatar,
  expertise,
  description,
  isSelected = false,
  onPress,
}) => {
  return (
    <Card 
      variant={isSelected ? 'filled' : 'outlined'} 
      onPress={onPress}
    >
      <HStack space="md" alignItems="center">
        {avatar ? (
          <Image
            source={{ uri: avatar }}
            alt={name}
            w="$16"
            h="$16"
            borderRadius="$full"
          />
        ) : (
          <Box
            w="$16"
            h="$16"
            borderRadius="$full"
            bg="$primary500"
            alignItems="center"
            justifyContent="center"
          >
            <Text size="xl" color="$white" fontWeight="$bold">
              {name.charAt(0)}
            </Text>
          </Box>
        )}
        <VStack flex={1} space="xs">
          <Heading size="sm" color="$textLight50">
            {name}
          </Heading>
          <Text size="xs" color="$primary400" fontWeight="$medium">
            {expertise}
          </Text>
          <Text size="xs" color="$textLight300" numberOfLines={2}>
            {description}
          </Text>
        </VStack>
        {isSelected && (
          <Box
            w="$6"
            h="$6"
            borderRadius="$full"
            bg="$success500"
            alignItems="center"
            justifyContent="center"
          >
            <Text size="sm" color="$white">✓</Text>
          </Box>
        )}
      </HStack>
    </Card>
  );
};