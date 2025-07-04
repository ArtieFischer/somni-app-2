import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';
import { initI18n } from './src/shared/locales/i18n';
import { useTheme } from './src/hooks/useTheme';
import { GluestackProvider } from './src/providers/GluestackProvider';
import { NotificationProvider } from './src/providers/NotificationProvider';

// Import debug helpers in development
if (__DEV__) {
  import('./src/utils/debugHelpers');
}

export default function App() {
  const [isI18nInitialized, setIsI18nInitialized] = useState(false);
  const theme = useTheme();

  useEffect(() => {
    const initializeApp = async () => {
      try {
        await initI18n();
        setIsI18nInitialized(true);
      } catch (error) {
        console.error('Failed to initialize app:', error);
        // Still set to true to prevent infinite loading
        setIsI18nInitialized(true);
      }
    };

    initializeApp();
  }, []);

  if (!isI18nInitialized) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: theme.colors.background.primary,
        }}
      >
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <GluestackProvider>
      <NavigationContainer>
        <NotificationProvider>
          <AppNavigator />
          <StatusBar style="light" />
        </NotificationProvider>
      </NavigationContainer>
    </GluestackProvider>
  );
}