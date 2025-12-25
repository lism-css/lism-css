/**
 * UI翻訳テキストの定義
 * 各言語のUIテキストを一元管理
 */
import type { LangCode } from './site';

/**
 * 翻訳テキストの型定義
 * キー構造のみを定義し、値は string 型
 */
type TranslationKeys = {
	toc: 'title' | 'open';
	search: 'title' | 'devMessage';
	header: 'openMenu';
	themeSwitch: 'ariaLabel';
	langSelect: 'ariaLabel' | 'menuAriaLabel';
	share: 'share' | 'copy' | 'copied';
	copyCode: 'copy' | 'copied';
	postNav: 'prev' | 'next' | 'ariaLabel';
	translationNotice: 'title' | 'description';
	demo: 'openNewTab' | 'lismNote';
};

/**
 * UITranslations 型を TranslationKeys から生成
 */
export type UITranslations = {
	[K in keyof TranslationKeys]: Record<TranslationKeys[K], string>;
};

/**
 * 言語別の翻訳テキスト
 */
export const translations: Record<LangCode, UITranslations> = {
	ja: {
		toc: {
			title: '目次',
			open: '目次を開く',
		},
		search: {
			title: '検索',
			devMessage: '検索は本番ビルド後に利用可能です。',
		},
		header: {
			openMenu: 'メニューを開く',
		},
		themeSwitch: {
			ariaLabel: 'カラーテーマを切り替える',
		},
		langSelect: {
			ariaLabel: '言語を選択',
			menuAriaLabel: '利用可能な言語',
		},
		share: {
			share: 'シェア',
			copy: 'コピー',
			copied: 'コピー完了',
		},
		copyCode: {
			copy: 'コードをコピー',
			copied: 'コードをコピーしました',
		},
		postNav: {
			prev: '← 前の記事',
			next: '次の記事 →',
			ariaLabel: '記事ナビゲーション',
		},
		translationNotice: {
			title: '翻訳準備中',
			description: 'このページはまだ翻訳されていません。日本語版を表示しています。',
		},
		demo: {
			openNewTab: '別タブで表示 ↗',
			lismNote: '※ CSSが書かれていないクラスはLism CSSのものです。',
		},
	},
	en: {
		toc: {
			title: 'Contents',
			open: 'Open contents',
		},
		search: {
			title: 'Search',
			devMessage: 'Search is available after production build.',
		},
		header: {
			openMenu: 'Open menu',
		},
		themeSwitch: {
			ariaLabel: 'Toggle color theme',
		},
		langSelect: {
			ariaLabel: 'Select language',
			menuAriaLabel: 'Available languages',
		},
		share: {
			share: 'Share',
			copy: 'Copy',
			copied: 'Copied!',
		},
		copyCode: {
			copy: 'Copy code',
			copied: 'Code copied!',
		},
		postNav: {
			prev: '← Previous',
			next: 'Next →',
			ariaLabel: 'Post navigation',
		},
		translationNotice: {
			title: 'Translation Not Available',
			description: 'This page has not been translated yet. You are viewing the Japanese version.',
		},
		demo: {
			openNewTab: 'Open in new tab ↗',
			lismNote: '* Classes without CSS are from Lism CSS.',
		},
	},
};
