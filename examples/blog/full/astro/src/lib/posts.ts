import { CATEGORY_KEYS, type CategoryKey } from '@/config/categories';

export function isCategoryKey(value: string): value is CategoryKey {
  return (CATEGORY_KEYS as string[]).includes(value);
}

/**
 * post.id（例: "dev/foo"）から category と URL 用 slug を分解する。
 */
export function parsePostId(id: string): { category: CategoryKey; slug: string } {
  const [category, ...rest] = id.split('/');
  if (!isCategoryKey(category)) {
    throw new Error(`Unknown category in post id: ${id}`);
  }
  const slug = rest.join('/');
  if (!slug) {
    throw new Error(`Missing post slug in post id: ${id}`);
  }
  return { category, slug };
}

export function getPostHref(id: string): string {
  const { slug } = parsePostId(id);
  return `/posts/${slug}/`;
}

export function getPostOgImageHref(id: string): string {
  const { slug } = parsePostId(id);
  return `/og/${slug}.png`;
}

export function getCategoryHref(category: CategoryKey): string {
  return `/category/${category}/`;
}

export function getTagHref(tag: string): string {
  return `/tag/${tag}/`;
}

/**
 * 記事詳細 URL は category を含めないため、slug の重複をビルド時に検知する。
 */
export function assertUniquePostSlugs(posts: Array<{ id: string }>): void {
  const seen = new Map<string, string>();

  for (const post of posts) {
    const { slug } = parsePostId(post.id);
    const duplicateId = seen.get(slug);

    if (duplicateId) {
      throw new Error(`Duplicate post slug "${slug}" found: ${duplicateId}, ${post.id}`);
    }

    seen.set(slug, post.id);
  }
}
