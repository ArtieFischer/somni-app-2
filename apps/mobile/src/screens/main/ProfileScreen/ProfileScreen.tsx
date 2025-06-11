import React from 'react';
import { View, ScrollView } from 'react-native';
import { Text, Button } from '../../../components/atoms';
import { useTranslation } from '../../../hooks/useTranslation';
import { useAuth } from '../../../hooks/useAuth';
import { useStyles } from './ProfileScreen.styles';

export const ProfileScreen: React.FC = () => {
  const { t } = useTranslation('common');
  const { user, profile, signOut } = useAuth();
  const styles = useStyles();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.profileSection}>
          <View style={styles.avatar}>
            <Text variant="h1">👤</Text>
          </View>
          <Text variant="h2" style={styles.username}>
            {profile?.username || user?.email?.split('@')[0] || 'Dreamer'}
          </Text>
          <Text variant="body" color="secondary">
            {user?.email}
          </Text>
        </View>

        <View style={styles.section}>
          <Button
            variant="secondary"
            size="large"
            onPress={signOut}
          >
            Sign Out
          </Button>
        </View>
      </View>
    </ScrollView>
  );
};