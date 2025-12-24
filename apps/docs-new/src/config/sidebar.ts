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

	// CSSカテゴリ：ディレクトリ内を自動取得
	{
		label: 'CSS',
		dir: 'css',
	},
	{
		label: 'State Modules',
		dir: 'modules/state',
	},
	{
		label: 'Layout Modules',
		dir: 'modules/layout',
	},
	{
		label: 'Atomic Modules',
		dir: 'modules/atomic',
	},
];

export default sidebarConfig;
