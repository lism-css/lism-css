/**
 * 記事カテゴリーの定義。
 * 物理ディレクトリ（src/posts/{key}/）とカテゴリ一覧 URL（/category/{key}/）で使われる。
 */
import type { OgImageParams } from '@/lib/ogImage';

export type CategoryKey = 'tech' | 'column';

export interface Category {
  key: CategoryKey;
  label: string;
  description: string;
  /** OG 画像パラメータの上書き（siteConfig.ogImage のデフォルトに重ねて適用） */
  ogImage?: Partial<OgImageParams>;
}

export const CATEGORIES: Record<CategoryKey, Category> = {
  tech: {
    key: 'tech',
    label: 'TECH',
    description: '技術記事と開発メモ',
  },
  column: {
    key: 'column',
    label: 'COLUMN',
    description: '技術以外のコラムと雑記',
    ogImage: { h: 180 },
  },
};

export const CATEGORY_KEYS: CategoryKey[] = ['tech', 'column'];
