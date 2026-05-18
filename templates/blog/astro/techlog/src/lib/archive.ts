import type { CollectionEntry } from 'astro:content';

export interface ArchiveKey {
  year: string;
  month: string;
}

export interface ArchiveSummary extends ArchiveKey {
  count: number;
}

/** "YYYY-MM-DD" / "YYYY.MM.DD" / "YYYY/MM/DD" から年月キーを抜き出す。 */
export function getArchiveKey(date: string): ArchiveKey {
  const [year, month] = date.split(/[-./]/);
  return { year, month };
}

/** 年月アーカイブの一覧（新しい順、件数つき）を返す。 */
export function getArchiveSummaries(posts: CollectionEntry<'posts'>[]): ArchiveSummary[] {
  const counts = new Map<string, number>();

  for (const post of posts) {
    const { year, month } = getArchiveKey(post.data.date);
    const key = `${year}-${month}`;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  return Array.from(counts.entries())
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([key, count]) => {
      const [year, month] = key.split('-');
      return { year, month, count };
    });
}

/** 年月アーカイブの記事のみを返す（新しい順）。 */
export function getPostsByArchive(posts: CollectionEntry<'posts'>[], year: string, month: string): CollectionEntry<'posts'>[] {
  return posts
    .filter((post) => {
      const key = getArchiveKey(post.data.date);
      return key.year === year && key.month === month;
    })
    .sort((a, b) => b.data.date.localeCompare(a.data.date));
}

export function getArchiveHref(year: string, month: string): string {
  return `/archive/${year}/${month}/`;
}
