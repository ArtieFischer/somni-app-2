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
    profile: profile ? { id: profile.id, onboarding_completed: profile.onboarding_completed } : null
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
    if (profile && !profile.onboarding_completed) {
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
