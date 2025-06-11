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
    placeholder: {
      marginTop: theme.spacing.xl,
      padding: theme.spacing.xl,
      backgroundColor: theme.colors.background.secondary,
      borderRadius: theme.borderRadius.medium,
      alignItems: 'center',
    },
  });
};