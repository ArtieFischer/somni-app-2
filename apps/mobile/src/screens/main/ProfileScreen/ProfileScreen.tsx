import React, { useState } from 'react';
import { Alert, TouchableOpacity } from 'react-native';
import { 
  ScrollView,
  VStack,
  Box,
  Button,
  ButtonText,
  Heading,
  SafeAreaView
} from '@gluestack-ui/themed';
import { Text } from '../../../components/atoms';
import { ProfileHeader } from '../../../components/molecules/ProfileHeader';
import { SharedDreamsSection } from '../../../components/molecules/SharedDreamsSection';
import { PreferencesSection } from '../../../components/molecules/PreferencesSection';
import { SupportSection } from '../../../components/molecules/SupportSection';
import { useTranslation } from '../../../hooks/useTranslation';
import { useAuth } from '../../../hooks/useAuth';
import { useStyles } from './ProfileScreen.styles';

export const ProfileScreen: React.FC = () => {
  const { t } = useTranslation('auth');
  const { signOut } = useAuth();
  const styles = useStyles();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    Alert.alert(
      String(t('actions.signOut')),
      String(t('errors.signOutConfirm')),
      [
        { text: String(t('actions.cancel')), style: 'cancel' },
        {
          text: String(t('actions.signOut')),
          style: 'destructive',
          onPress: async () => {
            setIsSigningOut(true);
            try {
              await signOut();
            } catch (error) {
              Alert.alert(String(t('status.error')), 'Failed to sign out. Please try again.');
              setIsSigningOut(false);
            }
          },
        },
      ],
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to permanently delete your account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Account',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Coming Soon', 'Account deletion will be available in a future update.');
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <VStack space="lg" style={styles.content}>
          {/* Profile Header with Avatar */}
          <ProfileHeader />

          {/* Shared Dreams Section */}
          <SharedDreamsSection 
            onViewAll={() => Alert.alert('Coming Soon', 'Shared dreams feature coming soon!')}
            onCreateShared={() => Alert.alert('Coming Soon', 'Dream sharing coming soon!')}
          />

          {/* Preferences Section */}
          <PreferencesSection />

          {/* Support Section */}
          <SupportSection />

          {/* Actions Section */}
          <Box style={styles.actionsSection}>
            <VStack space="md">
              <Button
                variant="outline"
                action="secondary"
                size="lg"
                onPress={handleSignOut}
                isDisabled={isSigningOut}
                style={styles.signOutButton}
              >
                <ButtonText style={styles.signOutButtonText}>
                  {isSigningOut ? 'Signing Out...' : String(t('profile.signOut'))}
                </ButtonText>
              </Button>

              <TouchableOpacity 
                style={styles.deleteButton}
                onPress={handleDeleteAccount}
              >
                <Text variant="body" style={styles.deleteButtonText}>
                  {String(t('profile.deleteAccount'))}
                </Text>
              </TouchableOpacity>
            </VStack>
          </Box>

          {/* Version Info */}
          <Box style={styles.versionSection}>
            <VStack space="xs" alignItems="center">
              <Text variant="caption" color="secondary" style={styles.versionText}>
                {String(t('version.info'))}
              </Text>
              <Text variant="caption" color="secondary" style={styles.taglineText}>
                {String(t('version.tagline'))}
              </Text>
            </VStack>
          </Box>
        </VStack>
      </ScrollView>
    </SafeAreaView>
  );
};