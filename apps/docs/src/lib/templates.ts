/**
 * テンプレート関連のヘルパー関数
 */

import { templates, type TemplateCategoryId, type TemplateItem } from '@/config/templates';

/**
 * カテゴリIDとテンプレートIDからテンプレート情報を取得
 */
export function getTemplate(categoryId: string, templateId: string): TemplateItem | undefined {
	const category = templates[categoryId as TemplateCategoryId];
	if (!category) return undefined;
	return category.items.find((item) => item.id === templateId);
}

/**
 * 全テンプレートのパスを生成（getStaticPaths用）
 */
export function getAllTemplatePaths(): Array<{ category: string; id: string }> {
	const paths: Array<{ category: string; id: string }> = [];
	for (const [categoryId, category] of Object.entries(templates)) {
		for (const item of category.items) {
			paths.push({ category: categoryId, id: item.id });
		}
	}
	return paths;
}

