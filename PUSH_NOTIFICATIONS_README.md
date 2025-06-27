# Push Notifications Implementation Guide

## Overview

This guide explains how push notifications have been implemented in the Somni app for both iOS and Android using Expo Notifications.

## Architecture

```
Mobile App → Expo Push Token → Backend → Expo Push Service → APNs/FCM → User Device
```

## Implementation Details

### 1. Frontend (React Native/Expo)

#### Core Files:
- `/apps/mobile/src/services/notificationService.ts` - Core notification service
- `/apps/mobile/src/hooks/useNotifications.ts` - React hook for notifications
- `/apps/mobile/src/providers/NotificationProvider.tsx` - Context provider
- `/apps/mobile/src/components/organisms/NotificationSettings.tsx` - Settings UI

#### Key Features:
- Permission handling for iOS and Android
- Push token registration with Expo
- Local notification scheduling
- Foreground/background notification handling
- Deep linking to specific dreams when notification tapped

### 2. Database Schema

Added to `profiles` table:
```sql
push_token TEXT                    -- Expo push token
push_token_platform TEXT           -- 'ios' or 'android'
push_token_updated_at TIMESTAMPTZ  -- Last update time
notification_preferences JSONB     -- User preferences
```

### 3. Backend Integration

The backend needs to:
1. Retrieve user's push token from profiles table
2. Send notification via Expo Push API when interpretation is ready
3. Handle delivery receipts (optional but recommended)

See `backend-notification-example.js` for implementation example.

## Setup Instructions

### For Development

1. **Install dependencies** (already done):
   ```bash
   npx expo install expo-notifications expo-device expo-constants
   ```

2. **Run migration**:
   ```bash
   npx supabase db push
   ```

3. **Test on physical device**:
   - Push notifications don't work on simulators
   - Use a physical iOS or Android device
   - Run: `npx expo start`

### For Production

1. **Configure EAS Build**:
   ```bash
   eas build:configure
   ```

2. **Set up push notification credentials**:
   ```bash
   eas credentials
   ```
   - iOS: Configure Apple Push Notifications Key
   - Android: Configure FCM API Key

3. **Build for production**:
   ```bash
   eas build --platform all
   ```

## User Flow

1. **First Launch**:
   - User navigates to Profile → Notification Settings
   - Taps "Enable Notifications"
   - System permission prompt appears
   - Push token is registered and saved to profile

2. **Interpretation Flow**:
   - User requests dream interpretation
   - Backend processes interpretation asynchronously
   - When complete, backend sends push notification
   - User receives notification
   - Tapping notification opens the dream's analysis tab

## Notification Types

Currently implemented:
- ✅ Interpretation Ready

Future notifications:
- ⏳ Daily Dream Reminders
- ⏳ Achievement Unlocked
- ⏳ Weekly Dream Insights

## Testing

### Local Testing (Development)

1. **Test local notifications**:
   ```javascript
   // In the app, go to Profile → Notification Settings
   // Tap "Send Test Notification" (dev mode only)
   ```

2. **Test interpretation notifications**:
   - Request an interpretation
   - Put app in background
   - Wait for notification

### Backend Testing

Use the example in `backend-notification-example.js`:
```javascript
await sendInterpretationReadyNotification({
  userId: 'user-uuid',
  dreamId: 'dream-uuid',
  dreamTitle: 'My Dream',
  interpretationId: 'interpretation-uuid'
});
```

## Troubleshooting

### Common Issues

1. **"Must use physical device"**:
   - Push notifications only work on real devices
   - Use Expo Go or a development build

2. **No push token**:
   - Ensure `extra.eas.projectId` is in app.json
   - Check notification permissions in device settings

3. **Notifications not received**:
   - Check user has push_token in profiles table
   - Verify notification_preferences allow interpretations
   - Check Expo Push Tool: https://expo.dev/notifications

4. **iOS specific**:
   - Ensure APNs is configured in Apple Developer account
   - Run `eas build` to generate proper entitlements

5. **Android specific**:
   - Check notification channels are set up
   - Verify FCM configuration

## Security Considerations

1. **Token Storage**:
   - Push tokens are stored securely in Supabase
   - RLS policies protect user data

2. **Backend Security**:
   - Only backend with service role can send notifications
   - Validate user permissions before sending

3. **Privacy**:
   - Don't include sensitive dream content in notification body
   - Use generic messages like "Your interpretation is ready"

## Future Enhancements

1. **Scheduled Notifications**:
   - Daily reminders to record dreams
   - Weekly dream pattern insights

2. **Rich Notifications**:
   - Include dream mood/theme in notification
   - Action buttons (View, Share, Dismiss)

3. **Notification Preferences**:
   - Quiet hours
   - Notification frequency settings
   - Per-type enable/disable

4. **Analytics**:
   - Track notification delivery rates
   - Monitor user engagement
   - A/B test notification content

## Resources

- [Expo Notifications Docs](https://docs.expo.dev/push-notifications/overview/)
- [Expo Push Tool](https://expo.dev/notifications)
- [Apple Push Notification Service](https://developer.apple.com/documentation/usernotifications)
- [Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging)