import { StyleSheet } from 'react-native';
import { useTheme } from '../../../hooks/useTheme';

export const useStyles = () => {
  const theme = useTheme();
  
  return StyleSheet.create({
    container: {
      backgroundColor: theme.colors.background.secondary,
      borderRadius: theme.borderRadius.large,
      padding: theme.spacing.large,
      marginBottom: theme.spacing.medium,
      ...theme.shadows.small,
    },
    sectionTitle: {
      fontSize: theme.typography.h3.fontSize,
      fontWeight: '600' as any,
      color: theme.colors.text.primary,
    },
    preferenceRow: {
      paddingVertical: theme.spacing.medium,
      paddingHorizontal: theme.spacing.small,
      borderRadius: theme.borderRadius.small,
    },
    preferenceIcon: {
      fontSize: 20,
      textAlign: 'center' as any,
      width: 24,
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
      fontSize: 18,
      color: theme.colors.text.secondary,
      fontWeight: '300' as any,
    },
    divider: {
      backgroundColor: theme.colors.border,
      height: 1,
      marginHorizontal: theme.spacing.medium,
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