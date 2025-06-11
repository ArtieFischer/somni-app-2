import { StyleSheet } from 'react-native';
import { useTheme } from '../../../hooks/useTheme';

export const useStyles = () => {
  const theme = useTheme();

  return StyleSheet.create({
    container: {
      marginHorizontal: theme.spacing.medium,
      marginTop: theme.spacing.small,
    },
    progressItem: {
      backgroundColor: theme.colors.background.elevated,
      borderRadius: theme.borderRadius.medium,
      padding: theme.spacing.medium,
      marginBottom: theme.spacing.small,
      ...theme.shadows.small,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.small,
    },
    title: {
      color: theme.colors.text.primary,
      fontWeight: '600',
    },
    percentage: {
      color: theme.colors.primary,
      fontWeight: '600',
    },
    progressBarContainer: {
      height: 4,
      backgroundColor: theme.colors.background.secondary,
      borderRadius: 2,
      overflow: 'hidden',
      marginBottom: theme.spacing.small,
    },
    progressBar: {
      height: '100%',
      backgroundColor: theme.colors.primary,
      borderRadius: 2,
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    sizeText: {
      color: theme.colors.text.secondary,
      fontSize: 12,
    },
    speedText: {
      color: theme.colors.text.secondary,
      fontSize: 12,
    },
  });
};