/**
 * サイドバーナビゲーションの設定
 *
 * - dir: 指定ディレクトリ内の記事を自動取得（日付順）
 * - items: メニューの並びを直接指定
 * - translate: 他言語用のラベル翻訳（例: { en: 'English Label' }）
 */

import type { LangCode } from '@/config/site';

// 翻訳オブジェクトの型（root言語以外の翻訳を指定）
type TranslateLabels = Partial<Record<Exclude<LangCode, 'ja'>, string>>;

// セパレータアイテムの型（区切り線）
export type SeparatorItem = {
	type: 'separator';
};

// 通常のリンクアイテムの型
export type LinkItem = {
	label: string;
	translate?: TranslateLabels; // アイテムごとの翻訳
	link: string;
};

// items配列に含められるアイテムの型
// 文字列の場合はURLとして扱い、対応するMDXのフロントマターからラベルを取得
export type SidebarNavItem = LinkItem | SeparatorItem | string;

// トップレベルの特別なリンクアイテムの型（大きめボタンとして表示）
export type TopLevelLinkItem = {
	type: 'toplink'; // 識別子
	label: string;
	translate?: TranslateLabels;
	link: string;
};

// セパレータかどうかを判定するヘルパー
export function isSeparator(item: SidebarNavItem): item is SeparatorItem {
	// 文字列の場合はセパレータではない
	if (typeof item === 'string') return false;
	return 'type' in item && item.type === 'separator';
}

// トップレベルリンクかどうかを判定するヘルパー
export function isTopLevelLink(item: SidebarItem | TopLevelLinkItem): item is TopLevelLinkItem {
	return 'type' in item && item.type === 'toplink';
}

// サイドバーセクションの型定義（カテゴリ）
export type SidebarSection =
	| {
			label: string;
			translate?: TranslateLabels; // 他言語用ラベル
			dir: string; // ディレクトリ名（content/{lang}/以下）
	  }
	| {
			label: string;
			translate?: TranslateLabels; // 他言語用ラベル
			items: Array<SidebarNavItem>;
	  };

// サイドバーアイテムの型定義（セクション または トップレベルリンク）
export type SidebarItem = SidebarSection | TopLevelLinkItem;

/**
 * 言語に応じたラベルを取得するヘルパー関数
 */
export function getTranslatedLabel(label: string, translate: TranslateLabels | undefined, lang: LangCode): string {
	// root言語（ja）の場合、または翻訳がない場合はデフォルトラベルを返す
	if (lang === 'ja' || !translate || !translate[lang as Exclude<LangCode, 'ja'>]) {
		return label;
	}
	return translate[lang as Exclude<LangCode, 'ja'>] || label;
}

// サイドバー設定
const sidebarConfig: SidebarItem[] = [
	// トップレベルリンク（大きめボタンとして表示）
	{
		type: 'toplink',
		label: 'Docs',
		link: '/docs/overview/',
	},
	// {
	// 	type: 'toplink',
	// 	label: 'Template Library',
	// 	translate: { en: 'Template Library' },
	// 	link: '/lib/',
	// },

	// はじめにカテゴリ：ルートディレクトリ内を自動取得
	{
		label: 'はじめに',
		translate: { en: 'Getting Started' },
		items: ['/docs/overview/', '/docs/installation/', '/docs/changelog/'],
	},

	// CSSカテゴリ：ディレクトリ内を自動取得
	{
		label: '概要',
		translate: { en: 'Overview' },
		// dir: 'css',
		items: [
			'/docs/css-methodology/',
			'/docs/tokens/',
			'/docs/typography/',
			{ type: 'separator' },
			'/docs/reset-css/',
			'/docs/html-base-styles/',
			'/docs/set-utility/',
			'/docs/module-class/',
			'/docs/utility-class/',
			'/docs/prop-class/',
			'/docs/responsive/',
			{ type: 'separator' },
			'/docs/customize/',
		],
	},
	// Components カテゴリ
	{
		label: 'コアコンポーネント',
		translate: { en: 'Core Components' },
		dir: 'core-components',
	},
	{
		label: 'State Modules',
		items: ['/docs/modules/is--container/', '/docs/modules/is--wrapper/', '/docs/modules/is--layer/', '/docs/modules/is--linkbox/'],
	},
	{
		label: 'Layout Modules',
		items: [
			'/docs/modules/l--box/',
			'/docs/modules/l--flow/',
			'/docs/modules/l--frame/',

			{ type: 'separator' },
			'/docs/modules/l--flex/',
			'/docs/modules/l--cluster/',
			'/docs/modules/l--stack/',
			'/docs/modules/l--sidemain/',

			{ type: 'separator' },
			'/docs/modules/l--grid/',
			'/docs/modules/l--center/',

			{ type: 'separator' },
			'/docs/modules/l--columns/',
			'/docs/modules/l--fluidcols/',
			'/docs/modules/l--switchcols/',

			{ type: 'separator' },
		],
	},
	{
		label: 'Atomic Modules',
		items: [
			'/docs/modules/a--decorator/',
			'/docs/modules/a--divider/',
			'/docs/modules/a--icon/',
			'/docs/modules/a--media/',
			'/docs/modules/a--spacer/',
		],
	},
	{
		label: 'Props',
		dir: 'props',
	},
];

export default sidebarConfig;
