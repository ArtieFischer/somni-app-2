import { StyleSheet } from 'react-native';
import { useTheme } from '../../../hooks/useTheme';

export const useStyles = () => {
  const theme = useTheme();

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background.primary,
    },
    content: {
      paddingBottom: theme.spacing.xxl,
    },
    
    // Profile section
    profileSection: {
      alignItems: 'center',
      paddingVertical: theme.spacing.xl,
      paddingHorizontal: theme.spacing.large,
      backgroundColor: theme.colors.background.elevated,
      borderBottomLeftRadius: theme.borderRadius.large,
      borderBottomRightRadius: theme.borderRadius.large,
      ...theme.shadows.medium,
    },
    avatar: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: theme.colors.primary + '20',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: theme.spacing.medium,
      borderWidth: 3,
      borderColor: theme.colors.primary,
    },
    username: {
      marginBottom: theme.spacing.xs,
      textAlign: 'center',
    },
    premiumBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.accent + '20',
      paddingHorizontal: theme.spacing.medium,
      paddingVertical: theme.spacing.small,
      borderRadius: theme.borderRadius.round,
      marginTop: theme.spacing.medium,
    },
    premiumIcon: {
      fontSize: 16,
      marginRight: theme.spacing.xs,
    },
    premiumText: {
      color: theme.colors.accent,
      fontWeight: '600',
    },
    
    // Stats section
    statsSection: {
      padding: theme.spacing.large,
    },
    statsGrid: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: theme.spacing.medium,
    },
    statCard: {
      flex: 1,
      backgroundColor: theme.colors.background.elevated,
      padding: theme.spacing.medium,
      borderRadius: theme.borderRadius.medium,
      alignItems: 'center',
      marginHorizontal: theme.spacing.xs,
      ...theme.shadows.small,
    },
    statValue: {
      color: theme.colors.primary,
      marginBottom: theme.spacing.xs,
    },
    
    // Settings section
    section: {
      paddingHorizontal: theme.spacing.large,
      marginBottom: theme.spacing.xl,
    },
    sectionTitle: {
      marginBottom: theme.spacing.medium,
      color: theme.colors.text.primary,
    },
    settingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: theme.colors.background.elevated,
      padding: theme.spacing.medium,
      borderRadius: theme.borderRadius.medium,
      marginBottom: theme.spacing.small,
      ...theme.shadows.small,
    },
    settingLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    settingIcon: {
      fontSize: 20,
      marginRight: theme.spacing.medium,
    },
    settingLabel: {
      flex: 1,
    },
    settingRight: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    settingValue: {
      marginRight: theme.spacing.small,
    },
    chevron: {
      fontSize: 20,
      color: theme.colors.text.secondary,
      marginLeft: theme.spacing.xs,
    },
    switchTrack: {
      color: theme.colors.primary,
    },
    switchThumb: {
      color: theme.colors.accent,
    },
    
    // Danger zone
    dangerButton: {
      marginTop: theme.spacing.medium,
      alignItems: 'center',
      padding: theme.spacing.medium,
    },
    dangerButtonText: {
      color: theme.colors.status.error,
    },
    
    // Version info
    versionInfo: {
      alignItems: 'center',
      paddingVertical: theme.spacing.xl,
      paddingHorizontal: theme.spacing.large,
    },
  });
};