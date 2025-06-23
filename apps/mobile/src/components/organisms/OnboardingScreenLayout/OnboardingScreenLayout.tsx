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
  backButtonVariant?: 'primary' | 'secondary' | 'ghost';
}

export const OnboardingScreenLayout: React.FC<OnboardingScreenLayoutProps> = ({
  title,
  description,
  children,
  onNext,
  onSkip,
  onBack,
  isNextDisabled = false,
  backButtonVariant = 'ghost',
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
          <View style={styles.backButton}>
            <Button
              variant="ghost"
              size="large"
              onPress={onBack}
            >
              Back
            </Button>
          </View>
        )}
        <View style={onBack ? styles.nextButton : { flex: 1 }}>
          <Button
            variant="primary"
            size="large"
            onPress={onNext}
            disabled={isNextDisabled}
          >
            Next
          </Button>
        </View>
        {onSkip && (
          <View style={styles.skipButton}>
            <Button variant="ghost" size="medium" onPress={onSkip}>
              Skip
            </Button>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};
