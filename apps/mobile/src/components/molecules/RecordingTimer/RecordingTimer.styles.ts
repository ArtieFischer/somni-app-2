import { StyleSheet } from 'react-native';
import { useTheme } from '../../../hooks/useTheme';

export const useStyles = () => {
  const theme = useTheme();

  return StyleSheet.create({
    container: {
      alignItems: 'center',
      marginTop: theme.spacing.xl,
    },
    timer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.small,
    },
    dot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: '#FF0000',
      marginRight: theme.spacing.small,
    },
    time: {
      color: theme.colors.text.primary,
      fontWeight: '600',
    },
    label: {
      color: theme.colors.text.secondary,
    },
  });
};