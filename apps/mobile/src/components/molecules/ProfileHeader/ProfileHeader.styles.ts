import { StyleSheet } from 'react-native';
import { useTheme } from '../../../hooks/useTheme';
import { Theme } from '@somni/theme';

export const useStyles = () => {
  const theme = useTheme();
  
  return StyleSheet.create({
    container: {
      backgroundColor: theme.colors.background.secondary,
      borderRadius: theme.borderRadius.large,
      padding: theme.spacing.large,
      marginBottom: theme.spacing.medium,
      ...theme.shadows.medium,
    },
    avatar: {
      borderWidth: 3,
      borderColor: theme.colors.primary,
    },
    avatarFallback: {
      fontSize: 28,
      fontWeight: '600' as any,
      color: theme.colors.text.primary,
    },
    avatarBadge: {
      backgroundColor: theme.colors.background.primary,
      borderColor: theme.colors.primary,
      borderWidth: 2,
    },
    avatarBadgeText: {
      fontSize: 12,
    },
    displayName: {
      fontSize: theme.typography.h2.fontSize,
      fontWeight: '700' as any,
      color: theme.colors.text.primary,
      textAlign: 'center' as any,
    },
    email: {
      fontSize: theme.typography.body.fontSize,
      color: theme.colors.text.secondary,
      textAlign: 'center' as any,
    },
    handle: {
      fontSize: theme.typography.caption.fontSize,
      color: theme.colors.text.secondary,
      textAlign: 'center' as any,
      fontWeight: '500' as any,
    },
    accountAge: {
      fontSize: theme.typography.caption.fontSize,
      color: theme.colors.text.secondary,
      textAlign: 'center' as any,
      fontStyle: 'italic',
      marginTop: 2,
    },
    premiumIcon: {
      fontSize: 12,
      marginRight: 2,
    },
  });
};