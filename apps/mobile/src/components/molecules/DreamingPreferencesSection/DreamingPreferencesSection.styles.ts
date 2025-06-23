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
      paddingHorizontal: theme.spacing.small,
      borderRadius: theme.borderRadius.small,
    },
    preferenceIcon: {
      fontSize: 24,
      textAlign: 'center' as any,
      width: 32,
    },
    preferenceLabel: {
      fontSize: theme.typography.body.fontSize,
      fontWeight: '500' as any,
      color: theme.colors.text.primary,
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
      fontStyle: 'italic',
      marginTop: theme.spacing.small,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: theme.spacing.large,
    },
    modalContent: {
      backgroundColor: theme.colors.background.primary,
      borderRadius: theme.borderRadius.large,
      padding: theme.spacing.large,
      width: '100%',
      maxWidth: 400,
      ...theme.shadows.large,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.large,
    },
    modalClose: {
      fontSize: 24,
      color: theme.colors.text.secondary,
      fontWeight: '300' as any,
    },
  });
};