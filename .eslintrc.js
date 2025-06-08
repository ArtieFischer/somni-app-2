module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'prettier', 'react', 'react-hooks'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'prettier',
  ],
  settings: {
    react: {
      version: 'detect',
    },
  },
  rules: {
    'prettier/prettier': 'warn',
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
  },
  env: {
    node: true,
    es6: true,
  },
  overrides: [
    {
      files: ['*.js', '*.jsx'],
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    // You might want specific overrides for .ts and .tsx files if not covered by plugins
    {
        files: ["**/__tests__/**/*.[jt]s?(x)", "**/?(*.)+(spec|test).[jt]s?(x)"],
        env: {
            jest: true, // or "mocha": true, etc.
        }
    }
  ],
};