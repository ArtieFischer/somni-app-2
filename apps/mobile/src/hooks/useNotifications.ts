import { useEffect, useCallback, useState } from 'react';
import { Alert, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { notificationService, areNotificationsEnabled, openNotificationSettings } from '../services/notificationService';
import { useAuth } from './useAuth';

export interface NotificationData {
  type: 'interpretation_ready' | 'reminder' | 'achievement';
  dreamId?: string;
  interpretationId?: string;
  title?: string;
  message?: string;
}

export function useNotifications() {
  const navigation = useNavigation<any>();
  const { profile } = useAuth();
  const [isEnabled, setIsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Check if notifications are enabled
  const checkNotificationStatus = useCallback(async () => {
    const enabled = await areNotificationsEnabled();
    setIsEnabled(enabled);
  }, []);

  // Initialize notifications
  useEffect(() => {
    const initializeNotifications = async () => {
      await notificationService.initialize();
      await checkNotificationStatus();
    };

    initializeNotifications();
  }, [checkNotificationStatus]);

  // Handle notification received while app is foregrounded
  useEffect(() => {
    const subscription = notificationService.addNotificationReceivedListener((notification) => {
      console.log('Notification received:', notification);
      
      const data = notification.request.content.data as NotificationData;
      
      // Handle different notification types
      if (data.type === 'interpretation_ready') {
        // Show a subtle in-app notification instead of system notification
        Alert.alert(
          'Interpretation Ready!',
          'Your dream interpretation is complete. Tap to view.',
          [
            {
              text: 'View',
              onPress: () => {
                if (data.dreamId) {
                  navigation.navigate('DreamDetail', { 
                    dreamId: data.dreamId,
                    initialTab: 'analysis'
                  });
                }
              },
            },
            { text: 'Later', style: 'cancel' },
          ]
        );
      }
    });

    return () => subscription.remove();
  }, [navigation]);

  // Handle notification response (user tapped on notification)
  useEffect(() => {
    const subscription = notificationService.addNotificationResponseListener((response) => {
      console.log('Notification tapped:', response);
      
      const data = response.notification.request.content.data as NotificationData;
      
      // Navigate based on notification type
      if (data.type === 'interpretation_ready' && data.dreamId) {
        navigation.navigate('DreamDetail', { 
          dreamId: data.dreamId,
          initialTab: 'analysis'
        });
      }
    });

    return () => subscription.remove();
  }, [navigation]);

  // Handle last notification response (app was launched from notification)
  useEffect(() => {
    const checkLastNotification = async () => {
      const lastResponse = await notificationService.getLastNotificationResponse();
      if (lastResponse) {
        const data = lastResponse.notification.request.content.data as NotificationData;
        
        if (data.type === 'interpretation_ready' && data.dreamId) {
          // Small delay to ensure navigation is ready
          setTimeout(() => {
            navigation.navigate('DreamDetail', { 
              dreamId: data.dreamId,
              initialTab: 'analysis'
            });
          }, 100);
        }
      }
    };

    checkLastNotification();
  }, [navigation]);

  // Register for push notifications
  const registerForNotifications = useCallback(async () => {
    if (!profile?.user_id) {
      console.warn('No user profile found, cannot register for notifications');
      return false;
    }

    setIsLoading(true);
    try {
      const token = await notificationService.registerForPushNotifications();
      console.log('Token received in hook:', token);
      
      if (token) {
        // Update token in user profile
        console.log('Updating token for user:', profile.user_id);
        await notificationService.updatePushTokenInProfile(profile.user_id, token);
        await checkNotificationStatus();
        
        // Show success message
        Alert.alert(
          'Notifications Enabled',
          'You will now receive notifications when your dream interpretations are ready.',
          [{ text: 'OK' }]
        );
        
        return true;
      } else {
        // Check if running in Expo Go
        const isExpoGo = await AsyncStorage.getItem('pushToken') === null && token === null;
        
        if (isExpoGo) {
          Alert.alert(
            'Expo Go Limitation',
            'Push notifications are limited in Expo Go. You can still test local notifications (like interpretation ready alerts).\n\nFor full push notification support, you need to create a development build.',
            [
              { text: 'OK', style: 'default' },
              { 
                text: 'Learn More', 
                onPress: () => {
                  // This would open documentation about development builds
                  Alert.alert(
                    'Development Build Required',
                    'To use push notifications:\n\n1. Run: npx expo prebuild\n2. Run: npx expo run:ios or npx expo run:android\n\nThis will create a custom version of your app with full notification support.',
                    [{ text: 'Got it' }]
                  );
                }
              }
            ]
          );
          
          // Still mark as "enabled" for local notifications
          await checkNotificationStatus();
          return true;
        } else {
          Alert.alert(
            'Notifications Not Available',
            Platform.OS === 'ios' 
              ? 'Please enable notifications in Settings > Somni to receive updates about your interpretations.'
              : 'Please enable notifications in Settings > Apps > Somni to receive updates about your interpretations.',
            [
              { text: 'Cancel', style: 'cancel' },
              { 
                text: 'Open Settings', 
                onPress: () => {
                  openNotificationSettings();
                }
              }
            ]
          );
          return false;
        }
      }
    } catch (error) {
      console.error('Error registering for notifications:', error);
      Alert.alert(
        'Error',
        'Failed to enable notifications. Please try again later.',
        [{ text: 'OK' }]
      );
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [profile, checkNotificationStatus]);

  // Disable notifications
  const disableNotifications = useCallback(async () => {
    if (!profile?.user_id) return;

    setIsLoading(true);
    try {
      await notificationService.clearPushToken(profile.user_id);
      await checkNotificationStatus();
      
      Alert.alert(
        'Notifications Disabled',
        'You will no longer receive push notifications.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error disabling notifications:', error);
      Alert.alert(
        'Error',
        'Failed to disable notifications. Please try again later.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  }, [profile, checkNotificationStatus]);

  // Send a test notification (for debugging)
  const sendTestNotification = useCallback(async () => {
    await notificationService.scheduleLocalNotification(
      'Test Notification',
      'This is a test notification from Somni',
      { type: 'test' as any }
    );
  }, []);

  return {
    isEnabled,
    isLoading,
    registerForNotifications,
    disableNotifications,
    sendTestNotification,
    checkNotificationStatus,
  };
}