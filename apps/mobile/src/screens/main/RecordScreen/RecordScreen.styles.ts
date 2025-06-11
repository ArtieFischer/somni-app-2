import { StyleSheet, Dimensions } from 'react-native';
import { useTheme } from '../../../hooks/useTheme';

const { height: screenHeight } = Dimensions.get('window');

export const useStyles = () => {
  const theme = useTheme();

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background.primary,
    },
    scrollContent: {
      minHeight: screenHeight - 100, // Account for tab bar
    },
    content: {
      flex: 1,
      paddingVertical: theme.spacing.xl,
    },
    header: {
      alignItems: 'center',
      paddingHorizontal: theme.spacing.large,
      marginBottom: theme.spacing.xl,
    },
    title: {
      textAlign: 'center',
      marginBottom: theme.spacing.small,
    },
    subtitle: {
      textAlign: 'center',
      lineHeight: 22,
    },
    buttonSection: {
      alignItems: 'center',
      justifyContent: 'center',
      marginVertical: theme.spacing.xl,
    },
    instructionSection: {
      alignItems: 'center',
      paddingHorizontal: theme.spacing.large,
      marginTop: theme.spacing.xl,
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
    },
    offlineText: {
      color: theme.colors.text.secondary,
    },
    actions: {
      alignItems: 'center',
      marginTop: theme.spacing.xl,
    },
  });
};