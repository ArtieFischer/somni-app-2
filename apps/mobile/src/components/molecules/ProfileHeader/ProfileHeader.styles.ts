import { StyleSheet } from 'react-native';
import { useTheme } from '../../../hooks/useTheme';

export const useStyles = () => {
  const theme = useTheme();
  
  return StyleSheet.create({
    // customCardStyle removed - using Card component defaults now
    cardContent: {
      padding: theme.spacing.xl,
      paddingTop: theme.spacing.xxl,
      paddingBottom: theme.spacing.xl,
    },
    avatarContainer: {
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: theme.colors.background.elevated,
      overflow: 'hidden',
      borderWidth: 3,
      borderColor: theme.colors.primary,
    },
    avatarImage: {
      width: 120,
      height: 120,
    },
    avatarFallbackContainer: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    avatarFallbackText: {
      fontSize: 48,
      fontWeight: '600' as any,
      color: theme.colors.text.primary,
      lineHeight: 48,
      includeFontPadding: false,
      textAlignVertical: 'center' as any,
    },
    displayName: {
      fontSize: theme.typography.h1.fontSize,
      fontWeight: '700' as any,
      color: theme.colors.text.primary,
      textAlign: 'center' as any,
      marginBottom: theme.spacing.xs,
    },
    email: {
      fontSize: theme.typography.body.fontSize + 2,
      color: theme.colors.text.secondary,
      textAlign: 'center' as any,
    },
    location: {
      fontSize: theme.typography.caption.fontSize,
      color: theme.colors.text.secondary,
      textAlign: 'center' as any,
    },
    handle: {
      fontSize: theme.typography.caption.fontSize,
      color: theme.colors.text.secondary,
      textAlign: 'center' as any,
      fontWeight: '500' as any,
    },
    accountAgePill: {
      backgroundColor: theme.colors.primary + '20',
      paddingHorizontal: theme.spacing.medium,
      paddingVertical: theme.spacing.small,
      borderRadius: theme.borderRadius.round,
      marginTop: theme.spacing.small,
    },
    accountAgeText: {
      fontSize: theme.typography.caption.fontSize,
      color: theme.colors.primary,
      fontWeight: '600' as any,
    },
    premiumIcon: {
      fontSize: 12,
      marginRight: 2,
    },
  });
};