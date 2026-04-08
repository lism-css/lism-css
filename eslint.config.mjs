// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from 'eslint-plugin-storybook';

import { defineConfig } from 'eslint/config';
import react from 'eslint-plugin-react';
import eslintConfigPrettier from 'eslint-config-prettier/flat';
import globals from 'globals';
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default defineConfig(
  {
    ignores: [
      '**/dist/**',
      '**/node_modules/**',
      '**/.astro/**',
      '**/.turbo/**',
      'apps/playgrounds/**',
      'apps/catalog/.storybook/**',
      'apps/catalog/storybook-static/**',
      'eslint.config.mjs',
      'lint-staged.config.mjs',
      '**/bin/**/*.mjs',
      'packages/lism-css/config.d.ts',
      '**/.prettierrc.cjs',
      '**/.stylelintrc.mjs',
      '**/.astro/**',
      '**/vite.config.*',
      // lism-ui: Astro 向けファイルは tsconfig から exclude されているため ESLint の型チェック対象外
      'packages/lism-ui/src/**/astro/**',
      'packages/lism-ui/src/components/astro.ts',
    ],
  },
  eslintConfigPrettier,
  eslint.configs.recommended,
  // JavaScriptファイルには通常のrecommendedを適用
  tseslint.configs.recommended,
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },

      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        projectService: {
          allowDefaultProject: ['scripts/*.mjs'],
        },
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  // TypeScriptファイルには型チェック付きのrecommendedを適用
  {
    files: ['**/*.ts', '**/*.tsx'],
    extends: [tseslint.configs.recommendedTypeChecked],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    // extends: compat.extends('plugin:react/recommended'),
    settings: {
      react: {
        version: '18',
      },
    },
    plugins: {
      react,
    },
    rules: {
      'react/react-in-jsx-scope': 0,
      'react/prop-types': 0,

      'react/no-unknown-property': [
        2,
        {
          ignore: ['jsx', 'global'],
        },
      ],

      // TypeScript ESLint rules
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
    },
  },
  {
    files: ['**/*.test.ts', '**/*.test.tsx'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
    },
  },
  ...storybook.configs['flat/recommended'],
  {
    // tsconfig から除外されている lism-ui astro re-exports は
    // allowDefaultProject で型チェックなし lint のみ実施
    files: [
      'packages/lism-ui/src/**/astro/index.ts',
      'packages/lism-ui/src/**/astro/transformTabitems.ts',
      'packages/lism-ui/src/components/astro.ts',
    ],
    languageOptions: {
      parserOptions: {
        projectService: {
          allowDefaultProject: [
            'packages/lism-ui/src/components/Accordion/astro/index.ts',
            'packages/lism-ui/src/components/Alert/astro/index.ts',
            'packages/lism-ui/src/components/Avatar/astro/index.ts',
            'packages/lism-ui/src/components/Badge/astro/index.ts',
            'packages/lism-ui/src/components/Button/astro/index.ts',
            'packages/lism-ui/src/components/Callout/astro/index.ts',
            'packages/lism-ui/src/components/Chat/astro/index.ts',
            'packages/lism-ui/src/components/Details/astro/index.ts',
            'packages/lism-ui/src/components/DummyImage/astro/index.ts',
            'packages/lism-ui/src/components/DummyText/astro/index.ts',
            'packages/lism-ui/src/components/Modal/astro/index.ts',
            'packages/lism-ui/src/components/NavMenu/astro/index.ts',
            'packages/lism-ui/src/components/ShapeDivider/astro/index.ts',
            'packages/lism-ui/src/components/Tabs/astro/index.ts',
            'packages/lism-ui/src/components/Tabs/astro/transformTabitems.ts',
            'packages/lism-ui/src/components/astro.ts',
          ],
          maximumDefaultProjectFileMatchCount_THIS_WILL_SLOW_DOWN_LINTING: 20,
        },
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
    },
  }
);
