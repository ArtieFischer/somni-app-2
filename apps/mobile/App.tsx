// apps/mobile/App.tsx
import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';
import { useAuthStore } from './src/stores/authStore';
import { StatusBar } from 'expo-status-bar';

export default function App() {
  // Initialize the auth store listener when the app loads
  useEffect(() => {
    useAuthStore.getState().initialize();
  }, []);

  return (
    <NavigationContainer>
      <AppNavigator />
      <StatusBar style="auto" />
    </NavigationContainer>
  );
}