import React from 'react';
import { View, SafeAreaView } from 'react-native';
import { Text, Button } from '../../atoms';
import { useStyles } from './OnboardingScreenLayout.styles';

interface OnboardingScreenLayoutProps {
  title: string;
  description: string;
  children: React.ReactNode;
  onNext: () => void;
  onSkip?: () => void;
  onBack?: () => void;
  isNextDisabled?: boolean;
}

export const OnboardingScreenLayout: React.FC<OnboardingScreenLayoutProps> = ({
  title,
  description,
  children,
  onNext,
  onSkip,
  onBack,
  isNextDisabled = false,
}) => {
  const styles = useStyles();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text variant="h1" style={styles.title}>
          {title}
        </Text>
        <Text variant="body" color="secondary" style={styles.description}>
          {description}
        </Text>
      </View>
      <View style={styles.content}>{children}</View>
      <View style={styles.footer}>
        {onBack && (
          <Button
            variant="secondary"
            size="large"
            onPress={onBack}
            style={styles.backButton}
          >
            Back
          </Button>
        )}
        <Button
          variant="primary"
          size="large"
          onPress={onNext}
          disabled={isNextDisabled}
          style={onBack ? styles.nextButton : undefined}
        >
          Next
        </Button>
        {onSkip && (
          <View style={styles.skipButton}>
            <Button variant="ghost" onPress={onSkip}>
              Skip
            </Button>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};
