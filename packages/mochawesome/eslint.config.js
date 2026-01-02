import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';
import vitest from '@vitest/eslint-plugin';
import globals from 'globals';

export default [
  js.configs.recommended,

  // TypeScript (no type-aware rules yet; keep it fast and low-friction)
  ...tseslint.configs.recommended,

  // Disable stylistic rules that conflict with Prettier
  prettier,

  {
    ignores: [
      'dist/**',
      'coverage/**',
      '.tmp-mochawesome-*/**',
      'node_modules/**',
      '**/*.cjs',
    ],
  },

  {
    files: ['**/*.ts', '**/*.tsx'],
    plugins: {
      vitest,
    },
    languageOptions: {
      globals: {
        ...vitest.environments.env.globals,
      },
    },
    rules: {
      ...vitest.configs.recommended.rules,
      // Keep “new” TS code clean without overengineering:
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },

  // Mocha spec-specific
  {
    files: ['**/*.spec.js'],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.mocha,
      },
    },
  },
];
