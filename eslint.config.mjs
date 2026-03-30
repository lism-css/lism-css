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
				projectService: true,
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
		files: ['**/*.stories.@(ts|tsx|js|jsx|mjs|cjs)'],
	}
);
