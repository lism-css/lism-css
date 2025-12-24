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
export type SidebarNavItem = LinkItem | SeparatorItem;

// トップレベルの特別なリンクアイテムの型（大きめボタンとして表示）
export type TopLevelLinkItem = {
	type: 'toplink'; // 識別子
	label: string;
	translate?: TranslateLabels;
	link: string;
};

// セパレータかどうかを判定するヘルパー
export function isSeparator(item: SidebarNavItem): item is SeparatorItem {
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
		dir: '/',
	},

	// CSSカテゴリ：ディレクトリ内を自動取得
	{
		label: 'CSS',
		dir: 'css',
	},
	// Components カテゴリ
	{
		label: 'Components',
		dir: 'components',
	},
	{
		label: 'State Modules',
		dir: 'modules/state',
	},
	{
		label: 'Layout Modules',
		items: [
			{
				label: 'Box',
				link: '/docs/modules/layout/box/',
			},
			{
				label: 'Flow',
				link: '/docs/modules/layout/flow/',
			},
			{
				label: 'Frame',
				link: '/docs/modules/layout/frame/',
			},
			{ type: 'separator' },
			{
				label: 'Flex',
				link: '/docs/modules/layout/flex/',
			},
			{
				label: 'Cluster',
				link: '/docs/modules/layout/cluster/',
			},
			{
				label: 'Stack',
				link: '/docs/modules/layout/stack/',
			},
			{
				label: 'SideMain',
				link: '/docs/modules/layout/sidemain/',
			},
			{ type: 'separator' },
			{
				label: 'Grid',
				link: '/docs/modules/layout/grid/',
			},
			{
				label: 'Center',
				link: '/docs/modules/layout/center/',
			},
			{ type: 'separator' },
			{
				label: 'Columns',
				link: '/docs/modules/layout/columns/',
			},
			{
				label: 'FluidCols',
				link: '/docs/modules/layout/fluidcols/',
			},
			{
				label: 'SwitchCols',
				link: '/docs/modules/layout/switchcols/',
			},
			{ type: 'separator' },
		],
	},
	{
		label: 'Atomic Modules',
		dir: 'modules/atomic',
	},
];

export default sidebarConfig;
