import { StyleSheet } from 'react-native';
import { useTheme } from '@hooks/useTheme';

export const useStyles = () => {
  const theme = useTheme();
  
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background.primary,
    },
    content: {
      flex: 1,
      justifyContent: 'center',
      paddingHorizontal: theme.spacing.large,
    },
    title: {
      textAlign: 'center',
      marginBottom: theme.spacing.small,
    },
    subtitle: {
      textAlign: 'center',
      marginBottom: theme.spacing.xl,
    },
    button: {
      marginTop: theme.spacing.large,
    },
    linkButton: {
      marginTop: theme.spacing.medium,
    },
  });
};