import React from 'react';
import { View, ScrollView } from 'react-native';
import { Text, Card } from '../../../components/atoms';
import { useTranslation } from '../../../hooks/useTranslation';
import { useStyles } from './FeedScreen.styles';

export const FeedScreen: React.FC = () => {
  const { t } = useTranslation('common');
  const styles = useStyles();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Card variant="elevated" style={styles.comingSoonCard}>
          <Text style={styles.icon}>🌊</Text>
          <Text variant="h2" style={styles.title}>
            {String(t('feed.comingSoon.title'))}
          </Text>
          <Text variant="body" color="secondary" style={styles.description}>
            {String(t('feed.comingSoon.description'))}
          </Text>
          <Text variant="caption" color="secondary" style={styles.subtitle}>
            {String(t('feed.comingSoon.subtitle'))}
          </Text>
        </Card>

        {/* Feature preview cards */}
        <View style={styles.featureSection}>
          <Text variant="h3" style={styles.sectionTitle}>
            {String(t('feed.features.title'))}
          </Text>

          <Card style={styles.featureCard}>
            <View style={styles.featureCardContent}>
              <Text style={styles.featureIcon}>👥</Text>
              <View style={styles.featureContent}>
              <Text variant="body" style={styles.featureTitle}>
                {String(t('feed.features.anonymousSharing.title'))}
              </Text>
              <Text variant="caption" color="secondary">
                {String(t('feed.features.anonymousSharing.description'))}
              </Text>
              </View>
            </View>
          </Card>

          <Card style={styles.featureCard}>
            <View style={styles.featureCardContent}>
              <Text style={styles.featureIcon}>💡</Text>
              <View style={styles.featureContent}>
              <Text variant="body" style={styles.featureTitle}>
                {String(t('feed.features.interpretations.title'))}
              </Text>
              <Text variant="caption" color="secondary">
                {String(t('feed.features.interpretations.description'))}
              </Text>
              </View>
            </View>
          </Card>

          <Card style={styles.featureCard}>
            <View style={styles.featureCardContent}>
              <Text style={styles.featureIcon}>🔮</Text>
              <View style={styles.featureContent}>
              <Text variant="body" style={styles.featureTitle}>
                {String(t('feed.features.similarDreams.title'))}
              </Text>
              <Text variant="caption" color="secondary">
                {String(t('feed.features.similarDreams.description'))}
              </Text>
              </View>
            </View>
          </Card>

          <Card style={styles.featureCard}>
            <View style={styles.featureCardContent}>
              <Text style={styles.featureIcon}>🏆</Text>
              <View style={styles.featureContent}>
              <Text variant="body" style={styles.featureTitle}>
                {String(t('feed.features.challenges.title'))}
              </Text>
              <Text variant="caption" color="secondary">
                {String(t('feed.features.challenges.description'))}
              </Text>
              </View>
            </View>
          </Card>
        </View>
      </View>
    </ScrollView>
  );
};