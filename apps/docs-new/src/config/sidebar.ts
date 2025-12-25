/**
 * サイドバーナビゲーションの設定
 *
 * - dir: 指定ディレクトリ内の記事を自動取得（日付順）
 * - items: メニューの並びを直接指定
 * - translate: 他言語用のラベル翻訳（例: { en: 'English Label' }）
 */

import type { LangCode } from '@/config/site';
import { BookOpenTextIcon, SquaresFourIcon, LayoutIcon } from '@phosphor-icons/react';
import { templates, categoryIds, type TemplateCategoryId } from './templates';

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
	icon?: React.ElementType; // アイコンコンポーネント
};

// セパレータかどうかを判定するヘルパー
export function isSeparator(item: SidebarNavItem): item is SeparatorItem {
	// 文字列の場合はセパレータではない
	if (typeof item === 'string') return false;
	return 'type' in item && item.type === 'separator';
}

// トップレベルリンクかどうかを判定するヘルパー
export function isTopLevelLink(item: SidebarSection | TopLevelLinkItem): item is TopLevelLinkItem {
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

// サイトセクションの識別子（/docs/, /ui/, /templates/ などの最初のパス部分）
export type SiteSection = 'docs' | 'ui' | 'templates';

// サイドバー設定の型
export interface SidebarConfig {
	topLevelLinks: TopLevelLinkItem[]; // 全セクション共通のトップレベルリンク
	sections: Record<SiteSection, SidebarSection[]>; // セクションごとのサイドバー設定
}

// トップレベルリンク（全セクション共通）
const topLevelLinks: TopLevelLinkItem[] = [
	{
		type: 'toplink',
		label: 'Docs',
		link: '/docs/',
		icon: BookOpenTextIcon,
	},
	{
		type: 'toplink',
		label: 'UI',
		link: '/ui/',
		icon: SquaresFourIcon,
	},
	{
		type: 'toplink',
		label: 'Templates',
		link: '/templates/',
		icon: LayoutIcon,
	},
];

// /docs/ セクション用のサイドバー設定
const docsSidebar: SidebarSection[] = [
	// はじめにカテゴリ
	{
		label: 'はじめに',
		translate: { en: 'Getting Started' },
		items: ['/docs/overview/', '/docs/installation/', '/docs/changelog/'],
	},

	// 概要カテゴリ
	{
		label: '概要',
		translate: { en: 'Overview' },
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
	// コアコンポーネント カテゴリ
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

// /ui/ セクション用のサイドバー設定
const uiSidebar: SidebarSection[] = [
	{
		label: 'Components',
		dir: 'ui', // content/ja/ui/ 配下のMDXを自動取得
	},
];

// /templates/ セクション用のサイドバー設定（templates.tsから動的生成）
const templatesSidebar: SidebarSection[] = categoryIds.map((categoryId: TemplateCategoryId) => {
	const category = templates[categoryId];
	return {
		label: category.label,
		items: category.items.map((item) => ({
			label: item.title,
			link: `/templates/${categoryId}/${item.id}`,
		})),
	};
});

// サイドバー設定をエクスポート
const sidebarConfig: SidebarConfig = {
	topLevelLinks,
	sections: {
		docs: docsSidebar,
		ui: uiSidebar,
		templates: templatesSidebar,
	},
};

export default sidebarConfig;

/**
 * URLからサイトセクションを取得するヘルパー
 * @param pathname URLのパス部分
 * @returns サイトセクション（'docs' | 'ui' | 'templates'）、該当なしの場合は 'docs' をデフォルトとして返す
 */
export function getSiteSection(pathname: string): SiteSection {
	// パスから言語プレフィックスを除去してセクションを判定
	const pathWithoutLang = pathname.replace(/^\/(en|ja)\//, '/');
	if (pathWithoutLang.startsWith('/ui/') || pathWithoutLang === '/ui') {
		return 'ui';
	}
	if (pathWithoutLang.startsWith('/templates/') || pathWithoutLang === '/templates') {
		return 'templates';
	}
	return 'docs';
}

/**
 * URLからslugを抽出するヘルパー
 * /docs/xxx/ → xxx（コンテンツは content/ja/xxx.mdx）
 * /ui/yyy/ → ui/yyy（コンテンツは content/ja/ui/yyy.mdx）
 * /templates/zzz/ → templates/zzz（テンプレートページ、MDXなし）
 */
export function extractSlugFromUrl(url: string): string {
	// /docs/ の場合はプレフィックスを除去（コンテンツは content/{lang}/ 直下）
	if (url.startsWith('/docs/')) {
		return url.replace(/^\/docs\//, '').replace(/^\/|\/$/g, '');
	}
	// /ui/ の場合は ui/ プレフィックスを保持（コンテンツは content/{lang}/ui/ 配下）
	if (url.startsWith('/ui/')) {
		return 'ui/' + url.replace(/^\/ui\//, '').replace(/^\/|\/$/g, '');
	}
	// /templates/ の場合は templates/ プレフィックスを保持
	if (url.startsWith('/templates/')) {
		return 'templates/' + url.replace(/^\/templates\//, '').replace(/^\/|\/$/g, '');
	}
	// その他の場合
	return url.replace(/^\/|\/$/g, '');
}
