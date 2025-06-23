// Translation type augmentations
import { TFunction } from 'i18next';

// Ensure translation functions always return strings
declare module '../hooks/useTranslation' {
  export interface UseTranslationReturn {
    t: (key: string, options?: any) => string;
    i18n: any;
  }
  
  export function useTranslation(namespace?: string): UseTranslationReturn;
}