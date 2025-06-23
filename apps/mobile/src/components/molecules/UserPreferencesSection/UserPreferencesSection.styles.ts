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
      marginBottom: theme.spacing.small,
    },
    preferenceRow: {
      paddingVertical: theme.spacing.medium,
    },
    preferenceIcon: {
      fontSize: 24,
      width: 32,
      textAlign: 'center' as any,
    },
    preferenceLabel: {
      fontSize: theme.typography.body.fontSize,
      color: theme.colors.text.primary,
      fontWeight: '500' as any,
    },
    preferenceValue: {
      fontSize: theme.typography.caption.fontSize,
      color: theme.colors.text.secondary,
      marginTop: 2,
    },
    chevron: {
      fontSize: 24,
      color: theme.colors.text.secondary,
      marginLeft: theme.spacing.small,
    },
    divider: {
      backgroundColor: theme.colors.border.primary,
      height: 1,
      marginHorizontal: 0,
      opacity: 0.4,
    },
    updatingText: {
      textAlign: 'center' as any,
      marginTop: theme.spacing.small,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      justifyContent: 'flex-end',
    },
    modalContent: {
      backgroundColor: theme.colors.background.elevated,
      borderTopLeftRadius: theme.borderRadius.large,
      borderTopRightRadius: theme.borderRadius.large,
      paddingBottom: theme.spacing.xl,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: theme.spacing.large,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border.primary,
    },
    modalClose: {
      fontSize: 32,
      color: theme.colors.text.secondary,
      lineHeight: 32,
    },
    input: {
      backgroundColor: theme.colors.background.primary,
      borderRadius: theme.borderRadius.medium,
      padding: theme.spacing.medium,
      fontSize: theme.typography.body.fontSize,
      color: theme.colors.text.primary,
      borderWidth: 1,
      borderColor: theme.colors.border.primary,
    },
  });
};