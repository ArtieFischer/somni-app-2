import { StyleSheet } from 'react-native';
import { useTheme } from '../../../hooks/useTheme';

export const useStyles = () => {
  const theme = useTheme();

  return StyleSheet.create({
    wrapper: {
      marginHorizontal: theme.spacing.medium,
      marginTop: theme.spacing.small,
    },
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: theme.spacing.medium,
      paddingVertical: theme.spacing.small,
      backgroundColor: theme.colors.background.secondary,
      borderRadius: theme.borderRadius.small,
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
    textContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.small,
    },
    statusText: {
      color: theme.colors.text.primary,
    },
    sizeText: {
      color: theme.colors.text.secondary,
      opacity: 0.7,
    },
    actions: {
      flexDirection: 'row',
      gap: theme.spacing.small,
      alignItems: 'center',
    },
    expandIcon: {
      marginLeft: theme.spacing.small,
      opacity: 0.6,
    },
    expandIconRotated: {
      transform: [{ rotate: '180deg' }],
    },
    expandedContainer: {
      backgroundColor: theme.colors.background.secondary,
      borderRadius: theme.borderRadius.small,
      padding: theme.spacing.medium,
      marginTop: theme.spacing.small,
    },
    statsGrid: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginBottom: theme.spacing.medium,
    },
    statItem: {
      alignItems: 'center',
    },
    statValue: {
      color: theme.colors.primary,
      fontWeight: '600',
    },
    statLabel: {
      color: theme.colors.text.secondary,
      marginTop: theme.spacing.xs,
    },
    lastProcessed: {
      color: theme.colors.text.secondary,
      textAlign: 'center',
      opacity: 0.7,
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