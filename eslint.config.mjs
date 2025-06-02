import react from 'eslint-plugin-react';
import eslintConfigPrettier from 'eslint-config-prettier/flat';
import globals from 'globals';
import js from '@eslint/js';

export default [
	eslintConfigPrettier,
	js.configs.recommended,
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
		},
	},
];
