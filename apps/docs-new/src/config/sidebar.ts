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
			items: Array<{
				label: string;
				translate?: TranslateLabels; // アイテムごとの翻訳
				link: string;
			}>;
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

	// Layoutカテゴリ：並びを直接指定
	// {
	// 	label: 'Layout',
	// 	items: [
	// 		{
	// 			label: 'Flexboxの基本',
	// 			translate: { en: 'Flexbox Basics' },
	// 			link: '/layout/flexbox-basics',
	// 		},
	// 		{
	// 			label: 'Gridで作るカラムレイアウト',
	// 			translate: { en: 'Grid Layout' },
	// 			link: '/layout/grid-layout',
	// 		},
	// 	],
	// },

	// Layoutカテゴリ：ディレクトリ内を自動取得
	{
		label: 'Layout',
		dir: 'layout',
	},

	// Designカテゴリ：ディレクトリ内を自動取得
	// {
	// 	label: 'Design',
	// 	dir: 'design',
	// },

	// UIカテゴリ：ディレクトリ内を自動取得
	{
		label: 'UI',
		dir: 'ui',
	},

	// Tipsカテゴリ：ディレクトリ内を自動取得
	{
		label: 'Tips',
		dir: 'tips',
	},

	// 基礎知識カテゴリ：ディレクトリ内を自動取得
	{
		label: '基礎知識',
		translate: { en: 'Basics' },
		dir: 'basics',
	},
];

export default sidebarConfig;
