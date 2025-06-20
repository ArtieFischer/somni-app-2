import { StyleSheet } from 'react-native';
import { useTheme } from '../../../hooks/useTheme';

export const useStyles = (focused: boolean) => {
  const theme = useTheme();

  return StyleSheet.create({
    container: {
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
    },
    iconWrapper: {
      position: 'relative',
      alignItems: 'center',
      justifyContent: 'center',
    },
    recordIconWrapper: {
      // No special styling needed here since the parent handles it
    },
    recordingIconWrapper: {
      // Recording state handled by parent
    },
    icon: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    iconText: {
      fontSize: 24,
      color: theme.colors.text.primary,
    },
    recordingGlow: {
      position: 'absolute',
      width: 72,
      height: 72,
      borderRadius: 36,
      backgroundColor: '#FF0000',
      opacity: 0.2,
    },
  });
};