import { useColorScheme } from 'react-native';
import { useSettingsStore } from '@somni/stores';
import { lightTheme, darkTheme, Theme } from '@somni/theme';

export const useTheme = (): Theme => {
  const systemColorScheme = useColorScheme();
  const { settings } = useSettingsStore();
  
  const getTheme = (): Theme => {
    if (settings.theme === 'system') {
      return systemColorScheme === 'dark' ? darkTheme : lightTheme;
    }
    return settings.theme === 'dark' ? darkTheme : lightTheme;
  };
  
  return getTheme();
};