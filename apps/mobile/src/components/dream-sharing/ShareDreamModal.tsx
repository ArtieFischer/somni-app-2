import React, { useState, useEffect } from 'react';
import {
  Modal,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  VStack,
  HStack,
  Box,
  Text,
  Pressable,
  Input,
  InputField,
} from '@gluestack-ui/themed';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { darkTheme } from '@somni/theme';
import { dreamSharingService, SharedDreamStatus } from '../../services/dreamSharingService';
import { useAuthStore } from '@somni/stores';

interface ShareDreamModalProps {
  visible: boolean;
  onClose: () => void;
  dreamId: string;
  dreamTitle?: string;
  onShareStatusChange?: (isShared: boolean) => void;
}

export const ShareDreamModal: React.FC<ShareDreamModalProps> = ({
  visible,
  onClose,
  dreamId,
  dreamTitle,
  onShareStatusChange,
}) => {
  const [shareType, setShareType] = useState<'open' | 'anonymous' | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentShareStatus, setCurrentShareStatus] = useState<SharedDreamStatus | null>(null);
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);
  const { profile } = useAuthStore();

  useEffect(() => {
    if (visible) {
      checkCurrentShareStatus();
      setDisplayName(profile?.full_name || '');
    }
  }, [visible, dreamId]);

  const checkCurrentShareStatus = async () => {
    setIsCheckingStatus(true);
    try {
      const status = await dreamSharingService.getShareStatus(dreamId);
      setCurrentShareStatus(status);
      
      if (status.isShared && status.shareDetails) {
        setShareType(status.shareDetails.isAnonymous ? 'anonymous' : 'open');
        if (status.shareDetails.displayName) {
          setDisplayName(status.shareDetails.displayName);
        }
      }
    } catch (error) {
      console.error('Error checking share status:', error);
    } finally {
      setIsCheckingStatus(false);
    }
  };

  const handleShare = async () => {
    if (!shareType) {
      Alert.alert('Please select', 'Choose how you want to share your dream');
      return;
    }

    setIsLoading(true);
    try {
      const request = {
        isAnonymous: shareType === 'anonymous',
        displayName: shareType === 'open' ? displayName || null : null,
      };

      let response;
      if (currentShareStatus?.isShared) {
        response = await dreamSharingService.updateShareSettings(dreamId, request);
      } else {
        response = await dreamSharingService.shareDream(dreamId, request);
      }

      if (response.success) {
        Alert.alert(
          'Success',
          currentShareStatus?.isShared 
            ? 'Sharing settings updated successfully' 
            : 'Your dream has been shared with the Somni community!',
          [{ text: 'OK', onPress: onClose }]
        );
        onShareStatusChange?.(true);
      } else {
        Alert.alert('Error', response.error || 'Failed to share dream');
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnshare = async () => {
    Alert.alert(
      'Stop Sharing?',
      'Your dream will no longer be visible to the Somni community.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Stop Sharing',
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            try {
              const response = await dreamSharingService.unshareDream(dreamId);
              if (response.success) {
                Alert.alert('Success', 'Your dream is no longer shared', [
                  { text: 'OK', onPress: onClose }
                ]);
                onShareStatusChange?.(false);
              } else {
                Alert.alert('Error', response.error || 'Failed to unshare dream');
              }
            } catch (error) {
              Alert.alert('Error', 'Something went wrong. Please try again.');
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  const renderShareOption = (type: 'open' | 'anonymous', icon: string, title: string, description: string) => (
    <Pressable
      onPress={() => setShareType(type)}
      style={{
        borderWidth: 2,
        borderColor: shareType === type ? darkTheme.colors.primary : darkTheme.colors.border.secondary,
        borderRadius: 12,
        padding: 16,
        backgroundColor: shareType === type 
          ? `${darkTheme.colors.primary}15` 
          : darkTheme.colors.background.elevated,
      }}
    >
      <HStack space="md" style={{ alignItems: 'center' }}>
        <Box
          style={{
            width: 48,
            height: 48,
            borderRadius: 24,
            backgroundColor: shareType === type 
              ? darkTheme.colors.primary 
              : darkTheme.colors.background.secondary,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Ionicons 
            name={icon as any} 
            size={24} 
            color={shareType === type ? 'white' : darkTheme.colors.text.secondary} 
          />
        </Box>
        <VStack style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: '600',
              color: darkTheme.colors.text.primary,
            }}
          >
            {title}
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: darkTheme.colors.text.secondary,
              marginTop: 2,
            }}
          >
            {description}
          </Text>
        </VStack>
      </HStack>
    </Pressable>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <Pressable
          onPress={onClose}
          style={{
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'flex-end',
          }}
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            style={{
              backgroundColor: darkTheme.colors.background.primary,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              paddingTop: 8,
              paddingBottom: Platform.OS === 'ios' ? 40 : 24,
              maxHeight: '80%',
            }}
          >
            <Box
              style={{
                width: 40,
                height: 4,
                backgroundColor: darkTheme.colors.border.secondary,
                borderRadius: 2,
                alignSelf: 'center',
                marginBottom: 16,
              }}
            />

            <VStack style={{ paddingHorizontal: 20 }}>
              <HStack style={{ alignItems: 'center', marginBottom: 8 }}>
                <Text
                  style={{
                    fontSize: 24,
                    fontWeight: '700',
                    color: darkTheme.colors.text.primary,
                    flex: 1,
                  }}
                >
                  Share Dream
                </Text>
                <Pressable onPress={onClose}>
                  <Ionicons
                    name="close"
                    size={24}
                    color={darkTheme.colors.text.secondary}
                  />
                </Pressable>
              </HStack>

              {dreamTitle && (
                <Text
                  style={{
                    fontSize: 16,
                    color: darkTheme.colors.text.secondary,
                    marginBottom: 24,
                  }}
                  numberOfLines={2}
                >
                  "{dreamTitle}"
                </Text>
              )}

              {isCheckingStatus ? (
                <Box style={{ alignItems: 'center', paddingVertical: 40 }}>
                  <ActivityIndicator color={darkTheme.colors.primary} />
                </Box>
              ) : (
                <>
                  {currentShareStatus?.isShared && (
                    <Box
                      style={{
                        backgroundColor: `${darkTheme.colors.primary}15`,
                        padding: 12,
                        borderRadius: 8,
                        marginBottom: 16,
                      }}
                    >
                      <HStack space="sm" style={{ alignItems: 'center' }}>
                        <Ionicons
                          name="checkmark-circle"
                          size={20}
                          color={darkTheme.colors.primary}
                        />
                        <Text
                          style={{
                            fontSize: 14,
                            color: darkTheme.colors.primary,
                            flex: 1,
                          }}
                        >
                          This dream is currently shared {currentShareStatus.shareDetails?.isAnonymous ? 'anonymously' : 'with your name'}
                        </Text>
                      </HStack>
                    </Box>
                  )}

                  <VStack space="md" style={{ marginBottom: 24 }}>
                    {renderShareOption(
                      'open',
                      'person-circle-outline',
                      'Share with my name',
                      'Your name will be visible to others'
                    )}
                    {renderShareOption(
                      'anonymous',
                      'eye-off-outline',
                      'Share anonymously',
                      'Your identity will remain hidden'
                    )}
                  </VStack>

                  {shareType === 'open' && (
                    <VStack space="sm" style={{ marginBottom: 24 }}>
                      <Text
                        style={{
                          fontSize: 14,
                          color: darkTheme.colors.text.secondary,
                          fontWeight: '500',
                        }}
                      >
                        Display Name (Optional)
                      </Text>
                      <Input
                        style={{
                          backgroundColor: darkTheme.colors.background.elevated,
                          borderColor: darkTheme.colors.border.secondary,
                          borderWidth: 1,
                          borderRadius: 8,
                          height: 48,
                        }}
                      >
                        <InputField
                          placeholder="Enter custom display name"
                          placeholderTextColor={darkTheme.colors.text.disabled}
                          value={displayName}
                          onChangeText={setDisplayName}
                          style={{
                            color: darkTheme.colors.text.primary,
                            fontSize: 16,
                          }}
                        />
                      </Input>
                      <Text
                        style={{
                          fontSize: 12,
                          color: darkTheme.colors.text.secondary,
                        }}
                      >
                        Leave empty to use your profile name
                      </Text>
                    </VStack>
                  )}

                  <VStack space="sm">
                    <Pressable
                      onPress={handleShare}
                      disabled={isLoading || !shareType}
                      style={{
                        backgroundColor: darkTheme.colors.primary,
                        paddingVertical: 16,
                        borderRadius: 12,
                        alignItems: 'center',
                        opacity: isLoading || !shareType ? 0.6 : 1,
                      }}
                    >
                      {isLoading ? (
                        <ActivityIndicator color="white" />
                      ) : (
                        <Text
                          style={{
                            fontSize: 16,
                            fontWeight: '600',
                            color: 'white',
                          }}
                        >
                          {currentShareStatus?.isShared ? 'Update Sharing' : 'Share Dream'}
                        </Text>
                      )}
                    </Pressable>

                    {currentShareStatus?.isShared && (
                      <Pressable
                        onPress={handleUnshare}
                        disabled={isLoading}
                        style={{
                          backgroundColor: darkTheme.colors.background.elevated,
                          paddingVertical: 16,
                          borderRadius: 12,
                          alignItems: 'center',
                          borderWidth: 1,
                          borderColor: darkTheme.colors.error,
                          opacity: isLoading ? 0.6 : 1,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 16,
                            fontWeight: '600',
                            color: darkTheme.colors.error,
                          }}
                        >
                          Stop Sharing
                        </Text>
                      </Pressable>
                    )}
                  </VStack>

                  <Box
                    style={{
                      backgroundColor: darkTheme.colors.background.elevated,
                      padding: 16,
                      borderRadius: 8,
                      marginTop: 16,
                    }}
                  >
                    <HStack space="sm" style={{ alignItems: 'flex-start' }}>
                      <Ionicons
                        name="information-circle-outline"
                        size={20}
                        color={darkTheme.colors.text.secondary}
                      />
                      <Text
                        style={{
                          fontSize: 12,
                          color: darkTheme.colors.text.secondary,
                          flex: 1,
                          lineHeight: 18,
                        }}
                      >
                        Shared dreams are visible to all Somni users. You can stop sharing at any time.
                      </Text>
                    </HStack>
                  </Box>
                </>
              )}
            </VStack>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
};