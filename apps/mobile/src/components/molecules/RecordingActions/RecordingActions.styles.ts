import { StyleSheet } from 'react-native';
import { useTheme } from '../../../hooks/useTheme';

export const useStyles = () => {
  const theme = useTheme();

  return StyleSheet.create({
    container: {
      alignItems: 'center',
      gap: theme.spacing.medium,
      width: '100%',
      paddingHorizontal: theme.spacing.large,
    },
    buttonWrapper: {
      width: '100%',
      maxWidth: 280,
    },
  });
};