/**
 * テンプレート関連のヘルパー関数
 */

import { templates, type TemplateCategoryId, type TemplateItem } from '@/config/templates';

// 本番環境かどうか（draft:trueのアイテムをフィルタリングするために使用）
const isProd = import.meta.env.PROD;

/**
 * 下書き状態のアイテムをフィルタリング（本番環境のみ）
 */
export function filterDraftItems(items: TemplateItem[]): TemplateItem[] {
	if (!isProd) return items; // 開発環境では全て表示
	return items.filter((item) => !item.draft);
}

/**
 * カテゴリIDとテンプレートIDからテンプレート情報を取得
 */
export function getTemplate(categoryId: string, templateId: string): TemplateItem | undefined {
	const category = templates[categoryId as TemplateCategoryId];
	if (!category) return undefined;
	const item = category.items.find((item) => item.id === templateId);
	// 本番環境でdraft:trueの場合はundefinedを返す
	if (isProd && item?.draft) return undefined;
	return item;
}

/**
 * 全テンプレートのパスを生成（getStaticPaths用）
 */
export function getAllTemplatePaths(): Array<{ category: string; id: string }> {
	const paths: Array<{ category: string; id: string }> = [];
	for (const [categoryId, category] of Object.entries(templates)) {
		// 本番環境ではdraft:trueのアイテムを除外
		const items = filterDraftItems(category.items);
		for (const item of items) {
			paths.push({ category: categoryId, id: item.id });
		}
	}
	return paths;
}

