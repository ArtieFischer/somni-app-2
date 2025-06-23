import { StyleSheet } from 'react-native';
import { useTheme } from '../../../hooks/useTheme';

export const useStyles = () => {
  const theme = useTheme();

  return StyleSheet.create({
    fullScreenContainer: {
      flex: 1,
      backgroundColor: '#000', // Fallback color
    },
    container: {
      flex: 1,
      backgroundColor: 'transparent', // Let the Skia background show through
    },
    innerContainer: {
      flex: 1,
    },
    content: {
      flex: 1,
      paddingVertical: theme.spacing.large,
      paddingHorizontal: theme.spacing.medium,
    },
    header: {
      alignItems: 'center',
      paddingHorizontal: theme.spacing.large,
      marginBottom: theme.spacing.large,
      paddingTop: theme.spacing.large,
    },
    title: {
      textAlign: 'center',
      marginBottom: theme.spacing.small,
      color: 'rgba(255, 255, 255, 0.9)',
    },
    subtitle: {
      textAlign: 'center',
      lineHeight: 22,
      color: 'rgba(255, 255, 255, 0.7)',
    },
    centerButtonSection: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 300,
    },
    actionsWrapper: {
      alignItems: 'center',
      width: '100%',
    },
    pendingHeader: {
      alignItems: 'center',
      marginBottom: theme.spacing.large,
    },
    pendingTitle: {
      textAlign: 'center',
      marginBottom: theme.spacing.small,
      color: 'rgba(255, 255, 255, 0.9)',
    },
    pendingSubtitle: {
      textAlign: 'center',
      lineHeight: 22,
      color: 'rgba(255, 255, 255, 0.7)',
    },
    timerSection: {
      alignItems: 'center',
      paddingVertical: theme.spacing.medium,
    },
    statusSection: {
      alignItems: 'center',
      paddingHorizontal: theme.spacing.large,
      paddingBottom: theme.spacing.large,
    },
    buttonSection: {
      alignItems: 'center',
      justifyContent: 'center',
      marginVertical: theme.spacing.medium,
    },
    instructionSection: {
      alignItems: 'center',
      paddingHorizontal: theme.spacing.large,
      marginTop: theme.spacing.large,
    },
    instruction: {
      textAlign: 'center',
      lineHeight: 22,
    },
    offlineNotice: {
      marginTop: theme.spacing.medium,
      paddingHorizontal: theme.spacing.medium,
      paddingVertical: theme.spacing.small,
      backgroundColor: theme.colors.background.secondary,
      borderRadius: theme.borderRadius.medium,
      borderLeftWidth: 3,
      borderLeftColor: theme.colors.status.warning,
    },
    offlineText: {
      color: theme.colors.text.secondary,
    },
    errorNotice: {
      marginTop: theme.spacing.small,
      paddingHorizontal: theme.spacing.medium,
      paddingVertical: theme.spacing.small,
      backgroundColor: theme.colors.background.secondary,
      borderRadius: theme.borderRadius.medium,
      borderLeftWidth: 3,
      borderLeftColor: theme.colors.status.error,
    },
    errorText: {
      color: theme.colors.status.error,
    },
    processingText: {
      marginTop: theme.spacing.small,
      textAlign: 'center',
      fontStyle: 'italic',
    },
    actionButtons: {
      alignItems: 'center',
      gap: theme.spacing.medium,
    },
    acceptButton: {
      width: 200,
      marginBottom: theme.spacing.small,
    },
    cancelButton: {
      width: 150,
    },
  });
};