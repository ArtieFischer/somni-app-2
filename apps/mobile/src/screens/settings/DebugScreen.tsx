import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../hooks/useTheme';
import {
  clearAllAppCache,
  clearDreamCache,
  clearOfflineQueue,
  getCacheInfo,
  listAllStorageKeys,
} from '../../utils/clearAppCache';

export const DebugScreen = () => {
  const theme = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [cacheInfo, setCacheInfo] = useState<any>(null);
  const [storageKeys, setStorageKeys] = useState<string[]>([]);

  const loadCacheInfo = async () => {
    try {
      const info = await getCacheInfo();
      setCacheInfo(info);
      const keys = await listAllStorageKeys();
      setStorageKeys(keys);
    } catch (error) {
      console.error('Error loading cache info:', error);
    }
  };

  useEffect(() => {
    loadCacheInfo();
  }, []);

  const handleClearAllCache = () => {
    Alert.alert(
      'Clear All Cache',
      'This will clear all app data including dreams, offline queue, and sign you out. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear Everything',
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            try {
              await clearAllAppCache();
              Alert.alert('Success', 'All cache cleared. The app will restart.');
              // In a real app, you might want to restart the app here
            } catch (error) {
              Alert.alert('Error', 'Failed to clear cache');
            } finally {
              setIsLoading(false);
              loadCacheInfo();
            }
          },
        },
      ]
    );
  };

  const handleClearDreams = () => {
    Alert.alert(
      'Clear Dream Cache',
      'This will clear all locally cached dreams. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear Dreams',
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            try {
              await clearDreamCache();
              Alert.alert('Success', 'Dream cache cleared');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear dream cache');
            } finally {
              setIsLoading(false);
              loadCacheInfo();
            }
          },
        },
      ]
    );
  };

  const handleClearOfflineQueue = () => {
    Alert.alert(
      'Clear Offline Queue',
      'This will clear all pending offline recordings. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear Queue',
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            try {
              await clearOfflineQueue();
              Alert.alert('Success', 'Offline queue cleared');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear offline queue');
            } finally {
              setIsLoading(false);
              loadCacheInfo();
            }
          },
        },
      ]
    );
  };

  const styles = getStyles(theme);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>Debug Settings</Text>
          <Text style={styles.subtitle}>Cache Management</Text>
        </View>

        {isLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cache Information</Text>
          {cacheInfo && (
            <View style={styles.infoBox}>
              <Text style={styles.infoText}>
                Total Storage Keys: {cacheInfo.totalKeys}
              </Text>
              <Text style={styles.infoText}>
                Cached Dreams: {cacheInfo.dreamStoreSize}
              </Text>
              <Text style={styles.infoText}>
                Offline Queue Items: {cacheInfo.offlineQueueSize}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Clear Cache</Text>
          
          <TouchableOpacity
            style={[styles.button, styles.dangerButton]}
            onPress={handleClearAllCache}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>Clear All App Cache</Text>
            <Text style={styles.buttonSubtext}>
              Removes all data and signs you out
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.warningButton]}
            onPress={handleClearDreams}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>Clear Dream Cache</Text>
            <Text style={styles.buttonSubtext}>
              Removes all locally cached dreams
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.warningButton]}
            onPress={handleClearOfflineQueue}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>Clear Offline Queue</Text>
            <Text style={styles.buttonSubtext}>
              Removes all pending recordings
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Storage Keys</Text>
          <View style={styles.keysContainer}>
            {storageKeys.map((key, index) => (
              <Text key={index} style={styles.keyText}>
                • {key}
              </Text>
            ))}
          </View>
        </View>

        <TouchableOpacity
          style={styles.refreshButton}
          onPress={loadCacheInfo}
          disabled={isLoading}
        >
          <Text style={styles.refreshButtonText}>Refresh Info</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const getStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background.primary,
    },
    scrollView: {
      flex: 1,
    },
    header: {
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.colors.text.primary,
      marginBottom: 4,
    },
    subtitle: {
      fontSize: 16,
      color: theme.colors.text.secondary,
    },
    section: {
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.text.primary,
      marginBottom: 12,
    },
    infoBox: {
      backgroundColor: theme.colors.surface,
      padding: 16,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    infoText: {
      fontSize: 14,
      color: theme.colors.text.secondary,
      marginBottom: 4,
    },
    button: {
      padding: 16,
      borderRadius: 8,
      marginBottom: 12,
      alignItems: 'center',
    },
    dangerButton: {
      backgroundColor: theme.colors.error,
    },
    warningButton: {
      backgroundColor: theme.colors.warning || '#FF9800',
    },
    buttonText: {
      fontSize: 16,
      fontWeight: '600',
      color: '#FFFFFF',
      marginBottom: 4,
    },
    buttonSubtext: {
      fontSize: 12,
      color: 'rgba(255, 255, 255, 0.8)',
    },
    keysContainer: {
      backgroundColor: theme.colors.surface,
      padding: 16,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    keyText: {
      fontSize: 12,
      color: theme.colors.text.secondary,
      marginBottom: 4,
      fontFamily: 'monospace',
    },
    refreshButton: {
      margin: 20,
      padding: 12,
      backgroundColor: theme.colors.primary,
      borderRadius: 8,
      alignItems: 'center',
    },
    refreshButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: '#FFFFFF',
    },
    loadingOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
    },
  });