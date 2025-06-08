// apps/mobile/src/navigation/AppNavigator.tsx
import React from 'react';
import { useAuthStore } from '../stores/authStore';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import { View, ActivityIndicator } from 'react-native';

export default function AppNavigator() {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const isLoading = useAuthStore(state => state.isLoading);

  if (isLoading) {
    // Show loading indicator while checking initial session
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return isAuthenticated ? <MainNavigator /> : <AuthNavigator />;
}