import { StyleSheet } from 'react-native';
import { useTheme } from '../../../hooks/useTheme';

export const useStyles = () => {
  const theme = useTheme();

  const styles = StyleSheet.create({
    container: {
      backgroundColor: theme.colors.background.elevated,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border.primary,
    },
    tabBar: {
      flexDirection: 'row',
      height: 56,
      paddingHorizontal: theme.spacing.small,
      paddingBottom: theme.spacing.xs,
    },
    tab: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    recordTab: {
      marginTop: -theme.spacing.large,
    },
    recordButtonContainer: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    recordButton: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: theme.colors.secondary,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: theme.colors.secondary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 6,
      elevation: 6,
    },
    recordButtonRecording: {
      backgroundColor: '#FF0000',
      shadowColor: '#FF0000',
      shadowOpacity: 0.5,
    },
    label: {
      fontSize: 10,
      marginTop: 2,
      fontWeight: '500',
    },
  });

  return {
    ...styles,
    activeColor: theme.colors.secondary,
    inactiveColor: theme.colors.text.secondary,
  };
};