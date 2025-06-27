import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export interface NotificationService {
  initialize(): Promise<void>;
  registerForPushNotifications(): Promise<string | null>;
  scheduleLocalNotification(title: string, body: string, data?: any): Promise<string>;
  addNotificationReceivedListener(handler: (notification: Notifications.Notification) => void): Notifications.EventSubscription;
  addNotificationResponseListener(handler: (response: Notifications.NotificationResponse) => void): Notifications.EventSubscription;
  getLastNotificationResponse(): Promise<Notifications.NotificationResponse | null>;
  updatePushTokenInProfile(userId: string, token: string): Promise<void>;
  clearPushToken(userId: string): Promise<void>;
}

class NotificationServiceImpl implements NotificationService {
  private pushToken: string | null = null;
  private notificationListeners: Notifications.EventSubscription[] = [];

  async initialize(): Promise<void> {
    // Set up notification channels for Android
    if (Platform.OS === 'android') {
      await this.setupAndroidChannels();
    }

    // Check if we already have a stored push token
    const storedToken = await AsyncStorage.getItem('pushToken');
    if (storedToken) {
      this.pushToken = storedToken;
    }
  }

  private async setupAndroidChannels(): Promise<void> {
    // Default channel for general notifications
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Default Notifications',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
      sound: 'default',
    });

    // Channel specifically for interpretation notifications
    await Notifications.setNotificationChannelAsync('interpretations', {
      name: 'Dream Interpretations',
      description: 'Notifications when your dream interpretations are ready',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#8B5CF6',
      sound: 'default',
    });
  }

  async registerForPushNotifications(): Promise<string | null> {
    // Check if running in Expo Go
    const isExpoGo = Constants.appOwnership === 'expo';
    
    if (isExpoGo) {
      console.log('⚠️ Running in Expo Go - Push notifications are limited');
      console.log('💡 For full push notification support, create a development build');
      // Continue anyway for testing local notifications
    }
    
    // Push notifications only work on physical devices
    if (!Device.isDevice) {
      console.log('Push notifications only work on physical devices');
      return null;
    }

    try {
      // Check existing permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      console.log('Current notification permission status:', existingStatus);
      let finalStatus = existingStatus;

      // Request permissions if not already granted
      if (existingStatus !== 'granted') {
        console.log('Requesting notification permissions...');
        const { status } = await Notifications.requestPermissionsAsync({
          ios: {
            allowAlert: true,
            allowBadge: true,
            allowSound: true,
            allowProvisional: false,
          },
        });
        finalStatus = status;
        console.log('Permission request result:', finalStatus);
      }

      if (finalStatus !== 'granted') {
        console.log('Notification permissions denied. Status:', finalStatus);
        return null;
      }

      // Get project ID from Constants
      const projectId = Constants?.expoConfig?.extra?.eas?.projectId || Constants?.easConfig?.projectId;
      
      if (!projectId) {
        console.error('Project ID not found. Please ensure your app.json contains extra.eas.projectId');
        return null;
      }

      // Get Expo push token
      console.log('Getting Expo push token with projectId:', projectId);
      
      try {
        const tokenResponse = await Notifications.getExpoPushTokenAsync({
          projectId,
        });

        this.pushToken = tokenResponse.data;
        console.log('Token received:', this.pushToken);

        // Store token locally
        await AsyncStorage.setItem('pushToken', this.pushToken);

        console.log('Push token registered:', this.pushToken);
        return this.pushToken;
      } catch (tokenError) {
        if (isExpoGo) {
          console.log('⚠️ Cannot get push token in Expo Go - this is expected');
          // Return a mock token for Expo Go to allow testing local notifications
          const mockToken = 'ExpoGo-LocalOnly-Token';
          await AsyncStorage.setItem('pushToken', mockToken);
          return mockToken;
        }
        throw tokenError;
      }
    } catch (error) {
      console.error('Error registering for push notifications:', error);
      return null;
    }
  }

  async scheduleLocalNotification(
    title: string,
    body: string,
    data: any = {}
  ): Promise<string> {
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: 'default',
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: null, // Send immediately
    });

    return notificationId;
  }

  addNotificationReceivedListener(
    handler: (notification: Notifications.Notification) => void
  ): Notifications.EventSubscription {
    const subscription = Notifications.addNotificationReceivedListener(handler);
    this.notificationListeners.push(subscription);
    return subscription;
  }

  addNotificationResponseListener(
    handler: (response: Notifications.NotificationResponse) => void
  ): Notifications.EventSubscription {
    const subscription = Notifications.addNotificationResponseReceivedListener(handler);
    this.notificationListeners.push(subscription);
    return subscription;
  }

  async getLastNotificationResponse(): Promise<Notifications.NotificationResponse | null> {
    return await Notifications.getLastNotificationResponseAsync();
  }

  async updatePushTokenInProfile(userId: string, token: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          push_token: token,
          push_token_platform: Platform.OS,
          push_token_updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId);

      if (error) {
        console.error('Error updating push token in profile:', error);
        throw error;
      }

      console.log('Push token updated in profile successfully');
    } catch (error) {
      console.error('Failed to update push token:', error);
      throw error;
    }
  }

  async clearPushToken(userId: string): Promise<void> {
    try {
      // Clear from local storage
      await AsyncStorage.removeItem('pushToken');
      this.pushToken = null;

      // Clear from profile
      const { error } = await supabase
        .from('profiles')
        .update({
          push_token: null,
          push_token_platform: null,
          push_token_updated_at: null,
        })
        .eq('user_id', userId);

      if (error) {
        console.error('Error clearing push token from profile:', error);
        throw error;
      }

      console.log('Push token cleared successfully');
    } catch (error) {
      console.error('Failed to clear push token:', error);
      throw error;
    }
  }

  cleanup(): void {
    // Remove all notification listeners
    this.notificationListeners.forEach(subscription => {
      subscription.remove();
    });
    this.notificationListeners = [];
  }
}

// Export singleton instance
export const notificationService = new NotificationServiceImpl();

// Helper function to check if notifications are enabled
export async function areNotificationsEnabled(): Promise<boolean> {
  if (!Device.isDevice) return false;
  
  const { status } = await Notifications.getPermissionsAsync();
  return status === 'granted';
}

// Helper function to open system notification settings
export async function openNotificationSettings(): Promise<void> {
  if (Platform.OS === 'ios') {
    // On iOS, this will open the app's notification settings
    await Notifications.openSettingsAsync();
  } else {
    // On Android, this opens the system notification settings
    await Notifications.openSettingsAsync();
  }
}