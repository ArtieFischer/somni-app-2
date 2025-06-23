import { StyleSheet } from 'react-native';
import { useTheme } from '../../../hooks/useTheme';

export const useStyles = () => {
  const theme = useTheme();
  
  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.colors.background.primary,
    },
    container: {
      flex: 1,
      backgroundColor: theme.colors.background.primary,
    },
    content: {
      paddingBottom: theme.spacing.xl,
    },
    // Actions section styles removed - now handled by Card component
    signOutButton: {
      borderColor: theme.colors.secondary,
      borderWidth: 1,
    },
    signOutButtonText: {
      color: theme.colors.secondary,
      fontSize: theme.typography.body.fontSize,
      fontWeight: '500' as any,
    },
    deleteButton: {
      paddingVertical: theme.spacing.medium,
      alignItems: 'center',
    },
    deleteButtonText: {
      color: theme.colors.status.error,
      fontSize: theme.typography.body.fontSize,
      fontWeight: '500' as any,
      textDecorationLine: 'underline',
    },
    versionSection: {
      marginTop: theme.spacing.large,
      paddingTop: theme.spacing.large,
      paddingBottom: theme.spacing.xxl,
    },
    versionText: {
      fontSize: theme.typography.caption.fontSize,
      color: theme.colors.text.secondary,
      textAlign: 'center' as any,
    },
    taglineText: {
      fontSize: theme.typography.caption.fontSize,
      color: theme.colors.text.secondary,
      textAlign: 'center' as any,
      fontStyle: 'italic',
    },
  });
};