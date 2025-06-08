module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
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
            // Monorepo packages
            '@somni/core': '../../packages/core/src',
            '@somni/types': '../../types/src',
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