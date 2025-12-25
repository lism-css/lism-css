/**
 * コンテンツコレクションのユーティリティ関数
 */
import { getCollection, type CollectionEntry } from 'astro:content';
import { getRootLang, type LangCode } from './i18n';
import { siteConfig } from '@/config/site';

// 言語コレクション名の型
type LangCollectionName = keyof typeof siteConfig.langs;

// 記事エントリの型
export type PostEntry = CollectionEntry<LangCollectionName>;

/**
 * 指定言語の記事一覧を取得
 * @param lang 言語コード
 * @param includeDraft 下書きを含めるか（開発環境ではtrue）
 */
export async function getPostsByLang(lang: LangCode, includeDraft = import.meta.env.DEV): Promise<PostEntry[]> {
	const posts = await getCollection(lang, ({ data }) => {
		return includeDraft ? true : !data.draft;
	});
	return posts;
}

/**
 * 指定言語の記事をslugで取得
 * @param lang 言語コード
 * @param slug 記事のslug
 * @param includeDraft 下書きを含めるか
 */
export async function getPostBySlug(lang: LangCode, slug: string, includeDraft = import.meta.env.DEV): Promise<PostEntry | undefined> {
	const posts = await getPostsByLang(lang, includeDraft);
	return posts.find((post) => post.slug === slug);
}

/**
 * 指定言語の記事を取得、なければroot言語にフォールバック
 * @param lang 言語コード
 * @param slug 記事のslug
 * @returns { entry, isFallback } - entryは記事、isFallbackはフォールバックかどうか
 */
export async function getPostWithFallback(lang: LangCode, slug: string): Promise<{ entry: PostEntry | undefined; isFallback: boolean }> {
	// まず指定言語で探す
	const post = await getPostBySlug(lang, slug);
	if (post) {
		return { entry: post, isFallback: false };
	}

	// なければroot言語にフォールバック
	const rootLang = getRootLang();
	if (lang !== rootLang) {
		const fallbackPost = await getPostBySlug(rootLang, slug);
		if (fallbackPost) {
			return { entry: fallbackPost, isFallback: true };
		}
	}

	return { entry: undefined, isFallback: false };
}

/**
 * 全言語の全記事を取得（静的パス生成用）
 */
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
 * root言語の全slugを取得（非root言語のフォールバック用パス生成）
 */
export async function getRootLangSlugs(includeDraft = import.meta.env.DEV): Promise<string[]> {
	const rootLang = getRootLang();
	const posts = await getPostsByLang(rootLang, includeDraft);
	return posts.map((post) => post.slug);
}
