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
    supportRow: {
      paddingVertical: theme.spacing.medium,
      paddingHorizontal: theme.spacing.small,
      borderRadius: theme.borderRadius.small,
    },
    supportIcon: {
      fontSize: 24,
      textAlign: 'center' as any,
      width: 32,
    },
    supportLabel: {
      fontSize: theme.typography.body.fontSize,
      fontWeight: '500' as any,
      color: theme.colors.text.primary,
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
  });
};