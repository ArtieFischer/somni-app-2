import { StyleSheet } from 'react-native';
import { useTheme } from '../../../hooks/useTheme';

export const useStyles = () => {
  const theme = useTheme();

  return StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: theme.spacing.medium,
      paddingVertical: theme.spacing.small,
      backgroundColor: theme.colors.background.secondary,
      borderRadius: theme.borderRadius.small,
      marginHorizontal: theme.spacing.medium,
      marginTop: theme.spacing.small,
    },
    statusContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    statusIndicator: {
      width: 8,
      height: 8,
      borderRadius: 4,
      marginRight: theme.spacing.small,
    },
    statusText: {
      color: theme.colors.text.secondary,
      marginRight: theme.spacing.small,
    },
    sizeText: {
      color: theme.colors.text.secondary,
      opacity: 0.7,
    },
    actions: {
      flexDirection: 'row',
      gap: theme.spacing.small,
    },
    statusError: {
      backgroundColor: theme.colors.status.error,
    },
    statusProcessing: {
      backgroundColor: theme.colors.status.warning,
    },
    statusOffline: {
      backgroundColor: theme.colors.text.secondary,
    },
    statusPending: {
      backgroundColor: theme.colors.accent,
    },
  });
};