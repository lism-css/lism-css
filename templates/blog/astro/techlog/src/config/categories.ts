/**
 * 記事カテゴリーの定義。
 * 物理ディレクトリ（src/posts/{key}/）とカテゴリ一覧 URL（/category/{key}/）で使われる。
 */
export type CategoryKey = 'tech' | 'column';

export interface Category {
  key: CategoryKey;
  label: string;
  description: string;
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
  },
};

export const CATEGORY_KEYS: CategoryKey[] = ['tech', 'column'];
