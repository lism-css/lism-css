/**
 * パターン関連のヘルパー関数
 */

import { patterns, type PatternCategoryId, type PatternItem } from '@/config/patterns';

// 本番環境かどうか（draft:trueのアイテムをフィルタリングするために使用）
const isProd = import.meta.env.PROD;

/**
 * 下書き状態のアイテムをフィルタリング（本番環境のみ）
 */
export function filterDraftItems(items: PatternItem[]): PatternItem[] {
  if (!isProd) return items; // 開発環境では全て表示
  return items.filter((item) => !item.draft);
}

/**
 * カテゴリIDとパターンIDからパターン情報を取得
 */
export function getPattern(categoryId: string, patternId: string): PatternItem | undefined {
  const category = patterns[categoryId as PatternCategoryId];
  if (!category) return undefined;
  const item: PatternItem | undefined = category.items.find((item) => item.id === patternId);
  // 本番環境でdraft:trueの場合はundefinedを返す
  if (isProd && item?.draft) return undefined;
  return item;
}

/**
 * 全パターンのパスを生成（getStaticPaths用）
 */
export function getAllPatternPaths(): Array<{ category: string; id: string }> {
  const paths: Array<{ category: string; id: string }> = [];
  for (const [categoryId, category] of Object.entries(patterns)) {
    // 本番環境ではdraft:trueのアイテムを除外
    const items = filterDraftItems(category.items);
    for (const item of items) {
      paths.push({ category: categoryId, id: item.id });
    }
  }
  return paths;
}
