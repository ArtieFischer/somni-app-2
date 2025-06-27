/**
 * Backend Notification Service
 * 
 * This service is meant to be used by your backend to send push notifications
 * to users when their interpretations are ready.
 * 
 * The backend should:
 * 1. Get the user's push token from the profiles table
 * 2. Use the Expo Push Notification API to send the notification
 * 
 * Example backend code (Node.js):
 */

// Example backend implementation (not for mobile app)
export const backendNotificationExample = `
import { Expo } from 'expo-server-sdk';

// Create a new Expo SDK client
const expo = new Expo();

async function sendInterpretationReadyNotification(
  userId: string,
  dreamId: string,
  dreamTitle: string,
  interpretationId: string
) {
  // 1. Get user's push token from Supabase
  const { data: profile } = await supabase
    .from('profiles')
    .select('push_token, notification_preferences')
    .eq('user_id', userId)
    .single();

  if (!profile?.push_token) {
    console.log('User has no push token');
    return;
  }

  // Check if user wants interpretation notifications
  const prefs = profile.notification_preferences || {};
  if (prefs.interpretations === false) {
    console.log('User has disabled interpretation notifications');
    return;
  }

  // 2. Check that the push token is valid
  if (!Expo.isExpoPushToken(profile.push_token)) {
    console.error(\`Push token \${profile.push_token} is not a valid Expo push token\`);
    return;
  }

  // 3. Create the message
  const message = {
    to: profile.push_token,
    sound: 'default',
    title: 'Dream Interpretation Ready! 🌙',
    body: \`Your interpretation for "\${dreamTitle}" is ready to view.\`,
    data: {
      type: 'interpretation_ready',
      dreamId,
      interpretationId,
    },
    priority: 'high',
    channelId: 'interpretations', // Android channel
  };

  // 4. Send the notification
  try {
    const tickets = await expo.sendPushNotificationsAsync([message]);
    console.log('Notification sent:', tickets);
    
    // You should store the ticket IDs to check receipts later
    // This helps track delivery status
  } catch (error) {
    console.error('Error sending notification:', error);
  }
}

// Call this function when interpretation is complete
// Example: After AI processing is done
async function onInterpretationComplete(interpretation: any) {
  await sendInterpretationReadyNotification(
    interpretation.user_id,
    interpretation.dream_id,
    interpretation.dream_title || 'your dream',
    interpretation.id
  );
}
`;

// Types for notification payloads
export interface InterpretationReadyPayload {
  type: 'interpretation_ready';
  dreamId: string;
  interpretationId: string;
  dreamTitle?: string;
}

export interface ReminderPayload {
  type: 'reminder';
  title: string;
  message: string;
}

export interface AchievementPayload {
  type: 'achievement';
  achievementId: string;
  title: string;
  description: string;
}

export type NotificationPayload = 
  | InterpretationReadyPayload 
  | ReminderPayload 
  | AchievementPayload;