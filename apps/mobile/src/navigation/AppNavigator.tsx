import React from 'react';
import { useAuth } from '../hooks/useAuth';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import OnboardingNavigator from './OnboardingNavigator';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useTheme } from '../hooks/useTheme';

export default function AppNavigator() {
  const { isAuthenticated, isLoading, profile } = useAuth();
  const theme = useTheme();
  const styles = useStyles(theme);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (isAuthenticated) {
    // If the profile is loaded and onboarding is NOT complete, show the onboarding flow.
    if (profile && !profile.onboarding_completed) {
      return <OnboardingNavigator />;
    }
    // Otherwise, show the main app.
    return <MainNavigator />;
  }

  // If not authenticated, show the auth flow.
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
