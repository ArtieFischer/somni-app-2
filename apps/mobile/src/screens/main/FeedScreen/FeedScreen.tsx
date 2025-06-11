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
        <View style={styles.comingSoonCard}>
          <Text style={styles.icon}>🌊</Text>
          <Text variant="h2" style={styles.title}>
            Dream Feed
          </Text>
          <Text variant="body" color="secondary" style={styles.description}>
            {t('status.comingSoon')}
          </Text>
          <Text variant="caption" color="secondary" style={styles.subtitle}>
            Soon you'll be able to explore dreams from the community, share insights, and connect with fellow dreamers.
          </Text>
        </View>

        {/* Feature preview cards */}
        <View style={styles.featureSection}>
          <Text variant="h3" style={styles.sectionTitle}>
            What's Coming
          </Text>

          <View style={styles.featureCard}>
            <Text style={styles.featureIcon}>👥</Text>
            <View style={styles.featureContent}>
              <Text variant="body" style={styles.featureTitle}>
                Anonymous Dream Sharing
              </Text>
              <Text variant="caption" color="secondary">
                Share your dreams anonymously and get insights from the community
              </Text>
            </View>
          </View>

          <View style={styles.featureCard}>
            <Text style={styles.featureIcon}>💡</Text>
            <View style={styles.featureContent}>
              <Text variant="body" style={styles.featureTitle}>
                Dream Interpretations
              </Text>
              <Text variant="caption" color="secondary">
                Get AI-powered and community interpretations of dream symbols
              </Text>
            </View>
          </View>

          <View style={styles.featureCard}>
            <Text style={styles.featureIcon}>🔮</Text>
            <View style={styles.featureContent}>
              <Text variant="body" style={styles.featureTitle}>
                Similar Dreams
              </Text>
              <Text variant="caption" color="secondary">
                Discover people who have had similar dream experiences
              </Text>
            </View>
          </View>

          <View style={styles.featureCard}>
            <Text style={styles.featureIcon}>🏆</Text>
            <View style={styles.featureContent}>
              <Text variant="body" style={styles.featureTitle}>
                Lucid Dream Challenges
              </Text>
              <Text variant="caption" color="secondary">
                Join community challenges to improve your lucid dreaming skills
              </Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};