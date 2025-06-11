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
      padding: theme.spacing.large,
    },
    title: {
      marginBottom: theme.spacing.small,
    },
    stats: {
      marginTop: theme.spacing.xl,
      padding: theme.spacing.large,
      backgroundColor: theme.colors.background.elevated,
      borderRadius: theme.borderRadius.medium,
      alignItems: 'center',
      ...theme.shadows.small,
    },
  });
};