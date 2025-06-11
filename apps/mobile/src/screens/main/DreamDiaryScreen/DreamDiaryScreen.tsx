import React from 'react';
import { View, ScrollView } from 'react-native';
import { Text } from '../../../components/atoms';
import { useTranslation } from '../../../hooks/useTranslation';
import { useDreamStore } from '@somni/stores';
import { useStyles } from './DreamDiaryScreen.styles';

export const DreamDiaryScreen: React.FC = () => {
  const { t } = useTranslation('navigation');
  const { dreams } = useDreamStore();
  const styles = useStyles();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text variant="h1" style={styles.title}>
          {String(t('screens.dreamDiary.title'))}
        </Text>
        <Text variant="body" color="secondary">
          {String(t('screens.dreamDiary.description'))}
        </Text>
        
        <View style={styles.stats}>
          <Text variant="h2">{dreams.length}</Text>
          <Text variant="caption" color="secondary">
            Total Dreams
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};