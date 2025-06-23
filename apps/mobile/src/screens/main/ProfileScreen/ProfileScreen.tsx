import React, { useState } from 'react';
import { Alert, TouchableOpacity } from 'react-native';
import { 
  ScrollView,
  VStack,
  Box,
  SafeAreaView
} from '@gluestack-ui/themed';
import { Text, Button, Card } from '../../../components/atoms';
import { ProfileHeader } from '../../../components/molecules/ProfileHeader';
import { SharedDreamsSection } from '../../../components/molecules/SharedDreamsSection';
import { DreamingPreferencesSection } from '../../../components/molecules/DreamingPreferencesSection';
import { UserPreferencesSection } from '../../../components/molecules/UserPreferencesSection';
import { SupportSection } from '../../../components/molecules/SupportSection';
import { useTranslation } from '../../../hooks/useTranslation';
import { useAuth } from '../../../hooks/useAuth';
import { useTheme } from '../../../hooks/useTheme';
import { useStyles } from './ProfileScreen.styles';

export const ProfileScreen: React.FC = () => {
  const { t } = useTranslation('auth');
  const { signOut } = useAuth();
  const theme = useTheme();
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
      <ScrollView 
        style={styles.container} 
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        <VStack space="lg" style={styles.content}>
          {/* Profile Header with Avatar */}
          <ProfileHeader />

          {/* Shared Dreams Section */}
          <SharedDreamsSection 
            onViewAll={() => Alert.alert('Coming Soon', 'Shared dreams feature coming soon!')}
            onCreateShared={() => Alert.alert('Coming Soon', 'Dream sharing coming soon!')}
          />

          {/* Dreaming Preferences */}
          <DreamingPreferencesSection />
          
          {/* User Preferences */}
          <UserPreferencesSection />

          {/* Support Section */}
          <SupportSection />

          {/* Actions Section */}
          <Card>
            <VStack space="md">
              <Button
                variant="outline"
                action="secondary"
                size="md"
                onPress={handleSignOut}
                isDisabled={isSigningOut}
                isLoading={isSigningOut}
                style={styles.signOutButton}
              >
                {isSigningOut ? 'Signing Out...' : String(t('profile.signOut'))}
              </Button>

              <Button
                variant="link"
                size="md"
                onPress={handleDeleteAccount}
                style={{ marginTop: theme.spacing.small, minHeight: 44 }}
                textStyle={{ color: theme.colors.status.error }}
              >
                {String(t('profile.deleteAccount'))}
              </Button>
            </VStack>
          </Card>

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