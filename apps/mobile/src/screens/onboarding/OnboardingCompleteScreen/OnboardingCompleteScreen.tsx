import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { OnboardingScreenLayout } from '../../../components/organisms/OnboardingScreenLayout';
import { useOnboardingStore, useAuthStore } from '@somni/stores';
import { useAuth } from '../../../hooks/useAuth';
import { UserRepository } from '../../../infrastructure/repositories/UserRepository';
import { useTheme } from '../../../hooks/useTheme';
import { useNavigation } from '@react-navigation/native';
import { Theme } from '@somni/theme';

const userRepository = new UserRepository();

export const OnboardingCompleteScreen = () => {
  const theme = useTheme();
  const styles = useStyles(theme);
  const navigation = useNavigation<any>();
  const { data: onboardingData, reset: resetOnboardingStore } =
    useOnboardingStore();
  const { user, profile, session } = useAuth();
  const { setProfile } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  const handleFinish = async () => {
    if (!user || !profile || !session) {
      Alert.alert(
        'Error',
        'User session not found. Please try logging in again.',
      );
      return;
    }

    try {
      setIsLoading(true);

      // Prepare the data to be saved
      const updates = {
        onboarding_completed: true,
        sleep_schedule: onboardingData.sleepSchedule
          ? {
              bedtime: onboardingData.sleepSchedule.bedtime,
              wake_time: onboardingData.sleepSchedule.wakeTime,
            }
          : undefined,
        lucid_dream_settings: {
          goals: onboardingData.dreamGoals,
          experience: onboardingData.lucidityExperience,
          privacy: onboardingData.privacy,
        },
      };

      // Call the repository to update the user's profile in Supabase
      const updatedProfile = await userRepository.update(user.id, updates);

      // Update the local state in the authStore to trigger navigation
      setProfile(updatedProfile);

      // Clean up the temporary onboarding store
      resetOnboardingStore();
    } catch (error) {
      console.error('Failed to save onboarding data:', error);
      Alert.alert(
        'Error',
        'Could not save your preferences. Please try again.',
      );
      setIsLoading(false);
    }
  };
  
  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <OnboardingScreenLayout
      title="Welcome to Somni!"
      description="You're all set! Let's start your journey to better dream experiences."
      onNext={handleFinish}
      onBack={handleBack}
      isNextDisabled={isLoading}
    >
      <View style={styles.container}>
        <View style={styles.summaryContainer}>
          <Text style={styles.summaryTitle}>Your Setup:</Text>

          {onboardingData.sleepSchedule && (
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Sleep Schedule:</Text>
              <Text style={styles.summaryValue}>
                {onboardingData.sleepSchedule.bedtime} -{' '}
                {onboardingData.sleepSchedule.wakeTime}
              </Text>
            </View>
          )}

          {onboardingData.dreamGoals && (
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Goals:</Text>
              <Text style={styles.summaryValue}>
                {onboardingData.dreamGoals.join(', ')}
              </Text>
            </View>
          )}

          {onboardingData.lucidityExperience && (
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Experience:</Text>
              <Text style={styles.summaryValue}>
                {onboardingData.lucidityExperience}
              </Text>
            </View>
          )}

          {onboardingData.privacy && (
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Privacy:</Text>
              <Text style={styles.summaryValue}>
                {onboardingData.privacy.defaultVisibility}
              </Text>
            </View>
          )}
        </View>
      </View>
    </OnboardingScreenLayout>
  );
};

const useStyles = (theme: Theme) => {
  return StyleSheet.create({
    container: {
      flex: 1,
      paddingTop: theme.spacing.large,
    },
    summaryContainer: {
      backgroundColor: theme.colors.background.secondary,
      borderRadius: theme.borderRadius.medium,
      padding: theme.spacing.medium,
      marginBottom: theme.spacing.large,
    },
    summaryTitle: {
      fontSize: theme.typography.h3.fontSize,
      fontWeight: '600' as any,
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.medium,
    },
    summaryItem: {
      marginBottom: theme.spacing.small,
    },
    summaryLabel: {
      fontSize: theme.typography.body.fontSize,
      fontWeight: '500' as any,
      color: theme.colors.text.secondary,
      marginBottom: 2,
    },
    summaryValue: {
      fontSize: theme.typography.body.fontSize,
      fontWeight: '400' as any,
      color: theme.colors.text.primary,
    },
  });
};
