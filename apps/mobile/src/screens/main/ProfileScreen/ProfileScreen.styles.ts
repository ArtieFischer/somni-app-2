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
    profileSection: {
      alignItems: 'center',
      marginBottom: theme.spacing.xl,
    },
    avatar: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: theme.colors.background.elevated,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: theme.spacing.medium,
      ...theme.shadows.medium,
    },
    username: {
      marginBottom: theme.spacing.xs,
    },
    section: {
      marginTop: theme.spacing.xl,
    },
  });
};