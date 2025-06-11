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
            Current Insights
          </Text>
          
          <View style={styles.statRow}>
            <View style={styles.stat}>
              <Text variant="h2" style={styles.statValue}>
                {dreams.length}
              </Text>
              <Text variant="caption" color="secondary">
                Total Dreams
              </Text>
            </View>
            
            <View style={styles.stat}>
              <Text variant="h2" style={styles.statValue}>
                {averageDuration}s
              </Text>
              <Text variant="caption" color="secondary">
                Avg Duration
              </Text>
            </View>
            
            <View style={styles.stat}>
              <Text variant="h2" style={styles.statValue}>
                {peakHour.hour}:00
              </Text>
              <Text variant="caption" color="secondary">
                Peak Hour
              </Text>
            </View>
          </View>
        </View>

        {/* Coming Soon Card */}
        <View style={styles.comingSoonCard}>
          <Text style={styles.icon}>📊</Text>
          <Text variant="h2" style={styles.title}>
            Advanced Analysis
          </Text>
          <Text variant="body" color="secondary" style={styles.description}>
            {t('status.comingSoon')}
          </Text>
          <Text variant="caption" color="secondary" style={styles.subtitle}>
            Unlock deep insights into your dream patterns, symbols, and subconscious themes.
          </Text>
        </View>

        {/* Feature preview */}
        <View style={styles.featureSection}>
          <Text variant="h3" style={styles.sectionTitle}>
            Coming Features
          </Text>

          <View style={styles.featureCard}>
            <Text style={styles.featureIcon}>🎯</Text>
            <View style={styles.featureContent}>
              <Text variant="body" style={styles.featureTitle}>
                Dream Pattern Analysis
              </Text>
              <Text variant="caption" color="secondary">
                Identify recurring themes, symbols, and emotions in your dreams
              </Text>
            </View>
          </View>

          <View style={styles.featureCard}>
            <Text style={styles.featureIcon}>🌙</Text>
            <View style={styles.featureContent}>
              <Text variant="body" style={styles.featureTitle}>
                Sleep Cycle Correlation
              </Text>
              <Text variant="caption" color="secondary">
                See how your dreams relate to your sleep phases and quality
              </Text>
            </View>
          </View>

          <View style={styles.featureCard}>
            <Text style={styles.featureIcon}>🧠</Text>
            <View style={styles.featureContent}>
              <Text variant="body" style={styles.featureTitle}>
                AI-Powered Insights
              </Text>
              <Text variant="caption" color="secondary">
                Get personalized interpretations based on psychological frameworks
              </Text>
            </View>
          </View>

          <View style={styles.featureCard}>
            <Text style={styles.featureIcon}>📈</Text>
            <View style={styles.featureContent}>
              <Text variant="body" style={styles.featureTitle}>
                Lucid Dream Progress
              </Text>
              <Text variant="caption" color="secondary">
                Track your journey to mastering lucid dreaming techniques
              </Text>
            </View>
          </View>

          <View style={styles.featureCard}>
            <Text style={styles.featureIcon}>🎮</Text>
            <View style={styles.featureContent}>
              <Text variant="body" style={styles.featureTitle}>
                Dream Quests
              </Text>
              <Text variant="caption" color="secondary">
                Complete challenges to unlock new levels of dream awareness
              </Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};