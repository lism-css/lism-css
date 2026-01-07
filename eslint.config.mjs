import { defineConfig } from 'eslint/config';
import react from 'eslint-plugin-react';
import eslintConfigPrettier from 'eslint-config-prettier/flat';
import globals from 'globals';
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default defineConfig(
	{
		ignores: ['**/dist/**', '**/node_modules/**', '**/.turbo/**'],
	},
	eslintConfigPrettier,
	eslint.configs.recommended,
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
		},
	},
);
