import { StyleSheet } from 'react-native';
import { useTheme } from '../../../hooks/useTheme';

export const useStyles = () => {
  const theme = useTheme();

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background.primary,
    },
    innerContainer: {
      flex: 1,
      justifyContent: 'center',
    },
    content: {
      flex: 1,
      justifyContent: 'center',
      paddingVertical: theme.spacing.large,
      paddingHorizontal: theme.spacing.medium,
    },
    header: {
      alignItems: 'center',
      paddingHorizontal: theme.spacing.large,
      marginBottom: theme.spacing.large,
    },
    title: {
      textAlign: 'center',
      marginBottom: theme.spacing.small,
    },
    subtitle: {
      textAlign: 'center',
      lineHeight: 22,
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