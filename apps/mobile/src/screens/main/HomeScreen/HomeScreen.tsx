import React from 'react';
import { View, ScrollView } from 'react-native';
import { Text, Button } from '@components/atoms';
import { useAuth } from '@hooks/useAuth';
import { useTranslation } from '@hooks/useTranslation';
import { useDreamStore } from '@somni/stores';
import { useStyles } from './HomeScreen.styles';

export const HomeScreen: React.FC = () => {
  const { t } = useTranslation('common');
  const { user, signOut } = useAuth();
  const { dreams } = useDreamStore();
  const styles = useStyles();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text variant="h1" style={styles.title}>
          {t('navigation.home')}
        </Text>
        
        <Text variant="body" color="secondary" style={styles.subtitle}>
          Welcome back, {user?.email}
        </Text>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text variant="h2" style={styles.statNumber}>
              {dreams.length}
            </Text>
            <Text variant="caption" color="secondary">
              Total Dreams
            </Text>
          </View>
          
          <View style={styles.statCard}>
            <Text variant="h2" style={styles.statNumber}>
              {dreams.filter(d => d.is_lucid).length}
            </Text>
            <Text variant="caption" color="secondary">
              Lucid Dreams
            </Text>
          </View>
        </View>

        <Button 
          variant="secondary" 
          onPress={signOut}
          style={styles.signOutButton}
        >
          Sign Out
        </Button>
      </View>
    </ScrollView>
  );
};