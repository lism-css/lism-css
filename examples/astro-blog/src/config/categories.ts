/**
 * 記事カテゴリーの定義。
 * 物理ディレクトリ（src/posts/{key}/）と URL（/{key}/）の両方で使われる。
 */
export type CategoryKey = 'dev' | 'life';

export interface Category {
  key: CategoryKey;
  label: string;
  description: string;
}

export const CATEGORIES: Record<CategoryKey, Category> = {
  dev: {
    key: 'dev',
    label: 'DEV',
    description: '日々の開発メモ',
  },
  life: {
    key: 'life',
    label: 'LIFE',
    description: '日々の暮らしと考えごと',
  },
};

export const CATEGORY_KEYS: CategoryKey[] = ['dev', 'life'];
