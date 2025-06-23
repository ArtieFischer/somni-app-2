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

      // Prepare the data to be saved - updated for new database structure
      const updates: any = {
        onboarding_complete: true,
        settings: {
          location_sharing: onboardingData.locationAccuracy || 'none',
          sleep_schedule: onboardingData.sleepSchedule
            ? {
                bed: onboardingData.sleepSchedule.bedtime,
                wake: onboardingData.sleepSchedule.wakeTime,
                tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
              }
            : null,
          improve_sleep_quality: onboardingData.improve_sleep_quality ? 
            (onboardingData.improve_sleep_quality === 'yes' ? true : 
             onboardingData.improve_sleep_quality === 'no' ? false : null) : null,
          interested_in_lucid_dreaming: onboardingData.interested_in_lucid_dreaming ? 
            (onboardingData.interested_in_lucid_dreaming === 'yes' ? true : 
             onboardingData.interested_in_lucid_dreaming === 'no' ? false : null) : null,
        },
        // Location fields - convert to PostGIS Point format
        location: onboardingData.location ? 
          `POINT(${onboardingData.location.lng} ${onboardingData.location.lat})` : null,
        location_accuracy: onboardingData.locationAccuracy || 'none',
        location_country: onboardingData.locationCountry || null,
        location_city: onboardingData.locationCity || null,
      };

      // Add personal info fields if they exist in onboarding data
      if (onboardingData.username || onboardingData.display_name) {
        updates.username = onboardingData.username || onboardingData.display_name;
      }
      if (onboardingData.sex) {
        updates.sex = onboardingData.sex;
      }
      if (onboardingData.birth_date || onboardingData.date_of_birth) {
        const birthDate = onboardingData.birth_date || onboardingData.date_of_birth;
        // Only set birth_date if it's not an empty string
        if (birthDate && birthDate.trim() !== '') {
          updates.birth_date = birthDate;
        }
      }
      if (onboardingData.locale || onboardingData.language) {
        updates.locale = onboardingData.locale || onboardingData.language;
      }
      if (onboardingData.dream_interpreter) {
        updates.dream_interpreter = onboardingData.dream_interpreter;
      }
      if (onboardingData.avatar_url) {
        updates.avatar_url = onboardingData.avatar_url;
      }

      // Call the repository to update the user's profile in Supabase
      // Note: user.id is now user_id in the new schema
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

          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Location Sharing:</Text>
            <Text style={styles.summaryValue}>
              {!onboardingData.locationAccuracy || onboardingData.locationAccuracy === 'none' ? 
                'Not sharing location' :
                onboardingData.locationAccuracy === 'exact' ? 'Sharing precise location' :
                onboardingData.locationAccuracy === 'city' ? `${onboardingData.locationCity}, ${onboardingData.locationCountry}` :
                onboardingData.locationAccuracy === 'country' ? onboardingData.locationCountry :
                'Not shared'}
            </Text>
          </View>
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
