import type { AstroExpressiveCodeOptions } from 'astro-expressive-code';
// import { pluginLineNumbers } from '@expressive-code/plugin-line-numbers';

export const expressiveCodeOptions: AstroExpressiveCodeOptions = {
	// 行番号表示プラグインを有効化
	// plugins: [pluginLineNumbers()],
	themes: ['github-light', 'github-dark'],
	// data-theme属性に連動してテーマを切り替え
	themeCssSelector: (theme) => `[data-theme='${theme.type}']`,

	useThemedScrollbars: false,

	// https://expressive-code.com/reference/style-overrides/#codefontsize
	// styleOverrides: {
	// 	codeFontSize: '0.9rem',
	// 	codeLineHeight: 1.6,
	// },
};
