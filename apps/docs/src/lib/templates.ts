/**
 * Templates 関連のヘルパー関数
 */

import { visibleTemplates, categories, type CategoryDef, type CategoryId, type TemplateItem } from '@/config/templates';

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
export function getCategory(categoryId: string): CategoryDef | undefined {
  return categories.find((c) => c.id === categoryId);
}

/**
 * slug 単位の詳細ページパスを生成（getStaticPaths 用）。
 * aggregateView: true のカテゴリは「カテゴリ単位の1ページ」へ統合するため除外する。
 */
export function getSingleTemplatePaths(): Array<{ category: CategoryId; slug: string }> {
  return visibleTemplates
    .filter((tpl) => {
      const category = categories.find((c) => c.id === tpl.category);
      return !category?.aggregateView;
    })
    .map((tpl) => ({ category: tpl.category, slug: tpl.slug }));
}

/**
 * カテゴリ単位の詳細ページパスを生成（getStaticPaths 用）。
 * aggregateView: true のカテゴリのみ対象。
 */
export function getAggregatedCategoryPaths(): Array<{ category: CategoryId }> {
  return categories.filter((c) => c.aggregateView && visibleTemplates.some((tpl) => tpl.category === c.id)).map((c) => ({ category: c.id }));
}
