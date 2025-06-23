import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Alert } from 'react-native';
import { Image } from 'expo-image';
import { Text } from '../../atoms';
import { 
  VStack,
  HStack,
  Badge,
  BadgeText,
  BadgeIcon,
  Box
} from '@gluestack-ui/themed';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { decode } from 'base64-arraybuffer';
import { useAuth } from '../../../hooks/useAuth';
import { useAuthStore } from '@somni/stores';
import { UserRepository } from '../../../infrastructure/repositories/UserRepository';
import { useTheme } from '../../../hooks/useTheme';
import { useStyles } from './ProfileHeader.styles';
import { supabase } from '../../../lib/supabase';

const userRepository = new UserRepository();

interface ProfileHeaderProps {
  onAvatarUpdate?: () => void;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({ onAvatarUpdate }) => {
  const { user, profile } = useAuth();
  const { setProfile } = useAuthStore();
  const theme = useTheme();
  const styles = useStyles();
  const [isUpdatingAvatar, setIsUpdatingAvatar] = useState(false);
  const [imageLoadError, setImageLoadError] = useState(false);

  const handleAvatarPress = () => {
    Alert.alert(
      'Change Profile Picture',
      'Choose an option',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Take Photo', onPress: () => openImagePicker('camera') },
        { text: 'Choose from Library', onPress: () => openImagePicker('library') },
        ...(profile?.avatar_url ? [{ text: 'Remove Photo', onPress: removeAvatar, style: 'destructive' as const }] : [])
      ]
    );
  };

  const openImagePicker = async (source: 'camera' | 'library') => {
    try {
      // Request permissions
      if (source === 'camera') {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Required', 'Camera permission is required to take photos.');
          return;
        }
      } else {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Required', 'Photo library permission is required to select images.');
          return;
        }
      }

      setIsUpdatingAvatar(true);

      const result = source === 'camera' 
        ? await ImagePicker.launchCameraAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
            base64: false,
            exif: false,
            cameraType: ImagePicker.CameraType.front
          })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
            base64: false,
            exif: false
          });

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        await uploadAvatar(imageUri);
      }
    } catch (error) {
      console.error('Error opening image picker:', error);
      Alert.alert('Error', 'Failed to open image picker. Please try again.');
    } finally {
      setIsUpdatingAvatar(false);
    }
  };

  const uploadAvatar = async (imageUri: string) => {
    if (!user?.id) return;

    try {
      console.log('Uploading avatar from:', imageUri);

      // 1. Read the file as base-64
      const base64 = await FileSystem.readAsStringAsync(imageUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      
      if (!base64 || base64.length < 100) {
        throw new Error('Selected image looks empty — aborting upload');
      }

      console.log('Base64 length:', base64.length);

      // 2. Convert to ArrayBuffer (works on RN)
      const arrayBuffer = decode(base64);

      // 3. Build a file path
      const fileName = `avatar_${Date.now()}.jpg`;
      const filePath = `${user.id}/${fileName}`;
      console.log('To path:', filePath);

      // 4. Delete the old avatar (strip the ?t= cache-buster)
      const oldPath = profile?.avatar_url?.split('/avatars/')[1]?.split('?')[0];
      if (oldPath) {
        console.log('Deleting old avatar:', oldPath);
        await supabase.storage.from('avatars').remove([oldPath]);
      }

      // 5. Upload the new avatar
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, arrayBuffer, {
          contentType: 'image/jpeg',
          upsert: true,
          cacheControl: '3600',
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      // 6. Get the public URL and save it
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const avatarUrl = urlData.publicUrl;
      console.log('New avatar URL:', avatarUrl);

      // Update profile with new avatar URL
      const updatedProfile = await userRepository.update(user.id, {
        avatar_url: avatarUrl
      });

      setProfile(updatedProfile);
      setImageLoadError(false); // Reset error state
      onAvatarUpdate?.();

      Alert.alert('Success', 'Profile picture updated successfully!');
    } catch (error) {
      console.error('Error uploading avatar:', error);
      Alert.alert('Error', 'Failed to update profile picture. Please try again.');
    }
  };

  const removeAvatar = async () => {
    if (!user?.id) return;

    try {
      setIsUpdatingAvatar(true);

      // Update profile to remove avatar URL
      const updatedProfile = await userRepository.update(user.id, {
        avatar_url: undefined
      });

      setProfile(updatedProfile);
      onAvatarUpdate?.();

      Alert.alert('Success', 'Profile picture removed successfully!');
    } catch (error) {
      console.error('Error removing avatar:', error);
      Alert.alert('Error', 'Failed to remove profile picture. Please try again.');
    } finally {
      setIsUpdatingAvatar(false);
    }
  };

  const getDisplayName = () => {
    return profile?.username || 
           profile?.handle?.replace('@', '') || 
           user?.email?.split('@')[0] || 
           'Dreamer';
  };

  const getInitials = () => {
    const name = getDisplayName();
    return name.substring(0, 2).toUpperCase();
  };

  const getAccountAge = () => {
    if (!profile?.created_at) return '';
    
    const createdDate = new Date(profile.created_at);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - createdDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Using Somni for 1 day';
    if (diffDays < 7) return `Using Somni for ${diffDays} days`;
    if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `Using Somni for ${weeks} week${weeks > 1 ? 's' : ''}`;
    }
    if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `Using Somni for ${months} month${months > 1 ? 's' : ''}`;
    }
    const years = Math.floor(diffDays / 365);
    return `Using Somni for ${years} year${years > 1 ? 's' : ''}`;
  };

  // Use avatar URL from profile
  const hasAvatar = profile?.avatar_url && !imageLoadError;

  useEffect(() => {
    // Reset error when avatar URL changes
    setImageLoadError(false);
  }, [profile?.avatar_url]);

  return (
    <Box style={styles.container}>
      <VStack space="md" alignItems="center">
        <TouchableOpacity onPress={handleAvatarPress} disabled={isUpdatingAvatar}>
          <View style={{ position: 'relative' }}>
            {hasAvatar && profile?.avatar_url ? (
              <View style={{
                width: 96,
                height: 96,
                borderRadius: 48,
                backgroundColor: theme.colors.background.secondary,
                overflow: 'hidden',
                borderWidth: 2,
                borderColor: theme.colors.primary
              }}>
                <Image 
                  source={{ uri: profile.avatar_url }} 
                  style={{ 
                    width: 96, 
                    height: 96,
                  }}
                  contentFit="cover"
                  transition={200}
                  onError={(error) => {
                    console.error('Avatar image load error:', error);
                    console.error('Failed URL:', profile.avatar_url);
                    setImageLoadError(true);
                  }}
                  onLoad={() => {
                    console.log('Avatar loaded successfully from:', profile.avatar_url);
                  }}
                />
              </View>
            ) : (
              <View style={{
                width: 96,
                height: 96,
                borderRadius: 48,
                backgroundColor: theme.colors.background.secondary,
                justifyContent: 'center',
                alignItems: 'center',
                overflow: 'hidden'
              }}>
                <Text style={{ 
                  fontSize: 32, 
                  fontWeight: '600',
                  color: theme.colors.text.primary,
                  lineHeight: 32,
                  includeFontPadding: false,
                  textAlignVertical: 'center'
                }}>
                  {getInitials()}
                </Text>
              </View>
            )}
            <View style={{ 
              position: 'absolute', 
              bottom: 0, 
              right: 0, 
              width: 36, 
              height: 36, 
              borderRadius: 18, 
              backgroundColor: theme.colors.primary, 
              justifyContent: 'center', 
              alignItems: 'center',
              borderWidth: 3,
              borderColor: theme.colors.background.primary,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 4,
              elevation: 5
            }}>
              <Text style={{ fontSize: 18 }}>📷</Text>
            </View>
          </View>
        </TouchableOpacity>
        {!isUpdatingAvatar && (
          <Text variant="caption" color="secondary" style={{ marginTop: 4 }}>
            Tap to change photo
          </Text>
        )}

        <VStack space="xs" alignItems="center">
          <HStack space="sm" alignItems="center">
            <Text variant="h2" style={styles.displayName}>
              {getDisplayName()}
            </Text>
            {profile?.is_premium && (
              <Badge variant="solid" action="success" size="sm">
                <BadgeIcon as={() => <Text style={styles.premiumIcon}>⭐</Text>} />
                <BadgeText>Premium</BadgeText>
              </Badge>
            )}
          </HStack>
          
          <Text variant="body" color="secondary" style={styles.email}>
            {user?.email}
          </Text>

          {profile?.handle && (
            <Text variant="caption" color="secondary" style={styles.handle}>
              @{profile.handle.replace('@', '')}
            </Text>
          )}

          {getAccountAge() && (
            <Text variant="caption" color="secondary" style={styles.accountAge}>
              {getAccountAge()}
            </Text>
          )}
        </VStack>

        {isUpdatingAvatar && (
          <Text variant="caption" color="secondary">
            Updating profile picture...
          </Text>
        )}
      </VStack>
    </Box>
  );
};