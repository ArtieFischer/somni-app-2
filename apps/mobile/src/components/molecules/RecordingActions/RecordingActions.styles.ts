import { StyleSheet } from 'react-native';
import { useTheme } from '../../../hooks/useTheme';

export const useStyles = () => {
  const theme = useTheme();

  return StyleSheet.create({
    container: {
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