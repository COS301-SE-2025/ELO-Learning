// eslint.config.mjs
import parser from '@babel/eslint-parser';
import prettierConfig from 'eslint-config-prettier';

export default [
  {
    files: ['**/*.js'],
    ignores: [
      '**/node_modules/**',
      '**/build/**',
      '**/dist/**',
      '**/.next/**',
      '**/out/**',
      '**/coverage/**',
      '**/package-lock.json',
      '**/yarn.lock',
      '**/*.md',
      '**/PUSH_NOTIFICATIONS_SETUP.md',
    ],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      parser,
      parserOptions: {
        requireConfigFile: true,
        babelOptions: {
          configFile: './babel.config.js',
        },
      },
    },
    rules: {
      semi: ['error', 'always'],
      quotes: ['error', 'single'],
    },
  },
  prettierConfig,
];
