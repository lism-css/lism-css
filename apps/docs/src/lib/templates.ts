import { visibleTemplates, categories, type CategoryDef, type CategoryId, type TemplateItem } from '@/config/templates';

/**
 * draft:true のテンプレートは本番ビルドでは取得不可（詳細ページが 404 になる）
 */
export function getTemplate(categoryId: string, slug: string): TemplateItem | undefined {
  return visibleTemplates.find((tpl) => tpl.category === categoryId && tpl.slug === slug);
}

export function getCategory(categoryId: string): CategoryDef | undefined {
  return categories.find((c) => c.id === categoryId);
}

/**
 * slug 単位の詳細ページパスを生成（getStaticPaths 用）。
 * aggregateView: true のカテゴリは stack 違いだけなので、カテゴリページに統合し個別ページは作らない。
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
 * カテゴリページのパスを生成（getStaticPaths 用）。
 * 公開テンプレートが 1 件以上あるカテゴリすべてが対象。
 */
export function getCategoryPaths(): Array<{ category: CategoryId }> {
  return categories.filter((c) => visibleTemplates.some((tpl) => tpl.category === c.id)).map((c) => ({ category: c.id }));
}
