import { StyleSheet, Dimensions } from 'react-native';
import { useTheme } from '../../../hooks/useTheme';

const BUTTON_SIZE = 180;
const { width: screenWidth } = Dimensions.get('window');

export const useStyles = (isRecording: boolean) => {
  const theme = useTheme();

  return StyleSheet.create({
    container: {
      width: screenWidth,
      height: screenWidth,
      alignItems: 'center',
      justifyContent: 'center',
    },
    waveformContainer: {
      position: 'absolute',
      width: screenWidth,
      height: screenWidth,
      alignItems: 'center',
      justifyContent: 'center',
    },
    waveformLayer: {
      position: 'absolute',
      width: BUTTON_SIZE,
      height: BUTTON_SIZE,
      borderRadius: BUTTON_SIZE / 2,
      borderWidth: 2,
      backgroundColor: 'transparent',
    },
    buttonWrapper: {
      width: BUTTON_SIZE,
      height: BUTTON_SIZE,
      alignItems: 'center',
      justifyContent: 'center',
    },
    button: {
      width: BUTTON_SIZE,
      height: BUTTON_SIZE,
      borderRadius: BUTTON_SIZE / 2,
      backgroundColor: isRecording 
        ? theme.colors.primary 
        : theme.colors.background.elevated,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: isRecording ? 0 : 3,
      borderColor: theme.colors.primary,
      ...theme.shadows.large,
      overflow: 'hidden',
    },
    buttonPressed: {
      opacity: 0.9,
    },
    gradientLayer1: {
      position: 'absolute',
      width: BUTTON_SIZE,
      height: BUTTON_SIZE,
      borderRadius: BUTTON_SIZE / 2,
      backgroundColor: theme.colors.accent,
      opacity: 0.3,
    },
    gradientLayer2: {
      position: 'absolute',
      width: BUTTON_SIZE * 0.8,
      height: BUTTON_SIZE * 0.8,
      borderRadius: (BUTTON_SIZE * 0.8) / 2,
      backgroundColor: theme.colors.secondary,
      opacity: 0.2,
    },
    centerContent: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    iconContainer: {
      width: 60,
      height: 60,
      alignItems: 'center',
      justifyContent: 'center',
    },
    micIcon: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    micEmoji: {
      fontSize: 40,
    },
    stopIcon: {
      width: 30,
      height: 30,
      backgroundColor: theme.colors.text.inverse,
      borderRadius: 4,
    },
    recordingDot: {
      position: 'absolute',
      top: 20,
      right: 20,
      width: 12,
      height: 12,
      borderRadius: 6,
      backgroundColor: '#FF0000',
    },
  });
};