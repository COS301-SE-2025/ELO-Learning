// eslint.config.mjs
import parser from '@babel/eslint-parser';
import prettierConfig from 'eslint-config-prettier';

export default [
  {
    files: ['**/*.js'],
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
