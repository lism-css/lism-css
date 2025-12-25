/**
 * ページネーション・タグ・OG画像・記事詳細の共通ロジック
 * 各ページコンポーネントから呼び出して使用
 */
import { siteConfig } from '@/config/site';
import { getPostsByLang, getPostWithFallback, getRootLangSlugs, type PostEntry } from '@/lib/content';
import { getRootLang, isRootLang, type LangCode } from '@/lib/i18n';
import { createHash } from 'crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import sharp from 'sharp';
import { renderOgSvg } from '@/lib/ogImage';

// 言語コードリスト
const langCodes = Object.keys(siteConfig.langs) as LangCode[];

// ============================================================
// 記事詳細ページ関連
// ============================================================

export interface PostPath {
	params: { slug: string; lang?: string };
	props: { lang: LangCode; entry: PostEntry };
}

export interface PostPathNonRoot {
	params: { slug: string; lang: string };
	props: { lang: LangCode; slug: string };
}

/**
 * 記事詳細ページ用のgetStaticPaths（root言語用）
 */
export async function getPostPathsForRoot(): Promise<PostPath[]> {
	const rootLang = getRootLang();
	const posts = await getPostsByLang(rootLang);

	return posts.map((entry) => ({
		params: { slug: entry.slug },
		props: { lang: rootLang, entry },
	}));
}

/**
 * 記事詳細ページ用のgetStaticPaths（非root言語用）
 */
export async function getPostPathsForNonRoot(): Promise<PostPathNonRoot[]> {
	const nonRootLangs = langCodes.filter((lang) => !isRootLang(lang));

	// root言語の全slugを取得（非root言語でも同じslugでアクセス可能にする）
	const rootSlugs = await getRootLangSlugs();

	const paths: PostPathNonRoot[] = [];

	for (const lang of nonRootLangs) {
		for (const slug of rootSlugs) {
			paths.push({
				params: { lang, slug },
				props: { lang, slug },
			});
		}
	}

	return paths;
}

// ============================================================
// ページネーション関連
// ============================================================

export interface PaginationPath {
	params: { num: string; lang?: string };
	props: { lang: LangCode; posts: PostEntry[]; currentPage: number; totalPages: number };
}

/**
 * ページネーション用のgetStaticPaths（root言語用）
 */
export async function getPaginationPathsForRoot(): Promise<PaginationPath[]> {
	const rootLang = getRootLang();
	const postsPerPage = siteConfig.pagination.postsPerPage;

	// 全記事を取得
	const allPosts = await getPostsByLang(rootLang);

	// 日付の降順でソート
	const sortedPosts = allPosts.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());

	// 総ページ数を計算
	const totalPages = Math.ceil(sortedPosts.length / postsPerPage);

	// 2ページ目以降のパスを生成（1ページ目は index.astro で処理）
	return Array.from({ length: Math.max(0, totalPages - 1) }, (_, i) => {
		const pageNum = i + 2; // 2ページ目から開始
		const start = (pageNum - 1) * postsPerPage;
		const end = start + postsPerPage;

		return {
			params: { num: String(pageNum) },
			props: {
				lang: rootLang,
				posts: sortedPosts.slice(start, end),
				currentPage: pageNum,
				totalPages,
			},
		};
	});
}

/**
 * ページネーション用のgetStaticPaths（非root言語用）
 */
export async function getPaginationPathsForNonRoot(): Promise<PaginationPath[]> {
	const nonRootLangs = langCodes.filter((lang) => !isRootLang(lang));
	const postsPerPage = siteConfig.pagination.postsPerPage;

	const paths: PaginationPath[] = [];

	for (const lang of nonRootLangs) {
		// 各言語の全記事を取得
		const allPosts = await getPostsByLang(lang);

		// 日付の降順でソート
		const sortedPosts = allPosts.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());

		// 総ページ数を計算
		const totalPages = Math.ceil(sortedPosts.length / postsPerPage);

		// 2ページ目以降のパスを生成
		for (let i = 0; i < Math.max(0, totalPages - 1); i++) {
			const pageNum = i + 2;
			const start = (pageNum - 1) * postsPerPage;
			const end = start + postsPerPage;

			paths.push({
				params: { lang, num: String(pageNum) },
				props: {
					lang,
					posts: sortedPosts.slice(start, end),
					currentPage: pageNum,
					totalPages,
				},
			});
		}
	}

	return paths;
}

// ============================================================
// タグ一覧関連
// ============================================================

export interface TagPath {
	params: { tag: string; lang?: string };
	props: { lang: LangCode; posts: PostEntry[] };
}

/**
 * タグ一覧用のgetStaticPaths（root言語用）
 */
export async function getTagPathsForRoot(): Promise<TagPath[]> {
	const rootLang = getRootLang();
	const posts = await getPostsByLang(rootLang);
	const tags = [...new Set(posts.flatMap((post) => post.data.tags))];

	return tags.map((tag) => {
		const filteredPosts = posts.filter((post) => post.data.tags.includes(tag));
		return {
			params: { tag },
			props: { lang: rootLang, posts: filteredPosts },
		};
	});
}

/**
 * タグ一覧用のgetStaticPaths（非root言語用）
 */
export async function getTagPathsForNonRoot(): Promise<TagPath[]> {
	const rootLang = getRootLang();
	const nonRootLangs = langCodes.filter((lang) => !isRootLang(lang));

	const paths: TagPath[] = [];

	for (const lang of nonRootLangs) {
		// 各言語の記事からタグを収集
		const posts = await getPostsByLang(lang);

		// 非root言語に記事がない場合はroot言語のタグを使用
		let tagsSource = posts;
		if (posts.length === 0) {
			tagsSource = await getPostsByLang(rootLang);
		}

		const tags = [...new Set(tagsSource.flatMap((post) => post.data.tags))];

		for (const tag of tags) {
			const filteredPosts = posts.filter((post) => post.data.tags.includes(tag));
			paths.push({
				params: { lang, tag },
				props: { lang, posts: filteredPosts },
			});
		}
	}

	return paths;
}

// ============================================================
// OG画像関連
// ============================================================

// キャッシュディレクトリのパス
const CACHE_DIR = '.cache/og';

/**
 * タイトルとタグからハッシュを生成
 */
function generateCacheKey(title: string, tags: string[] | undefined, lang: string): string {
	// tagsが未定義の場合は空配列として扱う
	const safeTags = Array.isArray(tags) ? tags : [];
	const content = JSON.stringify({ title, tags: [...safeTags].sort(), lang });
	return createHash('md5').update(content).digest('hex');
}

/**
 * キャッシュファイルのパスを取得
 */
function getCachePath(lang: string, slug: string, hash: string): string {
	return join(CACHE_DIR, lang, slug, `${hash}.png`);
}

export interface OgPath {
	params: { slug: string; lang?: string };
	props: { lang: LangCode; slug: string };
}

/**
 * OG画像用のgetStaticPaths（root言語用）
 */
export async function getOgPathsForRoot(): Promise<OgPath[]> {
	const rootLang = getRootLang();
	const posts = await getPostsByLang(rootLang);

	return posts.map((post) => ({
		params: { slug: post.slug },
		props: { lang: rootLang, slug: post.slug },
	}));
}

/**
 * OG画像用のgetStaticPaths（非root言語用）
 */
export async function getOgPathsForNonRoot(): Promise<OgPath[]> {
	const rootLang = getRootLang();
	const nonRootLangs = langCodes.filter((lang) => !isRootLang(lang));

	// root言語の全記事を取得してslugリストを作成
	const rootPosts = await getPostsByLang(rootLang);
	const rootSlugs = rootPosts.map((post) => post.slug);

	const paths: OgPath[] = [];

	for (const lang of nonRootLangs) {
		for (const slug of rootSlugs) {
			paths.push({
				params: { lang, slug },
				props: { lang, slug },
			});
		}
	}

	return paths;
}

/**
 * OG画像を生成（キャッシュ対応）
 */
export async function generateOgImage(lang: LangCode, slug: string): Promise<Response> {
	// 記事を取得（なければフォールバック）
	const { entry: post } = await getPostWithFallback(lang, slug);

	if (!post) {
		return new Response('Not found', { status: 404 });
	}

	const title = post.data.title;
	// tagsが未定義の場合は空配列として扱う
	const tags = post.data.tags ?? [];

	// キャッシュキー（ハッシュ）を生成（言語も含める）
	const cacheKey = generateCacheKey(title, tags, lang);
	const cachePath = getCachePath(lang, slug, cacheKey);

	// キャッシュが存在すればそれを返す
	if (existsSync(cachePath)) {
		console.log(`[OG] Cache hit: ${lang}/${slug}`);
		const cachedPng = readFileSync(cachePath);
		return new Response(cachedPng as any, {
			headers: { 'Content-Type': 'image/png' },
		});
	}

	// キャッシュがなければ新規生成
	console.log(`[OG] Generating: ${lang}/${slug}`);
	const svg = await renderOgSvg(title, tags);
	const png = await sharp(Buffer.from(svg)).png().toBuffer();

	// キャッシュディレクトリを作成して保存
	const cacheDir = dirname(cachePath);
	if (!existsSync(cacheDir)) {
		mkdirSync(cacheDir, { recursive: true });
	}
	writeFileSync(cachePath, png);

	return new Response(png as any, {
		headers: { 'Content-Type': 'image/png' },
	});
}
