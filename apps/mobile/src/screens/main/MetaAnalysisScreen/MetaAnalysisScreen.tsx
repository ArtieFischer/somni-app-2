import React from 'react';
import { View, ScrollView } from 'react-native';
import { Text } from '../../../components/atoms';
import { useTranslation } from '../../../hooks/useTranslation';
import { useStyles } from './MetaAnalysisScreen.styles';

export const MetaAnalysisScreen: React.FC = () => {
  const { t } = useTranslation('navigation');
  const styles = useStyles();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text variant="h1" style={styles.title}>
          {String(t('screens.metaAnalysis.title'))}
        </Text>
        <Text variant="body" color="secondary">
          {String(t('screens.metaAnalysis.description'))}
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