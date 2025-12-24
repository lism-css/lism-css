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

// セパレータかどうかを判定するヘルパー
export function isSeparator(item: SidebarNavItem): item is SeparatorItem {
	return 'type' in item && item.type === 'separator';
}

// サイドバーアイテムの型定義
export type SidebarItem =
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

// サイドバー設定
const sidebarConfig: SidebarItem[] = [
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
				link: '/modules/layout/box/',
			},
			{
				label: 'Flow',
				link: '/modules/layout/flow/',
			},
			{
				label: 'Frame',
				link: '/modules/layout/frame/',
			},
			{ type: 'separator' },
			{
				label: 'Flex',
				link: '/modules/layout/flex/',
			},
			{
				label: 'Cluster',
				link: '/modules/layout/cluster/',
			},
			{
				label: 'Stack',
				link: '/modules/layout/stack/',
			},
			{
				label: 'SideMain',
				link: '/modules/layout/sidemain/',
			},
			{ type: 'separator' },
			{
				label: 'Grid',
				link: '/modules/layout/grid/',
			},
			{
				label: 'Center',
				link: '/modules/layout/center/',
			},
			{ type: 'separator' },
			{
				label: 'Columns',
				link: '/modules/layout/columns/',
			},
			{
				label: 'FluidCols',
				link: '/modules/layout/fluidcols/',
			},
			{
				label: 'SwitchCols',
				link: '/modules/layout/switchcols/',
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
