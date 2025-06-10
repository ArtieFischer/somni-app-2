import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { en, es } from '@somni/locales';

const LANGUAGE_STORAGE_KEY = '@somni/language';

export const initI18n = async () => {
  try {
    // Get saved language or device default
    const savedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
    const deviceLanguage = Localization.getLocales()[0]?.languageCode || 'en';
    
    await i18n
      .use(initReactI18next)
      .init({
        compatibilityJSON: 'v3',
        resources: { en, es },
        lng: savedLanguage || deviceLanguage || 'en',
        fallbackLng: 'en',
        
        interpolation: {
          escapeValue: false,
        },
        
        // Namespaces for organization
        ns: ['common', 'dreams', 'auth'],
        defaultNS: 'common',
        
        react: {
          useSuspense: false,
        },
      });
  } catch (error) {
    console.error('Failed to initialize i18n:', error);
    // Fallback to English if initialization fails
    await i18n
      .use(initReactI18next)
      .init({
        compatibilityJSON: 'v3',
        resources: { en },
        lng: 'en',
        fallbackLng: 'en',
        interpolation: { escapeValue: false },
        ns: ['common', 'dreams', 'auth'],
        defaultNS: 'common',
        react: { useSuspense: false },
      });
  }
};

export const changeLanguage = async (language: string) => {
  try {
    await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    await i18n.changeLanguage(language);
  } catch (error) {
    console.error('Failed to change language:', error);
  }
};

export { i18n };