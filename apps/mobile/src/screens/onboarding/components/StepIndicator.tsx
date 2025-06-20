import React from 'react';
import { View, ViewStyle, Animated } from 'react-native';
import { useTheme } from '../../../hooks/useTheme';
import { Text } from '../../../components/atoms';
import { useTranslation } from '../../../hooks/useTranslation';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep, totalSteps }) => {
  const theme = useTheme();
  const { t } = useTranslation('onboarding');
  
  // Animation for smooth transitions
  const progressAnimation = React.useRef(new Animated.Value(0)).current;
  
  React.useEffect(() => {
    Animated.timing(progressAnimation, {
      toValue: (currentStep - 1) / (totalSteps - 1),
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [currentStep, totalSteps]);

  const styles: Record<string, ViewStyle> = {
    container: {
      paddingVertical: theme.spacing.medium,
    },
    progressContainer: {
      height: 4,
      backgroundColor: theme.colors.background.secondary,
      borderRadius: 2,
      marginBottom: theme.spacing.medium,
      overflow: 'hidden',
    },
    progressBar: {
      height: '100%',
      backgroundColor: theme.colors.primary,
      borderRadius: 2,
    },
    stepsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: theme.spacing.small,
    },
    stepWrapper: {
      alignItems: 'center',
      flex: 1,
    },
    stepDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      marginBottom: theme.spacing.xs,
    },
    stepDotActive: {
      backgroundColor: theme.colors.primary,
    },
    stepDotCompleted: {
      backgroundColor: theme.colors.secondary,
    },
    stepDotInactive: {
      backgroundColor: theme.colors.border.secondary,
    },
    stepLabel: {
      fontSize: 10,
      textAlign: 'center',
    },
  };

  const stepKeys = ['credentials', 'personal', 'interpreter', 'preferences', 'review'];

  return (
    <View style={styles.container}>
      {/* Progress bar */}
      <View style={styles.progressContainer}>
        <Animated.View
          style={[
            styles.progressBar,
            {
              width: progressAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              }),
            },
          ]}
        />
      </View>
      
      {/* Step labels */}
      <View style={styles.stepsContainer}>
        {stepKeys.map((key, index) => {
          const stepNumber = index + 1;
          const isActive = stepNumber === currentStep;
          const isCompleted = stepNumber < currentStep;
          
          return (
            <View key={key} style={styles.stepWrapper}>
              <View
                style={[
                  styles.stepDot,
                  isActive && styles.stepDotActive,
                  isCompleted && styles.stepDotCompleted,
                  !isActive && !isCompleted && styles.stepDotInactive,
                ]}
              />
              <Text
                variant="caption"
                style={[
                  styles.stepLabel,
                  {
                    color: isActive 
                      ? theme.colors.primary 
                      : isCompleted 
                        ? theme.colors.secondary 
                        : theme.colors.text.secondary,
                    fontWeight: isActive ? '600' : '400',
                  },
                ]}
              >
                {String(t(`steps.${key}`))}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};