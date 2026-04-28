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
    description: 'Lism CSS や Astro まわりの開発メモ',
  },
  life: {
    key: 'life',
    label: 'LIFE',
    description: '日々の暮らしと考えごと',
  },
};

export const CATEGORY_KEYS: CategoryKey[] = ['dev', 'life'];

export function isCategoryKey(value: string): value is CategoryKey {
  return value === 'dev' || value === 'life';
}

/**
 * post.id（例: "dev/foo"）から category と slug を分解する。
 */
export function parsePostId(id: string): { category: CategoryKey; slug: string } {
  const [category, ...rest] = id.split('/');
  if (!isCategoryKey(category)) {
    throw new Error(`Unknown category in post id: ${id}`);
  }
  return { category, slug: rest.join('/') };
}
