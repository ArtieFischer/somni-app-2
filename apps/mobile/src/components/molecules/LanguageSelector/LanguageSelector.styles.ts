import { StyleSheet } from 'react-native';
import { useTheme } from '../../../hooks/useTheme';

export const useStyles = () => {
  const theme = useTheme();

  return StyleSheet.create({
    container: {
      marginVertical: 16,
    },
    label: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text.primary,
      marginBottom: 8,
    },
    selector: {
      backgroundColor: theme.colors.background.secondary,
      borderRadius: 12,
      padding: 16,
      borderWidth: 1,
      borderColor: theme.colors.border.primary,
    },
    selectorContent: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    selectedText: {
      fontSize: 16,
      color: theme.colors.text.primary,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    },
    modalContent: {
      backgroundColor: theme.colors.background.primary,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      maxHeight: '80%',
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border.primary,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: theme.colors.text.primary,
    },
    languageList: {
      paddingHorizontal: 20,
    },
    languageItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border.primary,
    },
    selectedLanguageItem: {
      backgroundColor: theme.colors.background.secondary,
      marginHorizontal: -20,
      paddingHorizontal: 20,
    },
    languageName: {
      fontSize: 16,
      color: theme.colors.text.primary,
      marginBottom: 4,
    },
    languageNativeName: {
      fontSize: 14,
      color: theme.colors.text.secondary,
    },
    selectedLanguageText: {
      color: theme.colors.primary,
      fontWeight: '600',
    },
    // Color properties for icons (React Native doesn't support color in styles for icons)
    chevronColor: {
      color: theme.colors.text.secondary,
    },
    closeIconColor: {
      color: theme.colors.text.primary,
    },
    checkmarkColor: {
      color: theme.colors.primary,
    },
  });
};