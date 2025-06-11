import React from 'react';
import { View, ScrollView } from 'react-native';
import { Text } from '../../../components/atoms';
import { useTranslation } from '../../../hooks/useTranslation';
import { useStyles } from './FeedScreen.styles';

export const FeedScreen: React.FC = () => {
  const { t } = useTranslation('common');
  const styles = useStyles();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text variant="h1" style={styles.title}>
          {t('navigation.screens.feed.title')}
        </Text>
        <Text variant="body" color="secondary">
          {t('navigation.screens.feed.description')}
        </Text>
        <View style={styles.placeholder}>
          <Text variant="caption" color="secondary">
            {t('status.comingSoon')}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};