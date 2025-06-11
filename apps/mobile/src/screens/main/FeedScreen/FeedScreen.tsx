import React from 'react';
import { View, ScrollView } from 'react-native';
import { Text } from '../../../components/atoms';
import { useTranslation } from '../../../hooks/useTranslation';
import { useStyles } from './FeedScreen.styles';

export const FeedScreen: React.FC = () => {
  const { t } = useTranslation('navigation');
  const styles = useStyles();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text variant="h1" style={styles.title}>
          {String(t('screens.feed.title'))}
        </Text>
        <Text variant="body" color="secondary">
          {String(t('screens.feed.description'))}
        </Text>
        <View style={styles.placeholder}>
          <Text variant="caption" color="secondary">
            Coming soon...
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};