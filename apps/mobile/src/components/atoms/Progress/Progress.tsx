import React from 'react';
import {
  Progress as GluestackProgress,
  ProgressFilledTrack,
  VStack,
  HStack,
  Text,
  Box,
} from '@gluestack-ui/themed';
import { darkTheme } from '@somni/theme';

export interface ProgressProps {
  value: number;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  colorScheme?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  showLabel?: boolean;
  label?: string;
}

export const Progress: React.FC<ProgressProps> = ({
  value,
  size = 'md',
  colorScheme = 'primary',
  showLabel = false,
  label,
}) => {
  const getTrackColor = () => {
    const colors = {
      primary: darkTheme.colors.primary,
      secondary: darkTheme.colors.secondary,
      success: darkTheme.colors.status.success,
      warning: darkTheme.colors.status.warning,
      error: darkTheme.colors.status.error,
    };
    return colors[colorScheme];
  };

  const getSizeHeight = () => {
    const sizes = {
      xs: '$0.5',
      sm: '$1',
      md: '$2',
      lg: '$3',
      xl: '$4',
    };
    return sizes[size];
  };

  return (
    <VStack space="sm" w="$full">
      {(showLabel || label) && (
        <HStack justifyContent="space-between" alignItems="center">
          {label && (
            <Text size="sm" color="$textLight200">
              {label}
            </Text>
          )}
          {showLabel && (
            <Text size="sm" color="$textLight300" fontWeight="$medium">
              {value}%
            </Text>
          )}
        </HStack>
      )}
      <GluestackProgress
        value={value}
        h={getSizeHeight()}
        bg={darkTheme.colors.background.secondary}
        borderRadius="$full"
      >
        <ProgressFilledTrack
          h={getSizeHeight()}
          bg={getTrackColor()}
          borderRadius="$full"
        />
      </GluestackProgress>
    </VStack>
  );
};

// Processing Indicator Component - for ongoing operations
export interface ProcessingIndicatorProps {
  title: string;
  subtitle?: string;
  progress?: number;
  isIndeterminate?: boolean;
}

export const ProcessingIndicator: React.FC<ProcessingIndicatorProps> = ({
  title,
  subtitle,
  progress = 0,
  isIndeterminate = false,
}) => {
  const [animatedProgress, setAnimatedProgress] = React.useState(0);

  React.useEffect(() => {
    if (isIndeterminate) {
      // Simulate indeterminate progress
      const interval = setInterval(() => {
        setAnimatedProgress((prev) => {
          if (prev >= 90) return 20;
          return prev + 10;
        });
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setAnimatedProgress(progress);
    }
  }, [isIndeterminate, progress]);

  return (
    <Box
      bg={darkTheme.colors.background.elevated}
      p="$5"
      borderRadius="$lg"
      borderWidth={1}
      borderColor={darkTheme.colors.border.primary}
    >
      <VStack space="lg">
        <VStack space="xs">
          <Text size="lg" color="$textLight50" fontWeight="$medium">
            {title}
          </Text>
          {subtitle && (
            <Text size="sm" color="$textLight400">
              {subtitle}
            </Text>
          )}
        </VStack>
        
        <Progress
          value={animatedProgress}
          colorScheme="secondary"
          showLabel={!isIndeterminate}
        />
        
        {isIndeterminate && (
          <Text size="xs" color="$textLight400" textAlign="center">
            Processing... This may take a moment
          </Text>
        )}
      </VStack>
    </Box>
  );
};

// Dream-specific processing states
export const DreamProcessingIndicator: React.FC<{
  stage: 'transcribing' | 'interpreting' | 'analyzing';
}> = ({ stage }) => {
  const stages = {
    transcribing: {
      title: 'Transcribing Dream',
      subtitle: 'Converting your voice recording to text',
      progress: 35,
    },
    interpreting: {
      title: 'Interpreting Dream',
      subtitle: 'AI is analyzing symbolic meanings',
      progress: 70,
    },
    analyzing: {
      title: 'Analyzing Patterns',
      subtitle: 'Finding connections with previous dreams',
      progress: 90,
    },
  };

  const currentStage = stages[stage];

  return (
    <ProcessingIndicator
      title={currentStage.title}
      subtitle={currentStage.subtitle}
      progress={currentStage.progress}
    />
  );
};