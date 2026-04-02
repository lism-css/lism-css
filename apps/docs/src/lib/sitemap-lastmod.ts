/**
 * サイトマップ lastmod 用ユーティリティ
 * ビルド時に git の最終コミット日時を取得し、URL→lastmod のマップを生成する
 */
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { resolve, dirname } from 'node:path';

const SITE_URL = 'https://lism-css.com';
const ROOT_LANG = 'ja';
// NOTE: siteConfig.langs と同期すること（言語追加時に更新が必要）
const NON_ROOT_LANGS = ['en'];

// git リポジトリのルートディレクトリ（apps/docs/src/lib/ → 4階層上）
const GIT_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../../..');

/**
 * git log から各コンテンツファイルの最終コミット日時を一括取得し、
 * サイトURL→Date のマップを返す
 */
export function buildLastmodMap(): Map<string, Date> {
  const urlToDate = new Map<string, Date>();

  try {
    const fileToDate = getGitLastModifiedMap();

    for (const [filePath, date] of fileToDate) {
      const urls = filePathToSiteUrls(filePath);
      for (const url of urls) {
        urlToDate.set(url, date);
      }
    }
  } catch {
    // git が利用できない環境ではフォールバック（空マップ）
    console.warn('[sitemap-lastmod] git コマンドの実行に失敗しました。lastmod はスキップされます。');
  }

  return urlToDate;
}

/**
 * git log を解析して ファイルパス→最終コミット日時 のマップを構築する
 * git log は新しい順に出力されるので、各ファイルについて最初に見つかった日時が最新
 */
function getGitLastModifiedMap(): Map<string, Date> {
  const fileToDate = new Map<string, Date>();

  // apps/docs/ 配下のコンテンツ・ページファイルの最終コミット日時を一括取得
  const output = execSync("git log --pretty=format:'__COMMIT__%aI' --name-only -- 'apps/docs/src/content' 'apps/docs/src/pages'", {
    encoding: 'utf-8',
    maxBuffer: 50 * 1024 * 1024,
    cwd: GIT_ROOT,
  });

  let currentDate: Date | null = null;
  for (const line of output.split('\n')) {
    if (line.startsWith('__COMMIT__')) {
      currentDate = new Date(line.slice('__COMMIT__'.length));
    } else if (line.trim() && currentDate) {
      const trimmed = line.trim();
      // 最初に見つかった日付が最新なのでスキップ
      if (!fileToDate.has(trimmed)) {
        fileToDate.set(trimmed, currentDate);
      }
    }
  }

  return fileToDate;
}

/**
 * ファイルパス（git root相対）をサイトのフルURL配列に変換
 *
 * コンテンツファイル（Astro glob loader が entry.id を小文字化するため、slug も小文字化する）:
 *   apps/docs/src/content/ja/overview.mdx      → [https://lism-css.com/docs/overview/]
 *   apps/docs/src/content/ja/ui/Accordion.mdx   → [https://lism-css.com/docs/ui/accordion/, https://lism-css.com/ui/accordion/]
 *   apps/docs/src/content/en/overview.mdx       → [https://lism-css.com/en/docs/overview/]
 *
 * ページファイル:
 *   apps/docs/src/pages/index.astro             → [https://lism-css.com/]
 *   apps/docs/src/pages/templates/index.astro   → [https://lism-css.com/templates/]
 */
function filePathToSiteUrls(filePath: string): string[] {
  // _（アンダースコア開始）のパスは非公開ページ
  if (filePath.includes('/_')) return [];

  // コンテンツファイル
  const contentMatch = filePath.match(/^apps\/docs\/src\/content\/(\w+)\/(.+)\.mdx?$/);
  if (contentMatch) {
    const [, lang, rawSlug] = contentMatch;
    // Astro の glob loader は entry.id を小文字化する
    const slug = rawSlug.toLowerCase();
    const langPrefix = lang === ROOT_LANG ? '' : `/${lang}`;
    const urls = [`${SITE_URL}${langPrefix}/docs/${slug}/`];

    // ui/ コンテンツは /ui/{slug}/ ルートでも公開される（root言語のみ）
    if (lang === ROOT_LANG && slug.startsWith('ui/')) {
      urls.push(`${SITE_URL}/${slug}/`);
    }
    return urls;
  }

  // ページファイル
  const pageMatch = filePath.match(/^apps\/docs\/src\/pages\/(.+)\.astro$/);
  if (pageMatch) {
    const pagePath = pageMatch[1];

    // [lang]/index.astro → 非root言語のトップページ（/en/ 等）
    if (pagePath === '[lang]/index') {
      return NON_ROOT_LANGS.map((lang) => `${SITE_URL}/${lang}/`);
    }

    // その他の動的ルートはコンテンツ由来なのでスキップ
    if (pagePath.includes('[')) return [];

    // preview/templates/{cat}/{id}/index.astro → 対応するテンプレート詳細ページにもマップ
    const previewMatch = pagePath.match(/^preview\/templates\/(.+)\/index$/);
    if (previewMatch) {
      const templatePath = previewMatch[1];
      return [`${SITE_URL}/preview/templates/${templatePath}/`, `${SITE_URL}/templates/${templatePath}/`];
    }

    // index.astro → ディレクトリURL（ルートの index も正しく処理）
    const urlPath = pagePath.replace(/(^|\/)index$/, '');
    return [`${SITE_URL}/${urlPath}${urlPath ? '/' : ''}`];
  }

  return [];
}
