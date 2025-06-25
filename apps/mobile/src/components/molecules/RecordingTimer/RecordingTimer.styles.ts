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
      backgroundColor: theme.colors.status.recording,
      marginRight: theme.spacing.small,
    },
    dotWarning: {
      backgroundColor: '#FF6B6B',
    },
    time: {
      fontWeight: '600',
      fontSize: 24,
    },
    label: {
      // Color handled by Text component color prop
    },
  });
};