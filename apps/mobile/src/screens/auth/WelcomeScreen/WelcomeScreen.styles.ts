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
      flex: 1,
      justifyContent: 'space-between',
      paddingHorizontal: theme.spacing.large,
      paddingVertical: theme.spacing.xl,
    },
    header: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    title: {
      textAlign: 'center',
      marginBottom: theme.spacing.medium,
      color: theme.colors.primary,
    },
    tagline: {
      textAlign: 'center',
      marginBottom: theme.spacing.xl,
    },
    actions: {
      gap: theme.spacing.medium,
    },
    primaryButton: {
      marginBottom: theme.spacing.small,
    },
    secondaryButton: {
      // Additional styling if needed
    },
  });
};