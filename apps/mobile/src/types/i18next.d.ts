import 'i18next';

declare module 'i18next' {
  interface CustomTypeOptions {
    returnNull: false;
    returnEmptyString: false;
    returnObjects: false;
  }
}

// This ensures that the translation function always returns a string
declare module 'react-i18next' {
  interface UseTranslationResponse<N extends Namespace = DefaultNamespace, KPrefix = undefined> {
    t: <
      TKeys extends TFuncKey<N, KPrefix> = TFuncKey<N, KPrefix>,
      TInterpolationMap extends object = StringMap
    >(
      key: TKeys | TKeys[],
      options?: TOptions<TInterpolationMap> | string
    ) => string;
  }
}