import { StyleSheet } from 'react-native';
import { useTheme } from '../../../hooks/useTheme';

export const useStyles = (focused: boolean) => {
  const theme = useTheme();

  return StyleSheet.create({
    container: {
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      width: 60,
      height: 60,
    },
    iconWrapper: {
      position: 'relative',
      alignItems: 'center',
      justifyContent: 'center',
    },
    recordIconWrapper: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: focused ? theme.colors.primary : 'transparent',
      borderWidth: focused ? 0 : 2,
      borderColor: theme.colors.primary,
    },
    icon: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    iconText: {
      fontSize: 24,
    },
    recordingGlow: {
      position: 'absolute',
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: theme.colors.primary,
      opacity: 0.2,
      ...theme.shadows.medium,
    },
  });
};