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
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: theme.spacing.large,
    },
    recordButton: {
      width: 200,
      height: 200,
      borderRadius: 100,
      backgroundColor: theme.colors.background.elevated,
      borderWidth: 4,
      borderColor: theme.colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      ...theme.shadows.large,
    },
    recordingButton: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.accent,
    },
    recordButtonText: {
      fontSize: 48,
      marginBottom: theme.spacing.small,
    },
    recordButtonLabel: {
      color: theme.colors.text.primary,
    },
  });
};