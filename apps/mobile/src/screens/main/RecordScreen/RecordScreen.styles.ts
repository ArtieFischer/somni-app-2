import { StyleSheet } from 'react-native';
import { useTheme } from '../../../hooks/useTheme';

export const useStyles = () => {
  const theme = useTheme();

  return StyleSheet.create({
    fullScreenContainer: {
      flex: 1,
      backgroundColor: '#000', // Fallback color
    },
    container: {
      flex: 1,
      backgroundColor: 'transparent', // Let the Skia background show through
    },
    innerContainer: {
      flex: 1,
    },
    content: {
      flex: 1,
      paddingTop: theme.spacing.medium,
      paddingBottom: theme.spacing.small,
      paddingHorizontal: theme.spacing.medium,
      justifyContent: 'space-between',
    },
    header: {
      alignItems: 'center',
      paddingHorizontal: theme.spacing.large,
      marginBottom: theme.spacing.medium,
      marginTop: theme.spacing.xl, // Add top margin
      minHeight: 80, // Changed to minHeight for flexibility
    },
    title: {
      textAlign: 'center',
      marginBottom: theme.spacing.small,
      color: 'rgba(255, 255, 255, 0.9)',
    },
    subtitle: {
      textAlign: 'center',
      lineHeight: 22,
      color: 'rgba(255, 255, 255, 0.7)',
    },
    centerButtonSection: {
      flex: 1, // Take remaining space
      alignItems: 'center',
      justifyContent: 'center',
    },
    actionsWrapper: {
      alignItems: 'center',
      width: '100%',
    },
    pendingHeader: {
      alignItems: 'center',
      marginBottom: theme.spacing.large,
    },
    pendingTitle: {
      textAlign: 'center',
      marginBottom: theme.spacing.small,
      color: 'rgba(255, 255, 255, 0.9)',
    },
    pendingSubtitle: {
      textAlign: 'center',
      lineHeight: 22,
      color: 'rgba(255, 255, 255, 0.7)',
    },
    timerSection: {
      alignItems: 'center',
      paddingVertical: theme.spacing.small,
      height: 80, // Fixed height
      marginTop: -theme.spacing.large, // Negative margin to move up
      marginBottom: theme.spacing.large, // Reduced space below timer
    },
    statusSection: {
      alignItems: 'center',
      paddingHorizontal: theme.spacing.large,
      marginTop: theme.spacing.small, // Small positive margin
      paddingBottom: theme.spacing.xxl,
      minHeight: 80, // Increased height
    },
    buttonSection: {
      alignItems: 'center',
      justifyContent: 'center',
      marginVertical: theme.spacing.medium,
    },
    instructionSection: {
      alignItems: 'center',
      paddingHorizontal: theme.spacing.large,
      marginTop: theme.spacing.large,
    },
    instruction: {
      textAlign: 'center',
      lineHeight: 22,
    },
    offlineNotice: {
      marginTop: theme.spacing.medium,
      paddingHorizontal: theme.spacing.medium,
      paddingVertical: theme.spacing.small,
      backgroundColor: theme.colors.background.secondary,
      borderRadius: theme.borderRadius.medium,
      borderLeftWidth: 3,
      borderLeftColor: theme.colors.status.warning,
    },
    offlineText: {
      color: theme.colors.text.secondary,
    },
    errorNotice: {
      marginTop: theme.spacing.small,
      paddingHorizontal: theme.spacing.medium,
      paddingVertical: theme.spacing.small,
      backgroundColor: theme.colors.background.secondary,
      borderRadius: theme.borderRadius.medium,
      borderLeftWidth: 3,
      borderLeftColor: theme.colors.status.error,
    },
    errorText: {
      color: theme.colors.status.error,
    },
    processingText: {
      marginTop: theme.spacing.small,
      textAlign: 'center',
      fontStyle: 'italic',
    },
    actionButtons: {
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
    moonContainer: {
      position: 'relative',
      width: 280,
      height: 280,
      alignItems: 'center',
      justifyContent: 'center',
    },
    moonButton: {
      width: 180,
      height: 180,
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2,
    },
    moonButtonPressed: {
      opacity: 0.7,
      transform: [{ scale: 0.95 }],
    },
    moonIcon: {
      // Icon styling if needed
    },
    silverCircle: {
      position: 'absolute',
      width: 240,
      height: 240,
      borderRadius: 120, // Half of width/height to make it a perfect circle
      backgroundColor: 'rgba(203, 213, 225, 0.25)', // Silver with 25% opacity
      borderWidth: 1,
      borderColor: 'rgba(248, 250, 252, 0.2)', // Subtle light border
      zIndex: 1,
    },
  });
};