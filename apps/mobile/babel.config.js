module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'react-native-reanimated/plugin',
      [
        'module-resolver',
        {
          root: ['./src'],
          alias: {
            '@components': './src/components',
            '@screens': './src/screens',
            '@hooks': './src/hooks',
            '@services': './src/services',
            '@navigation': './src/navigation',
            '@somni/core': '../../packages/core/src',
            '@somni/types': '../../packages/types/src',
            '@somni/utils': '../../utils/src',
            '@somni/locales': '../../packages/locales/src',
            '@somni/theme': '../../packages/theme/src',
            '@somni/stores': '../../packages/stores/src',
          },
        },
      ],
    ],
  };
};