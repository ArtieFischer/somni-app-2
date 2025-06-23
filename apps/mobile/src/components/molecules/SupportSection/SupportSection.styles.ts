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
    supportRow: {
      paddingVertical: theme.spacing.medium,
      paddingHorizontal: theme.spacing.small,
      borderRadius: theme.borderRadius.small,
    },
    supportIcon: {
      fontSize: 20,
      textAlign: 'center' as any,
      width: 24,
    },
    supportLabel: {
      fontSize: theme.typography.body.fontSize,
      fontWeight: '500' as any,
      color: theme.colors.text.primary,
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
  });
};