import { siteConfig } from '@/config/site';
import { getPostsByLang, getDocsPostsByLang, getUiPostsByLang, getPostWithFallback, type PostEntry } from '@/lib/content';
import { getRootLang, isRootLang, type LangCode } from '@/lib/i18n';
import { createHash } from 'crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import sharp from 'sharp';
import { renderOgSvg } from '@/lib/ogImage';

// 記事ページ、一覧、OG画像の静的パスと生成処理をまとめる
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

export async function getPostPathsForRoot(): Promise<PostPath[]> {
  const rootLang = getRootLang();
  const posts = await getDocsPostsByLang(rootLang);

  return posts.map((entry) => ({
    params: { slug: entry.id },
    props: { lang: rootLang, entry },
  }));
}

export async function getPostPathsForNonRoot(): Promise<PostPathNonRoot[]> {
  const rootLang = getRootLang();
  const nonRootLangs = langCodes.filter((lang) => !isRootLang(lang));

  // 翻訳がなくても同じURLを生成するため、root言語のslugを基準にする
  const rootPosts = await getDocsPostsByLang(rootLang);

  const paths: PostPathNonRoot[] = [];

  for (const lang of nonRootLangs) {
    for (const post of rootPosts) {
      paths.push({
        params: { lang, slug: post.id },
        props: { lang, slug: post.id },
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

// 記事を日付順に分割し、2ページ目以降の静的パスを作る
export async function getPaginationPathsForRoot(): Promise<PaginationPath[]> {
  const rootLang = getRootLang();
  const postsPerPage = siteConfig.pagination.postsPerPage;

  const allPosts = await getPostsByLang(rootLang);
  const sortedPosts = allPosts.sort((a, b) => (b.data.date?.valueOf() ?? 0) - (a.data.date?.valueOf() ?? 0));
  const totalPages = Math.ceil(sortedPosts.length / postsPerPage);

  // 1ページ目は index.astro で処理する
  return Array.from({ length: Math.max(0, totalPages - 1) }, (_, i) => {
    const pageNum = i + 2;
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

// 各非root言語の記事を日付順に分割し、2ページ目以降の静的パスを作る
export async function getPaginationPathsForNonRoot(): Promise<PaginationPath[]> {
  const nonRootLangs = langCodes.filter((lang) => !isRootLang(lang));
  const postsPerPage = siteConfig.pagination.postsPerPage;

  const paths: PaginationPath[] = [];

  for (const lang of nonRootLangs) {
    const allPosts = await getPostsByLang(lang);
    const sortedPosts = allPosts.sort((a, b) => (b.data.date?.valueOf() ?? 0) - (a.data.date?.valueOf() ?? 0));
    const totalPages = Math.ceil(sortedPosts.length / postsPerPage);

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

// 記事のタグを集め、タグごとの一覧パスを作る
export async function getTagPathsForRoot(): Promise<TagPath[]> {
  const rootLang = getRootLang();
  const posts = await getPostsByLang(rootLang);
  const tags = [...new Set(posts.flatMap((post) => post.data.tags ?? []))].filter((tag): tag is string => tag != null);

  return tags.map((tag) => {
    const filteredPosts = posts.filter((post) => (post.data.tags ?? []).includes(tag));
    return {
      params: { tag },
      props: { lang: rootLang, posts: filteredPosts },
    };
  });
}

// 各非root言語のタグ一覧パスを作る
export async function getTagPathsForNonRoot(): Promise<TagPath[]> {
  const rootLang = getRootLang();
  const nonRootLangs = langCodes.filter((lang) => !isRootLang(lang));

  const paths: TagPath[] = [];

  for (const lang of nonRootLangs) {
    const posts = await getPostsByLang(lang);

    let tagsSource = posts;
    if (posts.length === 0) {
      // 記事がない言語でもタグURLを生成するため、root言語のタグを使う
      tagsSource = await getPostsByLang(rootLang);
    }

    const tags = [...new Set(tagsSource.flatMap((post) => post.data.tags ?? []))].filter((tag): tag is string => tag != null);

    for (const tag of tags) {
      const filteredPosts = posts.filter((post) => (post.data.tags ?? []).includes(tag));
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

const CACHE_DIR = '.cache/og';

function generateCacheKey(title: string, tags: string[] | undefined, lang: string): string {
  const safeTags = Array.isArray(tags) ? tags : [];
  const content = JSON.stringify({ title, tags: [...safeTags].sort(), lang });
  return createHash('md5').update(content).digest('hex');
}

function getCachePath(lang: string, slug: string, hash: string): string {
  return join(CACHE_DIR, lang, slug, `${hash}.png`);
}

export interface OgPath {
  params: { slug: string; lang?: string };
  props: { lang: LangCode; slug: string };
}

export async function getOgPathsForRoot(): Promise<OgPath[]> {
  const rootLang = getRootLang();
  const posts = await getDocsPostsByLang(rootLang);

  return posts.map((post) => ({
    params: { slug: post.id },
    props: { lang: rootLang, slug: post.id },
  }));
}

export async function getOgPathsForNonRoot(): Promise<OgPath[]> {
  const rootLang = getRootLang();
  const nonRootLangs = langCodes.filter((lang) => !isRootLang(lang));

  const rootPosts = await getDocsPostsByLang(rootLang);

  const paths: OgPath[] = [];

  for (const lang of nonRootLangs) {
    for (const post of rootPosts) {
      paths.push({
        params: { lang, slug: post.id },
        props: { lang, slug: post.id },
      });
    }
  }

  return paths;
}

// URL用slugからui/を除き、propsにはコンテンツIDを保持する
export async function getUiOgPathsForRoot(): Promise<OgPath[]> {
  const rootLang = getRootLang();
  const posts = await getUiPostsByLang(rootLang);

  return posts.map((post) => ({
    params: { slug: post.id.replace(/^ui\//, '') },
    props: { lang: rootLang, slug: post.id },
  }));
}

export async function getUiOgPathsForNonRoot(): Promise<OgPath[]> {
  const rootLang = getRootLang();
  const nonRootLangs = langCodes.filter((lang) => !isRootLang(lang));

  const uiPosts = await getUiPostsByLang(rootLang);

  const paths: OgPath[] = [];

  for (const lang of nonRootLangs) {
    for (const post of uiPosts) {
      paths.push({
        params: { lang, slug: post.id.replace(/^ui\//, '') },
        props: { lang, slug: post.id },
      });
    }
  }

  return paths;
}

// 記事を取得し、キャッシュを使いながらOG画像を生成する
export async function generateOgImage(lang: LangCode, slug: string): Promise<Response> {
  const { entry: post } = await getPostWithFallback(lang, slug);

  if (!post) {
    return new Response('Not found', { status: 404 });
  }

  const title = post.data.title;
  const tags = post.data.tags ?? [];

  const cacheKey = generateCacheKey(title, tags, lang);
  const cachePath = getCachePath(lang, slug, cacheKey);

  // 同じタイトル・タグ・言語の生成済み画像は再利用する
  if (existsSync(cachePath)) {
    console.log(`[OG] Cache hit: ${lang}/${slug}`);
    const cachedPng = readFileSync(cachePath);
    return new Response(new Uint8Array(cachedPng), {
      headers: { 'Content-Type': 'image/png' },
    });
  }

  console.log(`[OG] Generating: ${lang}/${slug}`);
  const svg = await renderOgSvg(title, tags);
  const png = await sharp(Buffer.from(svg)).png().toBuffer();

  // 新しく生成した画像は次回のビルド用に保存する
  const cacheDir = dirname(cachePath);
  if (!existsSync(cacheDir)) {
    mkdirSync(cacheDir, { recursive: true });
  }
  writeFileSync(cachePath, png);

  return new Response(new Uint8Array(png), {
    headers: { 'Content-Type': 'image/png' },
  });
}
