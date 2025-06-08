import { StyleSheet } from 'react-native';
import { useTheme } from '../../../hooks/useTheme';

export const useStyles = () => {
  const theme = useTheme();

  return StyleSheet.create({
    animationContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: theme.spacing.xxl,
    },
    animation: {
      width: theme.spacing.xxl * 8, // Equivalent to 256
      height: theme.spacing.xxl * 8, // Equivalent to 256
    },
  });
}; 