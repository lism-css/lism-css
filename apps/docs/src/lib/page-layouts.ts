import { pageLayouts, type PageLayoutCategoryId, type PageLayoutItem } from '@/config/page-layouts';

const isProd = import.meta.env.PROD;

export function filterDraftItems(items: PageLayoutItem[]): PageLayoutItem[] {
  if (!isProd) return items;
  return items.filter((item) => !item.draft);
}

export function getPageLayout(categoryId: string, layoutId: string): PageLayoutItem | undefined {
  const category = pageLayouts[categoryId as PageLayoutCategoryId];
  if (!category) return undefined;
  const item: PageLayoutItem | undefined = category.items.find((item) => item.id === layoutId);
  if (isProd && item?.draft) return undefined;
  return item;
}

export function getAllPageLayoutPaths(): Array<{ category: string; id: string }> {
  const paths: Array<{ category: string; id: string }> = [];
  for (const [categoryId, category] of Object.entries(pageLayouts)) {
    const items = filterDraftItems(category.items);
    for (const item of items) {
      paths.push({ category: categoryId, id: item.id });
    }
  }
  return paths;
}
