export default [
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'module',
    },
    extends: ['prettier'], // for disabling ESLint rules that cause issues with Prettier
    rules: {
      semi: ['error', 'always'],
      quotes: ['error', 'single'],
    },
  },
];
