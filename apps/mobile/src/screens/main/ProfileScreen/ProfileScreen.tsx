import React from 'react';
import { View, ScrollView } from 'react-native';
import { Text, Button } from '../../../components/atoms';
import { useTranslation } from '../../../hooks/useTranslation';
import { useAuth } from '../../../hooks/useAuth';
import { useStyles } from './ProfileScreen.styles';

export const ProfileScreen: React.FC = () => {
  const { t } = useTranslation('navigation');
  const { user, signOut } = useAuth();
  const styles = useStyles();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text variant="h1" style={styles.title}>
          {String(t('screens.profile.title'))}
        </Text>
        <Text variant="body" color="secondary">
          {String(t('screens.profile.description'))}
        </Text>
        
        {user && (
          <View style={styles.userInfo}>
            <Text variant="body">Welcome, {user.email}</Text>
          </View>
        )}

        <View style={styles.actions}>
          <Button variant="secondary" onPress={signOut}>
            Sign Out
          </Button>
        </View>
      </View>
    </ScrollView>
  );
};