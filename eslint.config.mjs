import { defineConfig } from 'eslint/config';
import react from 'eslint-plugin-react';
import eslintConfigPrettier from 'eslint-config-prettier/flat';
import globals from 'globals';
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default defineConfig(
	{
		ignores: ['**/dist/**', '**/node_modules/**', '**/.turbo/**', 'apps/playgrounds/**'],
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
);
