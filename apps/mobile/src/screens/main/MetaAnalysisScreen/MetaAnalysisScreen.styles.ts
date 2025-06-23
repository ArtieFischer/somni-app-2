import { StyleSheet } from 'react-native';
import { useTheme } from '../../../hooks/useTheme';

export const useStyles = () => {
  const theme = useTheme();

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background.primary,
    },
    content: {
      paddingBottom: theme.spacing.large,
    },
    
    // Stats card
    statsCard: {
      marginBottom: theme.spacing.large,
    },
    cardTitle: {
      marginBottom: theme.spacing.medium,
    },
    statRow: {
      flexDirection: 'row',
      justifyContent: 'space-around',
    },
    stat: {
      alignItems: 'center',
    },
    statValue: {
      color: theme.colors.primary,
      marginBottom: theme.spacing.xs,
    },
    
    // Coming soon card
    comingSoonCard: {
      alignItems: 'center',
      marginBottom: theme.spacing.xl,
    },
    icon: {
      fontSize: 64,
      marginBottom: theme.spacing.large,
    },
    title: {
      marginBottom: theme.spacing.small,
      textAlign: 'center',
    },
    description: {
      marginBottom: theme.spacing.medium,
      textAlign: 'center',
    },
    subtitle: {
      textAlign: 'center',
      lineHeight: 20,
      paddingHorizontal: theme.spacing.medium,
    },
    
    // Feature section
    featureSection: {
      marginTop: theme.spacing.medium,
    },
    sectionTitle: {
      marginBottom: theme.spacing.large,
    },
    featureCard: {
      marginBottom: theme.spacing.medium,
    },
    featureCardContent: {
      flexDirection: 'row',
      padding: theme.spacing.large,
    },
    featureIcon: {
      fontSize: 32,
      marginRight: theme.spacing.medium,
    },
    featureContent: {
      flex: 1,
    },
    featureTitle: {
      fontWeight: '600',
      marginBottom: theme.spacing.xs,
    },
  });
};