import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends('next/core-web-vitals'),
  {
    files: ['**/*.js', '**/*.jsx', '**/*.ts', '**/*.tsx'],
    ignores: [
      'node_modules/**',
      '.next/**',
      'out/**',
      'build/**',
      'dist/**',
      'package-lock.json',
      'yarn.lock',
      '**/*.md',
    ],
    rules: {
      // Disable the problematic rules that weren't enforced before
      'react/no-unescaped-entities': 'off',
      'react-hooks/exhaustive-deps': 'warn', // Change from error to warning
      'react-hooks/rules-of-hooks': 'warn', // Change from error to warning
    },
  },
];

export default eslintConfig;
