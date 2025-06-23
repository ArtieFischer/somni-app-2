import { StyleSheet } from 'react-native';
import { useTheme } from '../../../hooks/useTheme';

export const useStyles = () => {
  const theme = useTheme();
  
  return StyleSheet.create({
    // Container styles removed - now handled by Card component
    sectionTitle: {
      fontSize: theme.typography.h3.fontSize,
      fontWeight: '600' as any,
      color: theme.colors.text.primary,
    },
    emptyStateContainer: {
      backgroundColor: theme.colors.background.primary,
      borderRadius: theme.borderRadius.medium,
      padding: theme.spacing.xl,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderStyle: 'dashed',
    },
    emptyStateIcon: {
      fontSize: 48,
      marginBottom: theme.spacing.small,
    },
    emptyStateTitle: {
      fontSize: theme.typography.body.fontSize,
      fontWeight: '600' as any,
      color: theme.colors.text.primary,
      textAlign: 'center' as any,
    },
    emptyStateSubtitle: {
      fontSize: theme.typography.caption.fontSize,
      color: theme.colors.text.secondary,
      textAlign: 'center' as any,
      lineHeight: 18,
      paddingHorizontal: theme.spacing.medium,
    },
    emptyStateButtons: {
      width: '100%',
      marginTop: theme.spacing.small,
    },
    buttonText: {
      fontSize: theme.typography.caption.fontSize,
      fontWeight: '500' as any,
    },
    viewAllButton: {
      alignItems: 'center',
      paddingVertical: theme.spacing.small,
    },
    viewAllText: {
      fontSize: theme.typography.caption.fontSize,
      color: theme.colors.text.secondary,
      textDecorationLine: 'underline',
    },
  });
};