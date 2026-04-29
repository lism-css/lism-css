import { CATEGORY_KEYS, type CategoryKey } from '@/config/categories';

export function isCategoryKey(value: string): value is CategoryKey {
  return (CATEGORY_KEYS as string[]).includes(value);
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
