import { StyleSheet } from 'react-native';
import { useTheme } from '../../../hooks/useTheme';

export const useStyles = () => {
  const theme = useTheme();

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background.primary,
    },
    header: {
      paddingHorizontal: theme.spacing.large,
      paddingTop: theme.spacing.xxl,
      paddingBottom: theme.spacing.large,
    },
    title: {
      textAlign: 'center',
    },
    description: {
      textAlign: 'center',
      marginTop: theme.spacing.medium,
    },
    content: {
      flex: 1,
      justifyContent: 'center',
      paddingHorizontal: theme.spacing.large,
    },
    footer: {
      padding: theme.spacing.large,
    },
    skipButton: {
      marginTop: theme.spacing.medium,
    },
  });
}; 