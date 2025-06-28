import React from 'react';
import { VStack, HStack, Text, Switch, Button } from '@gluestack-ui/themed';
import { Alert, Platform } from 'react-native';
import { useNotificationContext } from '../../providers/NotificationProvider';
import { openNotificationSettings } from '../../services/notificationService';
import { darkTheme } from '@somni/theme';

export function NotificationSettings() {
  const {
    isEnabled,
    isLoading,
    registerForNotifications,
    disableNotifications,
    sendTestNotification,
  } = useNotificationContext();

  const handleToggleNotifications = async () => {
    if (isEnabled) {
      Alert.alert(
        'Disable Notifications',
        'Are you sure you want to disable push notifications?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Disable',
            onPress: disableNotifications,
            style: 'destructive',
          },
        ],
      );
    } else {
      await registerForNotifications();
    }
  };

  const handleOpenSettings = () => {
    Alert.alert(
      'System Settings',
      'You can manage detailed notification settings in your device settings.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Open Settings',
          onPress: openNotificationSettings,
        },
      ],
    );
  };

  return (
    <VStack space="lg" p="$4">
      <VStack space="sm">
        <Text
          size="lg"
          fontWeight="$semibold"
          color={darkTheme.colors.text.primary}
        >
          Push Notifications
        </Text>
        <Text size="sm" color={darkTheme.colors.text.secondary}>
          Get notified when your dream interpretations are ready
        </Text>
      </VStack>

      <HStack justifyContent="space-between" alignItems="center">
        <Text color={darkTheme.colors.text.primary}>Enable Notifications</Text>
        <Switch
          value={isEnabled}
          onValueChange={handleToggleNotifications}
          isDisabled={isLoading}
          trackColor={{
            false: darkTheme.colors.background.secondary,
            true: darkTheme.colors.primary,
          }}
          thumbColor={darkTheme.colors.background.primary}
        />
      </HStack>

      {isEnabled && (
        <VStack space="md" mt="$4">
          <Text size="sm" color={darkTheme.colors.text.secondary}>
            Notification Types:
          </Text>

          <VStack space="sm" ml="$2">
            <HStack space="sm" alignItems="center">
              <Text size="sm" color={darkTheme.colors.text.primary}>
                ✓ Dream analysis ready
              </Text>
            </HStack>
            <HStack space="sm" alignItems="center" opacity={0.5}>
              <Text size="sm" color={darkTheme.colors.text.secondary}>
                ◯ Daily dream reminders (coming soon)
              </Text>
            </HStack>
            <HStack space="sm" alignItems="center" opacity={0.5}>
              <Text size="sm" color={darkTheme.colors.text.secondary}>
                ◯ Achievement unlocked (coming soon)
              </Text>
            </HStack>
          </VStack>

          <Button
            variant="outline"
            size="sm"
            onPress={handleOpenSettings}
            mt="$2"
          >
            <Text color={darkTheme.colors.primary}>
              System Notification Settings
            </Text>
          </Button>

          {__DEV__ && (
            <Button
              variant="outline"
              size="sm"
              onPress={sendTestNotification}
              mt="$2"
              borderColor={darkTheme.colors.status.warning}
            >
              <Text color={darkTheme.colors.status.warning}>
                Send Test Notification
              </Text>
            </Button>
          )}
        </VStack>
      )}

      {!isEnabled && (
        <VStack space="sm" mt="$2">
          <Text
            size="xs"
            color={darkTheme.colors.text.secondary}
            fontStyle="italic"
          >
            {Platform.OS === 'ios'
              ? 'You can change notification settings anytime in iOS Settings > Somni'
              : 'You can change notification settings anytime in Android Settings > Apps > Somni'}
          </Text>
        </VStack>
      )}
    </VStack>
  );
}
