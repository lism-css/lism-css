import { getCollection, type CollectionEntry } from 'astro:content';
import { getRootLang, type LangCode } from './i18n';
import { siteConfig } from '@/config/site';

type LangCollectionName = keyof typeof siteConfig.langs;

export type PostEntry = CollectionEntry<LangCollectionName>;

export async function getPostsByLang(lang: LangCode, includeDraft = import.meta.env.DEV): Promise<PostEntry[]> {
  const posts = await getCollection(lang, ({ data }) => {
    return includeDraft ? true : !data.draft;
  });
  return posts;
}

export async function getPostBySlug(lang: LangCode, slug: string, includeDraft = import.meta.env.DEV): Promise<PostEntry | undefined> {
  const posts = await getPostsByLang(lang, includeDraft);
  return posts.find((post) => post.id === slug);
}

// 指定言語の記事を優先し、なければroot言語へフォールバックする
export async function getPostWithFallback(lang: LangCode, slug: string): Promise<{ entry: PostEntry | undefined; isFallback: boolean }> {
  const post = await getPostBySlug(lang, slug);
  if (post) {
    return { entry: post, isFallback: false };
  }

  const rootLang = getRootLang();
  if (lang !== rootLang) {
    const fallbackPost = await getPostBySlug(rootLang, slug);
    if (fallbackPost) {
      return { entry: fallbackPost, isFallback: true };
    }
  }

  return { entry: undefined, isFallback: false };
}

export async function getAllPosts(includeDraft = import.meta.env.DEV): Promise<
  {
    lang: LangCode;
    entry: PostEntry;
  }[]
> {
  const langCodes = Object.keys(siteConfig.langs) as LangCode[];
  const allPosts: { lang: LangCode; entry: PostEntry }[] = [];

  for (const lang of langCodes) {
    const posts = await getPostsByLang(lang, includeDraft);
    for (const entry of posts) {
      allPosts.push({ lang, entry });
    }
  }

  return allPosts;
}

/**
 * docs セクションの記事一覧を取得（id が ui/ で始まらないもの）
 * /docs/* および /[lang]/docs/* / OG / Pagefind 等の入力として使用
 */
export async function getDocsPostsByLang(lang: LangCode, includeDraft = import.meta.env.DEV): Promise<PostEntry[]> {
  const posts = await getPostsByLang(lang, includeDraft);
  return posts.filter((post) => !post.id.startsWith('ui/'));
}

/**
 * UI セクションの記事一覧を取得（id が ui/ で始まるもの）
 * /ui/* および /[lang]/ui/* / OG 等の入力として使用
 */
export async function getUiPostsByLang(lang: LangCode, includeDraft = import.meta.env.DEV): Promise<PostEntry[]> {
  const posts = await getPostsByLang(lang, includeDraft);
  return posts.filter((post) => post.id.startsWith('ui/'));
}
