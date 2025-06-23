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
      padding: theme.spacing.large,
      paddingBottom: theme.spacing.xl,
    },
    actionsSection: {
      backgroundColor: theme.colors.background.secondary,
      borderRadius: theme.borderRadius.large,
      padding: theme.spacing.large,
      marginBottom: theme.spacing.medium,
      ...theme.shadows.small,
    },
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
      paddingVertical: theme.spacing.large,
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