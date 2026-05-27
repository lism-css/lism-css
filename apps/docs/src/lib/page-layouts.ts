/**
 * Page Layouts 関連のヘルパー関数
 */

import { pageLayouts, type PageLayoutCategoryId, type PageLayoutItem } from '@/config/page-layouts';

// 本番環境かどうか（draft:true のアイテムをフィルタリングするために使用）
const isProd = import.meta.env.PROD;

/**
 * 下書き状態のアイテムをフィルタリング（本番環境のみ）
 */
export function filterDraftItems(items: PageLayoutItem[]): PageLayoutItem[] {
  if (!isProd) return items;
  return items.filter((item) => !item.draft);
}

/**
 * カテゴリIDとレイアウトIDから Page Layout 情報を取得
 */
export function getPageLayout(categoryId: string, layoutId: string): PageLayoutItem | undefined {
  const category = pageLayouts[categoryId as PageLayoutCategoryId];
  if (!category) return undefined;
  const item: PageLayoutItem | undefined = category.items.find((item) => item.id === layoutId);
  // 本番環境で draft:true の場合は undefined を返す
  if (isProd && item?.draft) return undefined;
  return item;
}

/**
 * 全 Page Layout のパスを生成（getStaticPaths 用）
 */
export function getAllPageLayoutPaths(): Array<{ category: string; id: string }> {
  const paths: Array<{ category: string; id: string }> = [];
  for (const [categoryId, category] of Object.entries(pageLayouts)) {
    // 本番環境では draft:true のアイテムを除外
    const items = filterDraftItems(category.items);
    for (const item of items) {
      paths.push({ category: categoryId, id: item.id });
    }
  }
  return paths;
}
