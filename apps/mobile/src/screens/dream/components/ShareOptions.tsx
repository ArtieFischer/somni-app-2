import React from 'react';
import { Alert, Platform, Linking } from 'react-native';
import { VStack, Box, Text, Pressable, HStack } from '@gluestack-ui/themed';
import { FontAwesome5 } from '@expo/vector-icons';
import { darkTheme } from '@somni/theme';
import { Dream } from '@somni/types';
import * as FileSystem from 'expo-file-system';

// Use mock in development, real module in production
const Share = __DEV__
  ? require('../../../utils/shareMock').default
  : require('react-native-share').default;

interface ShareOptionsProps {
  dream: Dream;
  onCaptureViewShot: () => Promise<string | null>;
  isCapturing: boolean;
}

export const ShareOptions: React.FC<ShareOptionsProps> = ({
  dream,
  onCaptureViewShot,
  isCapturing,
}) => {
  const handleShareOnSomni = () => {
    Alert.alert(
      'Coming Soon',
      'Share on Somni will be available in the next update!',
      [{ text: 'OK' }],
    );
  };

  const handleShareOnX = async () => {
    if (!dream) return;

    try {
      // Capture the view first
      const screenshotUri = await onCaptureViewShot();

      if (screenshotUri) {
        // Convert screenshot to base64
        const base64 = await FileSystem.readAsStringAsync(screenshotUri, {
          encoding: FileSystem.EncodingType.Base64,
        });

        const dreamText = dream.title || 'Just had an amazing dream';
        const message = `${dreamText} #Somni #DreamJournal`;

        const shareOptions: any = {
          message: message,
          url: `data:image/png;base64,${base64}`,
          social: Share.Social.TWITTER,
          type: 'image/png',
        };

        await Share.shareSingle(shareOptions);

        // Clean up temp file
        await FileSystem.deleteAsync(screenshotUri, { idempotent: true });
      } else {
        // Fallback to text only
        const dreamText = dream.title || 'Just had an amazing dream';
        const message = `${dreamText} #Somni #DreamJournal`;

        const shareOptions: any = {
          message: message,
          social: Share.Social.TWITTER,
        };

        await Share.shareSingle(shareOptions);
      }
    } catch (error) {
      console.error('Error sharing to X:', error);

      // Fallback to web intent if the app isn't installed
      const dreamText = dream.title || 'Just had an amazing dream';
      const tweetText = `${dreamText} #Somni #DreamJournal`;
      const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;

      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        Alert.alert(
          'Unable to Share',
          'Please make sure X (Twitter) is installed on your device',
          [{ text: 'OK' }],
        );
      }
    }
  };

  const handleShareToStory = async () => {
    if (!dream) return;

    try {
      // Check if Instagram is installed first
      const isInstagramInstalled = await Share.isPackageInstalled(
        'com.instagram.android',
      ).catch(() => ({ isInstalled: false }));

      if (!isInstagramInstalled.isInstalled && Platform.OS === 'android') {
        Alert.alert(
          'Instagram Not Found',
          'Please make sure Instagram is installed on your device',
          [{ text: 'OK' }],
        );
        return;
      }

      // Capture the view screenshot
      const screenshotUri = await onCaptureViewShot();

      if (screenshotUri) {
        // Convert screenshot to base64
        const imageBase64 = await FileSystem.readAsStringAsync(screenshotUri, {
          encoding: FileSystem.EncodingType.Base64,
        });

        const shareOptions: any = {
          social: Share.Social.INSTAGRAM_STORIES,
          appId: '1234567890', // You'll need to get a Facebook App ID
          backgroundImage: `data:image/png;base64,${imageBase64}`,
          attributionURL: 'https://somni.app', // Your app's deep link
        };

        await Share.shareSingle(shareOptions);

        // Clean up temp file
        await FileSystem.deleteAsync(screenshotUri, { idempotent: true });
      } else {
        // Fallback if screenshot fails
        Alert.alert(
          'Error',
          'Unable to capture dream details. Please try again.',
          [{ text: 'OK' }],
        );
      }
    } catch (error) {
      console.error('Error sharing to Instagram Story:', error);

      // Fallback to opening Instagram camera if sharing fails
      const instagramURL = 'instagram://story-camera';
      const canOpen = await Linking.canOpenURL(instagramURL);

      if (canOpen) {
        await Linking.openURL(instagramURL);
        Alert.alert(
          'Instagram Stories',
          'Take a screenshot of your dream to share it as a story!',
          [{ text: 'OK' }],
        );
      } else {
        Alert.alert(
          'Error',
          'Unable to share to Instagram Story. Please make sure Instagram is installed.',
          [{ text: 'OK' }],
        );
      }
    }
  };

  return (
    <VStack space="sm" style={{ marginTop: 16, marginBottom: 16 }}>
      <Pressable
        onPress={handleShareOnSomni}
        style={{
          borderWidth: 1,
          borderColor: darkTheme.colors.border.secondary,
          borderRadius: 12,
          paddingHorizontal: 24,
          paddingVertical: 14,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 12,
        }}
      >
        <Box
          style={{
            width: 24,
            height: 24,
            borderRadius: 12,
            backgroundColor: darkTheme.colors.primary,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Text style={{ fontSize: 14, color: 'white', fontWeight: 'bold' }}>
            S
          </Text>
        </Box>
        <Text
          style={{
            fontSize: 16,
            color: darkTheme.colors.text.secondary,
            fontWeight: '500',
          }}
        >
          Share on Somni
        </Text>
      </Pressable>

      <Pressable
        onPress={handleShareOnX}
        disabled={isCapturing}
        style={{
          borderWidth: 1,
          borderColor: darkTheme.colors.border.secondary,
          borderRadius: 12,
          paddingHorizontal: 24,
          paddingVertical: 14,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 12,
          opacity: isCapturing ? 0.6 : 1,
        }}
      >
        <FontAwesome5 name="twitter" size={24} color="#1DA1F2" />
        <Text
          style={{
            fontSize: 16,
            color: darkTheme.colors.text.secondary,
            fontWeight: '500',
          }}
        >
          {isCapturing ? 'Capturing...' : 'Share on X'}
        </Text>
      </Pressable>

      <Pressable
        onPress={handleShareToStory}
        disabled={isCapturing}
        style={{
          borderWidth: 1,
          borderColor: darkTheme.colors.border.secondary,
          borderRadius: 12,
          paddingHorizontal: 24,
          paddingVertical: 14,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 12,
          opacity: isCapturing ? 0.6 : 1,
        }}
      >
        <FontAwesome5 name="instagram" size={24} color="#E4405F" />
        <Text
          style={{
            fontSize: 16,
            color: darkTheme.colors.text.secondary,
            fontWeight: '500',
          }}
        >
          {isCapturing ? 'Capturing...' : 'Share on Story'}
        </Text>
      </Pressable>
    </VStack>
  );
};