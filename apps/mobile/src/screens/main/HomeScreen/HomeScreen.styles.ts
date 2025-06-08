import { StyleSheet } from 'react-native';
import { useTheme } from '@hooks/useTheme';

export const useStyles = () => {
  const theme = useTheme();
  
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background.primary,
    },
    content: {
      padding: theme.spacing.large,
    },
    title: {
      marginBottom: theme.spacing.small,
    },
    subtitle: {
      marginBottom: theme.spacing.xl,
    },
    statsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: theme.spacing.xl,
    },
    statCard: {
      backgroundColor: theme.colors.background.elevated,
      padding: theme.spacing.large,
      borderRadius: theme.borderRadius.medium,
      alignItems: 'center',
      flex: 1,
      marginHorizontal: theme.spacing.small,
      ...theme.shadows.small,
    },
    statNumber: {
      marginBottom: theme.spacing.xs,
    },
    signOutButton: {
      marginTop: theme.spacing.large,
    },
  });
};