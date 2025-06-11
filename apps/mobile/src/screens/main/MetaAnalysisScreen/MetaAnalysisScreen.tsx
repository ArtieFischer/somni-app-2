import React from 'react';
import { View, ScrollView } from 'react-native';
import { Text } from '../../../components/atoms';
import { useTranslation } from '../../../hooks/useTranslation';
import { useDreamStore } from '@somni/stores';
import { useStyles } from './MetaAnalysisScreen.styles';

export const MetaAnalysisScreen: React.FC = () => {
  const { t } = useTranslation('common');
  const { dreams, totalRecordingTime } = useDreamStore();
  const styles = useStyles();

  // Calculate some basic stats
  const averageDuration = dreams.length > 0 
    ? Math.round(totalRecordingTime / dreams.length) 
    : 0;
  
  const dreamsByHour = dreams.reduce((acc, dream) => {
    const hour = new Date(dream.recordedAt).getHours();
    acc[hour] = (acc[hour] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);

  const peakHour = Object.entries(dreamsByHour).reduce(
    (max, [hour, count]) => count > max.count ? { hour: parseInt(hour), count } : max,
    { hour: 0, count: 0 }
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Basic Stats Available Now */}
        <View style={styles.statsCard}>
          <Text variant="h3" style={styles.cardTitle}>
            {String(t('analysis.currentInsights'))}
          </Text>
          
          <View style={styles.statRow}>
            <View style={styles.stat}>
              <Text variant="h2" style={styles.statValue}>
                {dreams.length}
              </Text>
              <Text variant="caption" color="secondary">
                {String(t('stats.totalDreams'))}
              </Text>
            </View>
            
            <View style={styles.stat}>
              <Text variant="h2" style={styles.statValue}>
                {averageDuration}s
              </Text>
              <Text variant="caption" color="secondary">
                {String(t('stats.avgDuration'))}
              </Text>
            </View>
            
            <View style={styles.stat}>
              <Text variant="h2" style={styles.statValue}>
                {peakHour.hour}:00
              </Text>
              <Text variant="caption" color="secondary">
                {String(t('stats.peakHour'))}
              </Text>
            </View>
          </View>
        </View>

        {/* Coming Soon Card */}
        <View style={styles.comingSoonCard}>
          <Text style={styles.icon}>📊</Text>
          <Text variant="h2" style={styles.title}>
            {String(t('analysis.advancedAnalysis'))}
          </Text>
          <Text variant="body" color="secondary" style={styles.description}>
            {String(t('status.comingSoon'))}
          </Text>
          <Text variant="caption" color="secondary" style={styles.subtitle}>
            {String(t('analysis.comingSoon.subtitle'))}
          </Text>
        </View>

        {/* Feature preview */}
        <View style={styles.featureSection}>
          <Text variant="h3" style={styles.sectionTitle}>
            {String(t('analysis.features.title'))}
          </Text>

          <View style={styles.featureCard}>
            <Text style={styles.featureIcon}>🎯</Text>
            <View style={styles.featureContent}>
              <Text variant="body" style={styles.featureTitle}>
                {String(t('analysis.features.patternAnalysis.title'))}
              </Text>
              <Text variant="caption" color="secondary">
                {String(t('analysis.features.patternAnalysis.description'))}
              </Text>
            </View>
          </View>

          <View style={styles.featureCard}>
            <Text style={styles.featureIcon}>🌙</Text>
            <View style={styles.featureContent}>
              <Text variant="body" style={styles.featureTitle}>
                {String(t('analysis.features.sleepCorrelation.title'))}
              </Text>
              <Text variant="caption" color="secondary">
                {String(t('analysis.features.sleepCorrelation.description'))}
              </Text>
            </View>
          </View>

          <View style={styles.featureCard}>
            <Text style={styles.featureIcon}>🧠</Text>
            <View style={styles.featureContent}>
              <Text variant="body" style={styles.featureTitle}>
                {String(t('analysis.features.aiInsights.title'))}
              </Text>
              <Text variant="caption" color="secondary">
                {String(t('analysis.features.aiInsights.description'))}
              </Text>
            </View>
          </View>

          <View style={styles.featureCard}>
            <Text style={styles.featureIcon}>📈</Text>
            <View style={styles.featureContent}>
              <Text variant="body" style={styles.featureTitle}>
                {String(t('analysis.features.lucidProgress.title'))}
              </Text>
              <Text variant="caption" color="secondary">
                {String(t('analysis.features.lucidProgress.description'))}
              </Text>
            </View>
          </View>

          <View style={styles.featureCard}>
            <Text style={styles.featureIcon}>🎮</Text>
            <View style={styles.featureContent}>
              <Text variant="body" style={styles.featureTitle}>
                {String(t('analysis.features.dreamQuests.title'))}
              </Text>
              <Text variant="caption" color="secondary">
                {String(t('analysis.features.dreamQuests.description'))}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};