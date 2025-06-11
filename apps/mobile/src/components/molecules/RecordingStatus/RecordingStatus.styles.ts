import { StyleSheet } from 'react-native';
import { useTheme } from '../../../hooks/useTheme';

export const useStyles = () => {
  const theme = useTheme();

  return StyleSheet.create({
    container: {
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
    processingText: {
      marginTop: theme.spacing.small,
      textAlign: 'center',
      fontStyle: 'italic',
    },
  });
};