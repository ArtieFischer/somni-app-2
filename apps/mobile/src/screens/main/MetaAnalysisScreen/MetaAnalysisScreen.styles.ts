import { StyleSheet } from 'react-native';
import { useTheme } from '../../../hooks/useTheme';

export const useStyles = () => {
  const theme = useTheme();

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background.primary,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      marginTop: theme.spacing.medium,
    },
    
    // Header
    header: {
      paddingHorizontal: theme.spacing.large,
      paddingTop: theme.spacing.large,
      paddingBottom: theme.spacing.medium,
    },
    title: {
      fontSize: 28,
      fontWeight: '700',
      color: theme.colors.text.primary,
      marginBottom: 4,
    },
    subtitle: {
      fontSize: 14,
      opacity: 0.7,
    },
    
    // Content
    content: {
      paddingBottom: theme.spacing.xxl,
    },
    
    // Metrics Grid
    metricsGrid: {
      flexDirection: 'row',
      gap: theme.spacing.medium,
      marginBottom: theme.spacing.medium,
    },
    
    // Charts
    weeklyChart: {
      marginTop: -theme.spacing.small,
    },
    
    // Mood Trend
    moodTrend: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
      height: 80,
      paddingHorizontal: theme.spacing.small,
    },
    moodDay: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'flex-end',
    },
    moodBar: {
      width: 24,
      borderRadius: 12,
      marginBottom: 4,
    },
    moodLabel: {
      fontSize: 10,
      opacity: 0.6,
    },
    
    // Hours Grid
    hoursGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.medium,
    },
    hourItem: {
      alignItems: 'center',
      width: '30%',
    },
    hourTime: {
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 4,
    },
    
    // Clarity Bars
    clarityBars: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
      height: 100,
    },
    clarityItem: {
      flex: 1,
      alignItems: 'center',
    },
    clarityBarContainer: {
      width: '100%',
      height: 80,
      justifyContent: 'flex-end',
      alignItems: 'center',
    },
    clarityBar: {
      width: '60%',
      borderRadius: 4,
    },
    clarityLabel: {
      fontSize: 10,
      marginTop: 4,
      opacity: 0.6,
    },
    
    // Emotions
    emotionList: {
      gap: theme.spacing.medium,
    },
    emotionItem: {
      gap: theme.spacing.small,
    },
    emotionInfo: {
      marginBottom: 4,
    },
    emotionName: {
      fontSize: 15,
      fontWeight: '600',
    },
    emotionBarContainer: {
      height: 6,
      backgroundColor: theme.colors.background.secondary,
      borderRadius: 3,
      overflow: 'hidden',
    },
    emotionBar: {
      height: '100%',
      borderRadius: 3,
    },
    
    // Symbols
    symbolGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.small,
    },
    symbolTag: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.medium,
      paddingVertical: theme.spacing.small,
      borderRadius: 20,
      borderWidth: 1,
      gap: 4,
    },
    symbolText: {
      fontSize: 13,
      fontWeight: '500',
    },
    symbolCount: {
      fontSize: 11,
      opacity: 0.6,
    },
    
    // Location
    locationRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: theme.spacing.medium,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border.primary + '15',
    },
    locationName: {
      flex: 1,
      fontSize: 15,
    },
    locationStats: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.medium,
    },
    moodIndicator: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    moodDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    
    // Progress
    progressSection: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.large,
    },
    progressRingContainer: {
      alignItems: 'center',
    },
    progressStats: {
      flex: 1,
      gap: theme.spacing.medium,
    },
    progressStat: {
      gap: 2,
    },
    progressValue: {
      fontSize: 24,
      fontWeight: '700',
    },
    monthlyTrend: {
      marginTop: theme.spacing.large,
    },
    trendTitle: {
      marginBottom: theme.spacing.medium,
      textAlign: 'center',
    },
    
    // Quality
    qualitySection: {
      alignItems: 'center',
      gap: theme.spacing.large,
    },
    qualityScore: {
      alignItems: 'center',
    },
    bigScore: {
      fontSize: 64,
      fontWeight: '800',
      lineHeight: 72,
    },
    qualityBreakdown: {
      width: '100%',
      gap: theme.spacing.medium,
    },
    qualityItem: {
      gap: theme.spacing.small,
    },
    qualityBar: {
      height: 8,
      backgroundColor: theme.colors.background.secondary,
      borderRadius: 4,
      overflow: 'hidden',
    },
    qualityFill: {
      height: '100%',
      borderRadius: 4,
    },
    
    // Legacy styles (kept for compatibility)
    overviewCard: {},
    cardTitle: {},
    overviewGrid: {},
    overviewItem: {},
    overviewStats: {},
    statItem: {},
    statValue: {},
    chartCard: {},
    sectionTitle: {},
    chartSubtitle: {},
    tagContainer: {},
    tag: {},
    tagText: {},
    locationList: {},
    locationItem: {},
    locationMood: {},
    statsCard: {},
    statRow: {},
    stat: {},
    comingSoonCard: {},
    icon: {},
    title: {},
    description: {},
    subtitle: {},
    featureSection: {},
    featureCard: {},
    featureCardContent: {},
    featureIcon: {},
    featureContent: {},
    featureTitle: {},
  });
};