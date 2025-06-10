import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';

// Import test components
import { AudioServiceTest } from './src/components/test/AudioServiceTest';
import { NetworkStatusTest } from './src/components/test/NetworkStatusTest';
import { DreamStoreTest } from './src/components/test/DreamStoreTest';
import { OfflineQueueTest } from './src/components/test/OfflineQueueTest';
import { UploadServiceTest } from './src/components/test/UploadServiceTest';

type TestView = 'menu' | 'audio' | 'network' | 'dreams' | 'offline' | 'upload';

const TestButton: React.FC<{
  title: string;
  onPress: () => void;
  icon?: string;
}> = ({ title, onPress, icon }) => (
  <TouchableOpacity style={styles.menuButton} onPress={onPress}>
    <Text style={styles.menuIcon}>{icon}</Text>
    <Text style={styles.menuButtonText}>{title}</Text>
  </TouchableOpacity>
);

const BackButton: React.FC<{ onPress: () => void }> = ({ onPress }) => (
  <TouchableOpacity style={styles.backButton} onPress={onPress}>
    <Text style={styles.backButtonText}>← Back to Menu</Text>
  </TouchableOpacity>
);

export default function App() {
  const [currentView, setCurrentView] = useState<TestView>('menu');

  const renderContent = () => {
    switch (currentView) {
      case 'audio':
        return (
          <View style={styles.testContainer}>
            <BackButton onPress={() => setCurrentView('menu')} />
            <AudioServiceTest />
          </View>
        );
      
      case 'dreams':
        return (
          <View style={styles.testContainer}>
            <BackButton onPress={() => setCurrentView('menu')} />
            <DreamStoreTest />
          </View>
        );

      case 'offline':
        return (
          <View style={styles.testContainer}>
            <BackButton onPress={() => setCurrentView('menu')} />
            <OfflineQueueTest />
          </View>
        );

      case 'upload':
        return (
          <View style={styles.testContainer}>
            <BackButton onPress={() => setCurrentView('menu')} />
            <UploadServiceTest />
          </View>
        );
      
      default:
        return (
          <View style={styles.menuContainer}>
            <Text style={styles.title}>🌙 Somni Test Suite</Text>
            <Text style={styles.subtitle}>Choose a component to test:</Text>
            
            <View style={styles.buttonContainer}>
              <TestButton
                title="Audio Recording"
                icon="🎤"
                onPress={() => setCurrentView('audio')}
              />
              
              <TestButton
                title="Network Status"
                icon="📶"
                onPress={() => setCurrentView('network')}
              />
              
              <TestButton
                title="Dream Store"
                icon="💭"
                onPress={() => setCurrentView('dreams')}
              />

              <TestButton
                title="Offline Queue"
                icon="📤"
                onPress={() => setCurrentView('offline')}
              />

              <TestButton
                title="Upload Service"
                icon="🚀"
                onPress={() => setCurrentView('upload')}
              />
            </View>
            
            <View style={styles.infoContainer}>
              <Text style={styles.infoTitle}>💡 Test Instructions</Text>
              <Text style={styles.infoText}>
                • Audio: Test recording with timer{'\n'}
                • Network: Test connection states{'\n'}
                • Dreams: Test Zustand store operations{'\n'}
                • Offline: Test queue management & uploads{'\n'}
                • Upload: Test progressive upload strategies{'\n'}
                • Switch between WiFi/Cellular/Airplane mode{'\n'}
                • Check console for detailed logs
              </Text>
            </View>
          </View>
        );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {renderContent()}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A2E',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  menuContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  testContainer: {
    flex: 1,
    paddingTop: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#EAEAEA',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    color: '#B0B3B8',
    marginBottom: 40,
  },
  buttonContainer: {
    gap: 20,
    marginBottom: 40,
  },
  menuButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16213E',
    padding: 20,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#4ECDC4',
  },
  menuIcon: {
    fontSize: 24,
    marginRight: 15,
  },
  menuButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#EAEAEA',
    flex: 1,
  },
  backButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#0F3460',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginHorizontal: 20,
    marginBottom: 10,
  },
  backButtonText: {
    color: '#4ECDC4',
    fontSize: 14,
    fontWeight: '600',
  },
  infoContainer: {
    backgroundColor: '#0F3460',
    padding: 20,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#4ECDC4',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4ECDC4',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    color: '#B0B3B8',
    lineHeight: 20,
  },
});

// import React, { useEffect, useState } from 'react';
// import { NavigationContainer } from '@react-navigation/native';
// import { StatusBar } from 'expo-status-bar';
// import { View, ActivityIndicator } from 'react-native';
// import AppNavigator from './src/navigation/AppNavigator';
// import { initI18n } from './src/shared/locales/i18n';
// import { useTheme } from './src/hooks/useTheme';

// export default function App() {
//   const [isI18nInitialized, setIsI18nInitialized] = useState(false);
//   const theme = useTheme();

//   useEffect(() => {
//     const initializeApp = async () => {
//       try {
//         await initI18n();
//         setIsI18nInitialized(true);
//       } catch (error) {
//         console.error('Failed to initialize app:', error);
//         // Still set to true to prevent infinite loading
//         setIsI18nInitialized(true);
//       }
//     };

//     initializeApp();
//   }, []);

//   if (!isI18nInitialized) {
//     return (
//       <View
//         style={{
//           flex: 1,
//           justifyContent: 'center',
//           alignItems: 'center',
//           backgroundColor: theme.colors.background.primary,
//         }}
//       >
//         <ActivityIndicator size="large" color={theme.colors.primary} />
//       </View>
//     );
//   }

//   return (
//     <NavigationContainer>
//       <AppNavigator />
//       <StatusBar style="auto" />
//     </NavigationContainer>
//   );
// }