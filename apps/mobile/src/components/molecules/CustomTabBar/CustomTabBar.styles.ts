import { StyleSheet } from 'react-native';
import { useTheme } from '../../../hooks/useTheme';

export const useStyles = () => {
  const theme = useTheme();

  const styles = StyleSheet.create({
    container: {
      backgroundColor: theme.colors.background.elevated,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border.primary,
      ...theme.shadows.medium,
    },
    tabBar: {
      flexDirection: 'row',
      height: 65,
      paddingHorizontal: theme.spacing.small,
      paddingBottom: theme.spacing.xs,
    },
    tab: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingTop: theme.spacing.small,
    },
    label: {
      fontSize: 11,
      marginTop: 2,
    },
    activeColor: theme.colors.primary,
    inactiveColor: theme.colors.text.secondary,
  });

  return styles;
};