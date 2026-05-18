import type { CollectionEntry } from 'astro:content';

/**
 * 記事一覧から重複なしのタグ配列をアルファベット順で返す。
 */
export function getAllTags(posts: CollectionEntry<'posts'>[]): string[] {
  const tagSet = new Set<string>();
  for (const post of posts) {
    for (const tag of post.data.tags) tagSet.add(tag);
  }
  return Array.from(tagSet).sort();
}

export function getTagHref(tag: string): string {
  return `/tags/${tag}/`;
}
