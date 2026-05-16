/**
 * Templates 関連のヘルパー関数
 */

import { visibleTemplates, categories, type CategoryId, type TemplateItem } from '@/config/templates';

/**
 * カテゴリIDとslugからテンプレート情報を取得
 * draft:true のテンプレートは本番ビルドでは取得不可（詳細ページが 404 になる）
 */
export function getTemplate(categoryId: string, slug: string): TemplateItem | undefined {
  return visibleTemplates.find((tpl) => tpl.category === categoryId && tpl.slug === slug);
}

/**
 * カテゴリ定義を取得
 */
export function getCategory(categoryId: string) {
  return categories.find((c) => c.id === categoryId);
}

/**
 * 全テンプレートのパスを生成（getStaticPaths用）
 * draft:true のテンプレートは本番ビルドではパス生成されない
 */
export function getAllTemplatePaths(): Array<{ category: CategoryId; slug: string }> {
  return visibleTemplates.map((tpl) => ({ category: tpl.category, slug: tpl.slug }));
}
