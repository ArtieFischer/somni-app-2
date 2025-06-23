import React from 'react';
import { useAuth } from '../hooks/useAuth';
import AuthNavigator from './AuthNavigator';
import MainStackNavigator from './MainStackNavigator';
import OnboardingNavigator from './OnboardingNavigator';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useTheme } from '../hooks/useTheme';

export default function AppNavigator() {
  const { isAuthenticated, isLoading, profile } = useAuth();
  const theme = useTheme();
  const styles = useStyles(theme);

  console.log('🔍 AppNavigator state:', {
    isAuthenticated,
    isLoading,
    profile: profile ? { 
      id: profile.id || profile.user_id,
      onboarding_completed: profile.onboarding_completed,
      onboarding_complete: profile.onboarding_complete,
      full_profile: profile 
    } : null
  });

  if (isLoading) {
    console.log('⏳ Showing loading screen');
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (isAuthenticated) {
    // If the profile is loaded and onboarding is NOT complete, show the onboarding flow.
    // Check both old and new field names for backward compatibility
    const isOnboardingComplete = profile?.onboarding_completed || profile?.onboarding_complete;
    if (profile && !isOnboardingComplete) {
      console.log('🎯 Showing onboarding flow');
      return <OnboardingNavigator />;
    }
    // Otherwise, show the main app.
    console.log('🏠 Showing main app');
    return <MainStackNavigator />;
  }

  // If not authenticated, show the auth flow.
  console.log('🔐 Showing auth flow');
  return <AuthNavigator />;
}

// Create styles using theme parameter
const useStyles = (theme: any) => {
  return StyleSheet.create({
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.background.primary,
    },
  });
};
