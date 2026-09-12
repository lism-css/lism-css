import { layoutDemos, type LayoutDemoCategoryId, type LayoutDemoItem } from '@/config/layout-demos';

const isProd = import.meta.env.PROD;

export function filterDraftItems(items: LayoutDemoItem[]): LayoutDemoItem[] {
  if (!isProd) return items;
  return items.filter((item) => !item.draft);
}

export function getLayoutDemo(categoryId: string, layoutId: string): LayoutDemoItem | undefined {
  const category = layoutDemos[categoryId as LayoutDemoCategoryId];
  if (!category) return undefined;
  const item: LayoutDemoItem | undefined = category.items.find((item) => item.id === layoutId);
  if (isProd && item?.draft) return undefined;
  return item;
}

export function getAllLayoutDemoPaths(): Array<{ category: string; id: string }> {
  const paths: Array<{ category: string; id: string }> = [];
  for (const [categoryId, category] of Object.entries(layoutDemos)) {
    const items = filterDraftItems(category.items);
    for (const item of items) {
      paths.push({ category: categoryId, id: item.id });
    }
  }
  return paths;
}
