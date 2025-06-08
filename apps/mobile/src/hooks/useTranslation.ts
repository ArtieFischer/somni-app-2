import { useTranslation as useI18nTranslation } from 'react-i18next';
import type { TranslationKeys, Namespace } from '@somni/locales';

export const useTranslation = <N extends Namespace>(namespace?: N) => {
  const { t, ...rest } = useI18nTranslation(namespace);
  
  return {
    t: (key: string, options?: any) => t(key, options),
    ...rest,
  };
};