/**
 * 言語設定の型定義
 */
export type LangConfig = {
	label: string; // 言語の表示名
	root?: boolean; // メイン言語かどうか（URLにプレフィックスが付かない）
};

/**
 * サイト全体で使用する共通設定
 */
export const siteConfig = {
	// サイトを公開するかどうか
	publish: true,

	// サイト名
	name: 'Lism CSS',

	// サイトの短い説明
	description: 'Lism CSS の公式サイト。',

	// 多言語設定
	// root: true の言語はURLにプレフィックスが付かない（例: /introduction）
	// root: false/未指定の言語はURLにプレフィックスが付く（例: /en/introduction）
	langs: {
		ja: {
			label: '日本語',
			root: true,
		},
		en: {
			label: 'English',
		},
	} as const satisfies Record<string, LangConfig>,

	// 著者情報
	author: {
		name: 'ddryo',
		github: 'https://github.com/lism-css/lism-css',
		twitter: 'https://x.com/lismcss',
	},

	// 関連リンク
	links: {
		// LISM CSS 本体サイト
		lismCss: 'https://lism-css.com/',
	},

	// ページネーション設定
	pagination: {
		// 1ページあたりの記事数
		postsPerPage: 12,
	},

	// テーマ設定
	theme: {
		// デフォルトテーマ: 'system' | 'light' | 'dark'
		default: 'light' as 'system' | 'light' | 'dark',
	},

	// Google Analytics設定
	googleAnalytics: {
		// 測定ID（G-XXXXXXXXXX形式）を入力。
		measurementId: '',
	},
} as const;

// 型をエクスポート（必要に応じて使用）
export type SiteConfig = typeof siteConfig;

// 言語コードの型（"ja" | "en" など）
export type LangCode = keyof typeof siteConfig.langs;
