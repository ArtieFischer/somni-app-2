import React, { useEffect, useState } from 'react';
import { View, ScrollView, ActivityIndicator } from 'react-native';
import { Text } from '../../../components/atoms';
import { useTranslation } from '../../../hooks/useTranslation';
import { useDreamStore, useAuthStore } from '@somni/stores';
import { useStyles } from './MetaAnalysisScreen.styles';
import { BarChart, LineChart, PieChart, ProgressRing } from '../../../components/charts';
import { StatCard, InsightCard, TabSelector, MiniChart } from '../../../components/analytics';
import { analyticsService } from '../../../services/analyticsService';
import { useTheme } from '../../../hooks/useTheme';

type TabType = 'overview' | 'patterns' | 'insights' | 'progress';

export const MetaAnalysisScreen: React.FC = () => {
  const { t } = useTranslation('common');
  const { dreams, getDreamStats } = useDreamStore();
  const { user } = useAuthStore();
  const styles = useStyles();
  const theme = useTheme();
  const [analytics, setAnalytics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  useEffect(() => {
    loadAnalytics();
  }, [dreams]);

  const loadAnalytics = async () => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }
    
    try {
      setIsLoading(true);
      const data = await analyticsService.getDreamAnalytics(user.id);
      setAnalytics(data);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const stats = getDreamStats();

  const tabs = [
    { id: 'overview', label: 'Overview', iconName: 'chart-box', iconType: 'material' as const },
    { id: 'patterns', label: 'Patterns', iconName: 'weather-night', iconType: 'material' as const },
    { id: 'insights', label: 'Insights', iconName: 'lightbulb-outline', iconType: 'material' as const },
    { id: 'progress', label: 'Progress', iconName: 'trending-up', iconType: 'material' as const },
  ];

  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text variant="caption" color="secondary" style={styles.loadingText}>
          Loading analytics...
        </Text>
      </View>
    );
  }

  const renderOverviewTab = () => (
    <>
      {/* Key Metrics */}
      <View style={styles.metricsGrid}>
        <StatCard
          value={stats.totalDreams}
          label="Total Dreams"
          iconName="star"
          iconType="material"
          variant="primary"
          trend={analytics?.dreamsByMonth?.length >= 2 ? {
            value: Math.round(((analytics.dreamsByMonth[analytics.dreamsByMonth.length - 1].count - 
                    analytics.dreamsByMonth[analytics.dreamsByMonth.length - 2].count) / 
                    (analytics.dreamsByMonth[analytics.dreamsByMonth.length - 2].count || 1)) * 100),
            isPositive: analytics.dreamsByMonth[analytics.dreamsByMonth.length - 1].count >= 
                       analytics.dreamsByMonth[analytics.dreamsByMonth.length - 2].count
          } : undefined}
        />
        
        <StatCard
          value={`${analytics?.streakDays || 0}d`}
          label="Current Streak"
          iconName="fire"
          iconType="material"
          variant={analytics?.streakDays > 3 ? 'success' : 'default'}
        />
      </View>

      <View style={styles.metricsGrid}>
        <StatCard
          value={`${Math.round(analytics?.lucidDreamProgress.percentage || 0)}%`}
          label="Lucid Dreams"
          iconName="sparkles"
          iconType="material"
          variant="primary"
        />
        
        <StatCard
          value={analytics?.averageQualityScore || 0}
          label="Avg. Quality"
          iconName="star"
          iconType="ionicons"
          variant={analytics?.averageQualityScore >= 70 ? 'success' : 'default'}
        />
      </View>

      {/* Weekly Activity */}
      <InsightCard 
        title="Weekly Activity"
        subtitle="Dreams recorded by day"
      >
        <View style={styles.weeklyChart}>
          <BarChart
            data={analytics?.dreamsByDayOfWeek.map(item => ({
              label: item.day.slice(0, 3),
              value: item.count
            })) || []}
            height={120}
            showValues={false}
            barColor={theme.colors.primary}
          />
        </View>
      </InsightCard>

      {/* Recent Mood */}
      <InsightCard 
        title="Mood Trend"
        subtitle="Last 7 days"
      >
        <View style={styles.moodTrend}>
          {analytics?.moodTrend.slice(-7).map((item, index) => (
            <View key={index} style={styles.moodDay}>
              <View 
                style={[
                  styles.moodBar,
                  { 
                    height: `${(item.avgMood / 5) * 100}%`,
                    backgroundColor: item.avgMood >= 4 ? theme.colors.status.success :
                                   item.avgMood >= 3 ? theme.colors.primary :
                                   theme.colors.status.warning
                  }
                ]}
              />
              <Text variant="caption" style={styles.moodLabel}>
                {new Date(item.date).toLocaleDateString('en', { weekday: 'short' })[0]}
              </Text>
            </View>
          ))}
        </View>
      </InsightCard>
    </>
  );

  const renderPatternsTab = () => (
    <>
      {/* Peak Hours */}
      <InsightCard 
        title="Peak Dream Hours"
        subtitle="When you remember dreams most"
      >
        <View style={styles.hoursGrid}>
          {analytics?.dreamsByHour
            .filter(h => h.count > 0)
            .sort((a, b) => b.count - a.count)
            .slice(0, 6)
            .map((hour, index) => (
              <View key={index} style={styles.hourItem}>
                <Text variant="h4" style={styles.hourTime}>
                  {hour.hour}:00
                </Text>
                <MiniChart
                  data={[hour.count]}
                  type="bar"
                  width={40}
                  height={30}
                  color={index === 0 ? theme.colors.primary : theme.colors.text.secondary}
                />
                <Text variant="caption" color="secondary">
                  {hour.count} dreams
                </Text>
              </View>
            ))}
        </View>
      </InsightCard>

      {/* Monthly Pattern */}
      <InsightCard 
        title="Monthly Pattern"
        subtitle="Dream frequency over time"
      >
        <LineChart
          data={analytics?.dreamsByMonth.map((item, index) => ({
            x: item.month,
            y: item.count,
            label: item.month
          })) || []}
          height={180}
          minY={0}
          lineColor={theme.colors.primary}
          showPoints={true}
          fillArea={true}
        />
      </InsightCard>

      {/* Clarity Distribution */}
      <InsightCard 
        title="Dream Clarity"
        subtitle="How vivid are your dreams?"
      >
        <View style={styles.clarityBars}>
          {analytics?.clarityDistribution.map((item, index) => (
            <View key={index} style={styles.clarityItem}>
              <View style={styles.clarityBarContainer}>
                <View 
                  style={[
                    styles.clarityBar,
                    { 
                      height: `${item.percentage}%`,
                      backgroundColor: index >= 3 ? theme.colors.primary : theme.colors.text.secondary + '40'
                    }
                  ]}
                />
              </View>
              <Text variant="caption" style={styles.clarityLabel}>
                {item.range}
              </Text>
            </View>
          ))}
        </View>
      </InsightCard>
    </>
  );

  const renderInsightsTab = () => (
    <>
      {/* Top Emotions */}
      {analytics?.emotionalTones.length > 0 && (
        <InsightCard 
          title="Emotional Landscape"
          subtitle="Most common emotional tones"
        >
          <View style={styles.emotionList}>
            {analytics.emotionalTones.slice(0, 5).map((tone, index) => (
              <View key={index} style={styles.emotionItem}>
                <View style={styles.emotionInfo}>
                  <Text variant="body" style={styles.emotionName}>
                    {tone.tone}
                  </Text>
                  <Text variant="caption" color="secondary">
                    {tone.count} dreams • Intensity: {tone.avgIntensity.toFixed(1)}/10
                  </Text>
                </View>
                <View style={styles.emotionBarContainer}>
                  <View 
                    style={[
                      styles.emotionBar,
                      { 
                        width: `${(tone.count / analytics.emotionalTones[0].count) * 100}%`,
                        backgroundColor: theme.colors.primary + '30'
                      }
                    ]}
                  />
                </View>
              </View>
            ))}
          </View>
        </InsightCard>
      )}

      {/* Common Symbols */}
      {analytics?.topSymbols.length > 0 && (
        <InsightCard 
          title="Dream Symbols"
          subtitle="Recurring themes in your dreams"
        >
          <View style={styles.symbolGrid}>
            {analytics.topSymbols.slice(0, 12).map((symbol, index) => (
              <View 
                key={index} 
                style={[
                  styles.symbolTag,
                  { 
                    backgroundColor: theme.colors.primary + '15',
                    borderColor: theme.colors.primary + '30'
                  }
                ]}
              >
                <Text variant="caption" style={styles.symbolText}>
                  {symbol.symbol}
                </Text>
                <Text variant="caption" style={styles.symbolCount}>
                  {symbol.count}
                </Text>
              </View>
            ))}
          </View>
        </InsightCard>
      )}

      {/* Location Insights */}
      {analytics?.locationStats.length > 0 && (
        <InsightCard 
          title="Dreams by Location"
          subtitle="Where your dreams take place"
        >
          {analytics.locationStats.slice(0, 4).map((location, index) => (
            <View key={index} style={styles.locationRow}>
              <Text variant="body" style={styles.locationName}>
                {location.location}
              </Text>
              <View style={styles.locationStats}>
                <Text variant="caption" color="secondary">
                  {location.count} dreams
                </Text>
                {location.avgMood && (
                  <View style={styles.moodIndicator}>
                    <View 
                      style={[
                        styles.moodDot,
                        { 
                          backgroundColor: location.avgMood >= 4 ? theme.colors.status.success :
                                         location.avgMood >= 3 ? theme.colors.primary :
                                         theme.colors.status.warning
                        }
                      ]}
                    />
                    <Text variant="caption" color="secondary">
                      {location.avgMood.toFixed(1)}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          ))}
        </InsightCard>
      )}
    </>
  );

  const renderProgressTab = () => (
    <>
      {/* Lucid Progress */}
      <InsightCard 
        title="Lucid Dream Progress"
        subtitle="Your journey to lucid dreaming"
      >
        <View style={styles.progressSection}>
          <View style={styles.progressRingContainer}>
            <ProgressRing
              progress={analytics?.lucidDreamProgress.percentage || 0}
              size={140}
              color={theme.colors.primary}
              strokeWidth={12}
            />
          </View>
          
          <View style={styles.progressStats}>
            <View style={styles.progressStat}>
              <Text variant="h3" style={styles.progressValue}>
                {analytics?.lucidDreamProgress.totalLucid || 0}
              </Text>
              <Text variant="caption" color="secondary">
                Lucid Dreams
              </Text>
            </View>
            
            <View style={styles.progressStat}>
              <Text variant="h3" style={styles.progressValue}>
                {analytics?.lucidDreamProgress.totalDreams || 0}
              </Text>
              <Text variant="caption" color="secondary">
                Total Dreams
              </Text>
            </View>
          </View>
        </View>

        {analytics?.lucidDreamProgress.monthlyTrend.length > 0 && (
          <View style={styles.monthlyTrend}>
            <Text variant="caption" color="secondary" style={styles.trendTitle}>
              Monthly Lucid Percentage
            </Text>
            <LineChart
              data={analytics.lucidDreamProgress.monthlyTrend.map((item) => ({
                x: item.month,
                y: item.percentage,
                label: item.month.slice(0, 3)
              }))}
              height={120}
              minY={0}
              maxY={100}
              lineColor={theme.colors.status.success}
              showValues={false}
              showPoints={true}
            />
          </View>
        )}
      </InsightCard>

      {/* Quality Score Trend */}
      <InsightCard 
        title="Dream Quality"
        subtitle="Combined mood & clarity score"
      >
        <View style={styles.qualitySection}>
          <View style={styles.qualityScore}>
            <Text variant="h1" style={[styles.bigScore, { color: theme.colors.primary }]}>
              {analytics?.averageQualityScore || 0}
            </Text>
            <Text variant="caption" color="secondary">
              out of 100
            </Text>
          </View>
          
          <View style={styles.qualityBreakdown}>
            <View style={styles.qualityItem}>
              <Text variant="caption" color="secondary">Average Mood</Text>
              <View style={styles.qualityBar}>
                <View 
                  style={[
                    styles.qualityFill,
                    { 
                      width: `${((stats.averageMood || 3) / 5) * 100}%`,
                      backgroundColor: theme.colors.primary
                    }
                  ]}
                />
              </View>
            </View>
            
            <View style={styles.qualityItem}>
              <Text variant="caption" color="secondary">Average Clarity</Text>
              <View style={styles.qualityBar}>
                <View 
                  style={[
                    styles.qualityFill,
                    { 
                      width: `${(stats.averageClarity || 50) / 100 * 100}%`,
                      backgroundColor: theme.colors.secondary
                    }
                  ]}
                />
              </View>
            </View>
          </View>
        </View>
      </InsightCard>
    </>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text variant="h3" style={styles.title}>
          Dream Analytics
        </Text>
        <Text variant="caption" color="secondary" style={styles.subtitle}>
          Discover patterns in your dream journey
        </Text>
      </View>

      <TabSelector
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={(tabId) => setActiveTab(tabId as TabType)}
      />

      <View style={styles.content}>
        {activeTab === 'overview' && renderOverviewTab()}
        {activeTab === 'patterns' && renderPatternsTab()}
        {activeTab === 'insights' && renderInsightsTab()}
        {activeTab === 'progress' && renderProgressTab()}
      </View>
    </ScrollView>
  );
};